import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../server";

export default async function handle(req: VercelRequest, res: VercelResponse) {
  try {
    if (typeof app === "function" || (app && typeof (app as any).handle === "function")) {
      return app(req, res);
    } else {
      throw new Error("Het geladen serverbestand is geen geldige Express-applicatie.");
    }
  } catch (error: any) {
    console.error("Vercel Startup/Execution Error:", error);
    res.status(500).json({
      error: "Buzzi Server Startup Fout (500)",
      message: error?.message || String(error),
      stack: error?.stack || null,
      context: {
        nodeVersion: process.version,
        envVercel: process.env.VERCEL,
        mongoUrConfigured: !!process.env.MONGODB_URI,
        cwd: process.cwd(),
      }
    });
  }
}


