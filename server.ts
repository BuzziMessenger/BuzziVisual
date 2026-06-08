import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
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
const GAMES_FILE = path.join(process.cwd(), "data_games.json");

const isVercel = !!process.env.VERCEL;
const inMemoryCache: Record<string, any> = {};

// In-memory store for active typing statuses: senderUid -> { typingTo, lastActive: number }
const activeTypingState: Record<string, { typingTo: string; lastActive: number }> = {};

function readJsonFile<T>(filePath: string, defaultVal: T): T {
  if (isVercel) {
    if (inMemoryCache[filePath] === undefined) {
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, "utf-8");
          inMemoryCache[filePath] = JSON.parse(content);
        } else {
          inMemoryCache[filePath] = defaultVal;
        }
      } catch {
        inMemoryCache[filePath] = defaultVal;
      }
    }
    return inMemoryCache[filePath];
  }

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
  if (isVercel) {
    inMemoryCache[filePath] = data;
    return;
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn(`Failed to write local file ${filePath}:`, err);
  }
}

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let lastConnectAttempt = 0;
const CONNECT_COOLDOWN_MS = 10000; // Overcooldown reduced to 10 seconds for faster automatic background recovery

async function getMongoDb(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb+srv://Buzzi:BuzziMessenger@buzzimessenger.yoprloo.mongodb.net/?appName=BuzziMessenger";
  if (!uri) return null;
  if (mongoDb) return mongoDb;

  const now = Date.now();
  if (now - lastConnectAttempt < CONNECT_COOLDOWN_MS) {
    // Under cooldown to keep backend snappy and avoid blocking incoming requests
    return null;
  }
  
  try {
    lastConnectAttempt = now;
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000
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

    return mongoDb;
  } catch (err) {
    console.warn("MongoDB connection failed, falling back to local memory database:", err);
    return null;
  }
}

// Proactive MongoDB connection is disabled for serverless environments (will lazy-load on request)

const app = express();

// Help support Vercel wildcard rewrites to individual serverless functions by correcting request URLs
app.use((req, res, next) => {
  const originalUrl = req.headers["x-vercel-forwarded-path"] as string;
  if (originalUrl) {
    req.url = originalUrl;
  }
  next();
});

app.use(express.json());

// Database Connection Status API
app.get("/api/db/status", async (req, res) => {
    try {
      if (req.query.reconnect === "true") {
        mongoDb = null;
        lastConnectAttempt = 0;
      }
      const dbInstance = await getMongoDb();
      const rawUri = process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb+srv://Buzzi:BuzziMessenger@buzzimessenger.yoprloo.mongodb.net/?appName=BuzziMessenger";
      res.json({
        mongodb: {
          configured: !!rawUri,
          connected: !!dbInstance,
          uriMasked: rawUri 
            ? rawUri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, "mongodb+srv://***:***@") 
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

  // DOWNLOAD API: Download simulate retro APK for Android
  app.get("/api/download/apk", (req, res) => {
    const host = req.get("host") || "buzzimessenger.nl";
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const targetUrl = `${protocol}://${host}`;
    
    const fileContent = "BUZZIMESSENGER_MOBILE_CLIENT v1.2.0-Buzzi\n\n" +
      "Hallo retro chatter! We maken nu gebruik van de PWA (Progressive Web App) specificatie voor mobiele installaties!\n\n" +
      "Hierdoor draait de messenger als standalone applicatie volledig op zichzelf, met een eigen app-icoon en zonder Chrome-adresbalken op je startscherm!\n\n" +
      "====================================================\n" +
      "📱 HOE TE INSTALLEREN (In 5 seconden):\n" +
      "====================================================\n" +
      `1. Open deze link in Chrome op je Android telefoon: ${targetUrl}\n` +
      "2. Druk op de 3 puntjes rechtsbovenin Chrome.\n" +
      "3. Tik op 'App installeren' of 'Toevoegen aan startscherm'!\n" +
      "4. Start de app op via je startscherm - alles werkt live, standalone en up-to-date!\n\n" +
      "Veel plezier met inbellen!";
    
    const buffer = Buffer.from(fileContent, "utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=BuzziMessenger_Android_Installatie.txt");
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Length", buffer.length);
    res.status(200).send(buffer);
  });

  // DOWNLOAD API: Download helper installer script to compile real EXE locally
  app.get("/api/download/exe", (req, res) => {
    const host = req.get("host") || "buzzimessenger.nl";
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const targetUrl = `${protocol}://${host}`;

    const batContent = `@echo off
title Buzzi Messenger Installer
cls
echo ====================================================
echo   BUZZI MESSENGER - WINDOWS DESKTOP CONVERTER v1.2
echo ====================================================
echo.
echo Bezig met het genereren van uw standalone Buzzi Messenger...
echo Web-adres: ${targetUrl}
echo.

set "CSC_PATH=%windir%\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe"

if not exist "%CSC_PATH%" (
    echo [INFO] C# Compiler niet direct gevonden, we starten edge app-mode op...
    start msedge --app=${targetUrl}
    exit /b
)

echo Bezig met compileren van een echte BuzziMessenger.exe op uw computer...

:: Schrijf de C# Code voor de standalone launcher
echo using System; > temp_launcher.cs
echo using System.Diagnostics; >> temp_launcher.cs
echo public class Program { >> temp_launcher.cs
echo     public static void Main() { >> temp_launcher.cs
echo         ProcessStartInfo psi = new ProcessStartInfo(); >> temp_launcher.cs
echo         psi.FileName = "msedge.exe"; >> temp_launcher.cs
echo         psi.Arguments = "--app=${targetUrl}"; >> temp_launcher.cs
echo         psi.WindowStyle = ProcessWindowStyle.Hidden; >> temp_launcher.cs
echo         Process.Start(psi); >> temp_launcher.cs
echo     } >> temp_launcher.cs
echo } >> temp_launcher.cs

:: Compileer C# broncode naar een echte windows executable (.exe)
"%CSC_PATH%" /target:winexe /out:BuzziMessenger.exe temp_launcher.cs >nul 2>nul

:: Ruim de tijdelijke broncode op
del temp_launcher.cs >nul 2>nul

if exist "BuzziMessenger.exe" (
    echo.
    echo [SUCCES!] BuzziMessenger.exe is succesvol opgebouwd op uw computer!
    echo.
    echo U kunt dit installatiescript nu sluiten of verwijderen.
    echo Start voortaan direct de nieuw aangemaakte 'BuzziMessenger.exe' op!
    echo.
    echo Buzzi Messenger start nu op...
    start BuzziMessenger.exe
    timeout /t 3 >nul
) else (
    echo [INFO] Compileren mislukt, we starten direct op via Microsoft Edge...
    start msedge --app=${targetUrl}
)
exit
`;

    const buffer = Buffer.from(batContent, "utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=BuzziMessenger_Installer.bat");
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", buffer.length);
    res.status(200).send(buffer);
  });

  // PWA Support: Web App Manifest
  app.get("/manifest.json", (req, res) => {
    const manifest = {
      name: "Buzzi Messenger",
      short_name: "Buzzi",
      description: "De ultieme retro chat-buddy uit 2004",
      start_url: "/",
      display: "standalone",
      background_color: "#abd4ff",
      theme_color: "#0a2d54",
      icons: [
        {
          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20,50 a30,25 0 1,1 60,0 a30,25 0 1,1 -60,0' fill='%23ffd700'/%3E%3Cpath d='M35,35 a10,15 0 1,1 10,0' fill='%2338bdf8' opacity='0.8'/%3E%3Cpath d='M55,35 a10,15 0 1,1 10,0' fill='%2338bdf8' opacity='0.8'/%3E%3Ccircle cx='40' cy='50' r='4' fill='%23000'/%3E%3Ccircle cx='60' cy='50' r='4' fill='%23000'/%3E%3Cpath d='M45,62 q5,5 10,0' stroke='%23000' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3C/svg%3E",
          sizes: "192x192 512x512",
          type: "image/svg+xml"
        }
      ]
    };
    res.setHeader("Content-Type", "application/json");
    res.json(manifest);
  });

  // PWA Support: Minimal active Service Worker
  app.get("/sw.js", (req, res) => {
    const swCode = `
      self.addEventListener('install', (e) => {
        self.skipWaiting();
      });
      self.addEventListener('activate', (e) => {
        e.waitUntil(clients.claim());
      });
      self.addEventListener('fetch', (e) => {
        e.respondWith(fetch(e.request));
      });
    `;
    res.setHeader("Content-Type", "application/javascript");
    res.send(swCode);
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
        createdAtTimestamp: message.createdAtTimestamp || Date.now()
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

  // DB API: Post User Typing Status
  app.post("/api/db/typing", (req, res) => {
    try {
      const { senderUid, typingTo, isTyping } = req.body;
      if (!senderUid) {
        res.status(400).json({ error: "Missing senderUid" });
        return;
      }

      if (isTyping) {
        activeTypingState[senderUid] = {
          typingTo: typingTo || "",
          lastActive: Date.now()
        };
      } else {
        delete activeTypingState[senderUid];
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // DB API: Get Active Typing Statuses for a recipient
  app.get("/api/db/typing", (req, res) => {
    try {
      const recipient = req.query.recipient as string;
      if (!recipient) {
        res.status(400).json({ error: "Missing recipient query parameter" });
        return;
      }

      const now = Date.now();
      const typingUsers: string[] = [];

      // Prune inactive typing records (older than 2.5 seconds to make sure it respects the 2 second threshold but allows slight debounce network margin)
      Object.entries(activeTypingState).forEach(([senderUid, data]) => {
        if (now - data.lastActive > 2500) {
          delete activeTypingState[senderUid];
        } else if (data.typingTo === recipient) {
          typingUsers.push(senderUid);
        }
      });

      res.json({ typingUsers });
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
        naam: userData.uid,
        updatedAtTimestamp: Date.now()
      };
      
      // Remove Mongo _id field if it was passed from the frontend to avoid immutable field update errors
      if (docToInsert._id !== undefined) {
        delete docToInsert._id;
      }

      let savedOk = false;
      if (dbInstance) {
        try {
          console.log(`[DB] Saving profile for UID ${userData.uid} (Name: ${userData.name}) to MongoDB...`);
          await dbInstance.collection("users").updateOne(
            { uid: userData.uid },
            { $set: docToInsert },
            { upsert: true }
          );
          console.log(`[DB] Successfully saved profile for UID ${userData.uid} to MongoDB.`);
          savedOk = true;
        } catch (mongoErr: any) {
          console.warn("[DB] MongoDB save user failed with error:", mongoErr.message || mongoErr);
          console.warn("[DB] Falling back to local/JSON storage...");
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

      // Sanitize group name to look like classic chat channels: lowercased, hyphens, no special symbols
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
          const mongoBugs = await dbInstance.collection("bugs").find({}).sort({ timestamp: -1 }).toArray();
          res.json(mongoBugs);
          return;
        } catch (mongoErr) {
          console.warn("MongoDB bugs fetch failed, relying on JSON file:", mongoErr);
        }
      }

      const fileBugs = readJsonFile<any[]>(BUGS_FILE, []);
      fileBugs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      res.json(fileBugs);
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
          await dbInstance.collection("bugs").insertOne(newBug);
          const mongoBugs = await dbInstance.collection("bugs").find({}).sort({ timestamp: -1 }).toArray();
          res.json(mongoBugs);
          return;
        } catch (mongoErr) {
          console.warn("MongoDB bug insert failed, stored in JSON only:", mongoErr);
        }
      }

      const fileBugs = readJsonFile<any[]>(BUGS_FILE, []);
      fileBugs.unshift(newBug);
      writeJsonFile(BUGS_FILE, fileBugs);
      res.json(fileBugs);
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
          await dbInstance.collection("bugs").deleteOne({ id: bugId });
          const mongoBugs = await dbInstance.collection("bugs").find({}).sort({ timestamp: -1 }).toArray();
          res.json(mongoBugs);
          return;
        } catch (mongoErr) {
          console.warn("MongoDB bug delete failed, falling back to JSON:", mongoErr);
        }
      }

      let fileBugs = readJsonFile<any[]>(BUGS_FILE, []);
      fileBugs = fileBugs.filter((b) => b.id !== bugId);
      writeJsonFile(BUGS_FILE, fileBugs);
      res.json(fileBugs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Multiplayer Games Sync API: GET or POST game states
  app.get("/api/db/games", async (req, res) => {
    try {
      const { id } = req.query;
      const dbInstance = await getMongoDb();
      if (dbInstance) {
        try {
          if (id) {
            const game = await dbInstance.collection("games").findOne({ id: id as string });
            res.json(game ? [game] : []);
            return;
          }
          const games = await dbInstance.collection("games").find({}).toArray();
          res.json(games);
          return;
        } catch (mongoErr) {
          console.warn("MongoDB games query failed, falling back to local files:", mongoErr);
        }
      }

      const fileGames = readJsonFile<any[]>(GAMES_FILE, []);
      if (id) {
        const game = fileGames.find((g) => g.id === id);
        res.json(game ? [game] : []);
        return;
      }
      res.json(fileGames);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/db/games", async (req, res) => {
    try {
      const dbInstance = await getMongoDb();
      const gamePayload = req.body;
      if (!gamePayload || !gamePayload.id) {
        res.status(400).json({ error: "Invalid game payload" });
        return;
      }

      const docToInsert = {
        ...gamePayload,
        updatedAtTimestamp: Date.now()
      };

      if (dbInstance) {
        try {
          await dbInstance.collection("games").replaceOne(
            { id: gamePayload.id },
            docToInsert,
            { upsert: true }
          );
          res.json(docToInsert);
          return;
        } catch (mongoErr) {
          console.warn("MongoDB games save failed, falling back to JSON:", mongoErr);
        }
      }

      const fileGames = readJsonFile<any[]>(GAMES_FILE, []);
      const index = fileGames.findIndex((g) => g.id === gamePayload.id);
      if (index > -1) {
        fileGames[index] = docToInsert;
      } else {
        fileGames.push(docToInsert);
      }
      writeJsonFile(GAMES_FILE, fileGames);
      res.json(docToInsert);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ========== WEB RTC CALL SIGNALING FOR REAL-TIME VIDEO CALLING ==========
  const callSignals: Record<string, {
    roomId: string;
    offer?: any;
    answer?: any;
    callerCandidates: any[];
    calleeCandidates: any[];
    updatedAt: number;
  }> = {};

  // Clean stale signals periodically (older than 10 mins)
  setInterval(() => {
    const now = Date.now();
    for (const id in callSignals) {
      if (now - callSignals[id].updatedAt > 600000) {
        delete callSignals[id];
      }
    }
  }, 60000);

  app.get("/api/db/calls/signal", (req, res) => {
    const { roomId } = req.query;
    if (!roomId) {
      res.status(400).json({ error: "Missing roomId" });
      return;
    }
    const rId = roomId as string;
    if (!callSignals[rId]) {
      callSignals[rId] = { roomId: rId, callerCandidates: [], calleeCandidates: [], updatedAt: Date.now() };
    }
    res.json(callSignals[rId]);
  });

  app.post("/api/db/calls/signal", (req, res) => {
    const { roomId, type, data } = req.body;
    if (!roomId || !type) {
      res.status(400).json({ error: "Missing roomId or type" });
      return;
    }
    const rId = roomId as string;
    if (!callSignals[rId]) {
      callSignals[rId] = { roomId: rId, callerCandidates: [], calleeCandidates: [], updatedAt: Date.now() };
    }
    const room = callSignals[rId];
    room.updatedAt = Date.now();

    if (type === "offer") {
      room.offer = data;
    } else if (type === "answer") {
      room.answer = data;
    } else if (type === "caller_candidate") {
      if (data) {
        const strVal = JSON.stringify(data);
        if (!room.callerCandidates.some(c => JSON.stringify(c) === strVal)) {
          room.callerCandidates.push(data);
        }
      }
    } else if (type === "callee_candidate") {
      if (data) {
        const strVal = JSON.stringify(data);
        if (!room.calleeCandidates.some(c => JSON.stringify(c) === strVal)) {
          room.calleeCandidates.push(data);
        }
      }
    } else if (type === "reset") {
      room.offer = undefined;
      room.answer = undefined;
      room.callerCandidates = [];
      room.calleeCandidates = [];
    }

    res.json({ success: true });
  });
  // =========================================================================

  // 6. FRIEND REQUESTS API: GET pending or accepted friend requests/relations
  app.get("/api/friend-requests", async (req, res) => {
    try {
      const { toEmail, fromEmail, email, status } = req.query;
      const dbInstance = await getMongoDb();
      let list = [];
      const targetStatus = status || "pending";

      let query: any = {};
      if (targetStatus !== "all") {
        query.status = targetStatus;
      }

      if (email) {
        const cleanEmail = (email as string).split("#pwd_")[0].trim().toLowerCase();
        query.$or = [{ fromEmail: cleanEmail }, { toEmail: cleanEmail }];
      } else {
        if (toEmail) {
          query.toEmail = (toEmail as string).split("#pwd_")[0].trim().toLowerCase();
        }
        if (fromEmail) {
          query.fromEmail = (fromEmail as string).split("#pwd_")[0].trim().toLowerCase();
        }
      }

      if (dbInstance) {
        list = await dbInstance.collection("friend_requests").find(query).toArray();
      } else {
        list = readJsonFile<any[]>(FRIEND_REQUESTS_FILE, []);
        list = list.filter((r: any) => {
          const statusMatch = targetStatus === "all" || r.status === targetStatus;
          let emailMatch = true;
          if (email) {
            const cleanEmail = (email as string).split("#pwd_")[0].trim().toLowerCase();
            emailMatch = r.fromEmail === cleanEmail || r.toEmail === cleanEmail;
          } else {
            if (toEmail && r.toEmail !== (toEmail as string).split("#pwd_")[0].trim().toLowerCase()) emailMatch = false;
            if (fromEmail && r.fromEmail !== (fromEmail as string).split("#pwd_")[0].trim().toLowerCase()) emailMatch = false;
          }
          return statusMatch && emailMatch;
        });
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

      const cleanFromEmail = fromEmail.split("#pwd_")[0].trim().toLowerCase();
      const cleanToEmail = toEmail.split("#pwd_")[0].trim().toLowerCase();

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

  // API Route: Real-Time Translation for global multi-language support (English, German, French, etc.)
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;

      if (!text) {
        res.status(400).json({ error: "Text is verplicht." });
        return;
      }

      // Default back to Dutch if not specified
      const targetLang = targetLanguage || "Dutch";
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        // High quality offline translation simulation for typical 2004 words
        const textLower = text.trim().toLowerCase();
        let fallback = text;

        if (targetLang.toLowerCase().includes("eng") || targetLang.toLowerCase().includes("en")) {
          if (textLower.includes("hallo") || textLower.includes("hey")) {
            fallback = "Hello! Nice to meet you! :-D";
          } else if (textLower.includes("duwtje") || textLower.includes("nudge")) {
            fallback = "🚨 NUDGE! Immediate attention required!";
          } else {
            fallback = `[Translated to English] ${text}`;
          }
        } else if (targetLang.toLowerCase().includes("deu") || targetLang.toLowerCase().includes("dt") || targetLang.toLowerCase().includes("de")) {
          if (textLower.includes("hallo") || textLower.includes("hey")) {
            fallback = "Hallo! Schön dich kennenzulernen! :-D";
          } else if (textLower.includes("duwtje") || textLower.includes("nudge")) {
            fallback = "🚨 ANSTOSS! Sofortige Aufmerksamkeit erforderlich!";
          } else {
            fallback = `[Translated to German] ${text}`;
          }
        } else if (targetLang.toLowerCase().includes("fra") || targetLang.toLowerCase().includes("fr")) {
          if (textLower.includes("hallo") || textLower.includes("hey")) {
            fallback = "Salut ! Ravi de te rencontrer ! :-D";
          } else if (textLower.includes("duwtje") || textLower.includes("nudge")) {
            fallback = "🚨 SIGNAL! Attention immédiate requise !";
          } else {
            fallback = `[Translated to French] ${text}`;
          }
        }
        res.json({ translation: fallback });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Je bent een professionele vertaler geïntegreerd in Buzzi Messenger, een nostalgische MSN Messenger-kloon uit 2004.
Vertaal het onderstaande bericht zorgvuldig naar de taal: ${targetLang}.

Strikte regels:
1. Behoud de nostalgische 2004 MSN-sfeer en MSN-jargon (bijvoorbeeld 'w00t', 'lmao', 'omg', 'brb', 'ff', 'mss') op een passende manier in de doeltaal.
2. Laat emoticons (bijv. :-D, (H), :P, (A), (L), (W), (K), (S), 😉, 👑, 🤖) en nudges (🚨 DUWTJE! ...) EXACT onaangeroerd! Vertaal ze niet en verander de symbolen niet!
3. Geef ENKEL de vertaalde tekst terug. Voeg geen aanhalingstekens, inleiding, uitleg of extra bron/doel-vermeldingen toe.

Bericht om te vertalen:
"${text}"`;

      // Fallback model sequence
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let response: any = null;
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              temperature: 0.3,
            },
          });
          if (response) {
            break;
          }
        } catch (err: any) {
          console.warn(`Translation API: model ${modelName} selected. Trying fallback...`, err);
          lastError = err;
        }
      }

      if (!response && lastError) {
        throw lastError;
      }

      let translatedResult = response?.text?.trim() || text;
      // Strip wrapping quotes if any
      if (translatedResult.startsWith('"') && translatedResult.endsWith('"')) {
        translatedResult = translatedResult.slice(1, -1);
      }
      res.json({ translation: translatedResult });
    } catch (error: any) {
      console.error("Express /api/translate Error:", error);
      res.json({ translation: `[Fout bij vertalen] ${req.body?.text || ""}` });
    }
  });

  // Serve promotional design and mockup kit images
  app.use("/promo-images", express.static(path.join(process.cwd(), "src/assets/images")));

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Serve Vite app in Dev / Serve built assets in Production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
