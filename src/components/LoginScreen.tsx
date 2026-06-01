import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { auth } from "../utils/firebase";
import { Smile, Users, Laptop, Play, Compass, KeyRound, Mail, CircleAlert } from "lucide-react";
import { hiveAudio } from "../utils/audio";

interface LoginScreenProps {
  onLoginSuccess: (name: string, email: string) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Authenticate with Google (Passport Network integration)
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    hiveAudio.playHoneyPop();
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        hiveAudio.playNotification();
        onLoginSuccess(result.user.displayName || "MSN Vriend", result.user.email || "");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Aanmelden met Google mislukt: " + (err.message || "Probeer het opnieuw"));
    } finally {
      setLoading(false);
    }
  };

  // Authenticate with Email & Password
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Inlog-ID (e-mail) en wachtwoord zijn verplicht!");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    hiveAudio.playHoneyPop();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user) {
        hiveAudio.playNotification();
        onLoginSuccess(result.user.displayName || email.split("@")[0], result.user.email || "");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        setErrorMsg("Ongeldige combinatie van e-mail en wachtwoord. Heb je al een account geregistreerd?");
      } else if (err.code === "auth/invalid-email") {
        setErrorMsg("Voer een geldig e-mailadres in!");
      } else {
        setErrorMsg("Inloggen mislukt: " + (err.message || "Onbekende fout"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Register with Email, Password & Nickname
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !nickname) {
      setErrorMsg("Vul alle velden in om een MSN Passport ID aan te maken!");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Wachtwoord moet minimaal 6 karakters bevatten!");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    hiveAudio.playHoneyPop();
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user) {
        // We will store this display name
        hiveAudio.playNotification();
        onLoginSuccess(nickname, result.user.email || "");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMsg("Dit e-mailadres is al in gebruik! Probeer in te loggen.");
      } else if (err.code === "auth/invalid-email") {
        setErrorMsg("Voer een geldig e-mailadres in!");
      } else {
        setErrorMsg("Registratie mislukt: " + (err.message || "Gebruik andere gegevens"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-b from-[#4A86E8] via-[#0F55C9] to-[#012269] font-sans px-4 select-none">
      
      {/* Authentic Retro MSN Container */}
      <div className="w-full max-w-[420px] bg-gradient-to-b from-[#F2F6FB] via-[#E1ECF7] to-[#D5E5F4] rounded-2xl shadow-2xl border-2 border-[#1E56A0] overflow-hidden flex flex-col relative">
        
        {/* MSN Top Window Bar */}
        <div className="bg-gradient-to-r from-[#2154B6] via-[#327EE3] to-[#2154B6] px-4 py-2 flex items-center justify-between text-white border-b border-[#0C3B90]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold font-mono tracking-wider">MEMBER SIGN-IN</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded-sm bg-[#5C94E5] hover:bg-sky-400 border border-[#0F3987] flex items-center justify-center text-[8px] font-bold cursor-pointer">&#9644;</div>
            <div className="w-3.5 h-3.5 rounded-sm bg-[#EF4F4F] hover:bg-red-500 border border-[#8B1A1A] flex items-center justify-center text-[9px] font-black cursor-pointer">&#10005;</div>
          </div>
        </div>

        {/* MSN Logo Header */}
        <div className="px-6 py-6 text-center select-none flex flex-col items-center">
          <div className="relative group">
            {/* Styled Colorful Retro Butterfly Avatar shape */}
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-sky-500 rounded-full flex items-center justify-center shadow-md animate-bounce border-2 border-white">
              <Smile className="w-12 h-12 text-white fill-current animate-pulse" />
            </div>
            {/* Small decorative butterfly helper circles */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-sm font-bold text-white">✓</div>
          </div>
          <h1 className="mt-4 text-[#1C427F] font-black text-2xl tracking-tighter uppercase drop-shadow-sm flex items-center gap-1.5 justify-center">
            <span>Buzzi Messenger</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white font-mono lowercase tracking-normal">v2004</span>
          </h1>
          <p className="text-[10px] text-sky-800 font-mono mt-0.5 font-bold tracking-widest uppercase">
            Microsoft Passport Network
          </p>
        </div>

        {/* Error message indicator */}
        {errorMsg && (
          <div className="mx-6 mb-4 bg-red-100 hover:bg-red-200 border-2 border-red-300 rounded-xl p-3 flex items-start gap-2.5 shadow-sm text-left animate-shake transition-all transition-duration-100">
            <CircleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-red-950 text-xs font-black">Aanmeldingsfout!</div>
              <p className="text-[10.5px] text-red-900 leading-normal font-semibold font-sans">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Standard sign-in or passport sign-up */}
        <div className="px-6 pb-6 flex-1 flex flex-col justify-between">
          {!isRegistering ? (
            /* SIGN IN FORM */
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[11px] text-[#245D99] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Passport E-mailadres:</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@hotmail.com"
                  className="w-full bg-white border-2 border-[#A2BDDB] focus:border-[#2F66A9] text-xs font-semibold rounded-lg px-3 py-2.5 text-slate-800 shadow-inner outline-none transition-all placeholder:text-slate-400 font-mono"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[11px] text-[#245D99] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Wachtwoord:</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-[#A2BDDB] focus:border-[#2F66A9] text-xs h-9 font-semibold rounded-lg px-3 py-1 text-slate-800 shadow-inner outline-none transition-all placeholder:text-slate-400"
                  disabled={loading}
                />
              </div>

              {/* Classic MSN remember me configurations */}
              <div className="flex flex-col gap-1.5 text-left pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-slate-600 hover:text-slate-800">
                  <input type="checkbox" className="accent-[#0F55C9] h-3.5 w-3.5 rounded" />
                  <span>Mijn wachtwoord onthouden</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-slate-600 hover:text-slate-800">
                  <input type="checkbox" className="accent-[#0F55C9] h-3.5 w-3.5 rounded" />
                  <span>Mij automatisch aanmelden</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#2B80EB] to-[#155FB7] hover:from-[#3D8CF2] hover:to-[#1B6ECC] text-white text-xs font-extrabold py-3.5 rounded-xl shadow-md cursor-pointer border border-[#144F96] active:scale-98 transition-all uppercase tracking-widest disabled:opacity-50"
                >
                  {loading ? "Aanmelden..." : "Aanmelden (Sign In)"}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#A2BDDB]/40"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-mono uppercase tracking-widest">Of</span>
                  <div className="flex-grow border-t border-[#A2BDDB]/40"></div>
                </div>

                {/* Google Sign-In with Microsoft colors */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white hover:bg-slate-50 text-[#1F4172] text-xs font-black py-3 rounded-xl shadow-sm border-2 border-[#1E56A0]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all transition-duration-100"
                >
                  <span className="text-base">🌐</span>
                  <span>Passport Google Inloggen</span>
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-[11px] text-[#245D99] font-extrabold uppercase tracking-wider">
                  Selecteer Nickname (MSN-Naam):
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="xX_Robbin_Skater90_Xx (L)"
                  className="w-full bg-white border-2 border-[#A2BDDB] focus:border-[#2F66A9] text-xs font-semibold rounded-lg px-3 py-2.5 text-slate-800 shadow-inner outline-none transition-all"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[11px] text-[#245D99] font-extrabold uppercase tracking-wider">
                  Nieuw E-mailadres (Hotmail ID):
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jouwnaam@hotmail.com"
                  className="w-full bg-white border-2 border-[#A2BDDB] focus:border-[#2F66A9] text-xs font-semibold rounded-lg px-3 py-2.5 text-slate-800 shadow-inner outline-none transition-all font-mono"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[11px] text-[#245D99] font-extrabold uppercase tracking-wider">
                  Wachtwoord (minimaal 6 tekens):
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-[#A2BDDB] focus:border-[#2F66A9] text-xs h-9 font-semibold rounded-lg px-3 py-1 text-slate-800 shadow-inner outline-none transition-all"
                  disabled={loading}
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#21BA45] to-[#16AB39] hover:from-[#2ECC40] hover:to-[#21BA45] text-white text-xs font-extrabold py-3.5 rounded-xl border border-emerald-700 shadow-md cursor-pointer active:scale-98 transition-all uppercase tracking-wider disabled:opacity-50"
                >
                  {loading ? "Account aanmaken..." : "Registreren & Aanmelden!"}
                </button>
              </div>
            </form>
          )}

          {/* Selector to shift between Registration & Login */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMsg("");
                hiveAudio.playHoneyPop();
              }}
              className="text-[#104D99] hover:underline text-[11px] font-black tracking-wide cursor-pointer uppercase"
              disabled={loading}
            >
              {isRegistering ? "« Heb je al een account? Log direct in!" : "Nieuw op MSN? Registreer hier je Passport ID! »"}
            </button>
          </div>
        </div>

        {/* Footer info containing terms */}
        <div className="bg-[#E4ECF4] py-3 text-center border-t border-[#C7D7E9] text-[9.5px] font-mono text-slate-500 font-bold uppercase tracking-wider">
          © Microsoft Hotmail Corporation 2004
        </div>
      </div>

      {/* Instructional helper with setup guidelines */}
      <div className="mt-6 max-w-sm text-center text-white/70 text-[10.5px] leading-relaxed select-text p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        💡 <strong className="text-white">Tip:</strong> Aanmelden met Google werkt direct.<br />
        Als je inlogt met e-mail & wachtwoord, zorg dat <em>Email/Password</em> auth aanstaat in je Firebase Console.
      </div>
    </div>
  );
}
