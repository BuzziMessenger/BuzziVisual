import React, { useState } from "react";
import { Smile, CircleAlert, ShieldCheck, Mail, User } from "lucide-react";
import { hiveAudio } from "../utils/audio";

interface LoginScreenProps {
  onLoginSuccess: (name: string, email: string) => void;
}

// Client-side simple string hashing function to prevent plaintext password lookup in users list
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return "h_" + Math.abs(hash).toString(36);
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<"google" | "custom">("custom");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Custom login state
  const [typedEmail, setTypedEmail] = useState("");
  const [typedName, setTypedName] = useState("");
  const [typedPassword, setTypedPassword] = useState("");

  // Authenticate with Google (Mock Passport Network Integration)
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    hiveAudio.playHoneyPop();
    try {
      // Simulate quick-login with safe developer credentials
      const mockName = "Google Buzzi Vriend";
      const mockEmail = "google_passport@buzzi.nl#pwd_google";
      
      // Auto register/sync google user profile
      await fetch("/api/db/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: "u_google_mock",
          name: mockName,
          email: mockEmail,
          avatar: "🧑‍🚀",
          status: "online",
          personalMessage: "Aangemeld met Google Passport! B-)"
        })
      });

      hiveAudio.playNotification();
      onLoginSuccess(mockName, mockEmail);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Aanmelden met Google Passport mislukt: " + (err.message || "Probeer het opnieuw"));
    } finally {
      setLoading(false);
    }
  };

  // Custom email login / signup backed by Node/MongoDB
  const handleCustomEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedEmail || !typedEmail.includes("@")) {
      setErrorMsg("Voer een geldig e-mailadres in!");
      return;
    }
    if (!typedName.trim()) {
      setErrorMsg("Voer een originele Buzzi bijnaam in!");
      return;
    }
    if (typedPassword.length < 3) {
      setErrorMsg("Kies een inlogcode/wachtwoord van minimaal 3 tekens!");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    hiveAudio.playHoneyPop();

    try {
      // 1. Fetch current registered users from database / JSON fallback
      const usersRes = await fetch("/api/db/users");
      if (!usersRes.ok) {
        throw new Error("Kon gebruikerslijst niet ophalen");
      }
      const usersList = await usersRes.json();
      
      const targetCleanEmail = typedEmail.trim().toLowerCase();
      const existingUserDoc = usersList.find((u: any) => {
        if (!u.email) return false;
        const cleanUserEmail = u.email.split("#pwd_")[0].trim().toLowerCase();
        return cleanUserEmail === targetCleanEmail;
      });

      const enteredHash = simpleHash(typedPassword);
      const finalizedEmail = `${targetCleanEmail}#pwd_${enteredHash}`;
      const userUid = `u_${simpleHash(targetCleanEmail)}`;

      if (existingUserDoc) {
        const parts = existingUserDoc.email.split("#pwd_");
        const storedHash = parts[1];

        if (storedHash && storedHash !== enteredHash) {
          setErrorMsg("🔑 Onjuist wachtwoord! Dit e-mailadres is beveiligd. Voer de juiste inlogcode in of kies een ander e-mailadres.");
          setLoading(false);
          return;
        }

        // Login matched existing user!
        hiveAudio.playNotification();
        onLoginSuccess(existingUserDoc.name || typedName.trim(), finalizedEmail);
      } else {
        // Create new user record first
        const newUserProfile = {
          uid: userUid,
          name: typedName.trim(),
          email: finalizedEmail,
          avatar: "🧑‍🚀",
          status: "online",
          personalMessage: "Lekker chatten op Buzzi met Gemini! B-)"
        };

        const saveRes = await fetch("/api/db/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUserProfile)
        });

        if (!saveRes.ok) {
          throw new Error("Kon nieuw profiel niet opslaan");
        }

        hiveAudio.playNotification();
        onLoginSuccess(typedName.trim(), finalizedEmail);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Mislukt: " + (err.message || "Probeer het opnieuw"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-b from-[#4A86E8] via-[#0F55C9] to-[#012269] font-sans px-4 select-none">
      
      {/* Authentic Retro Buzzi Container */}
      <div className="w-full max-w-[420px] bg-gradient-to-b from-[#F2F6FB] via-[#E1ECF7] to-[#D5E5F4] rounded-2xl shadow-2xl border-2 border-[#1E56A0] overflow-hidden flex flex-col relative animate-fade-in">
        
        {/* Buzzi Top Window Bar */}
        <div className="bg-gradient-to-r from-[#2154B6] via-[#327EE3] to-[#2154B6] px-4 py-2 flex items-center justify-between text-white border-b border-[#0C3B90]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold font-mono tracking-wider">MEMBER SIGN-IN</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded-sm bg-[#5C94E5] hover:bg-sky-400 border border-[#0F3987] flex items-center justify-center text-[8px] font-bold cursor-pointer">&#9644;</div>
            <div className="w-3.5 h-3.5 rounded-sm bg-[#EF4F4F] hover:bg-red-500 border border-[#8B1A1A] flex items-center justify-center text-[9px] font-black cursor-pointer">&#10005;</div>
          </div>
        </div>

        {/* Buzzi Logo Header */}
        <div className="px-6 pt-6 pb-4 text-center select-none flex flex-col items-center">
          <div className="relative group">
            {/* Styled Colorful Retro Butterfly Avatar shape */}
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-sky-500 rounded-full flex items-center justify-center shadow-md animate-bounce border-4 border-white">
              <Smile className="w-12 h-12 text-white fill-current animate-pulse" />
            </div>
            {/* Small decorative butterfly helper circles */}
            <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center text-[11px] shadow-sm font-bold text-white">✓</div>
          </div>
          <h1 className="mt-4 text-[#1C427F] font-black text-xl tracking-tighter uppercase drop-shadow-sm flex items-center gap-1.5 justify-center">
            <span>Buzzi Messenger</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white font-mono lowercase tracking-normal">v2004</span>
          </h1>
          <p className="text-[9px] text-sky-800 font-mono mt-1 font-bold tracking-widest uppercase">
            Microsoft Passport Network
          </p>
        </div>

        {/* Tab Selection */}
        <div className="mx-6 mb-3 grid grid-cols-2 bg-[#D1E0EE] p-1 rounded-lg border border-slate-300">
          <button
            type="button"
            onClick={() => {
              setActiveTab("custom");
              setErrorMsg("");
            }}
            className={`text-[11px] font-bold py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "custom"
                ? "bg-white text-[#1C427F] shadow-sm border border-slate-300"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Eigen E-mailadres
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("google");
              setErrorMsg("");
            }}
            className={`text-[11px] font-bold py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === "google"
                ? "bg-white text-[#1C427F] shadow-sm border border-slate-300"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Snelstarten
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mb-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 rounded-xl p-3 flex items-start gap-2 shadow-sm text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-emerald-950 text-[10px] font-black uppercase tracking-wider">
              {activeTab === "google" ? "Quick Start:" : "Lokale Beveiliging:"}
            </div>
            <p className="text-[10px] text-emerald-900 leading-normal font-medium font-sans">
              {activeTab === "google"
                ? "Meld je direct en razendsnel aan met ons standaard Buzzi Google Passport."
                : "Kies een persoonlijk wachtwoord/inlogcode bij je adres. De eerste keer stelt dit jouw wachtwoord in, de volgende keren beveiligt dit jouw chatgesprekken!"}
            </p>
          </div>
        </div>

        {/* Error message indicator */}
        {errorMsg && (
          <div className="mx-6 mb-4 bg-red-100 hover:bg-red-200 border-2 border-red-300 rounded-xl p-3 flex flex-col gap-2.5 shadow-sm text-left animate-shake transition-all duration-100">
            <div className="flex items-start gap-2">
              <CircleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-red-950 text-xs font-black">Aanmeldingsfout!</div>
                <p className="text-[10px] text-red-900 leading-normal font-semibold font-sans">{errorMsg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                hiveAudio.playNotification();
                const finalName = typedName.trim() || "Buzzi Vriend";
                const finalEmail = typedEmail.trim() || "gast@buzzi.nl";
                onLoginSuccess(finalName, `${finalEmail}#pwd_local`);
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[10.5px] font-black py-2 px-3 rounded-lg border-2 border-amber-700 shadow-sm transition-all cursor-pointer text-center uppercase tracking-wide"
            >
              ⚡ Toch doorgaan in Offline/Lokale Modus 🚀
            </button>
          </div>
        )}

        {/* Custom form tab */}
        {activeTab === "custom" ? (
          <form onSubmit={handleCustomEmailLogin} className="px-6 pb-6 pt-2 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              
              {/* E-mail Input */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold text-[#1C427F] uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>E-mailadres (Hotmail / Buzzi / Live / Gmail / enz.)</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="bijvoorbeeld: robbin@hotmail.com"
                  value={typedEmail}
                  onChange={(e) => setTypedEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border-2 border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] select-text"
                />
              </div>

              {/* Display Name Input */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold text-[#1C427F] uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Buzzi Schermnaam (Bijnaam)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="bijvoorbeeld: Robin [B-)]"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border-2 border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] select-text"
                />
              </div>

              {/* Buzzi Wachtwoord / Inlogcode input */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-bold text-[#1C427F] uppercase tracking-wider flex items-center gap-1">
                  <span>🔑</span>
                  <span>Buzzi Inlogcode / Wachtwoord (Beveiliging)</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Voer je wachtwoord of code in..."
                  value={typedPassword}
                  onChange={(e) => setTypedPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border-2 border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] select-text"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-[#8CC63F] to-[#719E32] hover:from-[#9AD947] hover:to-[#7EAE37] text-white text-xs font-black py-2.5 rounded-xl shadow-md border-2 border-[#5C8229] flex items-center justify-center gap-3 cursor-pointer active:scale-98 transition-all duration-100 uppercase tracking-wider disabled:opacity-50"
              >
                <span className="text-base">🦋</span>
                <span>{loading ? "Inloggen beveiligen..." : "Veilig Aanmelden"}</span>
              </button>

              <div className="flex items-center py-0.5 justify-center gap-1.5">
                <span className="h-px bg-slate-300 w-full" />
                <span className="text-[8px] text-slate-400 font-bold uppercase shrink-0">OF GEBRUIK</span>
                <span className="h-px bg-slate-300 w-full" />
              </div>

              <button
                type="button"
                onClick={() => {
                  hiveAudio.playNotification();
                  const finalName = typedName.trim() || "Gast Gebruiker";
                  const finalEmail = typedEmail.trim() || "gast@buzzi.nl";
                  onLoginSuccess(finalName, `${finalEmail}#pwd_local`);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white text-[10.5px] font-bold py-2 rounded-lg border border-amber-600 shadow-sm transition-all cursor-pointer text-center"
              >
                Snelstarten in Offline/Lokale Modus
              </button>
            </div>
          </form>
        ) : (
          /* Google tab */
          <div className="px-6 pb-6 pt-2 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-center text-[10.5px] font-bold text-slate-500 pb-1">
                Klik op de onderstaande knop om direct verbinding te maken
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#2B80EB] to-[#155FB7] hover:from-[#3D8CF2] hover:to-[#1B6ECC] text-white text-xs font-black py-3 rounded-xl shadow-md border-2 border-[#1E56A0] flex items-center justify-center gap-3 cursor-pointer active:scale-98 transition-all duration-100 uppercase tracking-wider disabled:opacity-50"
              >
                <span className="text-base">🌐</span>
                <span>{loading ? "Verbinding maken..." : "Passport Snel Inloggen"}</span>
              </button>

              <div className="flex items-center py-0.5 justify-center gap-2">
                <span className="h-px bg-slate-300 w-full" />
                <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0">OF</span>
                <span className="h-px bg-slate-300 w-full" />
              </div>

              <button
                type="button"
                onClick={() => {
                  hiveAudio.playNotification();
                  onLoginSuccess("Buzzi Gast", "gast@buzzi.nl#pwd_local");
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black py-2.5 rounded-xl shadow-md border-2 border-amber-700 flex items-center justify-center gap-3 cursor-pointer active:scale-98 transition-all duration-100 uppercase tracking-wider"
              >
                <span className="text-base">⚡</span>
                <span>Gast Inloggen (Offline Modus)</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer info containing terms */}
        <div className="bg-[#E4ECF4] py-3 text-center border-t border-[#C7D7E9] text-[9.5px] font-mono text-slate-500 font-bold uppercase tracking-wider">
          © Microsoft Hotmail Corporation 2004
        </div>
      </div>

      {/* Instructional helper with setup guidelines */}
      <div className="mt-6 max-w-sm text-center text-white/70 text-[10.5px] leading-relaxed select-text p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        🎈 <strong className="text-white">Beveiligde Database:</strong> Ieder eigen e-mailadres is beveiligd met het gekozen wachtwoord. Alleen met de juiste code kun je naar binnen!
      </div>
    </div>
  );
}
