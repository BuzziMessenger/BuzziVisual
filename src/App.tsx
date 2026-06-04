/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { Message, Channel, Contact, StatusType } from "./types";
import { hiveAudio } from "./utils/audio";
import { Sparkles, Trophy, Users, RefreshCw, Smile, Compass, AlertTriangle, Play, Database, Wifi, CheckCircle2, Share2, Link, Send } from "lucide-react";
import { LoginScreen } from "./components/LoginScreen";
import { Minesweeper } from "./components/Minesweeper";

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
  const [isTyping, setIsTyping] = useState(false);
  const [isBuzzingFlash, setIsBuzzingFlash] = useState(false);

  // Custom User Profile configuration for Buzzi Clone
  const [userDisplayName, setUserDisplayName] = useState("Robbin (H)");
  const [userPersonalMessage, setUserPersonalMessage] = useState("Lekker chatten op Buzzi met Buzzi Bot! B-)");
  const [userStatus, setUserStatus] = useState<StatusType>("online");
  const [userAvatar, setUserAvatar] = useState("🧑‍🚀");
  const [userListeningTo, setUserListeningTo] = useState("");

  // Account and Database states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<Contact[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [acceptedFriendships, setAcceptedFriendships] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [activeDbMode, setActiveDbMode] = useState<"mongodb" | "local">("local");
  const [isMinesweeperOpen, setIsMinesweeperOpen] = useState(false);

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

  // Copy Link State
  const [copyLinkStatus, setCopyLinkStatus] = useState(false);
  const handleCopyInviteLink = () => {
    const shareDomain = "https://www.buzzimessenger.nl";
    const inviteLink = `${shareDomain}/?invitedBy=${encodeURIComponent(userDisplayName)}&inviteEmail=${encodeURIComponent(currentUser?.email || "")}`;
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
      const acceptedRes = await fetch(`/api/friend-requests?email=${encodeURIComponent(currentUser.email)}&status=accepted&t=${Date.now()}`);
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
        // Only if user profile does not exist do we create and write the initial default profile!
        const initialProfile = {
          uid: user.uid,
          name: defaultName,
          email: user.email || "",
          avatar: "🧑‍🚀",
          status: "online",
          personalMessage: "Lekker chatten op Buzzi met Buzzi Bot! B-)",
          listeningTo: ""
        };
        await fetch("/api/db/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initialProfile)
        });
        
        setUserDisplayName(defaultName);
        setUserPersonalMessage("Lekker chatten op Buzzi met Buzzi Bot! B-)");
        setUserAvatar("🧑‍🚀");
        setUserStatus("online");
        setUserListeningTo("");
      } else {
        // Load existing saved profile details securely!
        setUserDisplayName(currentProfile.name || defaultName);
        setUserPersonalMessage(currentProfile.personalMessage || "Lekker chatten op Buzzi met Buzzi Bot! B-)");
        setUserAvatar(currentProfile.avatar || "🧑‍🚀");
        setUserStatus((currentProfile.status as StatusType) || "online");
        setUserListeningTo(currentProfile.listeningTo || "");

        // Keep local storage synchronized for persistent seamless log-ins
        if (currentProfile.name) {
          localStorage.setItem("buzzi_remembered_name", currentProfile.name);
          const savedUser = localStorage.getItem("buzzi_user");
          if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser);
              parsed.displayName = currentProfile.name;
              localStorage.setItem("buzzi_user", JSON.stringify(parsed));
            } catch (e) {}
          }
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
          listeningTo: userListeningTo,
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
          const filtered = list
            .filter((data: any) => data.uid !== currentUser.uid)
            .map((data: any) => ({
              id: data.uid,
              name: data.name || "Buzzi Gebruiker",
              email: data.email || "",
              avatar: data.avatar || "🧑‍🚀",
              status: (data.status as StatusType) || "online",
              personalMessage: data.personalMessage || "",
              listeningTo: data.listeningTo || "",
            }));
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
  const currentBuddies = (isDemoUser
    ? [
        ...INITIAL_CONTACTS,
        ...registeredUsers.filter(u => 
          !INITIAL_CONTACTS.some(ic => ic.email === u.email) &&
          u.email !== currentUser?.email &&
          !u.name?.toLowerCase().includes("robbin") &&
          !u.email?.toLowerCase().includes("robbin")
        )
      ]
    : [
        INITIAL_CONTACTS[0], // Keep Buzzi Bot!
        ...registeredUsers.filter(u => {
          if (u.id === "queen" || u.email === "buzzi_bot@live.nl" || u.email === currentUser?.email) return false;
          
          // Check if there is an accepted friendship with this registered user
          const isFriend = acceptedFriendships.some(fr => {
            const cleanU = (u.email || "").trim().toLowerCase();
            const cleanMe = (currentUser?.email || "").trim().toLowerCase();
            const from = (fr.fromEmail || "").trim().toLowerCase();
            const to = (fr.toEmail || "").trim().toLowerCase();
            return (from === cleanMe && to === cleanU) || (from === cleanU && to === cleanMe);
          });
          return isFriend;
        })
      ]).filter(c => !deletedContactIds.includes(c.id));

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
        let listFromSrv = [];
        if (res.ok) {
          listFromSrv = await res.json();
        }
        
        // Merge with client-side localStorage backup to guarantee instantly robust local reporting visibility
        let localSaved: any[] = [];
        try {
          localSaved = JSON.parse(localStorage.getItem("buzzi_local_bugs") || "[]");
        } catch {}
        
        const combined = [...listFromSrv];
        localSaved.forEach((lb: any) => {
          if (!combined.some((sb: any) => sb.id === lb.id)) {
            combined.push(lb);
          }
        });
        
        combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setBugsList(combined);
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
    const intervalId = setInterval(fetchBugs, 12000); // Bugs change rarely, poll every 12s
    return () => clearInterval(intervalId);
  }, [currentUser]);

  // Poll friend requests and accepted friendships in real-time
  useEffect(() => {
    if (!currentUser || !currentUser.email) return;

    const fetchFriendRequestsAndFriendships = async () => {
      try {
        // 1. Pending requests to me (default GET is pending)
        const res = await fetch(`/api/friend-requests?toEmail=${encodeURIComponent(currentUser.email)}&status=pending&t=${Date.now()}`);
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
        const acceptedRes = await fetch(`/api/friend-requests?email=${encodeURIComponent(currentUser.email)}&status=accepted&t=${Date.now()}`);
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
        
        // Also send a reciprocal request back so they see us instantly too!
        await fetch("/api/friend-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromEmail: currentUser?.email || "",
            fromName: userDisplayName,
            toEmail: fromEmail
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

    // Store in localStorage as instant redundant backup
    let localSaved: any[] = [];
    try {
      localSaved = JSON.parse(localStorage.getItem("buzzi_local_bugs") || "[]");
    } catch {}
    localSaved.unshift(newBugItem);
    localStorage.setItem("buzzi_local_bugs", JSON.stringify(localSaved));

    // Instantly update state optimistically
    setBugsList(prev => {
      const updated = [newBugItem, ...prev];
      return updated.filter((item, index, self) => self.findIndex(t => t.id === item.id) === index);
    });

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
          // Merge with local storage
          const combined = [...list];
          localSaved.forEach((lb: any) => {
            if (!combined.some((sb: any) => sb.id === lb.id)) {
              combined.push(lb);
            }
          });
          combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setBugsList(combined);
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
        const combined = [...list];
        localSaved.forEach((lb: any) => {
          if (!combined.some((sb: any) => sb.id === lb.id)) {
            combined.push(lb);
          }
        });
        combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setBugsList(combined);
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
      handleUpdateDisplayName(generatedName);
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
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div 
      className={`flex h-screen w-screen overflow-hidden bg-slate-100 relative transition-transform duration-100 pb-14 md:pb-0 ${
        isBuzzingFlash ? "bg-red-50 animate-pulse scale-[0.99]" : ""
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
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          onBuzzIncoming={handleBuzzIncoming}
          myDisplayName={userDisplayName}
          myAvatar={userAvatar}
          myUserId={currentUser.uid}
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

              {/* Box 2: Wie heeft mij geblokkeerd? */}
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
                        className="text-[10px] font-medium bg-[#f0f4f9] hover:bg-sky-100 border border-slate-200 px-2 py-1.5 rounded truncate text-slate-700 active:scale-95 cursor-pointer transition-all disabled:opacity-50 text-left"
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

              {/* Box 3: Contacten Uitnodigen */}
              <div className="bg-gradient-to-b from-emerald-50 to-[#edf7e7] border border-[#abc4df] rounded-xl p-4 shadow-sm text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#8cc63f]"></div>
                
                <h3 className="font-sans font-extrabold text-[#235817] text-xs flex items-center gap-1.5 pt-1 uppercase tracking-wider">
                  <Share2 className="w-4 h-4 text-[#8cc63f]" />
                  <span>Contacten Uitnodigen 💬</span>
                </h3>
                
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  Deel deze retrograde Buzzi Messenger met je vrienden of klasgenoten om direct live samen te kletsen via WhatsApp of Facebook!
                </p>

                <div className="mt-4 space-y-3">
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
                      className="bg-[#25D366] hover:bg-[#20ba59] text-white text-[10.5px] py-2 rounded-lg font-black border-2 border-[#1ca34e] flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer text-center"
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
                      className="bg-[#1877F2] hover:bg-[#1465cf] text-white text-[10.5px] py-2 rounded-lg font-black border-2 border-[#0e5bc5] flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer text-center"
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

              {/* Classic Games Box */}
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
                      hiveAudio.playNotification();
                      setIsMinesweeperOpen(true);
                    }}
                    className="w-full bg-[#8cc63f] hover:bg-[#a6d854] text-stone-950 text-xs font-black py-2 rounded-xl shadow border-2 border-[#5c8229] cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Play className="w-3 h-3 fill-stone-950" />
                    <span>Mijnenveger Spelen ! 💣</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Bug Reporting panel */
            <div className="space-y-4 font-sans text-xs">
              {/* Beheerders Controlepaneel Block */}
              {(currentUser?.email?.toLowerCase() === "prinsrobbin@gmail.com" || 
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

                      const isAdmin = currentUser?.email?.toLowerCase() === "prinsrobbin@gmail.com" || 
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
        <Minesweeper onClose={() => setIsMinesweeperOpen(false)} />
      )}

      {/* Classic MSN / Windows XP Bubble Notice Toast */}
      {buzziToast && buzziToast.show && (
        <div className="fixed bottom-16 right-4 md:bottom-6 md:right-6 z-[9999] bg-gradient-to-b from-[#FFFDF0] via-[#FFFFED] to-[#FFEAA1] border border-[#DE9E1F] rounded-xl shadow-2xl p-4 max-w-[325px] flex items-start gap-3 border-l-[6px] border-l-[#EAA406] animate-bounce select-none">
          {buzziToast.avatar && (
            <div className="text-3xl shrink-0 select-none">{buzziToast.avatar}</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[10.5px] font-black text-[#855B04] uppercase tracking-wider mb-0.5 flex items-center justify-between">
              <span>{buzziToast.title}</span>
              <button 
                onClick={() => setBuzziToast(null)}
                className="hover:text-red-600 font-extrabold text-[12px] px-1.5 py-0.5 cursor-pointer leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] font-bold text-slate-700 leading-normal text-left">{buzziToast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
