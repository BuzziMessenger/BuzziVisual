import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { MongoClient, Db } from "mongodb";

// Unified Local Database storage paths for standalone zero-config execution
const USERS_FILE = path.join(process.cwd(), "data_users.json");
const MESSAGES_FILE = path.join(process.cwd(), "data_messages.json");

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

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

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

startServer();
