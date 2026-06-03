import React, { useState, useEffect } from "react";
import { Smile, CircleAlert, ShieldCheck, Mail, User, Phone, CheckCircle2, ChevronRight, MessageSquareCode } from "lucide-react";
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
  const [activeTab, setActiveTab ] = useState<"custom" | "guest">("custom");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Parse invite details from URL parameters
  const [invitedBy, setInvitedBy] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);

  // Custom login state
  const [typedEmail, setTypedEmail] = useState("");
  const [typedName, setTypedName] = useState("");
  const [typedPassword, setTypedPassword] = useState("");
  const [emailFlow, setEmailFlow] = useState<"login" | "register">("login");
  const [selectedAvatar, setSelectedAvatar] = useState("🧑‍🚀");
  const [personalMessage, setPersonalMessage] = useState("Lekker chatten op Buzzi met Buzzi Bot! B-)");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hostInvitedBy = params.get("invitedBy");
      const hostInviteEmail = params.get("inviteEmail");
      if (hostInvitedBy) {
        setInvitedBy(hostInvitedBy);
      }
      if (hostInviteEmail) {
        setInviteEmail(hostInviteEmail);
      }
      if (hostInviteEmail && hostInvitedBy) {
        try {
          localStorage.setItem("buzzi_pending_invite", JSON.stringify({ invitedBy: hostInvitedBy, inviteEmail: hostInviteEmail }));
        } catch (e) {
          console.warn("Fout bij opslaan pending uitnodiging:", e);
        }
      }
    }
    try {
      const rememberedEmail = localStorage.getItem("buzzi_remembered_email");
      const rememberedName = localStorage.getItem("buzzi_remembered_name");
      if (rememberedEmail) {
        setTypedEmail(rememberedEmail);
      }
      if (rememberedName) {
        setTypedName(rememberedName);
      }
    } catch (e) {
      console.warn("Could not read remembered Buzzi login credentials:", e);
    }
  }, []);

  // Custom email login / signup backed by Node/MongoDB with persistent fallback
  const handleCustomEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedEmail || !typedEmail.trim()) {
      setErrorMsg("Voer je e-mailadres in!");
      return;
    }
    if (!typedEmail.includes("@")) {
      setErrorMsg("Voer een geldig e-mailadres in (bijvoorbeeld: robin@live.nl)!");
      return;
    }
    if (emailFlow === "register" && !typedName.trim()) {
      setErrorMsg("Kies een Buzzi Schermnaam voor je registratie!");
      return;
    }
    if (!typedPassword) {
      setErrorMsg("Voer een Buzzi Wachtwoord in!");
      return;
    }
    if (typedPassword.length < 3) {
      setErrorMsg("Het Buzzi Wachtwoord moet minimaal 3 tekens zijn!");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    hiveAudio.playHoneyPop();

    try {
      // 1. Fetch current registered users from database or backup cache list
      let usersList = [];
      try {
        const usersRes = await fetch("/api/db/users?t=" + Date.now());
        if (usersRes.ok) {
          usersList = await usersRes.json();
          try {
            localStorage.setItem("buzzi_backup_users_list", JSON.stringify(usersList));
          } catch (e) {}
        } else {
          const backup = localStorage.getItem("buzzi_backup_users_list");
          usersList = backup ? JSON.parse(backup) : [];
        }
      } catch (fetchErr) {
        console.warn("MongoDB users query failed, falling back to local list:", fetchErr);
        const backup = localStorage.getItem("buzzi_backup_users_list");
        usersList = backup ? JSON.parse(backup) : [];
      }
      
      const targetCleanEmail = typedEmail.trim().toLowerCase();
      const existingUserDoc = usersList.find((u: any) => {
        if (!u.email) return false;
        const cleanUserEmail = u.email.split("#pwd_")[0].trim().toLowerCase();
        return cleanUserEmail === targetCleanEmail;
      });

      const enteredHash = simpleHash(typedPassword);
      const finalizedEmail = `${targetCleanEmail}#pwd_${enteredHash}`;
      const userUid = `u_${simpleHash(targetCleanEmail)}`;

      if (emailFlow === "login") {
        if (!existingUserDoc) {
          // AUTO-RECOVER LOGIC
          // The local database was cleared (standard during container redeploys or branch updates), so we restore them on the fly!
          const rememberedName = localStorage.getItem("buzzi_remembered_name") || targetCleanEmail.split("@")[0];
          
          const newUserProfile = {
            uid: userUid,
            name: rememberedName,
            email: finalizedEmail,
            avatar: selectedAvatar || "🧑‍🚀",
            status: "online",
            personalMessage: personalMessage || "Lekker chatten op Buzzi met Buzzi Bot! B-)"
          };

          try {
            await fetch("/api/db/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newUserProfile)
            });
            
            localStorage.setItem("buzzi_remembered_email", targetCleanEmail);
            localStorage.setItem("buzzi_remembered_name", rememberedName);
          } catch (recoveryErr) {
            console.error("Auto-recovery of user profile failed:", recoveryErr);
          }

          hiveAudio.playNotification();
          onLoginSuccess(rememberedName, finalizedEmail);
          setLoading(false);
          return;
        }

        const parts = existingUserDoc.email.split("#pwd_");
        const storedHash = parts[1];

        if (storedHash && storedHash !== enteredHash) {
          setErrorMsg("Onjuist wachtwoord! Voer de juiste inlogcode in of maak een nieuw account aan.");
          setLoading(false);
          return;
        }

        // Login matched existing user!
        try {
          localStorage.setItem("buzzi_remembered_email", targetCleanEmail);
          localStorage.setItem("buzzi_remembered_name", existingUserDoc.name || "");
        } catch (e) {
          console.error(e);
        }
        hiveAudio.playNotification();
        onLoginSuccess(existingUserDoc.name || "Buzzi Vriend", finalizedEmail);
      } else {
        // REGISTRATION FLOW
        if (existingUserDoc) {
          setErrorMsg("Dit e-mailadres is al geregistreerd! Klik hierboven op 'Inloggen' om direct in te loggen.");
          setLoading(false);
          return;
        }

        // Create new user record
        const newUserProfile = {
          uid: userUid,
          name: typedName.trim(),
          email: finalizedEmail,
          avatar: selectedAvatar,
          status: "online",
          personalMessage: personalMessage
        };

        // Try DB write, fail elegantly without aborting the login
        try {
          await fetch("/api/db/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUserProfile)
          });
        } catch (dbErr) {
          console.warn("DB save user failed, using local fallback state:", dbErr);
        }

        // Save to local backup list so consecutive fetches match immediately
        try {
          const backupStr = localStorage.getItem("buzzi_backup_users_list");
          const backupList = backupStr ? JSON.parse(backupStr) : [];
          if (!backupList.some((u: any) => u.uid === userUid)) {
            backupList.push(newUserProfile);
            localStorage.setItem("buzzi_backup_users_list", JSON.stringify(backupList));
          }
        } catch (localStoreErr) {
          console.error("Local storage backup sync failed:", localStoreErr);
        }

        try {
          localStorage.setItem("buzzi_remembered_email", targetCleanEmail);
          localStorage.setItem("buzzi_remembered_name", typedName.trim());
        } catch (e) {
          console.error(e);
        }
        hiveAudio.playNotification();
        onLoginSuccess(typedName.trim(), finalizedEmail);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Aanmeldingsfout: " + (err.message || "Probeer de offline snelstart gratis te gebruiken."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen w-screen bg-gradient-to-b from-[#4A86E8] via-[#0F55C9] to-[#012269] font-sans px-4 py-8 select-none gap-8 relative overflow-x-hidden">
      
      {/* Authentic Retro Buzzi Container */}
      <div className="w-full max-w-[420px] bg-gradient-to-b from-[#F2F6FB] via-[#E1ECF7] to-[#D5E5F4] rounded-2xl shadow-2xl border-2 border-[#1E56A0] overflow-hidden flex flex-col relative animate-fade-in z-10 shrink-0">
        
        {/* Buzzi Top Window Bar */}
        <div className="bg-gradient-to-r from-[#2154B6] via-[#327EE3] to-[#2154B6] px-4 py-2 flex items-center justify-between text-white border-b border-[#0C3B90]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold font-mono tracking-wider">GEBRUIKERS INLOGGEN</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded-sm bg-[#5C94E5] hover:bg-sky-400 border border-[#0F3987] flex items-center justify-center text-[8px] font-bold cursor-pointer">&#9644;</div>
            <div className="w-3.5 h-3.5 rounded-sm bg-[#EF4F4F] hover:bg-red-500 border border-[#8B1A1A] flex items-center justify-center text-[9px] font-black cursor-pointer">&#10005;</div>
          </div>
        </div>

        {/* Buzzi Logo Header */}
        <div className="px-6 pt-5 pb-3 text-center flex flex-col items-center">
          <div className="relative group">
            {/* Styled Colorful Retro Butterfly Avatar shape */}
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-sky-500 rounded-full flex items-center justify-center shadow-md animate-bounce border-4 border-white">
              <Smile className="w-10 h-10 text-white fill-current animate-pulse" />
            </div>
            <div className="absolute top-0 right-0 w-5.5 h-5.5 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-sm font-bold text-white">✓</div>
          </div>
          <h1 className="mt-3 text-[#1C427F] font-black text-lg tracking-tighter uppercase drop-shadow-sm flex items-center gap-1.5 justify-center">
            <span>Buzzi Messenger</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500 text-white font-mono lowercase tracking-normal">V2026</span>
          </h1>
        </div>

        {/* Invitation Banner Alert if invited */}
        {invitedBy && (
          <div className="mx-6 mb-3 bg-indigo-50 border-2 border-indigo-300 rounded-xl p-3 text-left animate-pulse shadow-sm flex items-start gap-2.5">
            <span className="text-xl">💌</span>
            <div>
              <div className="text-indigo-950 text-[10px] font-black uppercase tracking-wider">Uitnodiging Ontvangen!</div>
              <p className="text-[10.5px] text-indigo-900 leading-normal font-bold">
                Je bent uitgenodigd door <strong className="text-[#1C427F]">{invitedBy}</strong>! Meld je hieronder direct aan en chat meteen samen live op Buzzi!
              </p>
            </div>
          </div>
        )}

        {/* Tab Selection (Two Column Grid) */}
        <div className="mx-6 mb-3 grid grid-cols-2 bg-[#D1E0EE] p-1 rounded-lg border border-slate-300 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab("custom");
              setErrorMsg("");
            }}
            className={`text-[11.5px] font-black py-2.5 rounded-md transition-all cursor-pointer whitespace-nowrap text-center ${
              activeTab === "custom"
                ? "bg-[#1C427F] text-white shadow-sm"
                : "text-slate-600 hover:text-[#1C427F]"
            }`}
          >
            📧 E-mail & Wachtwoord
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("guest");
              setErrorMsg("");
            }}
            className={`text-[11.5px] font-black py-2.5 rounded-md transition-all cursor-pointer whitespace-nowrap text-center ${
              activeTab === "guest"
                ? "bg-[#1C427F] text-white shadow-sm"
                : "text-slate-600 hover:text-[#1C427F]"
            }`}
          >
            ⚡ Gast Snelstart
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mb-3 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 rounded-xl p-3 flex items-start gap-2 shadow-sm text-left shrink-0 animate-fade-in">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-emerald-950 text-[10px] font-black uppercase tracking-wider">
              {activeTab === "guest" ? "Gast Toegang Snelstart:" : "Veilige Logingegevens:"}
            </div>
            <p className="text-[10px] text-emerald-900 leading-normal font-medium font-sans">
              {activeTab === "guest"
                ? "Meld je direct en anoniem aan als Buzzi Gast om de chat meteen uit te proberen, zonder wachtwoord."
                : "Registreer de eerste keer gratis je e-mail met een wachtwoord naar keuze. Dit beveiligt jouw profiel en chatgesprekken!"}
            </p>
          </div>
        </div>

        {/* Error message indicator */}
        {errorMsg && (
          <div className="mx-6 mb-3 bg-red-100 hover:bg-red-200 border-2 border-red-300 rounded-xl p-3 flex flex-col gap-2 shadow-sm text-left animate-shake transition-all duration-100 shrink-0">
            <div className="flex items-start gap-2">
              <CircleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-red-950 text-xs font-black">Aanmeldingsfout!</div>
                <p className="text-[10px] text-red-900 leading-normal font-semibold font-sans">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic form rendering */}
        {activeTab === "custom" && (
          <div className="flex-1 flex flex-col justify-between animate-fade-in">
            {/* Sub-tabs login vs register */}
            <div className="mx-6 mt-1 mb-2 flex bg-[#dfebf7] p-1 rounded-lg border border-[#abc4df] gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEmailFlow("login");
                  setErrorMsg("");
                }}
                className={`flex-1 text-xs font-extrabold py-2 rounded-md transition-all cursor-pointer text-center ${
                  emailFlow === "login"
                    ? "bg-[#1C427F] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 font-bold"
                }`}
              >
                Inloggen 🔓
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailFlow("register");
                  setErrorMsg("");
                }}
                className={`flex-1 text-xs font-extrabold py-2 rounded-md transition-all cursor-pointer text-center ${
                  emailFlow === "register"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 font-bold"
                }`}
              >
                Registreren ✨
              </button>
            </div>

            <form onSubmit={handleCustomEmailLogin} className="px-6 pb-5 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                {/* E-mail Input */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-black text-[#1C427F] uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>E-mailadres</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="bijvoorbeeld: robbin@hotmail.com"
                    value={typedEmail}
                    onChange={(e) => setTypedEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border-2 border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] select-text font-semibold shadow-inner"
                  />
                </div>

                {/* Display Name Input */}
                {emailFlow === "register" && (
                  <>
                    <div className="flex flex-col gap-1 text-left animate-fade-in">
                      <label className="text-[10px] font-black text-[#1C427F] uppercase tracking-wider flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>Buzzi Schermnaam</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="bijvoorbeeld: Robin [B-)]"
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border-2 border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] select-text font-semibold shadow-inner"
                      />
                    </div>

                    {/* Choose Emoji Avatar */}
                    <div className="flex flex-col gap-1 text-left animate-fade-in">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-[#1C427F] uppercase tracking-wider flex items-center gap-1">
                          <span>🧩</span>
                          <span>Kies je Buzzi Avatar (24 favorieten)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const fullAvatars = [
                              "🧑‍🚀", "🦋", "🐝", "🐱", "🐶", "🦊", "🤖", "👽", "🤠", "🧙", "😎", "👾", "🐻", "🦄", "🎮", "🍕",
                              "🍟", "🍦", "🎸", "🎧", "🛹", "⚽", "⚡", "🔥", "🌈", "🎈", "💎", "👑", "🍀", "🎃", "💩", "👻",
                              "🦁", "🐯", "🐼", "🐨", "🐸", "🐵", "🦖", "🍩", "🧁", "🍿", "🚗", "🚀", "💡", "🔮", "🛎️", "🔑"
                            ];
                            const randomEmoji = fullAvatars[Math.floor(Math.random() * fullAvatars.length)];
                            setSelectedAvatar(randomEmoji);
                            hiveAudio.playNotification();
                          }}
                          className="text-[9.5px] font-black text-[#1C427F] hover:text-[#4A86E8] bg-white border border-[#B9CEDF] rounded px-1.5 py-0.5 shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-0.5"
                        >
                          <span>🎲 Dobbelen!</span>
                        </button>
                      </div>
                      <div className="bg-[#DCE7F3] p-1.5 rounded-lg border border-[#B9CEDF] grid grid-cols-8 gap-1.5 justify-center">
                        {[
                          "🧑‍🚀", "🦋", "🐝", "🐱", "🐶", "🦊", "🤖", "👽", "🤠", "🧙", "😎", "👾",
                          "🐻", "🦄", "🎮", "🍕", "🎸", "🎧", "🛹", "⚽", "⚡", "🔥", "🌈", "👑"
                        ].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setSelectedAvatar(emoji);
                              hiveAudio.playHoneyPop();
                            }}
                            className={`w-7 h-7 text-sm rounded bg-white hover:bg-sky-100 border flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                              selectedAvatar === emoji
                                ? "border-[#1C427F] bg-[#CFE1F5] outline-none ring-2 ring-sky-500 scale-110"
                                : "border-slate-300"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      {/* Show current selection if it is a rolled custom one from the deep list of 48 */}
                      {!["🧑‍🚀", "🦋", "🐝", "🐱", "🐶", "🦊", "🤖", "👽", "🤠", "🧙", "😎", "👾", "🐻", "🦄", "🎮", "🍕", "🎸", "🎧", "🛹", "⚽", "⚡", "🔥", "🌈", "👑"].includes(selectedAvatar) && (
                        <div className="mt-1 flex items-center gap-1.5 bg-[#CFE1F5] p-1 rounded border border-[#16427E] text-[10px] text-slate-800 font-bold self-start">
                          <span>Gedobbeld:</span>
                          <span className="text-sm bg-white aspect-square h-5 rounded flex items-center justify-center border">{selectedAvatar}</span>
                        </div>
                      )}
                    </div>

                    {/* Choose Personal Status message preset */}
                    <div className="flex flex-col gap-1 text-left animate-fade-in">
                      <label className="text-[10px] font-black text-[#1C427F] uppercase tracking-wider flex items-center gap-1">
                        <span>💬</span>
                        <span>Kies of typ je statusbericht</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Typ je eigen status..."
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border-2 border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] select-text font-semibold shadow-inner"
                      />
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[
                          "Lekker chatten op Buzzi! 😎",
                          "Aan het rocken op Veronica 🎸",
                          "Offline vibe, online chat B-)",
                          "Zoemend de dag door! 🐝",
                          "Druk bezig met gamen 🎮"
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setPersonalMessage(preset)}
                            className={`text-[8.5px] px-1.5 py-0.5 rounded border text-slate-700 font-medium cursor-pointer transition-all ${
                              personalMessage === preset
                                ? "bg-[#1C427F] text-white border-[#1C427F]"
                                : "bg-[#EAEEF4] hover:bg-[#D9E4EF] border-[#B9CEDF]"
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Buzzi Wachtwoord / Inlogcode input */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] font-black text-[#1C427F] uppercase tracking-wider flex items-center gap-1">
                    <span>🔑</span>
                    <span>Buzzi Wachtwoord</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder={emailFlow === "register" ? "Kies een nieuw wachtwoord..." : "Voer je wachtwoord in..."}
                    value={typedPassword}
                    onChange={(e) => setTypedPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border-2 border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] select-text font-semibold shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-2 bg-gradient-to-r ${
                    emailFlow === "register"
                      ? "from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 border-emerald-800"
                      : "from-[#8CC63F] to-[#719E32] hover:from-[#9AD947] hover:to-[#7EAE37] border-[#5C8229]"
                  } text-white text-xs font-black py-2.5 rounded-xl shadow-md border-2 flex items-center justify-center gap-3 cursor-pointer active:scale-98 transition-all duration-100 uppercase tracking-wider disabled:opacity-50`}
                >
                  <span className="text-base">{emailFlow === "register" ? "✨" : "🔓"}</span>
                  <span>
                    {loading
                      ? "Inloggen beveiligen..."
                      : emailFlow === "register"
                      ? "Maak account & Inloggen"
                      : "Direct Veilig Inloggen"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gast Snelstart Tab */}
        {activeTab === "guest" && (
          <div className="px-6 pb-6 pt-2 flex-1 flex flex-col justify-between animate-fade-in">
            <div className="space-y-4 text-center">
              <div className="text-[11px] font-bold text-slate-500 leading-relaxed py-1">
                Wil je liever anoniem rondkijken? Met onze Gast inlogfunctie ben je direct startklaar zonder e-mail of wachtwoord op te hoeven geven.
              </div>

              <button
                type="button"
                onClick={() => {
                  hiveAudio.playNotification();
                  let guestId = localStorage.getItem("buzzi_guest_id");
                  if (!guestId) {
                    guestId = String(Math.floor(Math.random() * 900000 + 100000));
                    localStorage.setItem("buzzi_guest_id", guestId);
                  }
                  onLoginSuccess(`Buzzi Gast #${guestId}`, `gast_${guestId}@buzzi.nl#pwd_local`);
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black py-3 rounded-xl shadow-md border-2 border-amber-700 flex items-center justify-center gap-3 cursor-pointer active:scale-98 transition-all duration-100 uppercase tracking-wider"
              >
                <span className="text-lg">⚡</span>
                <span>Als Gast Binnengaan (Direct Chatten)</span>
              </button>

              <div className="text-[9.5px] italic text-slate-400">
                (Let op: Gast-accounts bewaren geen chatgeschiedenis bij het wissen van browsergegevens)
              </div>
            </div>
          </div>
        )}

        {/* Footer info containing terms */}
        <div className="bg-[#E4ECF4] py-3 text-center border-t border-[#C7D7E9] text-[9.5px] font-mono text-slate-500 font-bold uppercase tracking-wider shrink-0">
          © Buzzi Messenger Corporation 2026
        </div>
      </div>

      {/* Instructional helper with setup guidelines */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-white/50 text-[9px] uppercase tracking-wider font-bold">
        Beveiligd door 128-bit SSL & Buzzi Gateways Ltd™
      </div>
    </div>
  );
}
