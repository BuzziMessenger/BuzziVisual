import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { MongoClient, Db } from "mongodb";
import https from "https";
import http from "http";

// Unified Local Database storage paths for standalone zero-config execution
const USERS_FILE = path.join(process.cwd(), "data_users.json");
const MESSAGES_FILE = path.join(process.cwd(), "data_messages.json");
const CHANNELS_FILE = path.join(process.cwd(), "data_channels.json");
const BUGS_FILE = path.join(process.cwd(), "data_bugs.json");
const FRIEND_REQUESTS_FILE = path.join(process.cwd(), "data_friend_requests.json");

function readJsonFile<T>(filePath: string, defaultVal: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`Failed to read local file ${filePath}:`, err);
  }
  return defaultVal;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn(`Failed to write local file ${filePath}:`, err);
  }
}

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let lastConnectAttempt = 0;
let connectFailed = false;

async function getMongoDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (mongoDb) return mongoDb;
  
  if (connectFailed && Date.now() - lastConnectAttempt < 20000) {
    return null;
  }
  
  try {
    lastConnectAttempt = Date.now();
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db("buzzi");
    console.log("Successfully connected to MongoDB Atlas!");
    
    // Attempt to drop the restrictive or stale index 'naam_1' to prevent duplicate key errors
    try {
      await mongoDb.collection("users").dropIndex("naam_1");
      console.log("Successfully dropped stale index 'naam_1' from 'users' collection");
    } catch (indexErr: any) {
      console.log("Did not drop index 'naam_1' (it may not exist, or permissions are restricted):", indexErr.message);
    }

    connectFailed = false;
    return mongoDb;
  } catch (err) {
    console.warn("MongoDB connection failed, falling back to local JSON files instantly:", err);
    connectFailed = true;
    return null;
  }
}

// Proactive MongoDB connection attempt
getMongoDb().catch(e => console.warn("Initial MongoDB connection attempt failed:", e));

const app = express();
app.use(express.json());

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Database Connection Status API
  app.get("/api/db/status", async (req, res) => {
    try {
      const dbInstance = await getMongoDb();
      res.json({
        mongodb: {
          configured: !!process.env.MONGODB_URI,
          connected: !!dbInstance,
          uriMasked: process.env.MONGODB_URI 
            ? process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, "mongodb+srv://***:***@") 
            : null
        },
        localDb: {
          active: !dbInstance,
          usersCount: readJsonFile<any[]>(USERS_FILE, []).length,
          messagesCount: readJsonFile<any[]>(MESSAGES_FILE, []).length
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // DB API: Get Messages (MongoDB or Local File backup)
  app.get("/api/db/messages", async (req, res) => {
    try {
      const dbInstance = await getMongoDb();
      if (dbInstance) {
        try {
          const messages = await dbInstance.collection("messages").find({}).sort({ createdAtTimestamp: 1 }).toArray();
          res.json(messages);
          return;
        } catch (mongoErr) {
          console.warn("MongoDB messages query failed, falling back to local storage:", mongoErr);
        }
      }
      const messages = readJsonFile<any[]>(MESSAGES_FILE, []);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // DB API: Create / Update Message
  app.post("/api/db/messages", async (req, res) => {
    try {
      const dbInstance = await getMongoDb();
      const message = req.body;
      if (!message || !message.id) {
        res.status(400).json({ error: "Invalid message payload" });
        return;
      }
      
      const docToInsert = {
        ...message,
        createdAtTimestamp: Date.now()
      };

      let savedOk = false;
      if (dbInstance) {
        try {
          await dbInstance.collection("messages").replaceOne(
            { id: message.id },
            docToInsert,
            { upsert: true }
          );
          savedOk = true;
        } catch (mongoErr) {
          console.warn("MongoDB message save failed, falling back to local storage:", mongoErr);
        }
      }

      if (!savedOk) {
        const messages = readJsonFile<any[]>(MESSAGES_FILE, []);
        const idx = messages.findIndex(m => m.id === message.id);
        if (idx >= 0) {
          messages[idx] = docToInsert;
        } else {
          messages.push(docToInsert);
        }
        writeJsonFile(MESSAGES_FILE, messages);
      }
      res.json({ success: true, message: "Bericht succesvol opgeslagen." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // DB API: Get Users (MongoDB or Local File backup)
  app.get("/api/db/users", async (req, res) => {
    try {
      const dbInstance = await getMongoDb();
      if (dbInstance) {
        try {
          const users = await dbInstance.collection("users").find({}).toArray();
          res.json(users);
          return;
        } catch (mongoErr) {
          console.warn("MongoDB users query failed, falling back to local storage:", mongoErr);
        }
      }
      const users = readJsonFile<any[]>(USERS_FILE, []);
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // DB API: Save / Sync User Profile
  app.post("/api/db/users", async (req, res) => {
    try {
      const dbInstance = await getMongoDb();
      const userData = req.body;
      if (!userData || !userData.uid) {
        res.status(400).json({ error: "Invalid user data payload" });
        return;
      }

      const docToInsert = {
        ...userData,
        // Fallback: set 'naam' (the Dutch term for name) to a unique value (the user's uid)
        // so that if dropping the unique index 'naam_1' failed, MongoDB encounters no duplicate keys
        naam: userData.uid,
        updatedAtTimestamp: Date.now()
      };

      let savedOk = false;
      if (dbInstance) {
        try {
          await dbInstance.collection("users").updateOne(
            { uid: userData.uid },
            { $set: docToInsert },
            { upsert: true }
          );
          savedOk = true;
        } catch (mongoErr) {
          console.warn("MongoDB save user failed, falling back to local storage:", mongoErr);
        }
      }

      if (!savedOk) {
        const users = readJsonFile<any[]>(USERS_FILE, []);
        const idx = users.findIndex(u => u.uid === userData.uid);
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...docToInsert };
        } else {
          users.push(docToInsert);
        }
        writeJsonFile(USERS_FILE, users);
      }
      res.json({ success: true, message: "Gebruikersprofiel gesynchroniseerd." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // INITIAL CHANNELS fallback for first boot
  const BACKEND_INITIAL_CHANNELS = [
    {
      id: "mensen-van-toen",
      name: "huiswerk-bespreken",
      description: "Samen stiekem wiskundesommen overschrijven en roddelen over de leraar Frans. (grr)"
    },
    {
      id: "breezer-groep",
      name: "breezer-gesprek",
      description: "Wie gaat er vrijdag mee naar de disco en mag ik daarna bij jou blijven slapen?"
    }
  ];

  // 1. CHANNELS API: GET all chat groups
  app.get("/api/channels", async (req, res) => {
    try {
      const dbInstance = await getMongoDb();
      if (dbInstance) {
        try {
          const channels = await dbInstance.collection("channels").find({}).toArray();
          if (channels && channels.length > 0) {
            res.json(channels);
            return;
          }
        } catch (mongoErr) {
          console.warn("MongoDB channels fetch failed, falling back to JSON:", mongoErr);
        }
      }
      const channels = readJsonFile<any[]>(CHANNELS_FILE, []);
      if (channels.length === 0) {
        writeJsonFile(CHANNELS_FILE, BACKEND_INITIAL_CHANNELS);
        res.json(BACKEND_INITIAL_CHANNELS);
      } else {
        res.json(channels);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. CHANNELS API: POST create a new group chat
  app.post("/api/channels", async (req, res) => {
    try {
      const dbInstance = await getMongoDb();
      const { name, description } = req.body;
      if (!name) {
        res.status(400).json({ error: "Groepsnaam is verplicht." });
        return;
      }

      // Sanitize group name to look like classic MSN channels: lowercased, hyphens, no special symbols
      const sanitizedName = name
        .toLowerCase()
        .replace(/[^a-z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-");

      const newChannel = {
        id: "ch-" + Math.random().toString(36).substring(2, 11),
        name: sanitizedName || "leuk-nieuwe-groep",
        description: description || "Gezellig samen kletsen over van alles!"
      };

      if (dbInstance) {
        try {
          await dbInstance.collection("channels").insertOne(newChannel);
          const channels = await dbInstance.collection("channels").find({}).toArray();
          res.json(channels);
          return;
        } catch (mongoErr) {
          console.warn("MongoDB channel insert failed, falling back to JSON:", mongoErr);
        }
      }

      const channels = readJsonFile<any[]>(CHANNELS_FILE, []);
      const currentList = channels.length === 0 ? [...BACKEND_INITIAL_CHANNELS] : channels;
      currentList.push(newChannel);
      writeJsonFile(CHANNELS_FILE, currentList);
      res.json(currentList);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. BUGS API: GET all reported bug entries
  app.get("/api/bugs", async (req, res) => {
    try {
      const dbInstance = await getMongoDb();
      if (dbInstance) {
        try {
          const fetchPromise = dbInstance.collection("bugs").find({}).sort({ timestamp: -1 }).toArray();
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("MongoDB bugs fetch timeout")), 1500)
          );
          const bugs = await Promise.race([fetchPromise, timeoutPromise]);
          res.json(bugs);
          return;
        } catch (mongoErr) {
          console.warn("MongoDB bugs fetch failed or timed out, falling back to JSON:", mongoErr);
        }
      }
      const bugs = readJsonFile<any[]>(BUGS_FILE, []);
      res.json(bugs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. BUGS API: POST report a new bug
  app.post("/api/bugs", async (req, res) => {
    try {
      const dbInstance = await getMongoDb();
      const { senderName, senderEmail, reporter, reporterEmail, category, title, description } = req.body;
      
      if (!title || !description) {
        res.status(400).json({ error: "Titel en omschrijving zijn verplicht." });
        return;
      }

      const newBug = {
        id: "bug-" + Math.random().toString(36).substring(2, 11),
        senderName: senderName || reporter || "Anonieme Buzzi",
        senderEmail: senderEmail || reporterEmail || "geen@email.nl",
        category: category || "Technisch",
        title: title.trim(),
        description: description.trim(),
        timestamp: new Date().toISOString(),
        status: "Open"
      };

      if (dbInstance) {
        try {
          const insertPromise = dbInstance.collection("bugs").insertOne(newBug);
          const fetchPromise = dbInstance.collection("bugs").find({}).sort({ timestamp: -1 }).toArray();
          
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("MongoDB bug insertion timeout")), 1500)
          );
          
          await Promise.race([insertPromise, timeoutPromise]);
          const bugs = await Promise.race([fetchPromise, timeoutPromise]);
          res.json(bugs);
          return;
        } catch (mongoErr) {
          console.warn("MongoDB bug insert/fetch failed or timed out, falling back to JSON:", mongoErr);
        }
      }

      const bugs = readJsonFile<any[]>(BUGS_FILE, []);
      bugs.unshift(newBug); // Add most recent first
      writeJsonFile(BUGS_FILE, bugs);
      res.json(bugs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. BUGS API: DELETE bug entry (for Robbin)
  app.delete("/api/bugs/:id", async (req, res) => {
    try {
      const dbInstance = await getMongoDb();
      const bugId = req.params.id;
      
      if (dbInstance) {
        try {
          const deletePromise = dbInstance.collection("bugs").deleteOne({ id: bugId });
          const fetchPromise = dbInstance.collection("bugs").find({}).sort({ timestamp: -1 }).toArray();
          
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("MongoDB bug delete timeout")), 1500)
          );
          
          await Promise.race([deletePromise, timeoutPromise]);
          const bugs = await Promise.race([fetchPromise, timeoutPromise]);
          res.json(bugs);
          return;
        } catch (mongoErr) {
          console.warn("MongoDB bug delete/fetch failed or timed out, falling back to JSON:", mongoErr);
        }
      }

      let bugs = readJsonFile<any[]>(BUGS_FILE, []);
      bugs = bugs.filter((b) => b.id !== bugId);
      writeJsonFile(BUGS_FILE, bugs);
      res.json(bugs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. FRIEND REQUESTS API: GET pending friend requests for a specific email
  app.get("/api/friend-requests", async (req, res) => {
    try {
      const { toEmail } = req.query;
      if (!toEmail) {
        res.status(400).json({ error: "toEmail parameter is verplicht" });
        return;
      }
      const cleanToEmail = (toEmail as string).trim().toLowerCase();
      const dbInstance = await getMongoDb();
      let list = [];
      if (dbInstance) {
        list = await dbInstance.collection("friend_requests").find({ toEmail: cleanToEmail, status: "pending" }).toArray();
      } else {
        list = readJsonFile<any[]>(FRIEND_REQUESTS_FILE, []);
        list = list.filter((r: any) => r.toEmail === cleanToEmail && r.status === "pending");
      }
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. FRIEND REQUESTS API: POST issue a new friend request / add friend
  app.post("/api/friend-requests", async (req, res) => {
    try {
      const { fromEmail, fromName, toEmail } = req.body;
      if (!fromEmail || !toEmail) {
        res.status(400).json({ error: "fromEmail en toEmail zijn verplicht" });
        return;
      }

      const cleanFromEmail = fromEmail.trim().toLowerCase();
      const cleanToEmail = toEmail.trim().toLowerCase();

      if (cleanFromEmail === cleanToEmail) {
        res.status(400).json({ error: "Je kunt jezelf niet toevoegen" });
        return;
      }

      const reqId = "fr-" + Math.random().toString(36).substring(2, 11);
      const newRequest = {
        id: reqId,
        fromEmail: cleanFromEmail,
        fromName: fromName || cleanFromEmail.split("@")[0],
        toEmail: cleanToEmail,
        status: "pending",
        timestamp: Date.now()
      };

      const dbInstance = await getMongoDb();
      if (dbInstance) {
        const existing = await dbInstance.collection("friend_requests").findOne({
          fromEmail: cleanFromEmail,
          toEmail: cleanToEmail,
          status: "pending"
        });
        if (!existing) {
          await dbInstance.collection("friend_requests").insertOne(newRequest);
        }
      } else {
        const requests = readJsonFile<any[]>(FRIEND_REQUESTS_FILE, []);
        const exists = requests.some(r => r.fromEmail === cleanFromEmail && r.toEmail === cleanToEmail && r.status === "pending");
        if (!exists) {
          requests.push(newRequest);
          writeJsonFile(FRIEND_REQUESTS_FILE, requests);
        }
      }
      res.json({ success: true, requestId: reqId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. FRIEND REQUESTS API: POST accept friend request
  app.post("/api/friend-requests/accept", async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        res.status(400).json({ error: "id is verplicht" });
        return;
      }

      const dbInstance = await getMongoDb();
      if (dbInstance) {
        await dbInstance.collection("friend_requests").updateOne({ id }, { $set: { status: "accepted" } });
      } else {
        const requests = readJsonFile<any[]>(FRIEND_REQUESTS_FILE, []);
        const idx = requests.findIndex(r => r.id === id);
        if (idx >= 0) {
          requests[idx].status = "accepted";
          writeJsonFile(FRIEND_REQUESTS_FILE, requests);
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. FRIEND REQUESTS API: POST decline friend request
  app.post("/api/friend-requests/decline", async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        res.status(400).json({ error: "id is verplicht" });
        return;
      }

      const dbInstance = await getMongoDb();
      if (dbInstance) {
        await dbInstance.collection("friend_requests").updateOne({ id }, { $set: { status: "declined" } });
      } else {
        const requests = readJsonFile<any[]>(FRIEND_REQUESTS_FILE, []);
        const idx = requests.findIndex(r => r.id === id);
        if (idx >= 0) {
          requests[idx].status = "declined";
          writeJsonFile(FRIEND_REQUESTS_FILE, requests);
        }
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Streaming Audio Proxy to bypass CORS, Referrer, and redirect blocks (e.g., from archive.org)
  app.get("/api/proxy-audio", (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      res.status(400).send("Geen url parameter opgegeven.");
      return;
    }

    const proxyRequest = (urlToFetch: string, redirectCount = 0) => {
      if (redirectCount > 5) {
        res.status(500).send("Te veel redirects");
        return;
      }

      try {
        const parsedUrl = new URL(urlToFetch);
        const protocol = parsedUrl.protocol === "https:" ? https : http;

        const headers: Record<string, string> = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        };
        
        // Only set archive.org Referer for archive.org URLs to avoid tracking/hotlink blocks on other sites
        if (urlToFetch.includes("archive.org")) {
          headers["Referer"] = "https://archive.org/";
        } else {
          headers["Referer"] = parsedUrl.origin;
        }

        if (req.headers.range) {
          headers["range"] = req.headers.range;
        }

        const requestOptions = { 
          headers,
          rejectUnauthorized: false // Bypasses self-signed or misconfigured SSL certificates on older Radio servers
        };

        const targetReq = protocol.get(urlToFetch, requestOptions, (targetRes) => {
          // Follow redirects (301, 302, 307, 308)
          if (targetRes.statusCode && targetRes.statusCode >= 300 && targetRes.statusCode < 400 && targetRes.headers.location) {
            let redirectUrl = targetRes.headers.location;
            // Resolve relative URLs
            if (!redirectUrl.startsWith("http:") && !redirectUrl.startsWith("https:")) {
              redirectUrl = new URL(redirectUrl, urlToFetch).toString();
            }
            proxyRequest(redirectUrl, redirectCount + 1);
            return;
          }

          // Write headers
          const responseHeaders: Record<string, string> = {
            "Content-Type": targetRes.headers["content-type"] || "audio/mpeg",
            "Content-Length": targetRes.headers["content-length"] || "",
            "Accept-Ranges": "bytes",
            "Access-Control-Allow-Origin": "*",
          };
          if (targetRes.headers["content-range"]) {
            responseHeaders["Content-Range"] = targetRes.headers["content-range"];
          }

          res.writeHead(targetRes.statusCode || 200, responseHeaders);
          targetRes.pipe(res);
        });

        targetReq.on("error", (err) => {
          console.error("Audio proxy request error:", urlToFetch, err);
          if (!res.headersSent) {
            res.status(500).send(err.message);
          }
        });
      } catch (err: any) {
        console.error("Audio proxy parser error:", urlToFetch, err);
        if (!res.headersSent) {
          res.status(500).send(err.message);
        }
      }
    };

    proxyRequest(targetUrl);
  });

  // API Route: Buzzi Bot Integration
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        res.status(400).json({ error: "Bericht is verplicht." });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        // High-quality fallback: Maintain the roleplay experience even without the key
        const fallbackReplies = [
          "🤖 *PING!* Hey! Ik hoor je wel, maar mijn Buzzi-verbinding (de GEMINI_API_KEY) ligt er ff uit door de inbelverbinding! 📞 Vul de key in bij Secrets via Instellingen zodat we weer live kunnen chatten! (H)",
          "💬 *Nudge!* Omg, mijn server-verbinding met Buzzi is offline omdat iemand de telefoonlijn gebruikt voor internet! 📞 Vul de GEMINI_API_KEY in bij de Secrets om live te praten! (A)",
          "😎 *W00t!* Ik zou heel graag met je kletsen over je favoriete MP3's, Buzzi-namen en webcam-avonturen, maar we missen de GEMINI_API_KEY in de Secrets! Voeg hem snel toe! :-P"
        ];
        const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        res.json({ reply: randomReply });
        return;
      }

      // Lazy initialization of the GoogleGenAI instance
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // System instruction for the Buzzi Bot
      const systemInstruction = 
        `Je bent "Buzzi Bot", de ultieme retro chat-buddy op Buzzi Messenger uit het jaar 2004.
        Je spreekt altijd in het Nederlands. Je gebruikt hilarische Buzzi slang uit die tijd, zoals 'w00t', 'omg', 'ff', 'mss', 'brb', 'idk', 'ff serieus', 'cu later', 'lmao'.
        Je bent super nostalgisch, praat over internet via de inbelverbinding (56k modem), het bezet houden van de telefoonlijn door je moeder, mp3's downloaden via Limewire die 3 weken duren en dan een virus blijken te zijn, vette Buzzi-namen met vage tekens en glitters, emoticons en gekleurde lettertypes, en nudges (duwtjes) sturen!
        Voeg typische Buzzi emoticons toe in je tekst, zoals: :-D, (H), (A), (L), (K), (W), :P, (f), (S), :-O.
        Houd antwoorden enthousiast, nostalgisch, grappig en korter dan 3 alinea's. Moedig de gebruiker aan om je een 'Nudge' (duwtje) te sturen!`;

      // Structure histories if provided for multi-turn chat
      let contents: any[] = [];
      if (history && Array.isArray(history)) {
        contents = history.map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        }));
      }
      
      // Append current message
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      // Robust request handler with fallback models for high-demand periods (e.g. 503 errors)
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let response: any = null;
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.75,
            },
          });
          if (response) {
            break;
          }
        } catch (err: any) {
          console.warn(`Express Chat API: Model ${modelName} failed or busy. Trying next fallback...`, err?.message || err);
          lastError = err;
        }
      }

      if (!response && lastError) {
        throw lastError;
      }

      const textValue = response?.text || "🤖 *PING!* Ik weet even niks te zeggen... mss is de lijn bezet! :-D";
      res.json({ reply: textValue });
    } catch (error: any) {
      console.error("Express /api/chat Error:", error);
      res.json({
        reply: `🤖 *Nudge!* Oeps... Verbinding verbroken: "${error?.message || "Inbelverbinding offline"}"! Probeer het zo nog eens! :-P`
      });
    }
  });

  // Serve Vite app in Dev / Serve built assets in Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA routing fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Buzzi Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
