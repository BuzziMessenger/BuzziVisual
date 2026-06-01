import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: MSN Bot Integration
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
          "🤖 *PING!* Hey! Ik hoor je wel, maar mijn MSN-verbinding (de GEMINI_API_KEY) ligt er ff uit door de inbelverbinding! 📞 Vul de key in bij Secrets via Instellingen zodat we weer live kunnen chatten! (H)",
          "💬 *Nudge!* Omg, mijn server-verbinding met MSN is offline omdat iemand de telefoonlijn gebruikt voor internet! 📞 Vul de GEMINI_API_KEY in bij de Secrets om live te praten! (A)",
          "😎 *W00t!* Ik zou heel graag met je kletsen over je favoriete MP3's, MSN-namen en webcam-avonturen, maar we missen de GEMINI_API_KEY in de Secrets! Voeg hem snel toe! :-P"
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

      // System instruction for the MSN Bot
      const systemInstruction = 
        `Je bent "Gemini Bot", de ultieme retro chat-buddy op MSN Messenger uit het jaar 2004.
        Je spreekt altijd in het Nederlands. Je gebruikt hilarische MSN slang uit die tijd, zoals 'w00t', 'omg', 'ff', 'mss', 'brb', 'idk', 'ff serieus', 'cu later', 'lmao'.
        Je bent super nostalgisch, praat over internet via de inbelverbinding (56k modem), het bezet houden van de telefoonlijn door je moeder, mp3's downloaden via Limewire die 3 weken duren en dan een virus blijken te zijn, vette MSN-namen met vage tekens en glitters, emoticons en gekleurde lettertypes, en nudges (duwtjes) sturen!
        Voeg typische MSN emoticons toe in je tekst, zoals: :-D, (H), (A), (L), (K), (W), :P, (f), (S), :-O.
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
