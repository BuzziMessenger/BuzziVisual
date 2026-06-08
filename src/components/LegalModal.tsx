import React from "react";
import { ShieldAlert, FileText, Lock, Check, HelpCircle } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteLanguage?: string;
}

const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  NL: {
    title: "Buzzi Juridische Voorwaarden & Privacy",
    disclaimerTitle: "⚠️ Belangrijke Disclaimer & Certificering",
    disclaimerText: "Buzzi Messenger is een onafhankelijk kunst- en parodieproject. Dit platform heeft geen enkele commerciële, officiële of juridische band met Microsoft Corporation, MSN, MSN Messenger, Skype, Windows of enig ander origineel handelsmerk.",
    sec1Title: "1. Juridische Status & Intellectueel Eigendom",
    sec1Text: "Dit platform fungegaat puur als een educatieve en nostalgische simulatie. Alle retro geluidseffecten (chimes, nudges, inlognotificaties) worden in realtime in de browser gesynthetiseerd met behulp van de Web Audio API (Web-synthesizer). Er worden geen auteursrechtelijk beschermde audiobestanden, merknamen of bedrijfseigendommen van derden gedistribueerd of gehost op onze servers.",
    sec2Title: "2. Privacyverklaring & Gegevensopslag",
    sec2Text: "Wij hechten grote waarde aan jouw privacy. Wij verzamelen geen persoonsgegevens, IP-adressen of commerciële telemetrie. Afhankelijk van de actieve modus worden je gegevens als volgt verwerkt:",
    sec2Local: "Lokale Modus: Alle aangemaakte vrienden, ingestelde avatars, statusberichten en chatgeschiedenis worden exclusief opgeslagen in het lokale sandbox-geheugen van je eigen browser (localStorage). Deze gegevens verlaten je apparaat nooit.",
    sec2Cloud: "Beveiligde Database Modus: Indien er verbinding is met onze databaseserver, worden je schermnaam, geselecteerde emoji/foto, en verzonden berichten versleuteld opgeslagen in een beveiligde databasecontainer om realtime synergie tussen chatters mogelijk te maken. Deze gegevens worden nooit met derden gedeeld of verkocht.",
    sec3Title: "3. Cookiebeleid (Eerste-partij Alleen)",
    sec3Text: "Buzzi Messenger gebruikt uitsluitend functionele en noodzakelijke eerste-partij cookies / lokale browseropslag. Deze zijn strikt noodzakelijk om:",
    sec3Bullet1: "Je inlogstatus en retro-identiteit (schermnaam, avatar) te onthouden.",
    sec3Bullet2: "Je gekozen Buzzi-geluidsschema en voorkeuren op te slaan.",
    sec3Bullet3: "De acceptatie van deze voorwaarden te onthouden zodat je niet telkens opnieuw akkoord hoeft te gaan.",
    sec3NoTracking: "Er worden geen advertentie- of marketingcookies geplaatst. Er vindt geen cross-site tracking plaats.",
    sec4Title: "4. Gebruikersvoorwaarden (Gedragsregels)",
    sec4Text: "Door gebruik te maken van Buzzi Messenger stem je in met de volgende redelijke gedragsregels:",
    sec4Bullet1: "Je mag geen kwetsende, discriminerende of illegale teksten instellen als schermnaam of in chatgroepen versturen.",
    sec4Bullet2: "Het misbruiken van de Nudge-functie door excessief te trillen wordt afgeraden om de chatervaring voor iedereen gezellig te houden.",
    sec4Bullet3: "De service wordt geleverd 'as is' in de huidige simulator-staat zonder onvoorwaardelijke garantie op continue uptime.",
    closeBtn: "Ik snap het, Sluiten!"
  },
  EN: {
    title: "Buzzi Legal Conditions & Privacy",
    disclaimerTitle: "⚠️ Important Disclaimer & Certification",
    disclaimerText: "Buzzi Messenger is an independent art and parody project. This platform has absolutely NO commercial, official, or legal affiliation with Microsoft Corporation, MSN, MSN Messenger, Skype, Windows, or any other original trademark.",
    sec1Title: "1. Legal Status & Intellectual Property",
    sec1Text: "This platform functions purely as an educational and nostalgic simulation. All retro sound effects (chimes, nudges, login notifications) are synthesized in real-time in the browser using the Web Audio API. No copyrighted audio, trademarks, or proprietary third-party assets are hosted or distributed on our servers.",
    sec2Title: "2. Privacy Policy & Data Storage",
    sec2Text: "We deeply value your privacy. We do not collect personal data, IP addresses, or tracking telemetry. Depending on the active mode, your data is processed as follows:",
    sec2Local: "Local Sandbox Mode: All created friends, avatars, status updates, and chat history are saved exclusively in your browser's localStorage. This data never leaves your device.",
    sec2Cloud: "Secure Database Mode: If connected to our database backend, your screen name, selected avatar/photo, and sent messages are securely stored in our cloud container to enable live communication. This data is never shared or sold.",
    sec3Title: "3. Cookie Policy (First-party Only)",
    sec3Text: "Buzzi Messenger uses functional first-party cookies and local storage. These are strictly necessary to:",
    sec3Bullet1: "Remember your login status and profile (screen name, avatar).",
    sec3Bullet2: "Save your custom Buzzi sound schemes and sound preferences.",
    sec3Bullet3: "Remember your acceptance of these terms so you don't have to agree repeatedly.",
    sec3NoTracking: "No advertisement, marketing, or tracking cookies are ever used. No cross-site profiling takes place.",
    sec4Title: "4. User Terms & Code of Conduct",
    sec4Text: "By using Buzzi Messenger, you agree to these friendly rules:",
    sec4Bullet1: "Do not use offensive, abusive, or illegal text in screen names or chat messages.",
    sec4Bullet2: "Abuse of the Nudge function (excessive buzzing) is discouraged to keep the chat cozy for everyone.",
    sec4Bullet3: "The simulator is provided 'as is' with no guarantees of uninterrupted 100% service uptime.",
    closeBtn: "I understand, Close!"
  },
  DE: {
    title: "Buzzi Rechtliche Hinweise & Datenschutz",
    disclaimerTitle: "⚠️ Wichtiger Haftungsausschluss",
    disclaimerText: "Buzzi Messenger is ein unabhängiges Kunst- und Parodieprojekt. Diese Plattform steht in keinerlei kommerzieller, offizieller oder rechtlicher Verbindung mit der Microsoft Corporation, MSN, Skype, Windows oder anderen Marken.",
    sec1Title: "1. Rechtlicher Status & Geistiges Eigentum",
    sec1Text: "Diese Plattform dient ausschließlich als nostalgische und pädagogische Simulation. Alle Retro-Soundeffekte werden in Echtzeit über die Web Audio API im Browser synthetisiert. Es werden keine urheberrechtlich geschützten Audio- oder Markenressourcen auf unseren Servern gehostet.",
    sec2Title: "2. Datenschutzerklärung & Datenspeicherung",
    sec2Text: "Wir legen großen Wert auf Ihren Datenschutz. Wir sammeln keine persönlichen Daten, IP-Adressen oder kommerzielle Telemetrie. Je nach Modus werden Ihre Daten wie folgt verarbeitet:",
    sec2Local: "Lokaler Modus: Alle erstellten Kontakte, Avatare, Statusmeldungen und Chatverläufe werden ausschließlich im lokalen Speicher Ihres Browsers (localStorage) gesichert.",
    sec2Cloud: "Datenbank-Modus: Bei einer Serververbindung werden Ihr Anzeigename, Avatar und Nachrichten in einer sicheren Datenbank gespeichert, um Echtzeit-Chats zu ermöglichen.",
    sec3Title: "3. Cookie-Richtlinie (Nur Erstanbieter)",
    sec3Text: "Buzzi Messenger verwendet ausschließlich funktionale Cookies und lokalen Speicher. Diese sind zwingend erforderlich, um:",
    sec3Bullet1: "Ihre Anmeldung und Identität (Name, Avatar) zu speichern.",
    sec3Bullet2: "Ihre Sound-Einstellungen und Vorlieben zu sichern.",
    sec3Bullet3: "Die Annahme dieser Bedingungen zu speichern, damit Sie nicht ständig zustimmen müssen.",
    sec3NoTracking: "Es werden keine Werbe- oder Tracking-Cookies verwendet. Es findet kein websiteübergreifendes Tracking statt.",
    sec4Title: "4. Nutzungsbedingungen & Verhaltensregeln",
    sec4Text: "Mit der Nutzung von Buzzi Messenger erklären Sie sich mit folgenden Regeln einverstanden:",
    sec4Bullet1: "Verwenden Sie keine beleidigenden oder illegalen Texte in Namen oder Chats.",
    sec4Bullet2: "Missbrauch der Anstoß-Funktion (Nudge) durch übermäßiges Trillern ist zu unterlassen.",
    sec4Bullet3: "Die Bereitstellung erfolgt ohne Gewähr auf ständige Erreichbarkeit.",
    closeBtn: "Ich verstehe, Schließen!"
  },
  FR: {
    title: "Conditions Juridiques & Confidentialité Buzzi",
    disclaimerTitle: "⚠️ Clause de non-responsabilité importante",
    disclaimerText: "Buzzi Messenger est un projet artistique et de parodie indépendant. Cette plateforme n'a aucun lien commercial, officiel ou juridique avec Microsoft Corporation, MSN, Skype, Windows ou toute autre marque d'origine.",
    sec1Title: "1. Statut juridique et propriété intellectuelle",
    sec1Text: "Cette plateforme fonctionne uniquement comme une simulation éducative et nostalgique. Tous les effets sonores rétro sont synthétisés en temps réel dans le navigateur via l'API Web Audio. Aucun contenu audio ou propriété de tiers n'est hébergé ou distribué sur nos serveurs.",
    sec2Title: "2. Déclaration de confidentialité & Stockage des données",
    sec2Text: "Nous accordons une grande importance à la confidentialité. Nous ne collectons aucune donnée personnelle, adresse IP ou télémétrie commerciale. Vos données sont traitées de la manière suivante :",
    sec2Local: "Mode local : Tous les amis créés, avatars, messages de statut et l'historique des discussions sont enregistrés exclusivement dans le stockage de votre navigateur (localStorage).",
    sec2Cloud: "Mode base de données : Si vous êtes connecté, votre pseudo, avatar et messages sont stockés de manière sécurisée dans une base de données pour permettre la communication.",
    sec3Title: "3. Politique relative aux cookies",
    sec3Text: "Buzzi Messenger utilise uniquement des cookies fonctionnels de première partie. Ils sont strictement nécessaires pour :",
    sec3Bullet1: "Retenir votre état de connexion et votre profil (pseudo, avatar).",
    sec3Bullet2: "Enregistrer vos préférences de thèmes sonores Buzzi.",
    sec3Bullet3: "Mémoriser l'acceptation de ces conditions afin de ne pas vous les redemander.",
    sec3NoTracking: "Aucun cookie publicitaire ou de suivi n'est installé. Aucun ciblage n'est effectué.",
    sec4Title: "4. Conditions d'utilisation",
    sec4Text: "En utilisant Buzzi Messenger, vous acceptez ces règles simples :",
    sec4Bullet1: "Vous ne devez pas utiliser de termes offensants ou illégaux dans vos pseudos ou messages.",
    sec4Bullet2: "L'abus de la fonction d'envoi de signaux (vibrations excessives) est à éviter.",
    sec4Bullet3: "Le service est fourni 'en l'état' sans garantie de disponibilité ininterrompue.",
    closeBtn: "J'ai compris, Fermer !"
  },
  ES: {
    title: "Condiciones Legales & Privacidad de Buzzi",
    disclaimerTitle: "⚠️ Descargo de responsabilidad importante",
    disclaimerText: "Buzzi Messenger es un proyecto independiente de arte y parodia. Esta plataforma no tiene ninguna afiliación comercial, oficial o legal con Microsoft Corporation, MSN, Skype, Windows o marcas originales.",
    sec1Title: "1. Estatus Legal y Propiedad Intelectual",
    sec1Text: "Esta plataforma funciona únicamente como una simulación educativa y nostálgica. Todos los efectos de sonido se sintetizan en tiempo real en la Web Audio API del navegador. No se hospeda ni distribuye audios protegidos.",
    sec2Title: "2. Declaración de Privacidad & Datos",
    sec2Text: "Valoramos mucho su privacidad. No recopilamos datos personales, direcciones IP o telemetría. Sus datos se procesan de la siguiente manera:",
    sec2Local: "Modo Local: Todos los contactos creados, avatares, estados e historial de chat se guardan localmente en localStorage.",
    sec2Cloud: "Modo Base de Datos: Si se conecta al servidor, su nombre, avatar y mensajes se guardarán de forma segura en la base de datos para habilitar chats en tiempo real.",
    sec3Title: "3. Política de Cookies (Solo Propias)",
    sec3Text: "Buzzi Messenger utiliza únicamente cookies funcionales. Son estrictamente necesarias para:",
    sec3Bullet1: "Recordar su inicio de sesión y perfil (nombre, avatar).",
    sec3Bullet2: "Guardar sus esquemas y preferencias de sonido.",
    sec3Bullet3: "Recordar la aceptación de estos términos.",
    sec3NoTracking: "No se utilizan cookies publicitarias ni de seguimiento de terceros.",
    sec4Title: "4. Condiciones de Uso (Reglas de Conducta)",
    sec4Text: "Al usar Buzzi Messenger, usted acepta seguir estas amigables reglas:",
    sec4Bullet1: "No usar textos ofensivos o ilegales en nombres o chats.",
    sec4Bullet2: "Se desaconseja abusar de la función de zumbido excesivo.",
    sec4Bullet3: "El servicio se proporciona 'tal cual' sin garantía absoluta de disponibilidad continua.",
    closeBtn: "Lo entiendo, ¡Cerrar!"
  },
  IT: {
    title: "Condizioni Legali & Privacy di Buzzi",
    disclaimerTitle: "⚠️ Dichiarazione di limitazione di responsabilità",
    disclaimerText: "Buzzi Messenger è un progetto artistico e parodia indipendente. Questa piattaforma non ha alcuna affiliazione commerciale, ufficiale o legale con Microsoft Corporation, MSN, Skype, Windows o marchi originali.",
    sec1Title: "1. Stato legale e Proprietà Intellettuale",
    sec1Text: "Questa piattaforma funge esclusivamente da simulazione nostalgica ed educativa. Tutti gli effetti sonori retro sono sintetizzati in tempo reale tramite la Web Audio API. Nessun contenuto protetto è ospitato sui nostri server.",
    sec2Title: "2. Informativa sulla Privacy & Salvataggio Dati",
    sec2Text: "Diamo grande valore alla tua privacy. Non raccogliamo dati personali, indirizzi IP o telemetria commerciale. I tuoi dati vengono trattati come segue:",
    sec2Local: "Modalità Locale: Tutti i contatti, gli avatar inseriti, gli stati e la cronologia chat vengono memorizzati sul tuo browser (localStorage).",
    sec2Cloud: "Modalità Database Protetto: In caso di connessione al server, il tuo nome, l'avatar scelto e i messaggi verranno memorizzati nel database per consentire la chat.",
    sec3Title: "3. Informativa sui Cookie (Solo Prima Parte)",
    sec3Text: "Buzzi Messenger utilizza esclusivamente cookie tecnici e di prima parte. Sono necessari per:",
    sec3Bullet1: "Ricordare lo stato di accesso e il profilo (nome, avatar).",
    sec3Bullet2: "Salvare le preferenze e gli schemi sonori.",
    sec3Bullet3: "Ricordare l'accettazione di queste condizioni.",
    sec3NoTracking: "Non viene inserito alcun cookie pubblicitario o tracciamento di terze parti.",
    sec4Title: "4. Condizioni d'Uso (Regole di Comportamento)",
    sec4Text: "Utilizzando Buzzi Messenger, accetti le seguenti semplici regole di comportamento:",
    sec4Bullet1: "Non inserire frasi offensive o illegali come nomi o chat.",
    sec4Bullet2: "È sconsigliato l'abuso della funzione trillo per mantenere un'esperienza piacevole.",
    sec4Bullet3: "Il servizio viene fornito così com'è senza garanzia di uptime continuo al 100%.",
    closeBtn: "Ho capito, Chiudi!"
  }
};

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, siteLanguage = "NL" }) => {
  if (!isOpen) return null;

  const lang = (siteLanguage || "NL").toUpperCase();
  const dict = LOCAL_TRANSLATIONS[lang] || LOCAL_TRANSLATIONS["NL"];

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
            <span>{dict.title}</span>
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
            <span className="font-black text-[11px] block uppercase mb-0.5">{dict.disclaimerTitle}</span>
            {dict.disclaimerText}
          </div>
        </div>

        {/* Scrollable Document Text */}
        <div className="p-4 flex-1 overflow-y-auto max-h-[340px] space-y-4 text-xs text-slate-700 bg-white leading-relaxed custom-scrollbar border-b border-[#bad0e3]">
          {/* Section 1 */}
          <div className="space-y-1">
            <h4 className="font-black text-[#1C427F] uppercase tracking-wider text-[11px] flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>{dict.sec1Title}</span>
            </h4>
            <p className="text-[10.5px]">
              {dict.sec1Text}
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-1">
            <h4 className="font-black text-[#1C427F] uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-sky-600" />
              <span>{dict.sec2Title}</span>
            </h4>
            <p className="text-[10.5px]">
              {dict.sec2Text}
            </p>
            <ul className="list-disc list-inside pl-1 text-[10px] text-slate-600 space-y-1 font-medium">
              <li>
                {dict.sec2Local}
              </li>
              <li>
                {dict.sec2Cloud}
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-1">
            <h4 className="font-black text-[#1C427F] uppercase tracking-wider text-[11px] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>{dict.sec3Title}</span>
            </h4>
            <p className="text-[10.5px]">
              {dict.sec3Text}
            </p>
            <ul className="list-disc list-inside pl-1 text-[10px] text-slate-600 space-y-0.5 font-medium">
              <li>{dict.sec3Bullet1}</li>
              <li>{dict.sec3Bullet2}</li>
              <li>{dict.sec3Bullet3}</li>
            </ul>
            <p className="text-[10px] text-slate-500 italic">
              {dict.sec3NoTracking}
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-1">
            <h4 className="font-black text-[#1C427F] uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-sky-600" />
              <span>{dict.sec4Title}</span>
            </h4>
            <p className="text-[10.5px]">
              {dict.sec4Text}
            </p>
            <ul className="list-disc list-inside pl-1 text-[10px] text-slate-600 space-y-1 font-medium">
              <li>{dict.sec4Bullet1}</li>
              <li>{dict.sec4Bullet2}</li>
              <li>{dict.sec4Bullet3}</li>
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
            {dict.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
