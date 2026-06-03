/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
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
      text: "🤖 *PING!* W00t! Welkom op mijn Buzzi Messenger-kanaal! Ik ben aangedreven door Buzzi AI Niches en spreek vloeiend 2004 Buzzi Messenger-slang! Vraag me over inbelverbindingen, retro-muziek of stuur me een 'Nudge' (duwtje) met de rode knop! :-D",
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
    "🤘 Ssst! Mijn moeder mag niet horen dat ik nog op de computer zit, she denkt dat ik allang slaap haha!"
  ],
  "danny": [
    "🎮 Bzzz... Ik probeer nu stiekem te skaten in de woonkamer maar mn vader is woest lmao! (H)",
    "🎮 Vet cool! Gaan we morgen mss een zak snoep halen bij de Jamin?",
    "🎮 brb, mn broertje wil ook op de pc dus we moeten dadelijk afwisselen... grrrr!"
  ]
};

const NICKNAME_PREFIXES = ["★ ~ ", "xX__", "✿ *~ ", "o0o_"];
const NICKNAME_SUFFIXES = [" ~ ★", "__Xx", " ~* ✿ (L)", "_o0o"];

export default function App() {
  const [activeId, setActiveId] = useState<string>("queen");
  const [activeType, setActiveType] = useState<"channel" | "dm">("dm");
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [mobileActiveTab, setMobileActiveTab] = useState<"sidebar" | "chat" | "tools">("sidebar");
  
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [isBuzzingFlash, setIsBuzzingFlash] = useState(false);

  const [userDisplayName, setUserDisplayName] = useState("Robbin (H)");
  const [userPersonalMessage, setUserPersonalMessage] = useState("Lekker chatten op Buzzi met Buzzi Bot! B-)");
  const [userStatus, setUserStatus] = useState<StatusType>("online");
  const [userAvatar, setUserAvatar] = useState("🧑‍🚀");
  const [userListeningTo, setUserListeningTo] = useState("");

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<Contact[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [acceptedFriendships, setAcceptedFriendships] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [activeDbMode, setActiveDbMode] = useState<"local" | "mongodb">("mongodb");

  useEffect(() => {
    async function forceMongoConnect() {
      try {
        const res = await fetch("/api/db/status");
        if (res.status === 200) {
          const d = await res.json();
          if (d.connected) {
            setActiveDbMode("mongodb");
            console.log("Succesvol verbonden met MongoDB Cloud! (Y)");
          }
        }
      } catch (e) {
        console.warn("Render server reageert nog niet, we blijven proberen...", e);
      }
    }
    forceMongoConnect();
  }, []);

  const [isMinesweeperOpen, setIsMinesweeperOpen] = useState(false);
  const [generatedName, setGeneratedName] = useState("");
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [checkedContact, setCheckedContact] = useState("");
  const [checking, setChecking] = useState(false);

  const [activeUtilityTab, setActiveUtilityTab] = useState<"tools" | "bugs">("tools");
  const [bugsList, setBugsList] = useState<any[]>([]);
  const [bugTitle, setBugTitle] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [bugCategory, setBugCategory] = useState("Radio");
  const [bugSuccess, setBugSuccess] = useState(false);
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);

  const [buzziToast, setBuzziToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    avatar?: string;
  } | null>(null);

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
      try {
        const res = await fetch("/api/db/users?t=" + Date.now());
        if (res.status === 200) {
          const allUsers = await res.json();
          const targetCleanName = emailOrUsername.trim().toLowerCase();
          
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
      targetEmail = emailOrUsername.trim().toLowerCase();
      targetName = name.trim();

      if (targetEmail === myCleanEmail) {
        return { success: false, reason: "SELF_ADD" };
      }
    }

    const cleanTargetEmail = targetEmail.trim().toLowerCase();
    if (cleanTargetEmail === myCleanEmail) {
      return { success: false, reason: "SELF_ADD" };
    }

    try {
      // De eenmalige fetch logic voor invite afhandeling
      await fetch("/api/friend-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromEmail: myCleanEmail,
          fromName: userDisplayName,
          toEmail: cleanTargetEmail
        })
      });

      hiveAudio.playNotification();

      setBuzziToast({
        show: true,
        title: "Verzoek Verstuurd! ✉️",
        message: `Er is een vriendenverzoek verstuurd naar ${cleanTargetEmail}. Zodra zij dit accepteren, staan jullie in elkaars lijst!`,
        avatar: "🧑‍🚀"
      });

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

  const initUserProfile = async (user: any, preferredName?: string) => {
    const defaultName = preferredName || user.displayName || user.email?.split("@")[0] || "Buzzi Gebruiker";

    try {
      const localName = localStorage.getItem("buzzi_remembered_name");
      const localAvatar = localStorage.getItem("buzzi_remembered_avatar");
      if (localName) setUserDisplayName(localName);
      if (localAvatar) setUserAvatar(localAvatar);

      const res = await fetch("/api/db/users?t=" + Date.now());
      let currentProfile = null;
      if (res.status === 200) {
        const list = await res.json();
        currentProfile = list.find((u: any) => u.uid === user.uid);
      }

      if (!currentProfile) {
        const initialProfile = {
          uid: user.uid,
          name: localName || defaultName,
          email: user.email || "",
          avatar: localAvatar || "🧑‍🚀",
          status: "online",
          personalMessage: "Lekker chatten op Buzzi met Buzzi Bot! B-)",
          listeningTo: ""
        };
        await fetch("/api/db/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initialProfile)
        });
        
        setUserDisplayName(initialProfile.name);
        setUserAvatar(initialProfile.avatar);
      } else {
        const finalName = currentProfile.name || localName || defaultName;
        const finalAvatar = currentProfile.avatar || localAvatar || "🧑‍🚀";

        setUserDisplayName(finalName);
        setUserAvatar(finalAvatar);
        setUserPersonalMessage(currentProfile.personalMessage || "Lekker chatten op Buzzi met Buzzi Bot! B-)");
        setUserStatus((currentProfile.status as StatusType) || "online");
        setUserListeningTo(currentProfile.listeningTo || "");

        localStorage.setItem("buzzi_remembered_name", finalName);
        localStorage.setItem("buzzi_remembered_avatar", finalAvatar);
      }
    } catch (err) {
      console.warn("User profile init failed, falling back to state:", err);
      setUserDisplayName(defaultName);
    }
  };

  const updateProfileInDatabase = async (fields: Partial<any>) => {
    if (!currentUser) return;

    try {
      const updatedProfile = {
        uid: currentUser.uid,
        name: fields.name !== undefined ? fields.name : userDisplayName,
        email: currentUser.email || "",
        avatar: fields.avatar !== undefined ? fields.avatar : userAvatar,
        status: fields.status !== undefined ? fields.status : userStatus,
        personalMessage: fields.personalMessage !== undefined ? fields.personalMessage : userPersonalMessage,
        listeningTo: fields.listeningTo !== undefined ? fields.listeningTo : userListeningTo,
        ...fields
      };

      if (fields.name) localStorage.setItem("buzzi_remembered_name", fields.name);
      if (fields.avatar) localStorage.setItem("buzzi_remembered_avatar", fields.avatar);

      await fetch("/api/db/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile)
      });
    } catch (err) {
      console.warn("Failed to update profile in database:", err);
    }
  };

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

  // Handle URL-based invitations en polling functionaliteiten
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
        try {
          localStorage.setItem("buzzi_pending_invite", JSON.stringify({ invitedBy: invitedByVal, inviteEmail: inviteEmailVal }));
        } catch {}
      }

      if (!inviteEmailVal) return;
      const cleanInviteEmail = inviteEmailVal.trim().toLowerCase();

      const alVriend = currentBuddies.some(buddy => buddy.email?.toLowerCase() === cleanInviteEmail);
      if (alVriend) {
        try {
          localStorage.removeItem("buzzi_pending_invite");
        } catch {}
        return;
      }
      const cleanMyEmail = currentUser.email.split("#pwd_")[0].trim().toLowerCase();

      if (cleanInviteEmail === cleanMyEmail) {
        try {
          localStorage.removeItem("buzzi_pending_invite");
        } catch {}
        return;
      }

      try {
        console.log("Processing mutual auto-invite from:", cleanInviteEmail, "to current:", cleanMyEmail);

        await fetch("/api/friend-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromEmail: cleanInviteEmail,
            fromName: invitedByVal || "Buzzi Vriend",
            toEmail: cleanMyEmail
          })
        });

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

        await fetch("/api/friend-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromEmail: cleanMyEmail,
            fromName: userDisplayName,
            toEmail: cleanInviteEmail
          })
        });

        hiveAudio.playNotification();

        setBuzziToast({
          show: true,
          title: "Vriend Toegevoegd! 🎉",
          message: `${invitedByVal || "Buzzi Gebruiker"} is zojuist automatisch aan je contactenlijst toegevoegd via de uitnodigingslink!`,
          avatar: "🧑‍🚀"
        });

        try {
          if (typeof window !== "undefined") {
            const tempUrl = new URL(window.location.href);
            tempUrl.searchParams.delete("invitedBy");
            tempUrl.searchParams.delete("inviteEmail");
            window.history.replaceState({}, document.title, tempUrl.pathname);
          }
          localStorage.removeItem("buzzi_pending_invite");
        } catch (e) {
          console.warn("Fout bij het opschonen van de URL:", e);
        }

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
    const interval = setInterval(syncUsers, 4000);
    return () => clearInterval(interval);
  }, [currentUser]);

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
        INITIAL_CONTACTS[0],
        ...registeredUsers.filter(u => {
          if (u.id === "queen" || u.email === "buzzi_bot@live.nl" || u.email === currentUser?.email) return false;
          
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
    const intervalId = setInterval(fetchChannels, 5000);
    return () => clearInterval(intervalId);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchBugs = async () => {
      try {
        const res = await fetch("/api/bugs?t=" + Date.now());
        let listFromSrv = [];
        if (res.ok) {
          listFromSrv = await res.json();
        }
        
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
    const intervalId = setInterval(fetchBugs, 4000);
    return () => clearInterval(intervalId);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.email) return;

    const fetchFriendRequestsAndFriendships = async () => {
      try {
        const res = await fetch(`/api/friend-requests?toEmail=${encodeURIComponent(currentUser.email)}&status=pending&t=${Date.now()}`);
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            if (list.length > friendRequests.length) {
              hiveAudio.playNotification();
            }
            setFriendRequests(list);
          }
        }

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
    const interval = setInterval(fetchFriendRequestsAndFriendships, 4000);
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
        
        await fetch("/api/friend-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromEmail: currentUser?.email || "",
            fromName: userDisplayName,
            toEmail: fromEmail
          })
        });
        
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

    let localSaved: any[] = [];
    try {
      localSaved = JSON.parse(localStorage.getItem("buzzi_local_bugs") || "[]");
    } catch {}
    localSaved.unshift(newBugItem);
    localStorage.setItem("buzzi_local_bugs", JSON.stringify(localSaved));

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

        const freshRes = await fetch("/api/bugs?t=" + Date.now());
        if (freshRes.ok) {
          const list = await freshRes.json();
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
      }
    } catch (err) {
      console.error("Fout bij opslaan bug report op de server:", err);
    } finally {
      setIsSubmittingBug(false);
    }
  };

  const handleDeleteBug = async (bugId: string) => {
    try {
      let localSaved: any[] = [];
      try {
        localSaved = JSON.parse(localStorage.getItem("buzzi_local_bugs") || "[]");
      } catch {}
      localSaved = localSaved.filter((b: any) => b.id !== bugId);
      localStorage.setItem("buzzi_local_bugs", JSON.stringify(localSaved));

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
      console.error("Fout bij verwijderen van bug op de server:", err);
    }
  };

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

            if (recId !== "mensen-van-toen" && recId !== "breezer-groep" && !recId.startsWith("ch-") && recId !== "queen") {
              if (data.senderId === currentUser.uid) {
                conversationKey = data.receiverId;
              } else if (data.receiverId === currentUser.uid) {
                conversationKey = data.senderId;
              } else {
                return;
              }
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
    const interval = setInterval(syncMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

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
    const mockUser = { uid: `u_${hash}`, displayName: name, email: email.split("#pwd_")[0] };
    localStorage.setItem("buzzi_user", JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    setUserDisplayName(name);
    await initUserProfile(mockUser, name);
  };

  const handleBuzzIncoming = () => {
    setIsBuzzingFlash(true);
    setTimeout(() => {
      setIsBuzzingFlash(false);
    }, 650);
  };

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
      senderId: simId,
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
      console.warn("Reply write failed, using local state fallback:", err);
      setMessages(prev => {
        const h = prev[activeId] || [];
        return { ...prev, [activeId]: [...h, msgDoc as Message] };
      });
    }
  };

  const handleSendMessage = async (text: string, isBuzz: boolean = false, isWink: boolean = false, winkId?: string) => {
    if (!currentUser) return;
    await saveMessageToDatabase({ text, isBuzz, isWink, winkId });
    // De rest van de AI chat trigger logica volgt hieronder in je JSX...
  };

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-[#2D60B3] flex items-center justify-center font-sans">
        <div className="text-white flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-white w-10 h-10" />
          <p className="text-sm font-medium">Buzzi Bestanden Laden... Een momentje!</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const activeMessages = messages[activeId] || [];
  const currentActiveContact = currentBuddies.find(c => c.id === activeId);
  const currentActiveChannel = visibleChannels.find(ch => ch.id === activeId);
  const activeChatName = activeType === "channel" 
    ? `#${currentActiveChannel?.name || activeId}` 
    : (currentActiveContact?.name || "Onbekend contact");

  return (
    <div className={`h-screen w-screen flex flex-col bg-[#F0F0EE] text-slate-800 select-none overflow-hidden font-sans ${isBuzzingFlash ? "animate-ping" : ""}`}>
      {/* Windows XP Style Top Titlebar Bar */}
      <div className="bg-gradient-to-r from-[#0058E6] via-[#3A80F2] to-[#0058E6] text-white px-3 py-1.5 flex items-center justify-between shadow-md border-b border-[#003CB3] shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-[#5CABFF] p-1 rounded-md text-white shadow-inner">
            <Sparkles size={15} className="text-amber-200" />
          </div>
          <span className="font-bold text-[13.5px] tracking-wide drop-shadow-sm select-none">
            Buzzi Messenger v1.44 - MSN Clone Premium (2004 vibe)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-full border border-white/10 text-[11px]">
            <Database size={11} className={activeDbMode === "mongodb" ? "text-emerald-400" : "text-amber-300"} />
            <span className="font-medium text-white/90">
              Modus: <span className="font-bold uppercase text-white">{activeDbMode}</span>
            </span>
          </div>
          <button 
            onClick={handleSignOut}
            className="bg-gradient-to-b from-[#E25C5C] to-[#A92A2A] hover:from-[#F37474] hover:to-[#C63B3B] text-white px-3 py-0.5 rounded border border-[#801B1B] text-[11.5px] font-bold shadow-sm transition-all active:scale-95"
          >
            Afmelden
          </button>
        </div>
      </div>

      {/* Main Container Layout Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* SIDEBAR NAVIGATION PANEL */}
        <div className={`w-full md:w-[320px] shrink-0 border-r border-[#D4D0C8] flex flex-col bg-[#FAF9F5] ${mobileActiveTab !== "sidebar" ? "hidden md:flex" : "flex"}`}>
          <Sidebar
            userDisplayName={userDisplayName}
            userPersonalMessage={userPersonalMessage}
            userStatus={userStatus}
            userAvatar={userAvatar}
            userListeningTo={userListeningTo}
            onUpdateDisplayName={handleUpdateDisplayName}
            onUpdatePersonalMessage={handleUpdatePersonalMessage}
            onUpdateStatus={handleUpdateStatus}
            onUpdateAvatar={handleUpdateAvatar}
            onUpdateListeningTo={handleUpdateListeningTo}
            contacts={currentBuddies}
            channels={visibleChannels}
            activeId={activeId}
            onSelect={(id, type) => {
              setActiveId(id);
              setActiveType(type);
              setMobileActiveTab("chat");
            }}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
            onCreateChannel={handleCreateChannel}
            friendRequests={friendRequests}
            onAcceptFriendRequest={handleAcceptFriendRequest}
            onDeclineFriendRequest={handleDeclineFriendRequest}
          />
        </div>

        {/* INTERACTIVE CHAT SCREEN DIALOG AREA */}
        <div className={`flex-1 flex flex-col bg-white min-w-0 ${mobileActiveTab !== "chat" ? "hidden md:flex" : "flex"}`}>
          <ChatArea
            activeId={activeId}
            activeType={activeType}
            chatName={activeChatName}
            contact={currentActiveContact}
            channel={currentActiveChannel}
            messages={activeMessages}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onIncomingBuzz={handleBuzzIncoming}
          />
        </div>

        {/* UTILITIES & RETRO FUN CONTROLS RIGHT BAR */}
        <div className={`w-full md:w-[280px] shrink-0 bg-[#F1EFEA] border-l border-[#D4D0C8] flex flex-col ${mobileActiveTab !== "tools" ? "hidden lg:flex" : "flex"}`}>
          {/* Sub tabs header selection inside utilities */}
          <div className="grid grid-cols-2 text-center bg-[#E4E1DA] border-b border-[#D4D0C8] shrink-0">
            <button
              onClick={() => setActiveUtilityTab("tools")}
              className={`py-2 text-[12px] font-bold border-r border-[#D4D0C8] flex items-center justify-center gap-1.5 transition-all ${activeUtilityTab === "tools" ? "bg-[#F1EFEA] text-[#0042A5] border-b-2 border-b-[#0058E6]" : "text-slate-600 hover:bg-[#EAE7E0]"}`}
            >
              <Smile size={14} /> Retro Fun Tools
            </button>
            <button
              onClick={() => setActiveUtilityTab("bugs")}
              className={`py-2 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${activeUtilityTab === "bugs" ? "bg-[#F1EFEA] text-red-700 border-b-2 border-b-red-600" : "text-slate-600 hover:bg-[#EAE7E0]"}`}
            >
              <AlertTriangle size={14} /> Live Bug Tracker ({bugsList.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 custom-scrollbar min-h-0">
            {activeUtilityTab === "tools" ? (
              <>
                {/* Invite URL dynamic sharing module */}
                <div className="bg-gradient-to-br from-[#EBF3FF] to-[#D5E6FF] border border-[#A2C4F7] rounded-lg p-3 shadow-sm">
                  <h4 className="text-[11.5px] font-black text-[#003580] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Share2 size={13} /> Nod iemand uit!
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5">
                    Deel je unieke link. Zodra een vriend inlogt via de link, worden jullie **automatisch** direct vrienden!
                  </p>
                  <button
                    onClick={handleCopyInviteLink}
                    className={`w-full py-1.5 px-3 rounded text-[11px] font-bold flex items-center justify-center gap-2 border shadow-sm transition-all active:scale-95 ${copyLinkStatus ? "bg-emerald-600 text-white border-emerald-700" : "bg-gradient-to-b from-[#FFF] to-[#F0F0EE] text-slate-700 border-[#C5C2B8] hover:bg-slate-50"}`}
                  >
                    {copyLinkStatus ? (
                      <>
                        <CheckCircle2 size={13} /> Gekopieerd! (Y)
                      </>
                    ) : (
                      <>
                        <Link size={13} /> Kopieer Uitnodigingslink
                      </>
                    )}
                  </button>
                </div>

                {/* Nickname Generator */}
                <div className="bg-white border border-[#D4D0C8] rounded-lg p-3 shadow-sm">
                  <h4 className="text-[11.5px] font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" /> MSN Name Generator
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal mb-3">
                    Maak direct een vette retro weergavenaam gevuld met nostalgische sterretjes en MSN-tekens!
                  </p>
                  
                  <button
                    onClick={generateRetroName}
                    className="w-full bg-gradient-to-b from-[#79B4FF] to-[#3486F7] hover:from-[#8EC2FF] hover:to-[#4A96FF] text-white border border-[#1A63D1] rounded py-1.5 px-3 font-bold text-[11.5px] shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 mb-2"
                  >
                    🎲 Genereer Retro Naam
                  </button>

                  {generatedName && (
                    <div className="mt-2.5 bg-[#F8F8F6] border border-dashed border-[#C5C2B8] p-2 rounded flex flex-col gap-2">
                      <div className="text-[11.5px] font-mono break-all text-center select-text bg-white py-1 px-1.5 border border-slate-200 rounded text-slate-700 selection:bg-blue-200">
                        {generatedName}
                      </div>
                      <button
                        onClick={applyGeneratedName}
                        className="w-full bg-gradient-to-b from-[#4CD964] to-[#34A853] hover:from-[#5EE275] hover:to-[#3CBA62] text-white border border-[#278A41] py-1 px-2 rounded text-[10.5px] font-bold shadow-xs transition-all active:scale-95"
                      >
                        ✅ Direct instellen als mijn naam
                      </button>
                    </div>
                  )}
                </div>

                {/* Online Block Checker Tool Simulation */}
                <div className="bg-white border border-[#D4D0C8] rounded-lg p-3 shadow-sm">
                  <h4 className="text-[11.5px] font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Compass size={13} className="text-blue-500" /> MSN Block Checker
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal mb-3">
                    Ben je bang dat een vriend jou stiekem heeft geblokkeerd of verwijderd? Typ de naam en test het live!
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <select
                      className="w-full bg-white border border-[#C5C2B8] rounded px-2 py-1 text-[11.5px] text-slate-700 focus:outline-hidden focus:border-blue-500"
                      value={checkedContact}
                      onChange={(e) => setCheckedContact(e.target.value)}
                      disabled={checking}
                    >
                      <option value="">-- Kies een contact --</option>
                      {currentBuddies.filter(b => b.id !== "queen").map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => testBlockStatus(checkedContact || "Wouter")}
                      disabled={checking || !checkedContact}
                      className="w-full bg-gradient-to-b from-[#FFF] to-[#EAE6DD] hover:to-[#DFD9CE] text-slate-700 border border-[#A6A296] disabled:opacity-50 disabled:pointer-events-none rounded py-1 px-2.5 font-bold text-[11px] shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      {checking ? (
                        <>
                          <RefreshCw size={11} className="animate-spin text-blue-600" /> Controleren...
                        </>
                      ) : (
                        "🔍 Heeft dit contact mij geblokkeerd?"
                      )}
                    </button>

                    {checkResult && (
                      <div className="mt-2 text-[10.5px] p-2 rounded-md font-semibold border bg-slate-50 text-slate-700 leading-relaxed">
                        {checkResult}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* LIVE BUG TRACKER FORM AND VISIBILITY PANEL */
              <div className="flex flex-col gap-3">
                <form onSubmit={handleSendBugReport} className="bg-[#FFFEE6] border border-[#DE9E1F] rounded-lg p-3 shadow-xs flex flex-col gap-2">
                  <h4 className="text-[11.5px] font-black text-[#855B04] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    🐞 Meld een Bug / Fout
                  </h4>
                  <p className="text-[10.5px] text-[#855B04]/80 leading-normal mb-1">
                    Erger je je ergens aan of werkt de radio of chat niet goed? Stuur het in, we fixen het live in de MongoDB cloud!
                  </p>

                  <input
                    type="text"
                    placeholder="Titel van de bug (bijv. Radio kraakt)..."
                    value={bugTitle}
                    onChange={(e) => setBugTitle(e.target.value)}
                    maxLength={50}
                    disabled={isSubmittingBug}
                    className="w-full bg-white border border-[#C5C2B8] rounded px-2 py-1 text-[11.5px] text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
                  />

                  <select
                    value={bugCategory}
                    onChange={(e) => setBugCategory(e.target.value)}
                    disabled={isSubmittingBug}
                    className="w-full bg-white border border-[#C5C2B8] rounded px-2 py-1 text-[11.5px] text-slate-700 focus:outline-hidden"
                  >
                    <option value="Radio">📻 Categorie: Retro Radio Player</option>
                    <option value="Chat">💬 Categorie: Berichten / Winks</option>
                    <option value="Database">🗄️ Categorie: Database / MongoDB</option>
                    <option value="Vrienden">🧑‍🚀 Categorie: Vrienden Systeem</option>
                    <option value="Overig">✨ Categorie: Overige Styling</option>
                  </select>

                  <textarea
                    placeholder="Beschrijf hier kort wat er misgaat zodat we het kunnen oplossen..."
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    maxLength={200}
                    rows={2}
                    disabled={isSubmittingBug}
                    className="w-full bg-white border border-[#C5C2B8] rounded px-2 py-1 text-[11.5px] text-slate-800 placeholder:text-slate-400 focus:outline-hidden resize-none"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingBug || !bugTitle.trim() || !bugDescription.trim()}
                    className="w-full bg-gradient-to-b from-[#FAD264] to-[#EAA406] hover:from-[#FBE084] hover:to-[#F3B31B] text-[#553A00] font-black border border-[#B37E05] rounded py-1 px-3 text-[11px] shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmittingBug ? "Verzenden..." : "🚀 Bug Opslaan in Cloud"}
                  </button>

                  {bugSuccess && (
                    <div className="text-center text-[10.5px] font-bold text-emerald-700 bg-emerald-50 py-1 rounded border border-emerald-300 animate-pulse">
                      ✓ Bug succesvol opgeslagen!
                    </div>
                  )}
                </form>

                {/* Bug items feedback listing box container */}
                <div className="flex flex-col gap-2">
                  <h5 className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider px-0.5">
                    Recente meldingen van developers:
                  </h5>
                  {bugsList.length === 0 ? (
                    <div className="text-center text-[11px] text-slate-400 py-4 bg-white rounded-lg border border-slate-200 border-dashed">
                      Geen openstaande bugs! Alles werkt perfect. (Y)
                    </div>
                  ) : (
                    bugsList.map((bug: any) => (
                      <div key={bug.id} className="bg-white border border-[#D4D0C8] rounded-md p-2.5 shadow-xs relative flex flex-col gap-1 group">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11.5px] font-bold text-slate-800 break-words leading-tight">
                            {bug.title}
                          </span>
                          <button
                            onClick={() => handleDeleteBug(bug.id)}
                            className="text-slate-400 hover:text-red-600 text-[10px] font-bold px-1 transition-colors opacity-0 group-hover:opacity-100"
                            title="Verwijder bug report"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[10.5px] text-slate-600 break-words leading-snug">
                          {bug.description}
                        </p>
                        <div className="flex items-center justify-between gap-1 mt-1 text-[9.5px]">
                          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-medium">
                            {bug.category}
                          </span>
                          <span className="text-slate-400 italic">
                            Door: {bug.senderName?.split(" (")[0] || "Onbekend"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Minesweeper Launch Icon Short-link panel footer bar */}
          <div className="p-2 border-t border-[#D4D0C8] bg-[#E4E1DA] shrink-0 flex items-center justify-between">
            <button
              onClick={() => {
                hiveAudio.playHoneyPop();
                setIsMinesweeperOpen(true);
              }}
              className="flex items-center gap-1 bg-gradient-to-b from-[#FFF] to-[#EAE6DD] hover:to-[#DFD9CE] text-slate-700 border border-[#A6A296] rounded py-1 px-2 text-[10.5px] font-bold shadow-xs active:scale-95 transition-all"
            >
              💣 Mijnenveger Spelen
            </button>
            <button
              onClick={() => {
                hiveAudio.playHoneyPop();
                setMobileActiveTab(mobileActiveTab === "tools" ? "sidebar" : "tools");
              }}
              className="md:hidden bg-slate-600 text-white text-[10.5px] px-2 py-1 rounded font-bold"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE LOWER LAYER TAB BAR CONTAINER NAVIGATION BUTTONS */}
      <div className="md:hidden bg-[#E4E1DA] border-t border-[#D4D0C8] h-12 shrink-0 grid grid-cols-3 text-center items-center">
        <button
          onClick={() => setMobileActiveTab("sidebar")}
          className={`h-full flex flex-col items-center justify-center border-r border-[#D4D0C8] text-slate-700 ${mobileActiveTab === "sidebar" ? "bg-[#FAF9F5] border-b-4 border-b-[#0058E6] font-bold" : ""}`}
        >
          <Users size={16} />
          <span className="text-[9.5px] uppercase tracking-wider mt-0.5">Contacten</span>
        </button>
        <button
          onClick={() => setMobileActiveTab("chat")}
          className={`h-full flex flex-col items-center justify-center border-r border-[#D4D0C8] text-slate-700 ${mobileActiveTab === "chat" ? "bg-white border-b-4 border-b-[#0058E6] font-bold" : ""}`}
        >
          <Send size={16} />
          <span className="text-[9.5px] uppercase tracking-wider mt-0.5">Chat ({activeChatName.split(" (")[0]})</span>
        </button>
        <button
          onClick={() => setMobileActiveTab("tools")}
          className={`h-full flex flex-col items-center justify-center text-slate-700 ${mobileActiveTab === "tools" ? "bg-[#FAF9F5] border-b-4 border-b-[#0058E6] font-bold" : ""}`}
        >
          <span className="text-base text-white">✨</span>
          <span className="text-[9.5px] uppercase font-bold tracking-wider mt-0.5">Extra's</span>
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
                className="hover:text-red-600 font-extrabold text-[12px] px-1"
              >
                ✕
              </button>
            </div>
            <p className="text-[11.5px] text-[#553A00] leading-relaxed break-words font-medium">
              {buzziToast.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
