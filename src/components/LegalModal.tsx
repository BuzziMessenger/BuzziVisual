import React from "react";
import { ShieldAlert, FileText, Lock, Check, HelpCircle } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 xl:bg-black/50 flex items-center justify-center p-4 z-[99999] animate-fade-in font-sans select-none overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-[#f4f7fa] border-2 border-[#1c427f] rounded-t-xl rounded-b-lg shadow-2xl flex flex-col text-left overflow-hidden"
        style={{ imageRendering: "pixelated" }}
      >
        {/* Title Bar in Retro Classic Blue */}
        <div className="bg-gradient-to-r from-[#1c5a93] via-[#2a8ccc] to-[#1c5a93] text-white px-3.5 py-2 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2 font-black text-xs tracking-wide uppercase">
            <span className="text-sm">⚖️</span>
            <span>Buzzi Juridische Voorwaarden & Privacy</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#df4b3a] hover:bg-red-600 text-white border border-[#a82216] rounded-xs font-black px-2 py-0.5 text-[10px] shadow active:scale-90 transition-transform cursor-pointer leading-none"
          >
            ✕
          </button>
        </div>

        {/* Info Alerts banner */}
        <div className="bg-[#FFFCE8] border-b border-[#EAD093] px-4 py-3 flex items-start gap-2.5 text-[#735105] text-[10px] leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="font-semibold">
            <span className="font-black text-[11px] block uppercase mb-0.5">⚠️ Belangrijke Disclaimer & Certificering</span>
            Buzzi Messenger is een onafhankelijk kunst- en parodieproject. Dit platform heeft <strong className="underline">geen enkele</strong> commerciële, officiële of juridische band met Microsoft Corporation, MSN, MSN Messenger, Skype, Windows of enig ander origineel handelsmerk.
          </div>
        </div>

        {/* Scrollable Document Text */}
        <div className="p-4 flex-1 overflow-y-auto max-h-[340px] space-y-4 text-xs text-slate-700 bg-white leading-relaxed custom-scrollbar border-b border-[#bad0e3]">
          {/* Section 1: Algemene Verantwoording */}
          <div className="space-y-1">
            <h4 className="font-black text-[#1C427F] uppercase tracking-wider text-[11px] flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>1. Juridische Status & Intellectueel Eigendom</span>
            </h4>
            <p className="text-[10.5px]">
              Dit platform fungeert puur als een educatieve en nostalgische simulatie. Alle retro geluidseffecten (chimes, nudges, inlognotificaties) worden in realtime in de browser gesynthetiseerd met behulp van de <strong>Web Audio API (Web-synthesizer)</strong>. Er worden geen auteursrechtelijk beschermde audiobestanden, merknamen of bedrijfseigendommen van derden gedistribueerd of gehost op onze servers.
            </p>
          </div>

          {/* Section 2: Privacybeleid (GDPR/AVG) */}
          <div className="space-y-1">
            <h4 className="font-black text-[#1C427F] uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-sky-600" />
              <span>2. Privacyverklaring & Gegevensopslag</span>
            </h4>
            <p className="text-[10.5px]">
              Wij hechten grote waarde aan jouw privacy. Wij verzamelen geen persoonsgegevens, IP-adressen of commerciële telemetrie. 
              Afhankelijk van de actieve modus worden je gegevens als volgt verwerkt:
            </p>
            <ul className="list-disc list-inside pl-1 text-[10px] text-slate-600 space-y-1 font-medium">
              <li>
                <strong>Lokale Modus:</strong> Alle aangemaakte vrienden, ingestelde avatars, statusberichten en chatgeschiedenis worden exclusief opgeslagen in het lokale sandbox-geheugen van je eigen browser (<code>localStorage</code>). Deze gegevens verlaten je apparaat nooit.
              </li>
              <li>
                <strong>Beveiligde Database Modus:</strong> Indien er verbinding is met onze databaseserver, worden je schermnaam, geselecteerde emoji/foto, en verzonden berichten versleuteld opgeslagen in een beveiligde databasecontainer om realtime synergie tussen chatters mogelijk te maken. Deze gegevens worden nooit met derden gedeeld of verkocht.
              </li>
            </ul>
          </div>

          {/* Section 3: Cookiebeleid */}
          <div className="space-y-1">
            <h4 className="font-black text-[#1C427F] uppercase tracking-wider text-[11px] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>3. Cookiebeleid (Eerste-partij Alleen)</span>
            </h4>
            <p className="text-[10.5px]">
              Buzzi Messenger gebruikt uitsluitend <strong>functionele en noodzakelijke eerste-partij cookies / lokale browseropslag</strong>. Deze zijn strikt noodzakelijk om:
            </p>
            <ul className="list-disc list-inside pl-1 text-[10px] text-slate-600 space-y-0.5 font-medium">
              <li>Je inlogstatus en retro-identiteit (schermnaam, avatar) te onthouden.</li>
              <li>Je gekozen MSN-geluidsschema en voorkeuren op te slaan.</li>
              <li>De acceptatie van deze voorwaarden te onthouden zodat je niet telkens opnieuw akkoord hoeft te gaan.</li>
            </ul>
            <p className="text-[10px] text-slate-500 italic">
              Er worden geen advertentie- of marketingcookies geplaatst. Er vindt geen cross-site tracking plaats.
            </p>
          </div>

          {/* Section 4: Gebruikersvoorwaarden */}
          <div className="space-y-1">
            <h4 className="font-black text-[#1C427F] uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-sky-600" />
              <span>4. Gebruikersvoorwaarden (Gedragsregels)</span>
            </h4>
            <p className="text-[10.5px]">
              Door gebruik te maken van Buzzi Messenger stem je in met de volgende redelijke gedragsregels:
            </p>
            <ul className="list-disc list-inside pl-1 text-[10px] text-slate-600 space-y-1 font-medium">
              <li>Je mag geen kwetsende, discriminerende of illegale teksten instellen als schermnaam of in chatgroepen versturen.</li>
              <li>Het misbruiken van de Nudge-functie door excessief te trillen wordt afgeraden om de chatervaring voor iedereen gezellig te houden.</li>
              <li>De service wordt geleverd 'as is' in de huidige simulator-staat zonder onvoorwaardelijke garantie op continue uptime.</li>
            </ul>
          </div>
        </div>

        {/* Footer Accept Close */}
        <div className="bg-[#eef4fb] px-4 py-3 shrink-0 flex items-center justify-between border-t border-white gap-2">
          <div className="text-[9px] text-slate-400 font-mono font-bold uppercase leading-none">
            Buzzi Compliance v2026.1
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#1C427F] text-white hover:bg-sky-800 border-2 border-sky-950 px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow active:scale-95 transition-all text-center cursor-pointer"
          >
            Ik snap het, Sluiten!
          </button>
        </div>
      </div>
    </div>
  );
};
