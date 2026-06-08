/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { Message, Channel, Contact, StatusType } from "./types";
import { hiveAudio } from "./utils/audio";
import { Sparkles, Trophy, Users, RefreshCw, Smile, Compass, AlertTriangle, Play, Database, Wifi, CheckCircle2, Share2, Link, Send, Smartphone, Laptop, Volume2, Coins } from "lucide-react";
import { LoginScreen } from "./components/LoginScreen";
import { Minesweeper } from "./components/Minesweeper";
import { LegalModal } from "./components/LegalModal";
import { motion, AnimatePresence } from "motion/react";
import { translateUI } from "./translations";

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
    name: "🤖 Buzzi Bot (H)",
    email: "buzzi_bot@live.nl",
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
      senderName: "🤖 Buzzi Bot (H)",
      senderAvatar: "🤖",
      text: "🤖 *PING!* W00t! Welkom op mijn Buzzi Messenger-kanaal! Ik ben aangedreven door Buzzi AI en spreek vloeiend 2004 Buzzi Messenger-slang! Vraag me over inbelverbindingen, retro-muziek of stuur me een 'Nudge' (duwtje) met de rode knop! :-D",
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
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [mobileActiveTab, setMobileActiveTab] = useState<"sidebar" | "chat" | "tools">("sidebar");
  
  // Keeps track of processed messages to only notify on new incoming ones during live polling
  const processedMessageIds = useRef<Set<string>>(new Set());
  
  // App-status
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [serverTypingUsers, setServerTypingUsers] = useState<string[]>([]);
  const [simulatedTyping, setSimulatedTyping] = useState<Record<string, boolean>>({});
  const isCurrentChatPartnerTyping = !!(simulatedTyping[activeId] || serverTypingUsers.includes(activeId));
  const setIsTyping = (typing: boolean) => {
    setSimulatedTyping(prev => ({ ...prev, [activeId]: typing }));
  };
  const [isBuzzingFlash, setIsBuzzingFlash] = useState(false);

  // Site language setting for global UI translation (NL by default)
  const [siteLanguage, setSiteLanguage] = useState<string>(() => {
    return localStorage.getItem("buzzi_language") || "NL";
  });

  // Short translation helper for App.tsx
  const t = (key: string) => {
    return translateUI(siteLanguage, key);
  };

  // Custom User Profile configuration for Buzzi Clone
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("Robbin (H)");
  const [userPersonalMessage, setUserPersonalMessage] = useState("Lekker chatten op Buzzi met Buzzi Bot! B-)");
  const [userStatus, setUserStatus] = useState<StatusType>("online");
  const [userAvatar, setUserAvatar] = useState("🧑‍🚀");
  const [userListeningTo, setUserListeningTo] = useState("");

  // Persistent Buzzi Premium and Blocking States
  const [isUserPremium, setIsUserPremium] = useState<boolean>(() => {
    return localStorage.getItem("buzzi_premium") === "true";
  });
  const [isSyncMusicEnabled, setIsSyncMusicEnabled] = useState<boolean>(() => {
    return localStorage.getItem("buzzi_sync_music") === "true";
  });
  const [blockedContactIds, setBlockedContactIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("buzzi_blocked_contacts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  const handleToggleBlockContact = (contactId: string) => {
    hiveAudio.playNotification();
    setBlockedContactIds(prev => {
      const isBlocked = prev.includes(contactId);
      const nextList = isBlocked ? prev.filter(id => id !== contactId) : [...prev, contactId];
      localStorage.setItem("buzzi_blocked_contacts", JSON.stringify(nextList));
      return nextList;
    });
  };

  const handleToggleSyncMusic = () => {
    setIsSyncMusicEnabled(prev => {
      const next = !prev;
      localStorage.setItem("buzzi_sync_music", next ? "true" : "false");
      return next;
    });
  };

  // Account and Database states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<Contact[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [acceptedFriendships, setAcceptedFriendships] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [activeDbMode, setActiveDbMode] = useState<"mongodb" | "local">("local");
  const [isReconnectingDb, setIsReconnectingDb] = useState(false);
  const [isMinesweeperOpen, setIsMinesweeperOpen] = useState(false);

  // Utility tools collapsible/foldable states
  const [isNaamVersierderExpanded, setIsNaamVersierderExpanded] = useState(false);
  const [isInviteExpanded, setIsInviteExpanded] = useState(false);
  const [isAppsExpanded, setIsAppsExpanded] = useState(false);
  const [isSoundSchemeExpanded, setIsSoundSchemeExpanded] = useState(false); // Default collapsed
  const [isMonetizationExpanded, setIsMonetizationExpanded] = useState(false);

  // Retro sound scheme preference loaded/saved
  const [soundScheme, setSoundScheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("buzzi_sound_scheme") || "default";
    }
    return "default";
  });

  // GDPR Cookie consent and legal disclaimer state
  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("buzzi_legal_cookies_accepted") !== "true";
    }
    return false;
  });
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);

  // Buzzi Clone interactive tools state
  const [generatedName, setGeneratedName] = useState("");
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [checkedContact, setCheckedContact] = useState("");
  const [checking, setChecking] = useState(false);

  // Bug reporting variables
  const [activeUtilityTab, setActiveUtilityTab] = useState<"tools" | "bugs">("tools");
  const [bugsList, setBugsList] = useState<any[]>([]);
  const [bugTitle, setBugTitle] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [bugCategory, setBugCategory] = useState("Radio");
  const [bugSuccess, setBugSuccess] = useState(false);
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);

  // Soft toast state for retro alerts/friendship confirmation
  const [buzziToast, setBuzziToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    avatar?: string;
  } | null>(null);

  // MSN Messenger online/offline notification state
  const [msnToast, setMsnToast] = useState<{
    show: boolean;
    name: string;
    avatar: string;
    event: "online" | "offline";
    email?: string;
  } | null>(null);

  // Overridden status of contacts for the XP sign-in notification simulation
  const [buddiesStatusOverride, setBuddiesStatusOverride] = useState<Record<string, StatusType>>({});

  // Copy Link State
  const [copyLinkStatus, setCopyLinkStatus] = useState(false);
  const [activeAppTab, setActiveAppTab] = useState<"info" | "windows" | "android">("info");

  const downloadWindowsLauncher = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const batContent = `@echo off
title Buzzi Messenger
color 0b
echo ====================================================
echo   BUZZI MESSENGER CLIENT - WINDOWS DESKTOP LAUNCHER
echo ====================================================
echo.
echo Bezig met opstarten in standalone venster-modus...
echo Web app: ${origin}
echo.

:: Zoek naar Microsoft Edge (werkt het best in standalone app-modus op Windows)
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start msedge --app=${origin}
    exit
)

:: Zoek naar Google Chrome
where chrome >nul 2>nul
if %errorlevel% equ 0 (
    start chrome --app=${origin}
    exit
)

:: Als beide ontbreken, open in de standaardbrowser
start ${origin}
exit
`;

    const blob = new Blob([batContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "BuzziMessenger.bat";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    hiveAudio.playNotification();
  };

  const handleCopyInviteLink = () => {
    const shareDomain = "https://www.buzzimessenger.nl";
    const cleanEmail = (currentUser?.email || "").split("#pwd_")[0].trim().toLowerCase();
    const inviteLink = `${shareDomain}/?invitedBy=${encodeURIComponent(userDisplayName)}&inviteEmail=${encodeURIComponent(cleanEmail)}`;
    navigator.clipboard.writeText(inviteLink);
    hiveAudio.playNotification();
    setCopyLinkStatus(true);
    setTimeout(() => {
      setCopyLinkStatus(false);
    }, 2500);
  };

  // Add Contact Handler (triggered from Sidebar modal)
  const handleAddContact = async (
    name: string,
    emailOrUsername: string,
    avatar: string,
    mode: "username" | "email" = "email"
  ): Promise<any> => {
    if (!emailOrUsername.trim()) {
      return { success: false, reason: "EMPTY" };
    }

    let targetEmail = "";
    let targetName = "";

    const myCleanEmail = (currentUser?.email || "").split("#pwd_")[0].trim().toLowerCase();

    if (mode === "username") {
      // Fetch latest users of the Buzzi platform to search our potential friend
      try {
        const res = await fetch("/api/db/users?t=" + Date.now());
        if (res.status === 200) {
          const allUsers = await res.json();
          const targetCleanName = emailOrUsername.trim().toLowerCase();
          
          // Try to find matching user based on their registered name
          const found = allUsers.find((u: any) => {
            const uName = (u.name || "").trim().toLowerCase();
            return uName === targetCleanName && u.email !== currentUser?.email;
          });

          if (found) {
            targetEmail = found.email;
            targetName = found.name;
          } else {
            return { success: false, reason: "USER_NOT_FOUND" };
          }
        } else {
          return { success: false, reason: "DB_ERROR" };
        }
      } catch (err) {
        console.warn("Could not query DB users:", err);
        return { success: false, reason: "DB_ERROR" };
      }
    } else {
      // Traditional Email mode
      targetEmail = emailOrUsername.trim().toLowerCase();
      targetName = name.trim();

      // Prevent adding oneself
      if (targetEmail === myCleanEmail) {
        return { success: false, reason: "SELF_ADD" };
      }
    }

    const cleanTargetEmail = targetEmail.trim().toLowerCase();
    
    // Prevent adding oneself
    if (cleanTargetEmail === myCleanEmail) {
      return { success: false, reason: "SELF_ADD" };
    }

    const mockUserUid = `u_${simpleHash(cleanTargetEmail)}`;

    // Check if user already exists under a registered account or is a default contact
    const existingUser = registeredUsers.find((r: any) => {
      const cleanRegEmail = (r.email || "").split("#pwd_")[0].trim().toLowerCase();
      return cleanRegEmail === cleanTargetEmail || r.id === mockUserUid;
    }) || INITIAL_CONTACTS.find((ic: any) => (ic.email || "").toLowerCase() === cleanTargetEmail);

    // Restore from deleted contacts list if they were previously hidden
    if (existingUser && deletedContactIds.includes(existingUser.id)) {
      const updated = deletedContactIds.filter(id => id !== existingUser.id);
      setDeletedContactIds(updated);
      localStorage.setItem("buzzi_deleted_contacts_" + (currentUser?.uid || ""), JSON.stringify(updated));
    }

    // Register shadow profile if they don't exist in the DB at all yet (for mock accounts)
    if (!existingUser) {
      const newContactProfile = {
        uid: mockUserUid,
        name: targetName || targetEmail.split("@")[0],
        email: cleanTargetEmail,
        avatar: avatar || "🧑‍🚀",
        status: "online" as StatusType,
        personalMessage: "Lekker chatten op Buzzi! [B-)]"
      };

      try {
        await fetch("/api/db/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newContactProfile)
        });
      } catch (err) {
        console.warn("Fout bij aanmaken schaduwprofiel:", err);
      }
    }

    // ALWAYS issue a real-time friend request so that the other user receives it under pending requests
    try {
      await fetch("/api/friend-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEmail: currentUser?.email || "",
          fromName: userDisplayName,
          toEmail: cleanTargetEmail
        })
      });

      hiveAudio.playNotification();

      // Trigger immediate reload of registered users list and accepted friendships
      const syncRes = await fetch("/api/db/users?t=" + Date.now());
      if (syncRes.status === 200) {
        const list = await syncRes.json();
        const filtered = list
          .filter((data: any) => data.uid !== currentUser?.uid)
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

      // Fetch friendships immediately to get live synchronization
      const cleanMyEmail = (currentUser.email || "").split("#pwd_")[0].trim().toLowerCase();
      const acceptedRes = await fetch(`/api/friend-requests?email=${encodeURIComponent(cleanMyEmail)}&status=accepted&t=${Date.now()}`);
      if (acceptedRes.ok) {
        const alist = await acceptedRes.json();
        if (Array.isArray(alist)) {
          setAcceptedFriendships(alist);
        }
      }

      return { success: true, name: targetName };
    } catch (err: any) {
      console.error(err);
      return { success: false, reason: "REQUEST_FAILED" };
    }
  };

  // Initial user fetch/setup from DB (check-first to avoid race overwrites!)
  const initUserProfile = async (user: any, preferredName?: string) => {
    const defaultName = preferredName || user.displayName || user.email?.split("@")[0] || "Buzzi Gebruiker";

    try {
      const res = await fetch("/api/db/users?t=" + Date.now());
      let currentProfile = null;
      if (res.status === 200) {
        const list = await res.json();
        currentProfile = list.find((u: any) => u.uid === user.uid);
      }

      if (!currentProfile) {
        // Fetch values from local storage back-up or fallback to defaults
        const localSavedName = localStorage.getItem("buzzi_remembered_name") || defaultName;
        const localSavedAvatar = localStorage.getItem("buzzi_remembered_avatar") || "🧑‍🚀";
        const localSavedStatus = localStorage.getItem("buzzi_remembered_status") || "online";
        const localSavedPM = localStorage.getItem("buzzi_remembered_pm") || "Lekker chatten op Buzzi met Buzzi Bot! B-)";
        const localSavedListening = localStorage.getItem("buzzi_remembered_listening") || "";

        // Only if user profile does not exist do we create and write the initial default or recovered profile!
        const initialProfile = {
          uid: user.uid,
          name: localSavedName,
          email: user.email || "",
          avatar: localSavedAvatar,
          status: localSavedStatus,
          personalMessage: localSavedPM,
          listeningTo: localSavedListening
        };
        await fetch("/api/db/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initialProfile)
        });
        
        setUserDisplayName(localSavedName);
        setUserPersonalMessage(localSavedPM);
        setUserAvatar(localSavedAvatar);
        setUserStatus(localSavedStatus as StatusType);
        setUserListeningTo(localSavedListening);

        // Keep local storage synchronized for persistent seamless log-ins
        localStorage.setItem("buzzi_remembered_name", localSavedName);
        localStorage.setItem("buzzi_remembered_avatar", localSavedAvatar);
        localStorage.setItem("buzzi_remembered_status", localSavedStatus);
        localStorage.setItem("buzzi_remembered_pm", localSavedPM);
        localStorage.setItem("buzzi_remembered_listening", localSavedListening);
      } else {
        // Load existing saved profile details securely, preferring local changes to prevent stale server overrides!
        const localSavedName = localStorage.getItem("buzzi_remembered_name") || user.displayName || user.name || "";
        const finalName = localSavedName || currentProfile.name || defaultName;
        setUserDisplayName(finalName);

        const pm = currentProfile.personalMessage || "Lekker chatten op Buzzi met Buzzi Bot! B-)";
        const av = currentProfile.avatar || "🧑‍🚀";
        const st = (currentProfile.status as StatusType) || "online";
        const lt = currentProfile.listeningTo || "";

        setUserPersonalMessage(pm);
        setUserAvatar(av);
        setUserStatus(st);
        setUserListeningTo(lt);

        // Keep local storage synchronized for persistent seamless log-ins
        localStorage.setItem("buzzi_remembered_name", finalName);
        localStorage.setItem("buzzi_remembered_avatar", av);
        localStorage.setItem("buzzi_remembered_status", st);
        localStorage.setItem("buzzi_remembered_pm", pm);
        localStorage.setItem("buzzi_remembered_listening", lt);

        const savedUser = localStorage.getItem("buzzi_user");
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            parsed.displayName = finalName;
            localStorage.setItem("buzzi_user", JSON.stringify(parsed));
          } catch (e) {}
        }

        // Self-heal: If database and local storage disagreed on the name, push the local preferred name to database!
        if (currentProfile.name !== finalName) {
          console.log(`[Sync] Self-healing name sync: Local "${finalName}" -> Database was "${currentProfile.name}"`);
          fetch("/api/db/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: user.uid,
              name: finalName,
              email: user.email || "",
              avatar: av,
              status: st,
              personalMessage: pm,
              listeningTo: lt
            })
          }).catch(err => console.warn("Failed self-healing update:", err));
        }
      }
    } catch (err) {
      console.warn("User profile init failed, falling back to state:", err);
      setUserDisplayName(defaultName);
    } finally {
      setProfileInitialized(true);
    }
  };

  // Sync profile edits to Server-side storage (MongoDB or Local memory)
  const updateProfileInDatabase = async (fields: Partial<any>) => {
    if (!currentUser) return;

    // Cache updated fields to localStorage as local backup
    if (fields.name !== undefined) localStorage.setItem("buzzi_remembered_name", fields.name);
    if (fields.avatar !== undefined) localStorage.setItem("buzzi_remembered_avatar", fields.avatar);
    if (fields.status !== undefined) localStorage.setItem("buzzi_remembered_status", fields.status);
    if (fields.personalMessage !== undefined) localStorage.setItem("buzzi_remembered_pm", fields.personalMessage);
    if (fields.listeningTo !== undefined) localStorage.setItem("buzzi_remembered_listening", fields.listeningTo);

    try {
      await fetch("/api/db/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
          name: fields.name !== undefined ? fields.name : userDisplayName,
          email: currentUser.email || "",
          avatar: fields.avatar !== undefined ? fields.avatar : userAvatar,
          status: fields.status !== undefined ? fields.status : userStatus,
          personalMessage: fields.personalMessage !== undefined ? fields.personalMessage : userPersonalMessage,
          listeningTo: fields.listeningTo !== undefined ? fields.listeningTo : userListeningTo,
          isPremium: isUserPremium,
          ...fields
        })
      });
    } catch (err) {
      console.warn("Failed to update profile in database:", err);
    }
  };

  // Dynamic database connection checker
  const checkDbStatus = async (forceReconnect = false) => {
    if (forceReconnect) {
      setIsReconnectingDb(true);
    }
    try {
      const url = forceReconnect ? "/api/db/status?reconnect=true" : "/api/db/status";
      const res = await fetch(url);
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
    } finally {
      if (forceReconnect) {
        setIsReconnectingDb(false);
      }
    }
  };

  useEffect(() => {
    checkDbStatus();
  }, []);

  // Automatic background reconnect loop for MongoDB database
  useEffect(() => {
    if (activeDbMode !== "local") return;

    // Periodically check if we can establish connection to MongoDB automatically in the background
    const interval = setInterval(() => {
      console.log("[Auto-Reconnect] Checking database status & auto-reconnecting to MongoDB Atlas...");
      checkDbStatus(false); 
    }, 12000); // Check every 12 seconds

    return () => clearInterval(interval);
  }, [activeDbMode]);

  // Background browser music detection syncing via HTMLMediaElement and Media Session API
  useEffect(() => {
    if (!isSyncMusicEnabled) return;

    const triggerMusicDetection = () => {
      try {
        // 1. Check all playing media elements in the page
        const mediaElements = Array.from(document.querySelectorAll("audio, video")) as HTMLMediaElement[];
        const playingElement = mediaElements.find(el => !el.paused && !el.muted && el.volume > 0);

        if (playingElement) {
          const src = playingElement.src || "";
          
          // Pattern-match with common stream signatures
          if (src.includes("RADIO538")) {
            updateStatusIfChanged("Radio 538 (Live FM) 📻");
            return;
          } else if (src.includes("qmusic")) {
            updateStatusIfChanged("Qmusic NL (Live) 📻");
            return;
          } else if (src.includes("RADIO10")) {
            updateStatusIfChanged("Radio 10 (Live) 📻");
            return;
          } else if (src.includes("SKYRADIO")) {
            updateStatusIfChanged("Sky Radio (Live) 📻");
            return;
          } else if (src.includes("VERONICA")) {
            updateStatusIfChanged("Radio Veronica 📻");
            return;
          } else if (src.includes("kink")) {
            updateStatusIfChanged("KINK (Alternative Rock) 🎸");
            return;
          } else if (src.includes("arrow")) {
            updateStatusIfChanged("Arrow Classic Rock ⚡");
            return;
          }

          if (playingElement.title) {
            updateStatusIfChanged(playingElement.title);
            return;
          }
        }

        // 2. Query standard system/browser navigator.mediaSession metadata
        if (typeof window !== "undefined" && "mediaSession" in navigator && navigator.mediaSession.metadata) {
          const meta = navigator.mediaSession.metadata;
          if (meta.title) {
            const trackInfo = meta.artist ? `${meta.artist} - ${meta.title}` : meta.title;
            updateStatusIfChanged(trackInfo);
            return;
          }
        }
      } catch (err) {
        console.warn("Fout bij achtergrondmuziekdetectie:", err);
      }
    };

    const updateStatusIfChanged = (newTrack: string) => {
      const cleaned = newTrack.trim();
      if (cleaned && userListeningTo !== cleaned) {
        handleUpdateListeningTo(cleaned);
      }
    };

    // Fast-capture any direct play event in this tab
    const handlePlayEvent = () => {
      setTimeout(triggerMusicDetection, 400);
    };

    document.addEventListener("play", handlePlayEvent, true);

    // Intercept MediaSession metadata changes (if any external embed updates it in this tab)
    if (typeof window !== "undefined" && "mediaSession" in navigator) {
      try {
        let currentMetadata = navigator.mediaSession.metadata;
        Object.defineProperty(navigator.mediaSession, "metadata", {
          get() {
            return currentMetadata;
          },
          set(value) {
            currentMetadata = value;
            if (value && value.title) {
              const info = value.artist ? `${value.artist} - ${value.title}` : value.title;
              updateStatusIfChanged(info);
            }
          },
          configurable: true
        });
      } catch (e) {
        console.warn("Buzzi could not configure MediaSession interception hooks:", e);
      }
    }

    // Set up a steady background polling layer
    const interval = setInterval(triggerMusicDetection, 2500);

    return () => {
      document.removeEventListener("play", handlePlayEvent, true);
      clearInterval(interval);
    };
  }, [isSyncMusicEnabled, userListeningTo]);

  // Authentication State / Local Session Restorer
  const [deletedContactIds, setDeletedContactIds] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser) {
      const savedDeleted = localStorage.getItem("buzzi_deleted_contacts_" + currentUser.uid);
      if (savedDeleted) {
        try {
          setDeletedContactIds(JSON.parse(savedDeleted));
        } catch (e) {
          console.warn("Failed to parse saved deleted contacts:", e);
        }
      } else {
        setDeletedContactIds([]);
      }
    } else {
      setDeletedContactIds([]);
    }
  }, [currentUser]);

  const handleDeleteContact = (contactId: string) => {
    if (!currentUser) return;
    const updated = [...deletedContactIds, contactId];
    setDeletedContactIds(updated);
    localStorage.setItem("buzzi_deleted_contacts_" + currentUser.uid, JSON.stringify(updated));
    
    hiveAudio.playNotification();
    if (activeId === contactId) {
      setActiveId("queen");
      setActiveType("dm");
    }
  };

  useEffect(() => {
    // Clean out old local browser message cache to ensure a 100% fresh start across database wipes!
    if (!localStorage.getItem("buzzi_backup_messages_cleared_v3")) {
      localStorage.removeItem("buzzi_backup_messages");
      localStorage.setItem("buzzi_backup_messages_cleared_v3", "true");
      localStorage.setItem("buzzi_backup_messages_cleared_v2", "true");
      localStorage.setItem("buzzi_backup_messages_cleared_v1", "true");
      console.log("[Clear] Local messages backup has been cleared on app mount to start with a clean slate.");
    }

    const savedUser = localStorage.getItem("buzzi_user");
    if (savedUser) {
      try {
        let parsed = JSON.parse(savedUser);
        let updatedLocally = false;
        if (parsed) {
          if (parsed.name && typeof parsed.name === "string" && /Robbin/i.test(parsed.name)) {
            parsed.name = parsed.name.replace(/Robbin/gi, "Test");
            updatedLocally = true;
          }
          if (parsed.displayName && typeof parsed.displayName === "string" && /Robbin/i.test(parsed.displayName)) {
            parsed.displayName = parsed.displayName.replace(/Robbin/gi, "Test");
            updatedLocally = true;
          }
          if (updatedLocally) {
            localStorage.setItem("buzzi_user", JSON.stringify(parsed));
            localStorage.setItem("buzzi_remembered_name", parsed.name || parsed.displayName || "Test");
            console.log("[Migration] Automatically migrated local session 'Robbin' keywords to 'Test'");
          }
        }
        setCurrentUser(parsed);
        initUserProfile(parsed);
      } catch (e) {
        console.warn("Saved user corrupted:", e);
      }
    }
    setAuthInitialized(true);
  }, [activeDbMode]);

  // Handle URL-based / localStorage-based friend invitation auto-connect
  useEffect(() => {
    if (!currentUser || !currentUser.email) return;

    const checkAndProcessInvite = async () => {
      let invitedByVal = null;
      let inviteEmailVal = null;

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        invitedByVal = params.get("invitedBy");
        inviteEmailVal = params.get("inviteEmail");
      }

      // Check localStorage backup
      if (!inviteEmailVal) {
        try {
          const cached = localStorage.getItem("buzzi_pending_invite");
          if (cached) {
            const parsed = JSON.parse(cached);
            invitedByVal = parsed.invitedBy;
            inviteEmailVal = parsed.inviteEmail;
          }
        } catch (e) {
          console.warn("Fout bij laden pending uitnodiging uit cache:", e);
        }
      } else if (invitedByVal) {
        // Safe keep in cache
        try {
          localStorage.setItem("buzzi_pending_invite", JSON.stringify({ invitedBy: invitedByVal, inviteEmail: inviteEmailVal }));
        } catch {}
      }

      if (!inviteEmailVal) return;

      const cleanInviteEmail = inviteEmailVal.trim().toLowerCase();
      const cleanMyEmail = currentUser.email.split("#pwd_")[0].trim().toLowerCase();

      // Avoid self invite
      if (cleanInviteEmail === cleanMyEmail) {
        try {
          localStorage.removeItem("buzzi_pending_invite");
        } catch {}
        return;
      }

      try {
        console.log("Processing mutual auto-invite from:", cleanInviteEmail, "to current:", cleanMyEmail);

        // 1. Send / register invite request in backend from Inviter -> Invitee
        await fetch("/api/friend-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromEmail: cleanInviteEmail,
            fromName: invitedByVal || "Buzzi Vriend",
            toEmail: cleanMyEmail
          })
        });

        // 2. Also save reciprocal user profile in backend if missing so they instantly exist in list
        await fetch("/api/db/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: `u_${simpleHash(cleanInviteEmail)}`,
            name: invitedByVal || "Buzzi Vriend",
            email: cleanInviteEmail,
            avatar: "🧑‍🚀",
            status: "online",
            personalMessage: "Gezellig samen vrienden op Buzzi! :-)"
          })
        });

        // 3. Send mutual request Invitee -> Inviter (automatically confirming bilateral relation)
        await fetch("/api/friend-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromEmail: cleanMyEmail,
            fromName: userDisplayName,
            toEmail: cleanInviteEmail
          })
        });

        // Play authentic Buzzi online sound!
        hiveAudio.playNotification();

        // Display beautiful bottom right toast!
        setBuzziToast({
          show: true,
          title: "Vriend Toegevoegd! 🎉",
          message: `${invitedByVal || "Buzzi Gebruiker"} is zojuist automatisch aan je contactenlijst toegevoegd via de uitnodigingslink!`,
          avatar: "🧑‍🚀"
        });

        // Clean up URL search parameters cleanly matching native window state
        try {
          if (typeof window !== "undefined" && window.history.replaceState) {
            const tempUrl = new URL(window.location.href);
            tempUrl.searchParams.delete("invitedBy");
            tempUrl.searchParams.delete("inviteEmail");
            window.history.replaceState({}, document.title, tempUrl.pathname + tempUrl.search);
          }
        } catch {}

        // Remove from pending cache so they don't get infinite toast notifications
        try {
          localStorage.removeItem("buzzi_pending_invite");
        } catch {}

        // Refresh registeredUsers immediately
        const syncRes = await fetch("/api/db/users?t=" + Date.now());
        if (syncRes.status === 200) {
          const ulist = await syncRes.json();
          const filtered = ulist
            .filter((data: any) => data.uid !== currentUser.uid)
            .map((data: any) => ({
              id: data.uid,
              name: data.name || "Buzzi Gebruiker",
              email: data.email || "",
              avatar: data.avatar || "🧑‍🚀",
              status: data.status || "online",
              personalMessage: data.personalMessage || "",
              listeningTo: data.listeningTo || "",
            }));
          setRegisteredUsers(filtered);
        }

      } catch (err) {
        console.error("Fout bij runnen van auto invite link handler:", err);
      }
    };

    const runT = setTimeout(checkAndProcessInvite, 1500);
    return () => clearTimeout(runT);
  }, [currentUser, userDisplayName]);

  // Sync users in real-time (Polling from Express Server / MongoDB / Local JSON)
  useEffect(() => {
    if (!currentUser) return;
    
    const syncUsers = async () => {
      try {
        const res = await fetch("/api/db/users?t=" + Date.now());
        if (res.status === 200) {
          const list = await res.json();
          
          let finalUsersList = list;
          if (list.length <= 1) { // server reset/cleanup happened
            const savedBackup = localStorage.getItem("buzzi_backup_users");
            if (savedBackup) {
              try {
                const parsedBackup = JSON.parse(savedBackup);
                if (parsedBackup && parsedBackup.length > 1) {
                  console.log("[Restore] Restoring other registered users from browser cache back to server...", parsedBackup.length);
                  parsedBackup.forEach((userDoc: any) => {
                    if (userDoc.uid !== currentUser.uid) {
                      fetch("/api/db/users", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(userDoc)
                      }).catch(e => console.warn("Background restore user failed:", e));
                    }
                  });
                  // Merge so we display them immediately
                  finalUsersList = parsedBackup;
                }
              } catch (err3) {
                console.warn("Failed to restore users backup:", err3);
              }
            }
          } else {
            try {
              localStorage.setItem("buzzi_backup_users", JSON.stringify(list));
            } catch (errs) {}
          }

          const filtered = finalUsersList
            .filter((data: any) => data.uid !== currentUser.uid)
            .map((data: any) => {
              const isStale = data.updatedAtTimestamp && (Date.now() - data.updatedAtTimestamp > 300000);
              const effectiveStatus = isStale ? "offline" : ((data.status as StatusType) || "online");
              return {
                id: data.uid,
                name: data.name || "Buzzi Gebruiker",
                email: data.email || "",
                avatar: data.avatar || "🧑‍🚀",
                status: effectiveStatus,
                personalMessage: data.personalMessage || "",
                listeningTo: data.listeningTo || "",
                isPremium: !!data.isPremium,
                updatedAtTimestamp: data.updatedAtTimestamp
              };
            });
          setRegisteredUsers(filtered);
        }
      } catch (e) {
        console.warn("Failed to sync users:", e);
      }
    };

    syncUsers();
    const interval = setInterval(syncUsers, 6000); // Poll every 6 seconds to reduce pressure
    return () => clearInterval(interval);
  }, [currentUser]);

  // Combine buddy lists: if gast@buzzi.nl, show full static initial buddies. If custom email, start fresh with Buzzi Bot and only accepted friends!
  const isDemoUser = currentUser?.email === "gast@buzzi.nl" || currentUser?.email?.startsWith("gast_") || currentUser?.email?.includes("pwd_local");
  const cleanCurrentUserEmail = (currentUser?.email || "").split("#pwd_")[0].trim().toLowerCase();
  
  const currentBuddies = (isDemoUser
    ? [
        ...INITIAL_CONTACTS,
        ...registeredUsers.filter(u => {
          const cleanUEmail = (u.email || "").split("#pwd_")[0].trim().toLowerCase();
          return !INITIAL_CONTACTS.some(ic => ic.email === u.email) &&
            cleanUEmail !== cleanCurrentUserEmail &&
            !u.name?.toLowerCase().includes("robbin") &&
            !u.email?.toLowerCase().includes("robbin");
        })
      ]
    : [
        INITIAL_CONTACTS[0], // Keep Buzzi Bot!
        ...registeredUsers.filter(u => {
          const cleanUEmail = (u.email || "").split("#pwd_")[0].trim().toLowerCase();
          if (u.id === "queen" || cleanUEmail === "buzzi_bot@live.nl" || cleanUEmail === cleanCurrentUserEmail) return false;
          
          // Check if there is an accepted friendship with this registered user
          const isFriend = acceptedFriendships.some(fr => {
            const cleanU = (u.email || "").trim().toLowerCase();
            const from = (fr.fromEmail || "").trim().toLowerCase();
            const to = (fr.toEmail || "").trim().toLowerCase();
            return (from === cleanCurrentUserEmail && to === cleanU) || (from === cleanU && to === cleanCurrentUserEmail);
          });
          return isFriend;
        })
      ]).map(c => ({
        ...c,
        isBlocked: blockedContactIds.includes(c.id)
      })).filter(c => !deletedContactIds.includes(c.id));

  // Refs to track previous buddy statuses for real-time MSN alerts
  const lastBuddiesStatusRef = useRef<Record<string, StatusType>>({});
  const initialSyncRef = useRef<boolean>(true);

  // Monitor buddy status changes dynamically for real-time sound and toast triggers
  useEffect(() => {
    if (!currentUser || currentBuddies.length === 0) return;

    const currentStatusMap: Record<string, StatusType> = {};
    currentBuddies.forEach(buddy => {
      if (buddy.id === "queen") return; // Skip Buzzi Bot
      currentStatusMap[buddy.id] = (buddy.status as StatusType) || "offline";
    });

    if (initialSyncRef.current) {
      lastBuddiesStatusRef.current = currentStatusMap;
      initialSyncRef.current = false;
      return;
    }

    Object.keys(currentStatusMap).forEach(buddyId => {
      const prevStatus = lastBuddiesStatusRef.current[buddyId];
      const newStatus = currentStatusMap[buddyId];

      if (prevStatus !== undefined && prevStatus !== newStatus) {
        const buddy = currentBuddies.find(b => b.id === buddyId);
        if (buddy) {
          const wasOffline = prevStatus === "offline";
          const isOffline = newStatus === "offline";
          const displayPm = buddy.personalMessage || "";
          const subtitle = `${buddy.email}${displayPm ? ` - "${displayPm}"` : ""}`;

          if (wasOffline && !isOffline) {
            hiveAudio.playOnlineAlert();
            setMsnToast({
              show: true,
              name: buddy.name,
              avatar: buddy.avatar,
              event: "online",
              email: subtitle
            });
            setTimeout(() => {
              setMsnToast(curr => {
                if (curr && curr.name === buddy.name && curr.event === "online") {
                  return { ...curr, show: false };
                }
                return curr;
              });
            }, 6000);
          } else if (!wasOffline && isOffline) {
            hiveAudio.playOfflineAlert();
            setMsnToast({
              show: true,
              name: buddy.name,
              avatar: buddy.avatar,
              event: "offline",
              email: subtitle
            });
            setTimeout(() => {
              setMsnToast(curr => {
                if (curr && curr.name === buddy.name && curr.event === "offline") {
                  return { ...curr, show: false };
                }
                return curr;
              });
            }, 6000);
          }
        }
      }
    });

    lastBuddiesStatusRef.current = currentStatusMap;
  }, [currentBuddies, currentUser]);

  // Periodic heartbeat to keep client active status fresh on the server
  useEffect(() => {
    if (!currentUser || !profileInitialized) return;

    // Send instant update on startup or logins
    updateProfileInDatabase({});

    const interval = setInterval(() => {
      updateProfileInDatabase({});
    }, 8000); // 8 seconds pulse

    return () => clearInterval(interval);
  }, [currentUser, profileInitialized, userDisplayName, userAvatar, userStatus, userPersonalMessage, userListeningTo]);

  const visibleChannels = channels;

  // Sync channels list dynamically from server JSON database
  useEffect(() => {
    if (!currentUser) return;

    const fetchChannels = async () => {
      try {
        const res = await fetch("/api/channels?t=" + Date.now());
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setChannels(data);
          }
        }
      } catch (err) {
        console.warn("Fout bij ophalen van kanalen:", err);
      }
    };

    fetchChannels();
    const intervalId = setInterval(fetchChannels, 10000); // Channels change rarely, poll every 10s
    return () => clearInterval(intervalId);
  }, [currentUser]);

  // Sync bugs list from server JSON database
  useEffect(() => {
    if (!currentUser) return;

    const fetchBugs = async () => {
      try {
        const res = await fetch("/api/bugs?t=" + Date.now());
        if (res.ok) {
          const listFromSrv = await res.json();
          // Update local cache to match server's official list
          localStorage.setItem("buzzi_local_bugs", JSON.stringify(listFromSrv));
          setBugsList(listFromSrv);
        } else {
          // Fallback to local cache if server is offline/error
          let localSaved = [];
          try {
            localSaved = JSON.parse(localStorage.getItem("buzzi_local_bugs") || "[]");
          } catch {}
          setBugsList(localSaved);
        }
      } catch (err) {
        console.warn("Fout bij ophalen van bug reports, fallback naar lokaal:", err);
        let localSaved = [];
        try {
          localSaved = JSON.parse(localStorage.getItem("buzzi_local_bugs") || "[]");
        } catch {}
        setBugsList(localSaved);
      }
    };

    fetchBugs();
    const intervalId = setInterval(fetchBugs, 12000); // Poll bugs every 12s
    return () => clearInterval(intervalId);
  }, [currentUser]);

  // Poll friend requests and accepted friendships in real-time
  useEffect(() => {
    if (!currentUser || !currentUser.email) return;

    const fetchFriendRequestsAndFriendships = async () => {
      try {
        const cleanMyEmail = (currentUser.email || "").split("#pwd_")[0].trim().toLowerCase();
        // 1. Pending requests to me (default GET is pending)
        const res = await fetch(`/api/friend-requests?toEmail=${encodeURIComponent(cleanMyEmail)}&status=pending&t=${Date.now()}`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            // Play notification if a new pending request arrives
            if (list.length > friendRequests.length) {
              hiveAudio.playNotification();
            }
            setFriendRequests(list);
          }
        }

        // 2. Accepted friendships (where I am recipient or sender)
        const acceptedRes = await fetch(`/api/friend-requests?email=${encodeURIComponent(cleanMyEmail)}&status=accepted&t=${Date.now()}`);
        if (acceptedRes.ok) {
          const alist = await acceptedRes.json();
          if (Array.isArray(alist)) {
            setAcceptedFriendships(alist);
          }
        }
      } catch (err) {
        console.warn("Fout bij ophalen van vriendenverzoeken/relaties:", err);
      }
    };

    fetchFriendRequestsAndFriendships();
    const interval = setInterval(fetchFriendRequestsAndFriendships, 7000); // Poll friend requests/status every 7s
    return () => clearInterval(interval);
  }, [currentUser, friendRequests.length]);

  const handleAcceptFriendRequest = async (id: string, fromName: string, fromEmail: string) => {
    try {
      const res = await fetch("/api/friend-requests/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setFriendRequests(prev => prev.filter(r => r.id !== id));
        hiveAudio.playNotification();
        
        // Ensure both profiles are registered/refreshed
        await fetch("/api/db/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: `u_${simpleHash(fromEmail)}`,
            name: fromName,
            email: fromEmail,
            avatar: "🧑‍🚀",
            status: "online",
            personalMessage: "Gezellig samen vrienden op Buzzi! :-)"
          })
        });
        
        // Sync users list immediately
        const syncRes = await fetch("/api/db/users?t=" + Date.now());
        if (syncRes.status === 200) {
          const list = await syncRes.json();
          const filtered = list
            .filter((data: any) => data.uid !== currentUser?.uid)
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
      }
    } catch (e) {
      console.warn("Kon vriendenverzoek niet accepteren:", e);
    }
  };

  const handleDeclineFriendRequest = async (id: string) => {
    try {
      const res = await fetch("/api/friend-requests/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setFriendRequests(prev => prev.filter(r => r.id !== id));
        hiveAudio.playHoneyPop();
      }
    } catch (e) {
      console.warn("Kon vriendenverzoek niet weigeren:", e);
    }
  };

  const handleSendBugReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle.trim() || !bugDescription.trim()) return;

    setIsSubmittingBug(true);

    // Create unique optimistic item
    const tempId = "bug-" + Math.random().toString(36).substring(2, 11);
    const newBugItem = {
      id: tempId,
      title: bugTitle.trim(),
      description: bugDescription.trim(),
      category: bugCategory,
      senderName: userDisplayName || "Onbekend",
      senderEmail: currentUser?.email || "geen@email.nl",
      timestamp: new Date().toISOString(),
      status: "Open"
    };

    // Store in localStorage as instant backup
    let localSaved: any[] = [];
    try {
      localSaved = JSON.parse(localStorage.getItem("buzzi_local_bugs") || "[]");
    } catch {}
    localSaved.unshift(newBugItem);
    localStorage.setItem("buzzi_local_bugs", JSON.stringify(localSaved));

    // Instantly update state optimistically
    setBugsList(prev => [newBugItem, ...prev]);

    try {
      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bugTitle.trim(),
          description: bugDescription.trim(),
          category: bugCategory,
          reporter: userDisplayName || "Onbekend",
          reporterEmail: currentUser?.email || "geen@email.nl"
        })
      });

      if (res.ok) {
        setBugTitle("");
        setBugDescription("");
        setBugSuccess(true);
        hiveAudio.playNotification();

        // Refresh bugs list from API
        const freshRes = await fetch("/api/bugs?t=" + Date.now());
        if (freshRes.ok) {
          const list = await freshRes.json();
          localStorage.setItem("buzzi_local_bugs", JSON.stringify(list));
          setBugsList(list);
        }

        setTimeout(() => {
          setBugSuccess(false);
        }, 3000);
      } else {
        console.warn("Bug-API reageerde met status fout:", res.status);
      }
    } catch (err) {
      console.error("Fout bij opslaan bug report op de server:", err);
    } finally {
      setIsSubmittingBug(false);
    }
  };

  const handleDeleteBug = async (bugId: string) => {
    try {
      // Instantly filter out from local cache
      let localSaved: any[] = [];
      try {
        localSaved = JSON.parse(localStorage.getItem("buzzi_local_bugs") || "[]");
      } catch {}
      localSaved = localSaved.filter((b: any) => b.id !== bugId);
      localStorage.setItem("buzzi_local_bugs", JSON.stringify(localSaved));

      // Filter in state optimistically
      setBugsList(prev => prev.filter(b => b.id !== bugId));

      const res = await fetch(`/api/bugs/${bugId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        const list = await res.json();
        localStorage.setItem("buzzi_local_bugs", JSON.stringify(list));
        setBugsList(list);
        hiveAudio.playNotification();
      }
    } catch (err) {
      console.error("Fout bij verwijderen van bug op de server, lokaal is wel verwijderd:", err);
    }
  };

  // Sync Messages with Database / Local Storage (Polling)
  useEffect(() => {
    if (!currentUser) return;

    const syncMessages = async () => {
      try {
        const res = await fetch("/api/db/messages?t=" + Date.now());
        if (res.status === 200) {
          const list = await res.json();
          
          let finalMessagesList = list;
          if (list.length === 0) {
            const savedBackup = localStorage.getItem("buzzi_backup_messages");
            if (savedBackup) {
              try {
                const parsedBackup = JSON.parse(savedBackup);
                if (parsedBackup && parsedBackup.length > 0) {
                  console.log("[Restore] Restoring messages from local browser cache back to server...", parsedBackup.length);
                  parsedBackup.forEach((msgDoc: any) => {
                    fetch("/api/db/messages", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(msgDoc)
                    }).catch(e => console.warn("Background restore message failed:", e));
                  });
                  finalMessagesList = parsedBackup;
                }
              } catch (err2) {
                console.warn("Failed to restore messages backup:", err2);
              }
            }
          } else {
            try {
              localStorage.setItem("buzzi_backup_messages", JSON.stringify(list));
            } catch (errs) {}
          }
          
          const freshMessages: Record<string, Message[]> = {
            "mensen-van-toen": [],
            "breezer-groep": [],
            "queen": [],
            "wouter": [],
            "kelly": [],
            "danny": [],
            "sanne": []
          };

          finalMessagesList.forEach((data: any) => {
            const recId = data.receiverId;
            let conversationKey = recId;

            // Differentiate between group channels/bots and peer-to-peer DMs
            if (recId !== "mensen-van-toen" && recId !== "breezer-groep" && !recId.startsWith("ch-") && recId !== "queen") {
              if (data.senderId === currentUser.uid) {
                conversationKey = data.receiverId; // We sent it, associate with the peer's ID
              } else if (data.receiverId === currentUser.uid) {
                conversationKey = data.senderId; // They sent it, associate with the sender's ID (peer)
              } else {
                // Confidential private conversation between others; do not load
                return;
              }
            }

            // Check for mobile push / browser notifications on new incoming messages
            if (data.senderId !== currentUser.uid) {
              if (processedMessageIds.current.size > 0 && !processedMessageIds.current.has(data.id)) {
                // To avoid sending double notifications for restored backup/historic messages,
                // we ONLY trigger alerts if the message is genuinely new (created within the last 60 seconds).
                const createdAtTime = data.createdAt ? new Date(data.createdAt).getTime() : data.createdAtTimestamp;
                const isVeryRecent = createdAtTime ? (Math.abs(Date.now() - createdAtTime) < 60000) : false;

                if (isVeryRecent) {
                  if (data.isBuzz) {
                    handleBuzzIncoming();
                    hiveAudio.playNudge();
                  }

                  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                    try {
                      let notificationBody = data.text;
                      if (data.isBuzz) {
                        notificationBody = "🚨 NUDGE! Stuurde je een nudge duwtje!";
                      } else if (data.isWink) {
                        notificationBody = "😉 KNIPOOG! Stuurde een knipoog!";
                      }
                    new Notification(`${data.senderName || "Buzzi Vriend"} 💬`, {
                      body: notificationBody,
                      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M20,50 a30,25 0 1,1 60,0 ' fill='%23ffd700'/%3E%3C/svg%3E",
                      tag: data.id
                    });

                    // Mobile vibration if available
                    if ("vibrate" in navigator) {
                      navigator.vibrate([150, 50, 150]);
                    }
                  } catch (err) {
                    console.warn("Failed to fire browser push notification:", err);
                  }
                }
              }
            }
            processedMessageIds.current.add(data.id);
            } else {
              processedMessageIds.current.add(data.id);
            }

            if (!freshMessages[conversationKey]) {
              freshMessages[conversationKey] = [];
            }
            freshMessages[conversationKey].push({
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
    const interval = setInterval(syncMessages, 4500); // Poll for new messages every 4.5s (relaxed from 3s)
    return () => clearInterval(interval);
  }, [currentUser]);

  // Sync methods
  const handleUpdateDisplayName = (val: string) => {
    setUserDisplayName(val);
    if (currentUser) {
      const updatedUser = { ...currentUser, displayName: val };
      localStorage.setItem("buzzi_user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    }
    localStorage.setItem("buzzi_remembered_name", val);
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
  const handleUpdateListeningTo = (val: string) => {
    setUserListeningTo(val);
    updateProfileInDatabase({ listeningTo: val });
  };

  const handleCreateChannel = async (name: string, description: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      });
      if (res.ok) {
        const updated = await res.json();
        setChannels(updated);
        hiveAudio.playNotification();
        return true;
      }
    } catch (err) {
      console.error("Fout bij maken van kanaal:", err);
    }
    return false;
  };

  const handleSignOut = async () => {
    hiveAudio.playHoneyPop();
    localStorage.removeItem("buzzi_user");
    setCurrentUser(null);
    setProfileInitialized(false);
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
    // Play connection / login jingle based on chosen sound scheme !
    setTimeout(() => {
      hiveAudio.playLogin();
    }, 150);
    await initUserProfile(mockUser, name);
  };

  const handleUpdateSoundScheme = (scheme: string) => {
    localStorage.setItem("buzzi_sound_scheme", scheme);
    setSoundScheme(scheme);
    // Play a test chime corresponding to the newly selected scheme
    setTimeout(() => {
      hiveAudio.playNotification();
    }, 80);
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
      handleUpdateDisplayName(generatedName);
      hiveAudio.playNotification();
    }
  };



  const saveMessageToDatabase = async (msg: Partial<Message>) => {
    if (!currentUser) return;
    const msgId = `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    let amsterdamTime = "";
    let amsterdamDateTime = "";
    try {
      amsterdamTime = new Date().toLocaleTimeString('nl-NL', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hour12: false });
      amsterdamDateTime = new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (e) {
      amsterdamTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      amsterdamDateTime = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }

    const msgDoc = {
      id: msgId,
      senderId: msg.senderId || currentUser.uid,
      senderName: msg.senderName || userDisplayName,
      senderAvatar: msg.senderAvatar || userAvatar,
      text: msg.text || "",
      timestamp: msg.timestamp || amsterdamTime,
      createdAtLocal: amsterdamDateTime,
      isBuzz: msg.isBuzz || false,
      isWink: msg.isWink || false,
      winkId: msg.winkId || "",
      isGameDuel: msg.isGameDuel || false,
      gameType: msg.gameType || undefined,
      gameId: msg.gameId || "",
      gameStatus: msg.gameStatus || undefined,
      fileTransfer: msg.fileTransfer || undefined,
      isCallInvite: msg.isCallInvite || false,
      callId: msg.callId || "",
      callStatus: msg.callStatus || undefined,
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

    let amsterdamTime = "";
    let amsterdamDateTime = "";
    try {
      amsterdamTime = new Date().toLocaleTimeString('nl-NL', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hour12: false });
      amsterdamDateTime = new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (e) {
      amsterdamTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      amsterdamDateTime = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }

    const msgDoc = {
      id: msgId,
      senderId: simId, // Use simId so local UI styling formats it correctly
      senderName: simName,
      senderAvatar: simAvatar,
      text: simText,
      timestamp: amsterdamTime,
      createdAtLocal: amsterdamDateTime,
      isBuzz: additional.isBuzz || false,
      isWink: additional.isWink || false,
      winkId: additional.winkId || "",
      fileTransfer: additional.fileTransfer || undefined,
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

  // Handle user typing state and sync to server-side
  const isLocallyTyping = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendTypingStatusToServer = async (typing: boolean) => {
    if (!currentUser || activeType !== "dm" || !activeId) return;
    try {
      await fetch("/api/db/typing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          senderUid: currentUser.uid,
          typingTo: activeId,
          isTyping: typing
        })
      });
    } catch (err) {
      console.warn("Failed to update server typing status:", err);
    }
  };

  const handleUserTyping = () => {
    if (!currentUser || activeType !== "dm" || !activeId) return;

    if (!isLocallyTyping.current) {
      isLocallyTyping.current = true;
      sendTypingStatusToServer(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isLocallyTyping.current = false;
      sendTypingStatusToServer(false);
    }, 2000); // 2 seconds of inactivity
  };

  // Clean up user typing state when switching conversations
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isLocallyTyping.current) {
      isLocallyTyping.current = false;
      sendTypingStatusToServer(false);
    }
  }, [activeId, activeType]);

  // Poll typing statuses from other players to current user
  useEffect(() => {
    if (!currentUser) return;

    const fetchTyping = async () => {
      try {
        const res = await fetch(`/api/db/typing?recipient=${encodeURIComponent(currentUser.uid)}&t=${Date.now()}`);
        if (res.status === 200) {
          const { typingUsers } = await res.json();
          setServerTypingUsers(typingUsers || []);
        }
      } catch (err) {
        console.warn("Failed to fetch typing status:", err);
      }
    };

    fetchTyping();
    const interval = setInterval(fetchTyping, 1800);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Sending a message
  const handleSendMessage = async (
    text: string,
    isBuzz: boolean = false,
    isWink: boolean = false,
    winkId?: string,
    fileTransfer?: any,
    isGameDuel?: boolean,
    gameType?: "tictactoe" | "connect4" | "rps" | "snake" | "memory",
    gameId?: string,
    isCallInvite?: boolean,
    callId?: string
  ) => {
    if (!currentUser) return;

    // Reset local typing state immediately on message send
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isLocallyTyping.current) {
      isLocallyTyping.current = false;
      sendTypingStatusToServer(false);
    }

    // Save to Database server-side first (MongoDB or Local File backup)
    await saveMessageToDatabase({
      text,
      isBuzz: isBuzz,
      isWink: isWink,
      winkId: winkId,
      fileTransfer: fileTransfer,
      isGameDuel: isGameDuel,
      gameType: gameType,
      gameId: gameId,
      gameStatus: isGameDuel ? "inviting" : undefined,
      isCallInvite: isCallInvite || false,
      callId: callId || "",
      callStatus: isCallInvite ? "dialing" : undefined
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
            "🤖 Buzzi Bot (H)",
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
            "🤖 Buzzi Bot (H)",
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
          "🤖 Buzzi Bot (H)",
          "🤖",
          "queen"
        );
      } catch (err) {
        console.error("AI Chat Failure:", err);
        setIsTyping(false);
        
        await writeSimulatedReply(
          "🤖 *PING!* Mijn inbelverbinding kraakt een beetje! Zorg dat de juiste GEMINI_API_KEY in je Secrets-instellingen staat om live te praten! brb mss... (A)",
          "🤖 Buzzi Bot (H)",
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
          <div className="text-[10px] text-slate-400 font-mono">Beveiligde database initialiseren...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} siteLanguage={siteLanguage} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      {showCookieBanner && (
        <div className="bg-[#FFFFE1] border-b-2 border-[#D6C176] shadow-sm flex items-center justify-between px-4 py-2.5 text-[10.5px] font-sans text-[#5c4a1e] select-none shrink-0 relative z-[999] gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-base">🍪</span>
            <div className="text-left leading-relaxed">
              <span className="font-bold">Buzzi Privacy &amp; Cookies:</span> We gebruiken functionele, tijdelijke browser-cookies om je aanmelding, profiel en retro geluidsschema te onthouden. Door deze site te gebruiken stem je in met onze{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLegalModalOpen(true);
                  hiveAudio.playHoneyPop();
                }}
                className="underline font-black text-[#1c427f] hover:text-blue-950 cursor-pointer inline-block"
              >
                Gebruikersvoorwaarden &amp; Privacyverklaring
              </button>.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                localStorage.setItem("buzzi_legal_cookies_accepted", "true");
                setShowCookieBanner(false);
                hiveAudio.playLogin();
              }}
              className="bg-[#1C427F] hover:bg-[#153466] text-white font-extrabold px-3 py-1 rounded text-[9.5px] border border-[#0d2242] uppercase shadow-sm cursor-pointer select-none active:scale-95 transition-all text-center shrink-0"
            >
              ✓ Akkoord
            </button>
            <button
              onClick={() => {
                setIsLegalModalOpen(true);
                hiveAudio.playHoneyPop();
              }}
              className="bg-white hover:bg-slate-100 text-slate-700 font-extrabold px-3 py-1 rounded text-[9.5px] border border-slate-300 shadow-sm cursor-pointer select-none active:scale-95 transition-all text-center shrink-0"
            >
              Lees voorwaarden
            </button>
          </div>
        </div>
      )}

      <div 
        className={`flex-1 flex overflow-hidden relative transition-transform duration-100 pb-14 md:pb-0 ${
          isBuzzingFlash ? "bg-red-50 animate-pulse scale-[0.99] animate-buzziShake" : ""
        }`}
        id="buzzi_workspace"
      >
      {/* Golden Flash Alert Overlay for Nudges */}
      {isBuzzingFlash && (
        <div className="absolute inset-0 bg-red-500/10 pointer-events-none z-50 animate-pulse border-4 border-red-500" />
      )}

      {/* 1. Sidebar Panel (Authentic Buzzi List) */}
      <div className={`h-full shrink-0 w-full md:w-80 ${mobileActiveTab === "sidebar" ? "flex" : "hidden md:flex"}`}>
        <Sidebar
          channels={visibleChannels}
          contacts={currentBuddies}
          activeId={activeId}
          activeType={activeType}
          siteLanguage={siteLanguage}
          onSelectChannel={(cid) => {
            setActiveId(cid);
            setActiveType("channel");
            setMobileActiveTab("chat");
            hiveAudio.playHoneyPop();
          }}
          onSelectDM={(cmid) => {
            setActiveId(cmid);
            setActiveType("dm");
            setMobileActiveTab("chat");
            hiveAudio.playHoneyPop();
          }}
          userEmail={currentUser.email || "prinsrobbin@gmail.com"}
          onSignOut={handleSignOut}
          onDeleteContact={handleDeleteContact}
          onCreateChannel={handleCreateChannel}
          onAddContact={handleAddContact}
          friendRequests={friendRequests}
          onAcceptFriendRequest={handleAcceptFriendRequest}
          onDeclineFriendRequest={handleDeclineFriendRequest}
          
          // Custom interactive profile properties for Buzzi
          userDisplayName={userDisplayName}
          onUpdateDisplayName={handleUpdateDisplayName}
          userPersonalMessage={userPersonalMessage}
          onUpdatePersonalMessage={handleUpdatePersonalMessage}
          userStatus={userStatus}
          onUpdateStatus={handleUpdateStatus}
          userAvatar={userAvatar}
          onUpdateAvatar={handleUpdateAvatar}
          userListeningTo={userListeningTo}
          onUpdateListeningTo={handleUpdateListeningTo}
          activeDbMode={activeDbMode}
          dbStatus={dbStatus}
          isUserPremium={isUserPremium}
          onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
          onToggleBlockContact={handleToggleBlockContact}
          isSyncMusicEnabled={isSyncMusicEnabled}
          onToggleSyncMusic={handleToggleSyncMusic}
          isReconnectingDb={isReconnectingDb}
          onReconnectDb={() => checkDbStatus(true)}
        />
      </div>

      {/* 2. Chat Area Window (Buzzi Conversation box) */}
      <div className={`h-full flex-1 ${mobileActiveTab === "chat" ? "flex" : "hidden md:flex"} flex-col min-w-0`}>
        <ChatArea
          activeId={activeId}
          activeType={activeType}
          activeChannel={activeChannel}
          activeContact={activeContact}
          messages={messages[activeId] || []}
          isTyping={isCurrentChatPartnerTyping}
          onSendMessage={handleSendMessage}
          onBuzzIncoming={handleBuzzIncoming}
          myDisplayName={userDisplayName}
          myAvatar={userAvatar}
          myUserId={currentUser.uid}
          onUserTyping={handleUserTyping}
          isBlocked={blockedContactIds.includes(activeId)}
          onToggleBlock={() => handleToggleBlockContact(activeId)}
          isUserPremium={isUserPremium}
          onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
          siteLanguage={siteLanguage}
        />
      </div>

      {/* 3. Retro Buzzi Side Utility Panel (Instead of HiveStats) */}
      <div className={`h-full w-full md:w-80 ${mobileActiveTab === "tools" ? "flex" : "hidden md:flex"} bg-gradient-to-b from-[#eef4fb] to-[#cbdcf0] border-l border-[#9ebcd1] flex-col p-4 justify-between select-none overflow-y-auto font-sans`}>
        <div className="space-y-4">
          
          {/* Utility Panel Tabs */}
          <div className="flex bg-[#cbdcf0] p-1 rounded-lg border border-[#bad0e3] shrink-0 gap-1 mb-2">
            <button
              onClick={() => {
                setActiveUtilityTab("tools");
                hiveAudio.playHoneyPop();
              }}
              className={`flex-1 text-center py-1.5 rounded text-[11px] font-black transition-all cursor-pointer ${
                activeUtilityTab === "tools"
                  ? "bg-[#1d5c8a] text-white shadow-sm"
                  : "text-[#1d5c8a] hover:bg-[#cfe1f5]"
              }`}
            >
              🧩 Retro Tools
            </button>
            <button
              onClick={() => {
                setActiveUtilityTab("bugs");
                hiveAudio.playHoneyPop();
              }}
              className={`flex-1 text-center py-1.5 rounded text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 relative ${
                activeUtilityTab === "bugs"
                  ? "bg-[#1d5c8a] text-white shadow-sm"
                  : "text-[#1d5c8a] hover:bg-[#cfe1f5]"
              }`}
            >
              🐞 Bug Melder
              {bugsList.length > 0 && (
                <span className="bg-red-500 text-white font-mono rounded-full text-[8.5px] h-4 min-w-4 px-1 flex items-center justify-center animate-bounce leading-none font-bold">
                  {bugsList.length}
                </span>
              )}
            </button>
          </div>

          {activeUtilityTab === "tools" ? (
            <div className="space-y-4">
              {/* Box 1: Buzzi Retro Customizer Tool */}
              <div className="bg-white border border-[#abc4df] rounded-xl shadow-sm text-left overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#1d5c8a]"></div>
                
                {/* Collapsible Header */}
                <div 
                  onClick={() => {
                    setIsNaamVersierderExpanded(!isNaamVersierderExpanded);
                    hiveAudio.playHoneyPop();
                  }}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 select-none pb-3"
                >
                  <h3 className="font-sans font-extrabold text-[#1d5c8a] text-sm flex items-center gap-1.5 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-sky-500 animate-spin" />
                    <span>Buzzi Naam Versierder</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {!isNaamVersierderExpanded && generatedName && (
                      <span className="text-[8px] bg-sky-200 text-[#1d5c8a] font-bold px-1 rounded truncate max-w-[80px]">
                        Nieuw
                      </span>
                    )}
                    <span className="text-slate-400 font-mono text-xs font-bold">
                      {isNaamVersierderExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {isNaamVersierderExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 animate-fade-in space-y-3">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Verander je statusnaam in een flitsende Buzzi-naam vol met glitters en vette retrotekens!
                    </p>

                    <button
                      onClick={generateRetroName}
                      className="w-full bg-gradient-to-r from-[#2c77b0] to-[#1e5881] hover:from-[#3a8bca] hover:to-[#22679a] text-white text-xs font-bold py-2 rounded-lg shadow-sm border border-sky-900 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Genereer vette Buzzi Naam!</span>
                    </button>

                    {generatedName && (
                      <div className="bg-slate-50 p-2.5 rounded border border-dashed border-[#abc4df] text-center">
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
                )}
              </div>

              {/* Box 3: Contacten Uitnodigen */}
              <div className="bg-gradient-to-b from-white to-[#f4faf0] border border-[#abc4df] rounded-xl shadow-sm text-left overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#8cc63f]"></div>
                
                {/* Collapsible Header */}
                <div 
                  onClick={() => {
                    setIsInviteExpanded(!isInviteExpanded);
                    hiveAudio.playHoneyPop();
                  }}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:brightness-95/80 bg-gradient-to-b from-emerald-50 to-[#edf7e7] select-none pb-3"
                >
                  <h3 className="font-sans font-extrabold text-[#235817] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Share2 className="w-4 h-4 text-[#8cc63f]" />
                    <span>Contacten Uitnodigen 💬</span>
                  </h3>
                  <span className="text-slate-500 font-mono text-xs font-bold">
                    {isInviteExpanded ? "▲" : "▼"}
                  </span>
                </div>

                {isInviteExpanded && (
                  <div className="px-4 pb-4 pt-3 border-t border-[#abc4df]/40 bg-white/70 animate-fade-in space-y-3">
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      Deel deze retrograde Buzzi Messenger met je vrienden of klasgenoten om direct live samen te kletsen via WhatsApp of Facebook!
                    </p>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wide block">Jouw unieke uitnodigingslink:</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            readOnly
                            value={`https://www.buzzimessenger.nl/?invitedBy=${encodeURIComponent(userDisplayName)}`}
                            className="flex-1 text-[10px] bg-white border border-[#abc4df] rounded px-2 py-1.5 text-slate-700 select-all font-mono font-medium truncate"
                          />
                          <button
                            onClick={handleCopyInviteLink}
                            className="bg-[#2C629E] hover:bg-[#1f4a7c] text-white text-[10.5px] px-2.5 py-1.5 rounded font-black flex items-center gap-1 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                          >
                            <Link className="w-3.5 h-3.5" />
                            <span>{copyLinkStatus ? "Gekopieerd! ✓" : "Kopieer 🔗"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `Heey! Kom gezellig met mij chatten op Buzzi Messenger! 💬 Mijn schermnaam is: ${userDisplayName}. Klik op deze link om direct verbinding te maken: https://www.buzzimessenger.nl/?invitedBy=${encodeURIComponent(userDisplayName)}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => hiveAudio.playNotification()}
                          className="bg-[#25D366] hover:bg-[#20ba59] text-white text-[10.5px] py-1.5 rounded-lg font-black border-2 border-[#1ca34e] flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer text-center"
                        >
                          <Send className="w-3.5 h-3.5 fill-current" />
                          <span>WhatsApp 🟢</span>
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                            `https://www.buzzimessenger.nl/?invitedBy=${encodeURIComponent(userDisplayName)}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => hiveAudio.playNotification()}
                          className="bg-[#1877F2] hover:bg-[#1465cf] text-white text-[10.5px] py-1.5 rounded-lg font-black border-2 border-[#0e5bc5] flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer text-center"
                        >
                          <span>👥 Facebook 🔵</span>
                        </a>
                      </div>

                      <a
                        href={`mailto:?subject=${encodeURIComponent("Kom chatten op Buzzi Messenger! 💬")}&body=${encodeURIComponent(
                          `Hoi!\n\nKom gezellig met mij chatten op Buzzi Messenger, de leukste retro chatroom van nu!\n\nMijn gebruikersnaam is: ${userDisplayName}\n\nKlik op de link om direct verbinding te maken:\nhttps://www.buzzimessenger.nl/?invitedBy=${encodeURIComponent(userDisplayName)}\n\nGroetjes!`
                        )}`}
                        onClick={() => hiveAudio.playNotification()}
                        className="w-full bg-[#f0f4f9] hover:bg-sky-50 text-sky-850 text-[10.5px] py-1.5 rounded border border-[#BAD0E3] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>✉️ Uitnodigen via E-mail</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Box 3.6: Retro Geluidsschema's (Sound Schemes) */}
              <div className="bg-gradient-to-b from-white to-[#fdf9f2] border border-[#abc4df] rounded-xl shadow-sm text-left overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
                
                {/* Collapsible Header */}
                <div 
                  onClick={() => {
                    setIsSoundSchemeExpanded(!isSoundSchemeExpanded);
                    hiveAudio.playHoneyPop();
                  }}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:brightness-95/85 bg-gradient-to-b from-amber-50 to-[#fcf0dc] select-none pb-3"
                >
                  <h3 className="font-sans font-extrabold text-[#7c5011] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <Volume2 className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>Retro Geluidsschema's 🎵</span>
                  </h3>
                  <span className="text-slate-500 font-mono text-xs font-bold">
                    {isSoundSchemeExpanded ? "▲" : "▼"}
                  </span>
                </div>

                {isSoundSchemeExpanded && (
                  <div className="px-4 pb-4 pt-3 border-t border-[#abc4df]/40 bg-white/70 animate-fade-in space-y-4">
                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                      Kies jouw favoriete retro geluidsstijl voor chatberichten, nudge-trillingen en inloggeluiden:
                    </p>

                    {/* Options List */}
                    <div className="space-y-2">
                      {[
                        { id: "default", name: "🐝 Buzzi Origineel", desc: "Polyfone alarmbellen en retro trillingen op je pc" },
                        { id: "classic_messenger", name: "💬 Klassieke Retro Messenger", desc: "De bekende 'tu-dut' chat-tune, sign-in harp en nudge alarm" },
                        { id: "retro_synth", name: "👾 Retro 8-Bit / Synth", desc: "Coole space geluidseffecten en arcade synth-sweeps" },
                        { id: "mute", name: "🔇 Dempen / Geen geluid", desc: "Helemaal stil, ideaal tijdens lessen of op werk!" }
                      ].map((scheme) => (
                        <label 
                          key={scheme.id}
                          className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer select-none transition-colors ${
                            soundScheme === scheme.id 
                              ? "bg-amber-500/10 border-amber-500/70" 
                              : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/60"
                          }`}
                        >
                          <input 
                            type="radio"
                            name="soundSchemeOption"
                            value={scheme.id}
                            checked={soundScheme === scheme.id}
                            onChange={() => handleUpdateSoundScheme(scheme.id)}
                            className="mt-1 h-3.5 w-3.5 text-amber-500 focus:ring-amber-500 cursor-pointer"
                          />
                          <div className="space-y-0.5 pointer-events-none">
                            <span className="text-[11px] font-black text-slate-800 tracking-tight leading-none block">
                              {scheme.name}
                            </span>
                            <span className="text-[9px] text-slate-500 block leading-tight font-medium font-sans">
                              {scheme.desc}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Preview Tests (Only show if not muted) */}
                    {soundScheme !== "mute" && (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                        <div className="text-[8.5px] font-black text-[#7c5011] uppercase tracking-wider">
                          🔊 Luister en test geluiden direct:
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => hiveAudio.playNotification()}
                            className="bg-white hover:bg-[#e4ecf7] border border-slate-300 rounded py-1 px-1.5 text-[9px] font-black text-slate-700 flex items-center justify-center gap-0.5 shadow-xs transition-colors active:scale-95 cursor-pointer truncate"
                            title="Test Bericht Chime"
                          >
                            <span>🔔 Chime</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => hiveAudio.playNudge()}
                            className="bg-white hover:bg-[#e4ecf7] border border-slate-300 rounded py-1 px-1.5 text-[9px] font-black text-slate-700 flex items-center justify-center gap-0.5 shadow-xs transition-colors active:scale-95 cursor-pointer truncate"
                            title="Test Nudge Vibration"
                          >
                            <span>📳 Nudge</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => hiveAudio.playLogin()}
                            className="bg-white hover:bg-[#e4ecf7] border border-slate-300 rounded py-1 px-1.5 text-[9px] font-black text-slate-700 flex items-center justify-center gap-0.5 shadow-xs transition-colors active:scale-95 cursor-pointer truncate"
                            title="Test Sign-in Harp"
                          >
                            <span>🚪 Sign-In</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="text-[8.5px] text-slate-400 font-mono text-center pt-0.5 border-t border-dashed">
                      Schema's direct gesynchroniseerd met lokaal backup-geheugen 💾
                    </div>
                  </div>
                )}
              </div>

              {/* Classic Games Box */}
              <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-xl p-4 shadow-md relative">
                <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                  <span className="font-mono text-[9px] text-[#8cc63f] tracking-widest font-bold">BUZZI_GAMES_ONLINE</span>
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                </div>
                
                <div className="mt-3 space-y-2.5">
                  <p className="text-[10.5px] italic text-slate-300 leading-normal">
                    &ldquo;Wil je een nostalgisch potje retro Mijnenveger of andere games spelen? Klik hieronder om direct een spel te starten!&rdquo;
                  </p>
                  <button
                    onClick={() => {
                      hiveAudio.playNotification();
                      setIsMinesweeperOpen(true);
                    }}
                    className="w-full bg-[#8cc63f] hover:bg-[#a6d854] text-stone-950 text-xs font-black py-2 rounded-xl shadow border-2 border-[#5c8229] cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Play className="w-3 h-3 fill-stone-950" />
                    <span>Spel spelen ! 🎮</span>
                  </button>
                </div>
              </div>

              {/* Universal Language Translation Panel */}
              <div className="bg-white border border-[#abc4df] rounded-xl shadow-sm text-left overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500"></div>
                
                <div className="p-3 bg-gradient-to-b from-teal-50 to-[#e9f7f5] pb-2 border-b border-teal-100 flex items-center justify-between">
                  <h3 className="font-sans font-extrabold text-[#115b51] text-[11px] flex items-center gap-1.5 uppercase tracking-wide">
                    <span>🌍 {t("Taal selecteren")}</span>
                  </h3>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-bold font-mono">
                    {siteLanguage}
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  <p className="text-[10px] text-slate-500 leading-normal font-bold">
                    {siteLanguage === "NL" 
                      ? "Verander de taal van de hele Buzzi Messenger website:" 
                      : siteLanguage === "DE"
                      ? "Ändere die Sprache der gesamten Buzzi Messenger-Website:"
                      : siteLanguage === "FR"
                      ? "Changer la langue de l'ensemble du site Web de Buzzi Messenger :"
                      : siteLanguage === "ES"
                      ? "Cambia el idioma de todo el sitio web de Buzzi Messenger:"
                      : siteLanguage === "IT"
                      ? "Cambia la lingua di tutto il sito web di Buzzi Messenger:"
                      : "Change the language of the entire Buzzi Messenger website:"}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { code: "NL", label: "Nederlands 🇳🇱" },
                      { code: "EN", label: "English 🇬🇧" },
                      { code: "DE", label: "Deutsch 🇩🇪" },
                      { code: "FR", label: "Français 🇫🇷" },
                      { code: "ES", label: "Español 🇪🇸" },
                      { code: "IT", label: "Italiano 🇮🇹" }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSiteLanguage(lang.code);
                          localStorage.setItem("buzzi_language", lang.code);
                          hiveAudio.playHoneyPop();
                          
                          setBuzziToast({
                            show: true,
                            title: lang.code === "NL" ? "Taal Gewijzigd!" : "Language Changed!",
                            message: lang.code === "NL" 
                              ? `De hele website is nu ingesteld op het Nederlands!` 
                              : `The entire website is now translated to ${lang.label}!`,
                            avatar: "🌍"
                          });
                        }}
                        className={`px-1.5 py-1 rounded-lg border text-[10px] font-bold text-left transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                          siteLanguage === lang.code
                            ? "bg-teal-500/10 border-teal-500 text-teal-950 font-black"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <span className="truncate">{lang.label}</span>
                        {siteLanguage === lang.code && (
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Bug Reporting panel */
            <div className="space-y-4 font-sans text-xs">
              {/* Beheerders Controlepaneel Block */}
              {((currentUser?.email || "").split("#pwd_")[0].trim().toLowerCase() === "prinsrobbin@gmail.com" || 
                userDisplayName?.toLowerCase().includes("robbin") ||
                userDisplayName?.toLowerCase().includes("admin") ||
                userDisplayName?.toLowerCase().includes("operator")) && (
                <div className="bg-[#FFFFED] border border-[#DE9E1F] rounded-xl p-4 shadow-sm text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#DE9E1F]"></div>
                  
                  <h3 className="font-sans font-black text-[#855B04] text-[11px] flex items-center gap-1.5 pt-1 uppercase tracking-wide">
                    <span>👑 OPERATOR CONTROLEPANEEL</span>
                  </h3>
                  
                  <p className="text-[10px] text-slate-600 mt-1.5 leading-relaxed font-semibold">
                    Welkom Beheerder! Wijzig instellingen of broadcasting live op Buzzi Buzzi!
                  </p>

                  <div className="mt-3.5 space-y-3 pt-2.5 border-t border-amber-200">
                    {/* Systeembericht Broadcast */}
                    <div className="flex flex-col gap-1">
                      <div className="text-[9px] font-black text-[#855B04] uppercase tracking-wider text-left">📢 Systeembericht Uitzenden</div>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          id="admin_broadcast_input"
                          placeholder="Bijv: Welkom op Buzzi Chat!..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const btn = document.getElementById("send_admin_broadcast") as HTMLButtonElement;
                              if (btn) btn.click();
                            }
                          }}
                          className="flex-1 bg-white border border-[#abc4df] rounded px-2 py-1 text-[11px] text-slate-800 focus:outline-none"
                        />
                        <button
                          id="send_admin_broadcast"
                          onClick={async () => {
                            const inputEl = document.getElementById("admin_broadcast_input") as HTMLInputElement;
                            if (inputEl && inputEl.value.trim()) {
                              const alertMsg = inputEl.value.trim();
                              
                              // Trigger a simulated system announcement!
                              await handleSendMessage(`📢 SYSTEM ALERT: ${alertMsg}`, false, false);
                              
                              // Play sweet notification sound!
                              hiveAudio.playNotification();
                              
                              // Show soft confirmation toast
                              setBuzziToast({
                                show: true,
                                title: "Omroep Voltooid! 🚀",
                                message: `Je systeembericht "${alertMsg}" is uitgezonden op Buzzi!`,
                                avatar: "👑"
                              });
                              inputEl.value = "";
                            }
                          }}
                          className="bg-[#2C629E] hover:bg-[#1f4a7c] text-white text-[10px] px-2.5 rounded font-black cursor-pointer active:scale-95 transition-all text-center"
                        >
                          Zend
                        </button>
                      </div>
                    </div>

                    {/* Geregistreerde Leden Quick View */}
                    <div className="bg-white/90 border border-amber-200 rounded p-2 text-[10px] text-slate-700 space-y-1.5 shadow-2xs">
                      <div className="font-extrabold text-[#855B04] uppercase tracking-wider flex items-center justify-between">
                        <span>👥 Geregistreerde Leden ({registeredUsers.length + 1})</span>
                      </div>
                      <div className="max-h-[90px] overflow-y-auto space-y-1.5 custom-scrollbar font-mono text-[9px] text-slate-600">
                        <div className="flex items-center justify-between py-0.5 border-b border-rose-50/60 bg-yellow-50/50">
                          <span className="truncate pr-1">👑 [Beheerder] {userDisplayName}</span>
                          <span className="shrink-0 text-[8.5px] font-bold text-amber-700 bg-amber-100 px-1 rounded">Admin</span>
                        </div>
                        {registeredUsers.map((u: any) => (
                          <div key={u.id} className="flex items-center justify-between py-0.5 border-b border-slate-100">
                            <span className="truncate pr-1" title={u.email}>{u.name || "Gast"} ({u.email ? u.email.split("@")[0] : "Gast"})</span>
                            <span className={`shrink-0 text-[8px] font-bold px-1 rounded ${
                              u.status === "online" ? "text-green-700 bg-green-50" : u.status === "bezet" ? "text-red-700 bg-red-50" : "text-slate-400 bg-slate-50"
                            }`}>
                              {u.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Multi-action quick bar */}
                    <button
                      onClick={async () => {
                        const conf = window.confirm("Weet je zeker dat je alle lokaal opgeslagen bugs wilt leegmaken?");
                        if (conf) {
                          try {
                            localStorage.removeItem("buzzi_local_bugs");
                            hiveAudio.playHoneyPop();
                            // Delete all bugs
                            for (const bug of bugsList) {
                              await fetch(`/api/bugs/${bug.id}`, { method: "DELETE" });
                            }
                            setBugsList([]);
                            setBuzziToast({
                              show: true,
                              title: "Bugs Gewist! 🧹",
                              message: "Alle lokaal en server opgeslagen bugs zijn succesvol leeggemaakt.",
                              avatar: "🧹"
                            });
                          } catch (e) {}
                        }
                      }}
                      className="w-full bg-[#FFFDF0] hover:bg-rose-50 border border-amber-300 text-rose-700 font-extrabold text-[9.5px] py-1.5 rounded active:scale-95 transition-all text-center cursor-pointer"
                    >
                      🧹 Bulk Wis Alle Foutmeldingen
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white border border-[#abc4df] rounded-xl p-4 shadow-sm text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#e43a3a]"></div>

                <h3 className="font-sans font-black text-[#e43a3a] text-xs flex items-center gap-1 pt-1 uppercase tracking-wide">
                  <span>🐞</span>
                  <span>Buzzi Bug Reporter</span>
                </h3>

                <p className="text-[11px] text-slate-500 mt-1.5 leading-normal">
                  Werkt er iets niet (bijv. een radiozender)? Meld het direct! Robbin zal hier melding van krijgen op zijn beeldscherm.
                </p>

                {bugSuccess ? (
                  <div className="mt-3.5 bg-emerald-50 border border-emerald-300 rounded p-3 text-center text-emerald-950 font-black text-[11px] animate-bounce">
                    🎉 Melding verstuurd naar Robbin! Bedankt voor de hulp!
                  </div>
                ) : (
                  <form onSubmit={handleSendBugReport} className="mt-3.5 space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9.5px] font-black text-[#1C427F] uppercase tracking-wider block text-left"> Wat werkt er niet? </label>
                      <input
                        type="text"
                        required
                        placeholder="bijv: Kink radiozender heeft buffering"
                        value={bugTitle}
                        onChange={(e) => setBugTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] font-bold select-text text-left"
                      />
                    </div>

                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-[9.5px] font-black text-[#1C427F] uppercase tracking-wider block text-left font-sans"> Categorie </label>
                      <select
                        value={bugCategory}
                        onChange={(e) => setBugCategory(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-[#B9CEDF] rounded font-bold text-slate-700 text-xs focus:outline-none hover:bg-slate-50 cursor-pointer"
                      >
                        <option value="Radio">📻 Radiozenders & Muziek</option>
                        <option value="Chat">💬 Chat en Groepen</option>
                        <option value="Profiel">👤 Profiel of Avatar</option>
                        <option value="Minesweeper">💣 Games of Mijnenveger</option>
                        <option value="Anders">🌀 Anders / Algemeen</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9.5px] font-black text-[#1C427F] uppercase tracking-wider block text-left"> Leg het kort uit </label>
                      <textarea
                        required
                        placeholder="Wat gaat er precies mis?..."
                        value={bugDescription}
                        onChange={(e) => setBugDescription(e.target.value)}
                        rows={3}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] select-text resize-none text-left font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingBug}
                      className="w-full bg-gradient-to-r from-red-600 via-rose-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white text-xs font-black py-2 rounded-lg border border-red-950 active:scale-95 transition-all text-center flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <span>Meld Bug 🐞</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Bug List Feed Box */}
              <div className="bg-white border border-[#abc4df] rounded-xl p-4 shadow-sm text-left relative overflow-hidden">
                <div className="font-sans font-black text-[#1C427F] text-xs uppercase tracking-wide border-b border-slate-100 pb-1.5 flex items-center justify-between">
                  <span>Meldingen overzicht ({bugsList.length})</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                </div>

                <div className="mt-2.5 space-y-2 max-h-[290px] overflow-y-auto custom-scrollbar">
                  {bugsList.length === 0 ? (
                    <div className="text-[10.5px] text-slate-400 italic py-4 text-center">
                      Helemaal gratis van bugs! Geen fouten gemeld. 🥇
                    </div>
                  ) : (
                    bugsList.map((bug: any, idx: number) => {
                      let catEmoji = "🌀";
                      if (bug.category === "Radio") catEmoji = "📻";
                      if (bug.category === "Chat") catEmoji = "💬";
                      if (bug.category === "Profiel") catEmoji = "👤";
                      if (bug.category === "Minesweeper") catEmoji = "💣";

                      const cleanEmail = (currentUser?.email || "").split("#pwd_")[0].trim().toLowerCase();
                      const isAdmin = cleanEmail === "prinsrobbin@gmail.com" || 
                                      userDisplayName.toLowerCase().includes("robbin");

                      return (
                        <div key={bug.id || idx} className="p-2 bg-[#fdfdfd] border border-slate-200 rounded text-left shadow-xs">
                          <div className="flex items-start gap-1">
                            <span className="text-xs shrink-0">{catEmoji}</span>
                            <div className="flex-1 min-w-0 pr-1">
                              <span className="text-[11px] font-black text-slate-800 block truncate">
                                {bug.title}
                              </span>
                              <span className="text-[8px] font-black bg-rose-50 border border-rose-200 text-rose-600 rounded px-1 py-0.2 select-none inline-block mt-0.5 uppercase tracking-wide leading-none">
                                Under review
                              </span>
                              <p className="text-[10px] text-slate-600 leading-normal mt-1 whitespace-pre-wrap select-text selection:bg-rose-100">
                                {bug.description}
                              </p>
                              <div className="mt-1.5 border-t border-slate-100 pt-1 flex items-center justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wide">
                                <span>Door: <span className="text-slate-600 font-black">{bug.senderName || bug.reporter}</span></span>
                                <div className="flex items-center gap-1.5">
                                  {isAdmin && (
                                    <button
                                      onClick={() => handleDeleteBug(bug.id)}
                                      className="text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer lowercase flex items-center gap-0.5"
                                      title="Verwijder deze bugmelding"
                                    >
                                      🗑️ verwijderen
                                    </button>
                                  )}
                                  <span>{bug.timestamp ? new Date(bug.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "live"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Nostalgic status/disclaimers */}
        <div className="pt-4 border-t border-[#abc4df]/60 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
            <span>BUZZI PROTOCOL: LIVE</span>
            <span className="text-emerald-500 font-bold animate-ping">&#9679;</span>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Navigation Bar for Mobile viewports */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-[#1d6fa5] border-t border-[#0f4f7d] flex items-center justify-around md:hidden z-40 px-2 shadow-lg select-none">
        <button
          type="button"
          onClick={() => {
            setMobileActiveTab("sidebar");
            hiveAudio.playHoneyPop();
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all h-full ${
            mobileActiveTab === "sidebar" ? "bg-white/10 text-white font-extrabold" : "text-sky-100/70 hover:text-white"
          }`}
        >
          <span className="text-base text-white">👥</span>
          <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Vrienden</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMobileActiveTab("chat");
            hiveAudio.playHoneyPop();
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all h-full relative ${
            mobileActiveTab === "chat" ? "bg-white/10 text-white font-extrabold" : "text-sky-100/70 hover:text-white"
          }`}
        >
          <span className="text-base text-white">💬</span>
          <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Gesprek</span>
          <span className="absolute top-2.5 right-6 w-2 h-2 rounded-full bg-emerald-400 pointer-events-none" />
        </button>

        <button
          type="button"
          onClick={() => {
            setMobileActiveTab("tools");
            hiveAudio.playHoneyPop();
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all h-full ${
            mobileActiveTab === "tools" ? "bg-white/10 text-white font-extrabold" : "text-sky-100/70 hover:text-white"
          }`}
        >
          <span className="text-base text-white">✨</span>
          <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Extra's</span>
        </button>
      </div>

      {isMinesweeperOpen && (
        <Minesweeper onClose={() => setIsMinesweeperOpen(false)} siteLanguage={siteLanguage} />
      )}

      {/* Classic Windows XP Style Bubble Notice Toast */}
      {buzziToast && buzziToast.show && (
        <div className="fixed bottom-16 right-4 md:bottom-6 md:right-6 z-[9999] bg-gradient-to-b from-[#FFFDF0] via-[#FFFFED] to-[#FFEAA1] border border-[#DE9E1F] rounded-xl shadow-2xl p-2.5 md:p-4 max-w-[260px] sm:max-w-[300px] md:max-w-[325px] flex items-start gap-2 md:gap-3 border-l-[4px] md:border-l-[6px] border-l-[#EAA406] animate-bounce select-none">
          {buzziToast.avatar && (
            <div className="text-xl md:text-3xl shrink-0 select-none">{buzziToast.avatar}</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[9.5px] md:text-[10.5px] font-black text-[#855B04] uppercase tracking-wider mb-0.5 flex items-center justify-between gap-2">
              <span className="truncate">{buzziToast.title}</span>
              <button 
                onClick={() => setBuzziToast(null)}
                className="hover:text-red-600 font-extrabold text-[11px] md:text-[12px] px-1 md:px-1.5 py-0.5 cursor-pointer leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-[10px] md:text-[11px] font-bold text-slate-700 leading-normal text-left">{buzziToast.message}</p>
          </div>
        </div>
      )}

      {/* Authentic MSN Messenger Toaster notification */}
      {msnToast && msnToast.show && (
        <div 
          className="fixed bottom-16 right-4 md:bottom-6 md:right-6 z-[99999] w-[275px] sm:w-[310px] bg-[#fdfdfd] border-2 border-[#1253a4] rounded-lg shadow-2xl overflow-hidden font-sans select-none animate-slide-up"
          style={{
            background: "linear-gradient(to bottom, #f0f7fe 0%, #d3e5f7 15%, #ecf4fd 100%)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)"
          }}
        >
          {/* Top header strip characteristic of MSN notifications */}
          <div className="bg-gradient-to-r from-[#1d62b5] to-[#4c92eb] text-white text-[10px] uppercase font-extrabold px-2.5 py-1.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] animate-pulse">🐝</span>
              <span>Buzzi Messenger</span>
            </div>
            <button 
              onClick={() => setMsnToast(prev => prev ? { ...prev, show: false } : null)}
              className="text-sky-100 hover:text-white font-black text-[11px] px-1 hover:bg-white/15 rounded cursor-pointer leading-none"
            >
              ✕
            </button>
          </div>

          <div className="p-3.5 flex items-start gap-3">
            {/* MSN Messenger custom/classic blue circular bubble for avatar status */}
            <div className="relative shrink-0 flex items-center justify-center p-1.5 bg-white border border-[#96b8e2] rounded-full shadow-inner w-12 h-12">
              <span className="text-3xl select-none">{msnToast.avatar}</span>
              {/* Status indicator bubble */}
              <span className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                msnToast.event === "online" ? "bg-emerald-500" : "bg-slate-400"
              }`} />
            </div>

            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11.5px] text-[#2c5384] font-black truncate leading-tight select-all">
                {msnToast.name}
              </p>
              <p className="text-[10.5px] text-slate-700 font-bold mt-1 leading-snug">
                {msnToast.event === "online" 
                  ? "is zojuist online gegaan!" 
                  : "is zojuist offline gegaan."
                }
              </p>
              <p className="text-[9px] text-[#4d6d9c] italic truncate mt-1 max-width-[100%] leading-none">
                {msnToast.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Buzzi Premium VIP Upgrade Modal is removed per user request */}

      <LegalModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} />
    </div>
  </div>
);
}
