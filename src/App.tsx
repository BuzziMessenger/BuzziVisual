/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { Message, Channel, Contact, StatusType } from "./types";
import { hiveAudio } from "./utils/audio";
import { Sparkles, Trophy, Users, RefreshCw, Smile, Compass, AlertTriangle, Play, Database, Wifi, CheckCircle2 } from "lucide-react";
import { LoginScreen } from "./components/LoginScreen";

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return "h_" + Math.abs(hash).toString(36);
}

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
    email: "kelly_sweet_x@buzzi.com",
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
      text: "🤖 *PING!* W00t! Welkom op mijn Buzzi Messenger-kanaal! Ik ben aangedreven door Gemini AI en spreek vloeiend 2004 Buzzi Messenger-slang! Vraag me over inbelverbindingen, retro-muziek of stuur me een 'Nudge' (duwtje) met de rode knop! :-D",
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
  
  // App-status
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [isBuzzingFlash, setIsBuzzingFlash] = useState(false);

  // Custom User Profile configuration for Buzzi Clone
  const [userDisplayName, setUserDisplayName] = useState("Robbin (H)");
  const [userPersonalMessage, setUserPersonalMessage] = useState("Lekker chatten op Buzzi met Gemini! B-)");
  const [userStatus, setUserStatus] = useState<StatusType>("online");
  const [userAvatar, setUserAvatar] = useState("🧑‍🚀");

  // Account and Database states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<Contact[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [activeDbMode, setActiveDbMode] = useState<"mongodb" | "local">("local");

  // Buzzi Clone interactive tools state
  const [generatedName, setGeneratedName] = useState("");
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [checkedContact, setCheckedContact] = useState("");
  const [checking, setChecking] = useState(false);

  // Initial user fetch/setup from DB
  const initUserProfile = async (user: any, preferredName?: string) => {
    const defaultName = preferredName || user.displayName || user.email?.split("@")[0] || "Buzzi Gebruiker";
    const initialProfile = {
      uid: user.uid,
      name: defaultName,
      email: user.email || "",
      avatar: "🧑‍🚀",
      status: "online",
      personalMessage: "Lekker chatten op Buzzi met Gemini! B-)"
    };

    try {
      await fetch("/api/db/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initialProfile)
      });
      
      const res = await fetch("/api/db/users");
      if (res.status === 200) {
        const list = await res.json();
        const currentProfile = list.find((u: any) => u.uid === user.uid);
        if (currentProfile) {
          setUserDisplayName(currentProfile.name || defaultName);
          setUserPersonalMessage(currentProfile.personalMessage || "Lekker chatten op Buzzi met Gemini! B-)");
          setUserAvatar(currentProfile.avatar || "🧑‍🚀");
          setUserStatus((currentProfile.status as StatusType) || "online");
        } else {
          setUserDisplayName(defaultName);
          setUserPersonalMessage("Lekker chatten op Buzzi met Gemini! B-)");
          setUserAvatar("🧑‍🚀");
          setUserStatus("online");
        }
      }
    } catch (err) {
      console.warn("User profile init failed, falling back to state:", err);
      setUserDisplayName(defaultName);
    }
  };

  // Sync profile edits to Server-side storage (MongoDB or Local memory)
  const updateProfileInDatabase = async (fields: Partial<any>) => {
    if (!currentUser) return;

    try {
      await fetch("/api/db/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
          name: userDisplayName,
          email: currentUser.email || "",
          avatar: userAvatar,
          status: userStatus,
          personalMessage: userPersonalMessage,
          ...fields
        })
      });
    } catch (err) {
      console.warn("Failed to update profile in database:", err);
    }
  };

  // Dynamic database connection checker
  const checkDbStatus = async () => {
    try {
      const res = await fetch("/api/db/status");
      if (res.status === 200) {
        const data = await res.json();
        setDbStatus(data);
        if (data.mongodb && data.mongodb.connected) {
          setActiveDbMode("mongodb");
        } else {
          setActiveDbMode("local");
        }
      }
    } catch (err) {
      console.warn("Could not load database status dynamically:", err);
    }
  };

  useEffect(() => {
    checkDbStatus();
  }, []);

  // Authentication State / Local Session Restorer
  useEffect(() => {
    const savedUser = localStorage.getItem("buzzi_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        initUserProfile(parsed);
      } catch (e) {
        console.warn("Saved user corrupted:", e);
      }
    }
    setAuthInitialized(true);
  }, [activeDbMode]);

  // Sync users in real-time (Polling from Express Server / MongoDB / Local JSON)
  useEffect(() => {
    if (!currentUser) return;
    
    const syncUsers = async () => {
      try {
        const res = await fetch("/api/db/users");
        if (res.status === 200) {
          const list = await res.json();
          const filtered = list
            .filter((data: any) => data.uid !== currentUser.uid)
            .map((data: any) => ({
              id: data.uid,
              name: data.name || "Buzzi Gebruiker",
              email: data.email || "",
              avatar: data.avatar || "🧑‍🚀",
              status: (data.status as StatusType) || "online",
              personalMessage: data.personalMessage || "",
            }));
          setRegisteredUsers(filtered);
        }
      } catch (e) {
        console.warn("Failed to sync users:", e);
      }
    };

    syncUsers();
    const interval = setInterval(syncUsers, 4000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Combine buddy lists
  const currentBuddies = [
    ...INITIAL_CONTACTS,
    ...registeredUsers
  ];

  // Sync Messages with Database / Local Storage (Polling)
  useEffect(() => {
    if (!currentUser) return;

    const syncMessages = async () => {
      try {
        const res = await fetch("/api/db/messages");
        if (res.status === 200) {
          const list = await res.json();
          
          const freshMessages: Record<string, Message[]> = {
            "mensen-van-toen": [],
            "breezer-groep": [],
            "queen": [],
            "wouter": [],
            "kelly": [],
            "danny": [],
            "sanne": []
          };

          list.forEach((data: any) => {
            const recId = data.receiverId;
            if (!freshMessages[recId]) {
              freshMessages[recId] = [];
            }
            freshMessages[recId].push({
              id: data.id,
              senderId: data.senderId,
              senderName: data.senderName,
              senderAvatar: data.senderAvatar,
              text: data.text,
              timestamp: data.timestamp,
              isBuzz: data.isBuzz || false,
              isWink: data.isWink || false,
              winkId: data.winkId
            });
          });

          const merged: Record<string, Message[]> = {};
          const keys = Array.from(new Set([
            ...Object.keys(INITIAL_MESSAGES),
            ...Object.keys(freshMessages)
          ]));

          keys.forEach(k => {
            const dbMsgs = freshMessages[k] || [];
            if (dbMsgs.length === 0 && INITIAL_MESSAGES[k]) {
              merged[k] = INITIAL_MESSAGES[k];
            } else {
              merged[k] = dbMsgs;
            }
          });

          setMessages(merged);
        }
      } catch (e) {
        console.warn("Failed to sync messages:", e);
      }
    };

    syncMessages();
    const interval = setInterval(syncMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Sync methods
  const handleUpdateDisplayName = (val: string) => {
    setUserDisplayName(val);
    updateProfileInDatabase({ name: val });
  };
  const handleUpdatePersonalMessage = (val: string) => {
    setUserPersonalMessage(val);
    updateProfileInDatabase({ personalMessage: val });
  };
  const handleUpdateStatus = (val: StatusType) => {
    setUserStatus(val);
    updateProfileInDatabase({ status: val });
  };
  const handleUpdateAvatar = (val: string) => {
    setUserAvatar(val);
    updateProfileInDatabase({ avatar: val });
  };

  const handleSignOut = async () => {
    hiveAudio.playHoneyPop();
    localStorage.removeItem("buzzi_user");
    setCurrentUser(null);
  };

  const handleLoginSuccess = async (name: string, email: string) => {
    const hash = simpleHash(email.split("#pwd_")[0]);
    const mockUser = {
      uid: `u_${hash}`,
      displayName: name,
      email: email.split("#pwd_")[0]
    };
    localStorage.setItem("buzzi_user", JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    setUserDisplayName(name);
    await initUserProfile(mockUser, name);
  };

  // Sound and Visual screen shake triggers
  const handleBuzzIncoming = () => {
    setIsBuzzingFlash(true);
    setTimeout(() => {
      setIsBuzzingFlash(false);
    }, 650);
  };

  // Quick retro Buzzi display name generator!
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

  // Fun Block-Checker simulation (Dutch classic Buzzi internet virus)
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

  const saveMessageToDatabase = async (msg: Partial<Message>) => {
    if (!currentUser) return;
    const msgId = `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const msgDoc = {
      id: msgId,
      senderId: msg.senderId || currentUser.uid,
      senderName: msg.senderName || userDisplayName,
      senderAvatar: msg.senderAvatar || userAvatar,
      text: msg.text || "",
      timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBuzz: msg.isBuzz || false,
      isWink: msg.isWink || false,
      winkId: msg.winkId || "",
      receiverId: activeId,
      createdAt: new Date().toISOString()
    };

    try {
      await fetch("/api/db/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgDoc)
      });
      setMessages(prev => {
        const h = prev[activeId] || [];
        if (h.some(m => m.id === msgId)) return prev;
        return { ...prev, [activeId]: [...h, msgDoc as Message] };
      });
    } catch (err) {
      console.warn("Database message save failed, using memory state fallback:", err);
      setMessages(prev => {
        const h = prev[activeId] || [];
        return { ...prev, [activeId]: [...h, msgDoc as Message] };
      });
    }
  };

  const writeSimulatedReply = async (simText: string, simName: string, simAvatar: string, simId: string, additional: Partial<Message> = {}) => {
    if (!currentUser) return;
    const msgId = `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const msgDoc = {
      id: msgId,
      senderId: simId, // Use simId so local UI styling formats it correctly
      senderName: simName,
      senderAvatar: simAvatar,
      text: simText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBuzz: additional.isBuzz || false,
      isWink: additional.isWink || false,
      winkId: additional.winkId || "",
      receiverId: activeId,
      createdAt: new Date().toISOString()
    };

    try {
      await fetch("/api/db/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgDoc)
      });
      setMessages(prev => {
        const h = prev[activeId] || [];
        if (h.some(m => m.id === msgId)) return prev;
        return { ...prev, [activeId]: [...h, msgDoc as Message] };
      });
    } catch (err) {
      console.warn("Reply write failed, using local local state fallback:", err);
      setMessages(prev => {
        const h = prev[activeId] || [];
        return { ...prev, [activeId]: [...h, msgDoc as Message] };
      });
    }
  };

  // Sending a message
  const handleSendMessage = async (text: string, isBuzz: boolean = false, isWink: boolean = false, winkId?: string) => {
    if (!currentUser) return;

    // Save to Database server-side first (MongoDB or Local File backup)
    await saveMessageToDatabase({
      text,
      isBuzz: isBuzz,
      isWink: isWink,
      winkId: winkId
    });

    const isConversingWithAI = activeId === "queen";

    if (isConversingWithAI) {
      if (isWink) {
        setIsTyping(true);
        setTimeout(async () => {
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

          await writeSimulatedReply(
            `*Stuurt een Wink terug: ${winkNames[randomWink]}*`,
            "🤖 Gemini Bot (H)",
            "🤖",
            "queen",
            { isWink: true, winkId: randomWink }
          );
        }, 1500);
        return;
      }

      if (isBuzz) {
        setIsTyping(true);
        setTimeout(async () => {
          setIsTyping(false);
          hiveAudio.playNudge();
          handleBuzzIncoming();

          await writeSimulatedReply(
            "🚨 *SHAKE-SHAKESS* Omg!! Je hebt me een nudge gestuurd! Mijn hele computer trilt en mijn speakers knarsen! 😂 Super vet! Wat wil je kletsen? :-D",
            "🤖 Gemini Bot (H)",
            "🤖",
            "queen"
          );
        }, 1200);
        return;
      }
      
      setIsTyping(true);

      try {
        const conversations = messages[activeId] || [];
        const threadHistory = conversations.map(msg => ({
          role: msg.senderName === userDisplayName ? "user" : "model",
          text: msg.text
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: text,
            history: threadHistory.slice(-10)
          })
        });

        const data = await response.json();
        setIsTyping(false);

        hiveAudio.playNotification();

        await writeSimulatedReply(
          data.reply || "🤖 *static* Oeps... Internetverbinding viel even weg! :-P",
          "🤖 Gemini Bot (H)",
          "🤖",
          "queen"
        );
      } catch (err) {
        console.error("AI Chat Failure:", err);
        setIsTyping(false);
        
        await writeSimulatedReply(
          "🤖 *PING!* Mijn inbelverbinding kraakt een beetje! Zorg dat de juiste GEMINI_API_KEY in je Secrets-instellingen staat om live te praten! brb mss... (A)",
          "🤖 Gemini Bot (H)",
          "🤖",
          "queen"
        );
      }
    } else {
      if (isWink) {
        setIsTyping(true);
        setTimeout(async () => {
          setIsTyping(false);
          const friendName = currentBuddies.find(c => c.id === activeId)?.name || "Vriend";
          const friendAvatar = currentBuddies.find(c => c.id === activeId)?.avatar || "🐝";
          
          const winksPool = ["pig", "crazy", "water", "guitar", "heart"];
          const randomWink = winksPool[Math.floor(Math.random() * winksPool.length)];

          await writeSimulatedReply(
            "Ooooh een Wink! 😍 Check deze retro animatie van mij:",
            friendName,
            friendAvatar,
            activeId,
            { isWink: true, winkId: randomWink }
          );
        }, 1600);
        return;
      }

      if (isBuzz) {
        setIsTyping(true);
        setTimeout(async () => {
          setIsTyping(false);
          hiveAudio.playNudge();
          handleBuzzIncoming();

          const friendName = currentBuddies.find(c => c.id === activeId)?.name || "Vriend";
          const friendAvatar = currentBuddies.find(c => c.id === activeId)?.avatar || "🐝";

          await writeSimulatedReply(
            "omg!! Stop met die rot irritante nudges sturen!! Mijn boxen trillen helemaal kapot hier en mn hele kamerscherm rammelt!! 😂 Here is one back: *NUDGE TRILT*",
            friendName,
            friendAvatar,
            activeId
          );
        }, 1200);
        return;
      }

      setIsTyping(true);
      const activeContactId = activeId;
      setTimeout(async () => {
        setIsTyping(false);
        hiveAudio.playNotification();

        let senderName = "Collega-chat";
        let senderAvatar = "💬";
        let phrase = "Haha, vet cool! brb mss!";

        if (activeType === "channel") {
          const pool = ["wouter", "kelly", "danny"];
          const randomCo = pool[Math.floor(Math.random() * pool.length)];
          const matchingContact = currentBuddies.find(c => c.id === randomCo);
          if (matchingContact) {
            senderName = matchingContact.name;
            senderAvatar = matchingContact.avatar;
            const replies = WORKER_REPLIES[randomCo] || ["*trilt met voelsprieten*"];
            phrase = replies[Math.floor(Math.random() * replies.length)];
          }
        } else {
          const matchingContact = currentBuddies.find(c => c.id === activeContactId);
          if (matchingContact) {
            senderName = matchingContact.name;
            senderAvatar = matchingContact.avatar;
            const replies = WORKER_REPLIES[activeContactId] || ["*zwaait*"];
            phrase = replies[Math.floor(Math.random() * replies.length)];
          }
        }

        await writeSimulatedReply(phrase, senderName, senderAvatar, activeContactId);
      }, 1100 + Math.random() * 800);
    }
  };

  const activeChannel = channels.find(c => c.id === activeId);
  const activeContact = currentBuddies.find(c => c.id === activeId);

  // Authentication & session routing
  if (!authInitialized) {
    return (
      <div className="flex flex-col h-screen w-screen bg-[#e4ecf7] items-center justify-center font-sans select-none" id="buzzi_loader">
        <div className="flex flex-col items-center gap-4">
          <div className="flex -space-x-2 items-center justify-center animate-bounce">
            <span className="w-8 h-8 rounded-full bg-[#8cc63f] inline-block border-2 border-white shadow-md"></span>
            <span className="w-8 h-8 rounded-full bg-[#00aeef] inline-block border-2 border-white shadow-md"></span>
          </div>
          <div className="text-sm font-bold text-[#1d5c8a]">Buzzi Messenger aan het opstarten...</div>
          <div className="text-[10px] text-slate-400 font-mono">Maakt verbinding met Buzzi server via modem...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div 
      className={`flex h-screen w-screen overflow-hidden bg-slate-100 relative transition-transform duration-100 ${
        isBuzzingFlash ? "bg-red-50 animate-pulse scale-[0.99]" : ""
      }`}
      id="buzzi_workspace"
    >
      {/* Golden Flash Alert Overlay for Nudges */}
      {isBuzzingFlash && (
        <div className="absolute inset-0 bg-red-500/10 pointer-events-none z-50 animate-pulse border-4 border-red-500" />
      )}

      {/* 1. Sidebar Panel (Authentic Buzzi List) */}
      <Sidebar
        channels={channels}
        contacts={currentBuddies}
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
        userEmail={currentUser.email || "prinsrobbin@gmail.com"}
        onSignOut={handleSignOut}
        
        // Custom interactive profile properties for Buzzi
        userDisplayName={userDisplayName}
        onUpdateDisplayName={handleUpdateDisplayName}
        userPersonalMessage={userPersonalMessage}
        onUpdatePersonalMessage={handleUpdatePersonalMessage}
        userStatus={userStatus}
        onUpdateStatus={handleUpdateStatus}
        userAvatar={userAvatar}
        onUpdateAvatar={handleUpdateAvatar}
      />

      {/* 2. Chat Area Window (Buzzi Conversation box) */}
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
        myUserId={currentUser.uid}
      />

      {/* 3. Retro Buzzi Side Utility Panel (Instead of HiveStats) */}
      <div className="w-80 bg-gradient-to-b from-[#eef4fb] to-[#cbdcf0] border-l border-[#9ebcd1] flex flex-col h-full p-4 justify-between select-none overflow-y-auto font-sans">
        <div className="space-y-4">
          
          {/* Box 1: Buzzi Retro Customizer Tool */}
          <div className="bg-white border border-[#abc4df] rounded-xl p-4 shadow-sm text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#1d5c8a]"></div>
            
            <h3 className="font-sans font-extrabold text-[#1d5c8a] text-sm flex items-center gap-1.5 pt-1 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-sky-500 animate-spin" />
              <span>Buzzi Naam Versierder</span>
            </h3>
            
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Verander je statusnaam in een flitsende Buzzi-naam vol met glitters en vette retrotekens!
            </p>

            <button
              onClick={generateRetroName}
              className="mt-3.5 w-full bg-gradient-to-r from-[#2c77b0] to-[#1e5881] hover:from-[#3a8bca] hover:to-[#22679a] text-white text-xs font-bold py-2 rounded-lg shadow-sm border border-sky-900 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Genereer vette Buzzi Naam!</span>
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
                  Toepassen als Buzzi Naam! ✏️
                </button>
              </div>
            )}
          </div>

          {/* Box 2: Wie heeft mij geblokkeerd? (Authentic 2004 scam test simulation!) */}
          <div className="bg-white border border-[#abc4df] rounded-xl p-4 shadow-sm text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#e31e24]"></div>
            
            <h3 className="font-sans font-extrabold text-[#e31e24] text-xs flex items-center gap-1.5 pt-1 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Buzzi Block Checker (V2)</span>
            </h3>
            
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Benieuwd of je klasgenoten je stiekem offline hebben geblokkeerd? Voer hier de scan uit!
            </p>

            <div className="mt-3.5 space-y-1.5">
              <div className="text-[10px] text-slate-400 font-bold">Selecteer contactpersoon:</div>
              <div className="grid grid-cols-2 gap-1.5">
                {currentBuddies.filter(c => c.id !== "queen").map(c => (
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
                  Checken van block status via Buzzi servers...
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

          {/* Box 4: Database & Verbindingsbeheer (Real-time dynamic control console) */}
          <div className="bg-white border border-[#abc4df] rounded-xl p-4 shadow-sm text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#469cd2]"></div>
            
            <h3 className="font-sans font-extrabold text-[#1d5c8a] text-xs flex items-center gap-1.5 pt-1 uppercase tracking-wider">
              <Database className="w-4 h-4 text-sky-600 animate-pulse" />
              <span>Verbindingen & Database</span>
            </h3>
            
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Beheer de actieve verbindingsmodus van je Buzzi Messenger. We gebruiken een supersnelle <strong>Local File DB</strong> of je eigen <strong>MongoDB database</strong>!
            </p>

            <div className="mt-3 space-y-2">
              {/* Connection Status Row */}
              <div className="text-[10.5px] border border-slate-100 rounded p-2 bg-[#f8fbfe] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Actieve database:</span>
                  <span className="flex items-center gap-1 font-extrabold">
                    {activeDbMode === "mongodb" ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> MongoDB Atlas
                      </span>
                    ) : (
                      <span className="text-[#1d5c8a] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-sky-500" /> Local File Storage
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Server status:</span>
                  <span className="font-mono text-[9.5px] text-emerald-700 font-extrabold bg-emerald-50 px-1 border border-emerald-200 rounded">
                    Volledig operationeel 🚀
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">MongoDB status:</span>
                  <span className={`font-mono text-[9.5px] ${dbStatus?.mongodb?.connected ? 'text-emerald-600 font-extrabold border border-emerald-300 px-1 rounded bg-emerald-50/50' : 'text-slate-400 font-medium'}`}>
                    {dbStatus?.mongodb?.connected ? 'Gekoppeld! 🎉' : 'Geen URI (Lokaal actief)'}
                  </span>
                </div>
              </div>

              {/* Explanatory instruction list for setup */}
              <div className="bg-slate-50 border border-slate-200/50 rounded p-2.5 text-[10px] text-slate-600 leading-normal space-y-2 max-h-48 overflow-y-auto">
                <div className="font-extrabold text-[#1d5c8a] flex items-center gap-1 mb-1 border-b border-slate-200/40 pb-1">
                  <span>💡 Database Instellen Handleiding</span>
                </div>
                
                {/* MongoDB instruction */}
                <div className="space-y-1">
                  <div className="font-bold text-emerald-850 text-[10px]">🍃 Liever MongoDB gebruiken?</div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Omdat je MongoDB fijner vindt, bewaart de Express-server chats direct in je MongoDB-database! Sla de URI op in de Secrets als:
                  </p>
                  <div className="bg-stone-100 p-1.5 rounded font-mono text-[9.5px] text-stone-700 break-all select-all leading-tight border border-stone-200/60">
                    MONGODB_URI="mongodb+srv://..."
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium italic mt-1">
                    * Zonder URI slaat de server de chats automatisch op in jouw lokale data bestanden. Firebase is volledig verwijderd! 😊
                  </p>
                </div>
              </div>

              {/* Force status check button */}
              <button
                onClick={checkDbStatus}
                className="w-full bg-[#f0f4f9] hover:bg-sky-100 text-[#1d5c8a] border border-slate-200 text-[10px] font-extrabold py-1.5 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-sky-600 animate-spin duration-3000" />
                <span>Database Verbindingen Verversen</span>
              </button>
            </div>
          </div>

          {/* Box 3: Classic Dutch Buzzi Mini-Games advert panel */}
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-xl p-4 shadow-md relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
              <span className="font-mono text-[9px] text-[#8cc63f] tracking-widest font-bold">BUZZI_GAMES_ONLINE</span>
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            
            <div className="mt-3 space-y-2.5">
              <p className="text-[10.5px] italic text-slate-300 leading-normal">
                &ldquo;Wil je een potje Mijnenveger of Dammen spelen tegen me? Klik hieronder om me uit te dagen op Buzzi!&rdquo;
              </p>
              <button
                onClick={() => {
                  hiveAudio.playCrownBuzz();
                  alert("🎮 BUZZI GAMES: Deze service is tijdelijk niet beschikbaar op het 56k modem wegens downloadsnelheid limieten! Vraag Gemini Bot in de chat om een spel te spelen! :-D");
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
            <span>BUZZI PROTOCOL: LIVE</span>
            <span className="text-emerald-500 font-bold animate-ping">&#9679;</span>
          </div>
        </div>

      </div>
    </div>
  );
}
