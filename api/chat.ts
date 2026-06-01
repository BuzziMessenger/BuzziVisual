import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests for the chat API
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed - Gebruik een POST request! :-D" });
    return;
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ error: "Bericht is verplicht." });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // High-quality fallback if API key is not configured in environment variables
      const fallbackReplies = [
        "🤖 *PING!* Hey! Ik hoor je wel, maar mijn Buzzi-verbinding (de GEMINI_API_KEY) ligt er ff uit door de inbelverbinding! 📞 Vul de key in bij je Vercel Environment Variables zodat we weer live kunnen chatten! (H)",
        "💬 *Nudge!* Omg, mijn server-verbinding met Buzzi is offline omdat iemand de telefoonlijn gebruikt voor internet! 📞 Vul de GEMINI_API_KEY in bij de Vercel Settings om live te praten! (A)",
        "😎 *W00t!* Ik zou heel graag met je kletsen over je favoriete MP3's, Buzzi-namen en webcam-avonturen, maar we missen de GEMINI_API_KEY in de Vercel Environment Variables! Voeg hem snel toe! :-P"
      ];
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      res.status(200).json({ reply: randomReply });
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
      Haud antwoorden enthousiast, nostalgisch, grappig en korter dan 3 alinea's. Moedig de gebruiker aan om je een 'Nudge' (duwtje) te sturen!`;

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

    // Try a pool of stable models for maximum robustness
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
        console.warn(`Vercel Chat API: Model ${modelName} failed or busy. Trying next fallback...`, err?.message || err);
        lastError = err;
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    const textValue = response?.text || "🤖 *PING!* Ik weet even niks te zeggen... mss is de lijn bezet! :-D";
    res.status(200).json({ reply: textValue });
  } catch (error: any) {
    console.error("Vercel Chat API Error:", error);
    res.status(200).json({
      reply: `🤖 *Nudge!* Oeps... Verbinding verbroken: "${error?.message || "Inbelverbinding offline"}"! Probeer het zo nog eens! :-P`
    });
  }
}
