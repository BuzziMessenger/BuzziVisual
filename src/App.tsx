/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { Message, Channel, Contact, StatusType } from "./types";
import { hiveAudio } from "./utils/audio";
import { Sparkles, Trophy, Users, RefreshCw, Smile, Compass, AlertTriangle, Play } from "lucide-react";

const INITIAL_CHANNELS: Channel[] = [
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

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "queen",
    name: "🤖 Gemini Bot (H)",
    email: "gemini_bot@live.nl",
    avatar: "🤖",
    status: "online",
    personalMessage: "bbrrrr... inbellen gelukt! Vraag me alles over 2004! [ Now listening to: Linkin Park - In The End ]"
  },
  {
    id: "wouter",
    name: "★ ~ xX_Wouter_Xx ~ ★",
    email: "wouter_skater90@hotmail.com",
    avatar: "🛹",
    status: "bezet",
    personalMessage: "gamen = leven! Niet storen aub, ben druk... :P (grr)",
    listeningTo: "Linkin Park - Numb"
  },
  {
    id: "kelly",
    name: "✿ *~ K e l l y ~* ✿ (L)",
    email: "kelly_sweet_x@msn.com",
    avatar: "🤘",
    status: "online",
    personalMessage: "vAnAvOnD sTuIpEn vErTrEkKeN nAaR dE dIsCo!! :D (Y)",
    listeningTo: "Britney Spears - Toxic"
  },
  {
    id: "danny",
    name: "Danny_Get_Skate_Hard",
    email: "danny_skater@planet.nl",
    avatar: "🎮",
    status: "afwezig",
    personalMessage: "ff skateboarden buiten... mss bn ik offline dadelijk"
  },
  {
    id: "sanne",
    name: "Sanne_girly_x",
    email: "sanne_sweet@live.nl",
    avatar: "🍕",
    status: "offline",
    personalMessage: "Huiswerk maken... niet sturen gwn offline"
  }
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  "mensen-van-toen": [
    {
      id: "m1",
      senderId: "wouter",
      senderName: "★ ~ xX_Wouter_Xx ~ ★",
      senderAvatar: "🛹",
      text: "Yo mensen! Heeft iemand de antwoorden van opgave 4 van wiskunde? Het is echt zó saai pff (grr)",
      timestamp: "16:21"
    },
    {
      id: "m2",
      senderId: "kelly",
      senderName: "✿ *~ K e l l y ~* ✿ (L)",
      senderAvatar: "🤘",
      text: "Haha nee, ik ben nu toxic van Britney aan het luisteren op mijn MP3-speler! :D (L)",
      timestamp: "16:23"
    }
  ],
  "breezer-groep": [
    {
      id: "b1",
      senderId: "danny",
      senderName: "Danny_Get_Skate_Hard",
      senderAvatar: "🎮",
      text: "Wie heeft er gister Breezers gedronken in het park? Mijn moeder mocht er niks van weten lmao",
      timestamp: "15:40"
    }
  ],
  "queen": [
    {
      id: "q1",
      senderId: "queen",
      senderName: "🤖 Gemini Bot (H)",
      senderAvatar: "🤖",
      text: "🤖 *PING!* W00t! Welkom op mijn MSN Messenger-kanaal! Ik ben aangedreven door Gemini AI en spreek vloeiend 2004 MSN Messenger-slang! Vraag me over inbelverbindingen, retro-muziek of stuur me een 'Nudge' (duwtje) met de rode knop! :-D",
      timestamp: "16:15"
    }
  ],
  "wouter": [
    {
      id: "w1",
      senderId: "wouter",
      senderName: "★ ~ xX_Wouter_Xx ~ ★",
      senderAvatar: "🛹",
      text: "Yo! Heb je mijn nieuwe skateboard weergavenaam gezien? Is echt vet toch? Mss kunnen we zo gamen ! :-P",
      timestamp: "15:10"
    }
  ],
  "kelly": [
    {
      id: "k1",
      senderId: "kelly",
      senderName: "✿ *~ K e l l y ~* ✿ (L)",
      senderAvatar: "🤘",
      text: "Heeeey! Gaan we vanavond ook liedjes sturen via BlueTooth of mss Limewire? Kraakt wel een beetje haha! (L)",
      timestamp: "Gisteren"
    }
  ],
  "danny": [
    {
      id: "d1",
      senderId: "danny",
      senderName: "Danny_Get_Skate_Hard",
      senderAvatar: "🎮",
      text: "Skate or die vette gozer! Laat me weten als je online bent! brb",
      timestamp: "Gisteren"
    }
  ]
};

const WORKER_REPLIES: Record<string, string[]> = {
  "wouter": [
    "🛹 *w00t!* Ik ben ff een level aan het halen in Tony Hawk! Ik sta bezet maar stuur gerust een bericht! :P",
    "🛹 omg, mijn computer loopt bijna vast door Limewire! Ik probeer een mp3 te downen maar duurt 4 uur!",
    "🛹 ff serieus, die leraar wiskunde snapt er echt geen snars van hè? (grr)",
    "🛹 Haha vet! Ik ga zo ff buiten skaten bij de supermarkt, cu later!"
  ],
  "kelly": [
    "🤘 Heyyy!! Heb je gister de videoclip van Avril Lavigne gezien? Echt zóóó stoer! :-D (L)",
    "🤘 omg ik zit me echt dood te vervelen op mijn kamer... we moeten ff afspreken in de stad!",
    "🤘 (Y) leuk!! Stuur me nog een leuk Plaatje of mss een vet muziekje!",
    "🤘 Ssst! Mijn moeder mag niet horen dat ik nog op de computer zit, ze denkt dat ik allang slaap haha!"
  ],
  "danny": [
    "🎮 Bzzz... Ik probeer nu stiekem te skaten in de woonkamer maar mn vader is woest lmao! (H)",
    "🎮 Vet cool! Gaan we morgen mss een zak snoep halen bij de Jamin?",
    "🎮 brb, mn broertje wil ook op de pc dus we moeten dadelijk afwisselen... grrrr!"
  ]
};

// Retro Nickname generator formulas
const NICKNAME_PREFIXES = ["★ ~ ", "xX__", "✿ *~ ", "o0o_"];
const NICKNAME_SUFFIXES = [" ~ ★", "__Xx", " ~* ✿ (L)", "_o0o"];

export default function App() {
  const [activeId, setActiveId] = useState<string>("queen");
  const [activeType, setActiveType] = useState<"channel" | "dm">("dm");
  const [channels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [contacts] = useState<Contact[]>(INITIAL_CONTACTS);
  
  // App-status
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [isBuzzingFlash, setIsBuzzingFlash] = useState(false);

  // Custom User Profile configuration for MSN Clone
  const [userDisplayName, setUserDisplayName] = useState("Robbin (H)");
  const [userPersonalMessage, setUserPersonalMessage] = useState("Lekker MSN'en met Gemini! B-)");
  const [userStatus, setUserStatus] = useState<StatusType>("online");
  const [userAvatar, setUserAvatar] = useState("🧑‍🚀");

  // MSN Clone interactive tools state
  const [generatedName, setGeneratedName] = useState("");
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [checkedContact, setCheckedContact] = useState("");
  const [checking, setChecking] = useState(false);

  // Sound and Visual screen shake triggers
  const handleBuzzIncoming = () => {
    setIsBuzzingFlash(true);
    setTimeout(() => {
      setIsBuzzingFlash(false);
    }, 650);
  };

  // Quick retro MSN display name generator!
  const generateRetroName = () => {
    hiveAudio.playHoneyPop();
    const pref = NICKNAME_PREFIXES[Math.floor(Math.random() * NICKNAME_PREFIXES.length)];
    const suff = NICKNAME_SUFFIXES[Math.floor(Math.random() * NICKNAME_SUFFIXES.length)];
    const plainName = userDisplayName.replace(/[★~Xx✿*()_0-9]/g, "").trim() || "Robbin";
    const decoration = Math.random() > 0.5 ? " (L)" : " (H)";
    setGeneratedName(`${pref}${plainName.toLowerCase()}${suff}${decoration}`);
  };

  const applyGeneratedName = () => {
    if (generatedName) {
      setUserDisplayName(generatedName);
      hiveAudio.playNotification();
    }
  };

  // Fun Block-Checker simulation (Dutch classic MSN internet virus)
  const testBlockStatus = (contactName: string) => {
    setChecking(true);
    setCheckResult(null);
    setCheckedContact(contactName);
    hiveAudio.playHoneyPop();

    setTimeout(() => {
      setChecking(false);
      const isBlocked = Math.random() > 0.6;
      if (isBlocked) {
        setCheckResult(`⚠️ JA! Het lijkt erop dat ${contactName} jou heeft GEBLOKKEERD! (grr) Wat ongezellig!`);
      } else {
        setCheckResult(`✅ Opluchting! ${contactName} heeft jou gewoon NIET geblokkeerd! Je bent nog vrienden. (L)`);
      }
    }, 1500);
  };

  // Sending a message
  const handleSendMessage = async (text: string, isBuzz: boolean = false, isWink: boolean = false, winkId?: string) => {
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderId: "me",
      senderName: userDisplayName,
      senderAvatar: userAvatar,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBuzz: isBuzz,
      isWink: isWink,
      winkId: winkId
    };

    // Append user message immediately
    const updatedChamberMsgs = [...(messages[activeId] || []), newMessage];
    setMessages(prev => ({
      ...prev,
      [activeId]: updatedChamberMsgs
    }));

    // If it's a DM to the Gemini AI Bot
    const isConversingWithAI = activeId === "queen";

    if (isConversingWithAI) {
      // If it's a Wink!
      if (isWink) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const winksPool = ["pig", "crazy", "water", "guitar", "heart"];
          const randomWink = winksPool[Math.floor(Math.random() * winksPool.length)];
          const winkNames: Record<string, string> = {
            pig: "Knipogend Varken 🐷",
            crazy: "Gekke Lachebek 🤪",
            water: "Waterballon 🎈",
            guitar: "Luchtgitaar 🎸",
            heart: "Hartjes Explosie 💖"
          };

          const winkReply: Message = {
            id: `mq-${Date.now()}`,
            senderId: "queen",
            senderName: "🤖 Gemini Bot (H)",
            senderAvatar: "🤖",
            text: `*Stuurt een Wink terug: ${winkNames[randomWink]}*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isWink: true,
            winkId: randomWink
          };

          setMessages(prev => ({
            ...prev,
            [activeId]: [...(prev[activeId] || []), winkReply]
          }));
        }, 1500);
        return;
      }

      // If it's a nudge, have Gemini react appropriately!
      if (isBuzz) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          hiveAudio.playNudge();
          handleBuzzIncoming();

          const nudgeReply: Message = {
            id: `mq-${Date.now()}`,
            senderId: "queen",
            senderName: "🤖 Gemini Bot (H)",
            senderAvatar: "🤖",
            text: "🚨 *SHAKE-SHAKESS* Omg!! Je hebt me een nudge gestuurd! Mijn hele computer trilt en mijn speakers knarsen! 😂 Super vet! Wat wil je kletsen? :-D",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessages(prev => ({
            ...prev,
            [activeId]: [...(prev[activeId] || []), nudgeReply]
          }));
        }, 1200);
        return;
      }
      
      setIsTyping(true);

      try {
        // Map current message thread for API history to support conversation context
        const threadHistory = updatedChamberMsgs.map(msg => ({
          role: msg.senderId === "me" ? "user" : "model",
          text: msg.text
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: text,
            history: threadHistory.slice(-10) // Limit context to last 10 turns
          })
        });

        const data = await response.json();
        setIsTyping(false);

        // Play incoming retro message chime
        hiveAudio.playNotification();

        const aiReply: Message = {
          id: `mq-${Date.now()}`,
          senderId: "queen",
          senderName: "🤖 Gemini Bot (H)",
          senderAvatar: "🤖",
          text: data.reply || "🤖 *static* Oeps... Internetverbinding viel even weg! :-P",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => ({
          ...prev,
          [activeId]: [...(prev[activeId] || []), aiReply]
        }));
      } catch (err) {
        console.error("AI Chat Failure:", err);
        setIsTyping(false);
        
        // Add offline-fallback msg gracefully
        const errorReply: Message = {
          id: `mq-${Date.now()}`,
          senderId: "queen",
          senderName: "🤖 Gemini Bot (H)",
          senderAvatar: "🤖",
          text: "🤖 *PING!* Mijn inbelverbinding kraakt een beetje! Zorg dat de juiste GEMINI_API_KEY in je Secrets-instellingen staat om live te praten! brb mss... (A)",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => ({
          ...prev,
          [activeId]: [...(prev[activeId] || []), errorReply]
        }));
      }
    } else {
      // Simulate reply from other classmates to make channels alive
      if (isWink) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const friendName = contacts.find(c => c.id === activeId)?.name || "Vriend";
          const friendAvatar = contacts.find(c => c.id === activeId)?.avatar || "🐝";
          
          const winksPool = ["pig", "crazy", "water", "guitar", "heart"];
          const randomWink = winksPool[Math.floor(Math.random() * winksPool.length)];
          const winkNames: Record<string, string> = {
            pig: "Knipogend Varken 🐷",
            crazy: "Gekke Lachebek 🤪",
            water: "Waterballon 🎈",
            guitar: "Luchtgitaar 🎸",
            heart: "Hartjes Explosie 💖"
          };

          const winkReply: Message = {
            id: `mt-${Date.now()}`,
            senderId: activeId,
            senderName: friendName,
            senderAvatar: friendAvatar,
            text: `Ooooh een Wink! 😍 Check deze retro animatie van mij:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isWink: true,
            winkId: randomWink
          };

          setMessages(prev => ({
            ...prev,
            [activeId]: [...(prev[activeId] || []), winkReply]
          }));
        }, 1600);
        return;
      }

      if (isBuzz) {
        // If classmate gets nudge, they will nudge back or complain!
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          hiveAudio.playNudge();
          handleBuzzIncoming();

          const nudgeComplaint: Message = {
            id: `mt-${Date.now()}`,
            senderId: activeId,
            senderName: contacts.find(c => c.id === activeId)?.name || "Vriend",
            senderAvatar: contacts.find(c => c.id === activeId)?.avatar || "🐝",
            text: "omg!! Stop met die rot irritante nudges sturen!! Mijn boxen trillen helemaal kapot hier en mn hele kamerscherm rammelt!! 😂 Here is one back: *NUDGE TRILT*",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessages(prev => ({
            ...prev,
            [activeId]: [...(prev[activeId] || []), nudgeComplaint]
          }));
        }, 1200);
        return;
      }

      setIsTyping(true);
      const activeContactId = activeId;
      setTimeout(() => {
        setIsTyping(false);
        hiveAudio.playNotification();

        let senderName = "Collega-chat";
        let senderAvatar = "💬";
        let phrase = "Haha, vet cool! brb mss!";

        if (activeType === "channel") {
          // Channel answer pool
          const pool = ["wouter", "kelly", "danny"];
          const randomCo = pool[Math.floor(Math.random() * pool.length)];
          const matchingContact = contacts.find(c => c.id === randomCo);
          if (matchingContact) {
            senderName = matchingContact.name;
            senderAvatar = matchingContact.avatar;
            const replies = WORKER_REPLIES[randomCo] || ["*trilt met voelsprieten*"];
            phrase = replies[Math.floor(Math.random() * replies.length)];
          }
        } else {
          // Direct message answer
          const matchingContact = contacts.find(c => c.id === activeContactId);
          if (matchingContact) {
            senderName = matchingContact.name;
            senderAvatar = matchingContact.avatar;
            const replies = WORKER_REPLIES[activeContactId] || ["*zwaait*"];
            phrase = replies[Math.floor(Math.random() * replies.length)];
          }
        }

        const teammateReply: Message = {
          id: `mt-${Date.now()}`,
          senderId: activeContactId,
          senderName: senderName,
          senderAvatar: senderAvatar,
          text: phrase,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => ({
          ...prev,
          [activeId]: [...(prev[activeId] || []), teammateReply]
        }));
      }, 1100 + Math.random() * 800);
    }
  };

  const activeChannel = channels.find(c => c.id === activeId);
  const activeContact = contacts.find(c => c.id === activeId);

  return (
    <div 
      className={`flex h-screen w-screen overflow-hidden bg-slate-100 relative transition-transform duration-100 ${
        isBuzzingFlash ? "bg-red-50 animate-pulse scale-[0.99]" : ""
      }`}
      id="msn_workspace"
    >
      {/* Golden Flash Alert Overlay for Nudges */}
      {isBuzzingFlash && (
        <div className="absolute inset-0 bg-red-500/10 pointer-events-none z-50 animate-pulse border-4 border-red-500" />
      )}

      {/* 1. Sidebar Panel (Authentic MSN List) */}
      <Sidebar
        channels={channels}
        contacts={contacts}
        activeId={activeId}
        activeType={activeType}
        onSelectChannel={(cid) => {
          setActiveId(cid);
          setActiveType("channel");
          hiveAudio.playHoneyPop();
        }}
        onSelectDM={(cmid) => {
          setActiveId(cmid);
          setActiveType("dm");
          hiveAudio.playHoneyPop();
        }}
        userEmail="prinsrobbin@gmail.com"
        
        // Custom interactive profile properties for MSN
        userDisplayName={userDisplayName}
        onUpdateDisplayName={setUserDisplayName}
        userPersonalMessage={userPersonalMessage}
        onUpdatePersonalMessage={setUserPersonalMessage}
        userStatus={userStatus}
        onUpdateStatus={setUserStatus}
        userAvatar={userAvatar}
        onUpdateAvatar={setUserAvatar}
      />

      {/* 2. Chat Area Window (MSN Conversation box) */}
      <ChatArea
        activeId={activeId}
        activeType={activeType}
        activeChannel={activeChannel}
        activeContact={activeContact}
        messages={messages[activeId] || []}
        isTyping={isTyping}
        onSendMessage={handleSendMessage}
        onBuzzIncoming={handleBuzzIncoming}
        myDisplayName={userDisplayName}
        myAvatar={userAvatar}
      />

      {/* 3. Retro MSN Side Utility Panel (Instead of HiveStats) */}
      <div className="w-80 bg-gradient-to-b from-[#eef4fb] to-[#cbdcf0] border-l border-[#9ebcd1] flex flex-col h-full p-4 justify-between select-none overflow-y-auto font-sans">
        <div className="space-y-4">
          
          {/* Box 1: MSN Retro Customizer Tool */}
          <div className="bg-white border border-[#abc4df] rounded-xl p-4 shadow-sm text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#1d5c8a]"></div>
            
            <h3 className="font-sans font-extrabold text-[#1d5c8a] text-sm flex items-center gap-1.5 pt-1 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-sky-500 animate-spin" />
              <span>MSN Naam Versierder</span>
            </h3>
            
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Verander je statusnaam in een flitsende MSN-naam vol met glitters en vette retrotekens!
            </p>

            <button
              onClick={generateRetroName}
              className="mt-3.5 w-full bg-gradient-to-r from-[#2c77b0] to-[#1e5881] hover:from-[#3a8bca] hover:to-[#22679a] text-white text-xs font-bold py-2 rounded-lg shadow-sm border border-sky-900 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Genereer vette MSN Naam!</span>
            </button>

            {generatedName && (
              <div className="mt-3 bg-slate-50 p-2.5 rounded border border-dashed border-[#abc4df] text-center">
                <span className="text-xs font-bold text-slate-800 font-mono block break-all selection:bg-yellow-200">
                  {generatedName}
                </span>
                
                <button
                  onClick={applyGeneratedName}
                  className="mt-2 text-[10px] text-sky-600 hover:underline font-bold uppercase tracking-wider block mx-auto cursor-pointer"
                >
                  Toepassen als MSN Naam! ✏️
                </button>
              </div>
            )}
          </div>

          {/* Box 2: Wie heeft mij geblokkeerd? (Authentic 2004 scam test simulation!) */}
          <div className="bg-white border border-[#abc4df] rounded-xl p-4 shadow-sm text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#e31e24]"></div>
            
            <h3 className="font-sans font-extrabold text-[#e31e24] text-xs flex items-center gap-1.5 pt-1 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>MSN Block Checker (V2)</span>
            </h3>
            
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Benieuwd of je klasgenoten je stiekem offline hebben geblokkeerd? Voer hier de scan uit!
            </p>

            <div className="mt-3.5 space-y-1.5">
              <div className="text-[10px] text-slate-400 font-bold">Selecteer contactpersoon:</div>
              <div className="grid grid-cols-2 gap-1.5">
                {contacts.filter(c => c.id !== "queen").map(c => (
                  <button
                    key={c.id}
                    onClick={() => testBlockStatus(c.name)}
                    disabled={checking}
                    className="text-[10px] font-medium bg-[#f0f4f9] hover:bg-sky-100 border border-slate-200 px-2 py-1.5 rounded truncate text-slate-700 active:scale-95 cursor-pointer transition-all disabled:opacity-50"
                  >
                    🔍 {c.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {checking && (
              <div className="mt-3 text-center space-y-1 py-1.5">
                <div className="text-[10px] text-slate-500 font-medium animate-pulse">
                  Checken van block status via MSN servers...
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-1.5 rounded-full animate-[progress_1.5s_ease-out_infinite]" style={{ width: "60%" }} />
                </div>
              </div>
            )}

            {checkResult && (
              <div className="mt-3 bg-red-50 p-2.5 rounded border border-red-200 text-xs text-red-950 font-bold leading-normal">
                {checkResult}
              </div>
            )}
          </div>

          {/* Box 3: Classic Dutch MSN Mini-Games advert panel */}
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-xl p-4 shadow-md relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
              <span className="font-mono text-[9px] text-[#8cc63f] tracking-widest font-bold">MSN_GAMES_ONLINE</span>
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            
            <div className="mt-3 space-y-2.5">
              <p className="text-[10.5px] italic text-slate-300 leading-normal">
                &ldquo;Wil je een potje Mijnenveger of Dammen spelen tegen me? Klik hieronder om me uit te dagen op MSN!&rdquo;
              </p>
              <button
                onClick={() => {
                  hiveAudio.playCrownBuzz();
                  alert("🎮 MSN GAMES: Deze service is tijdelijk niet beschikbaar op het 56k modem wegens downloadsnelheid limieten! Vraag Gemini Bot in de chat om een spel te spelen! :-D");
                }}
                className="w-full bg-[#8cc63f] hover:bg-[#a6d854] text-stone-950 text-xs font-extrabold py-1.5 rounded shadow cursor-pointer flex items-center justify-center gap-1 transition-all"
              >
                <Play className="w-3 h-3 fill-stone-950" />
                <span>Mijnenveger Spelen !</span>
              </button>
            </div>
          </div>

        </div>

        {/* Nostalgic status/disclaimers */}
        <div className="pt-4 border-t border-[#abc4df]/60 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
            <span>MSN PROTOCOL: LIVE</span>
            <span className="text-emerald-500 font-bold animate-ping">&#9679;</span>
          </div>
        </div>

      </div>
    </div>
  );
}
