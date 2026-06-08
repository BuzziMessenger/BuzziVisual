/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Message, Contact, Channel } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { translateUI } from "../translations";
import { 
  Send, 
  Volume2, 
  Smile, 
  Sparkles, 
  Wifi, 
  Scissors, 
  Type, 
  Users,
  Image as ImageIcon,
  Palette,
  BellRing,
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Headphones,
  Video,
  Paperclip,
  Gamepad2
} from "lucide-react";
import { hiveAudio } from "../utils/audio";
import { WebcamCall } from "./WebcamCall";
import { ChatGameDuel } from "./ChatGameDuel";
import { FileTransfer } from "./FileTransfer";

const isCustomAvatar = (avatar: string) => {
  if (!avatar) return false;
  return avatar.length > 5 || avatar.startsWith("data:") || avatar.startsWith("http") || avatar.startsWith("/");
};

interface ChatAreaProps {
  activeId: string;
  activeType: "channel" | "dm";
  activeChannel?: Channel;
  activeContact?: Contact;
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (
    text: string,
    isBuzz?: boolean,
    isWink?: boolean,
    winkId?: string,
    fileTransfer?: any,
    isGameDuel?: boolean,
    gameType?: "tictactoe" | "connect4" | "rps" | "snake" | "memory",
    gameId?: string,
    isCallInvite?: boolean,
    callId?: string
  ) => void;
  onBuzzIncoming: () => void;
  myDisplayName: string;
  myAvatar: string;
  myUserId?: string;
  onUserTyping?: () => void;
  isBlocked?: boolean;
  onToggleBlock?: () => void;
  isUserPremium?: boolean;
  onOpenPremiumModal?: () => void;
  siteLanguage?: string;
}

const BUZZI_EMOTICONS = [
  { code: ":-D", char: "😃", name: "Blij" },
  { code: ":D", char: "😃", name: "Blij" },
  { code: "(H)", char: "😎", name: "Cool" },
  { code: "(A)", char: "😇", name: "Engeltje" },
  { code: "(L)", char: "❤️", name: "Hartje" },
  { code: "(U)", char: "💔", name: "Gebroken Hart" },
  { code: ":-P", char: "😜", name: "Tong" },
  { code: ":P", char: "😜", name: "Tong" },
  { code: "(K)", char: "💋", name: "Kus" },
  { code: "(F)", char: "🌹", name: "Roos" },
  { code: "(W)", char: "🥀", name: "Verwelkt" },
  { code: "(coo)", char: "💻", name: "PC" },
  { code: "(grr)", char: "😡", name: "Boos" },
  { code: "(S)", char: "⭐", name: "Ster" },
  { code: "(Y)", char: "👍", name: "Duim op" },
  { code: "(N)", char: "👎", name: "Duim neer" },
  { code: ":-O", char: "😲", name: "Verrast" },
  { code: ":O", char: "😲", name: "Verrast" },
  { code: ";-)", char: "😉", name: "Knipoog" },
  { code: ";)", char: "😉", name: "Knipoog" },
  { code: ":-(", char: "😢", name: "Verdrietig" },
  { code: ":(", char: "😢", name: "Verdrietig" },
  { code: "(8)", char: "🎵", name: "Muziek" },
  { code: "(pl)", char: "🛹", name: "Skateboard" },
  { code: "(pi)", char: "🍕", name: "Pizza" },
  { code: "(beer)", char: "🍺", name: "Bier" },
  { code: "(v)", char: "✌️", name: "Peace" },
  { code: "(c)", char: "☕", name: "Koffie" },
  { code: "(yn)", char: "🤞", name: "Duimen" },
  { code: "(ball)", char: "⚽", name: "Voetbal" },
  { code: "(car)", char: "🚗", name: "Auto" },
  { code: "(rain)", char: "🌧️", name: "Regen" },
  { code: "(sun)", char: "☀️", name: "Zon" },
  { code: "(hug)", char: "🤗", name: "Knuffel" },
  { code: "(kiss)", char: "😘", name: "Kusje" },
  { code: "(dog)", char: "🐶", name: "Hond" },
  { code: "(cat)", char: "🐱", name: "Kat" },
  { code: "(ghost)", char: "👻", name: "Spook" },
  { code: "(dance)", char: "🕺", name: "Dansen" },
  { code: "(stare)", char: "😳", name: "Staren" },
  { code: "(zipped)", char: "🤐", name: "Stil" },
  { code: "(heart_eyes)", char: "😍", name: "Verliefd" },
  { code: "(yawn)", char: "🥱", name: "Gapen" },
  { code: "(alien)", char: "👽", name: "Alien" },
  { code: "(devil)", char: "😈", name: "Duiveltje" },
  { code: "(fire)", char: "🔥", name: "Vuur" },
  { code: "(bomb)", char: "💣", name: "Bom" },
  { code: "(lol)", char: "😂", name: "Lachen" },
  { code: "(sick)", char: "🤢", name: "Ziek" },
  { code: "(sleep)", char: "😴", name: "Slapen" },
  { code: "(wave)", char: "👋", name: "Zwaaien" },
  { code: "(party)", char: "🎉", name: "Feest" },
  { code: "(clown)", char: "🤡", name: "Clown" },
  { code: "(poop)", char: "💩", name: "Maffe Poep" },
  { code: "(game)", char: "🎮", name: "Spel" },
  { code: "(yes)", char: "✅", name: "Compleet" },
  { code: "(no)", char: "❌", name: "Fout" }
];

const WINKS_LIST = [
  { id: "pig", title: "Knipogend Varken", icon: "🐷", desc: "Een vrolijk roze Buzzi-varkentje met een vette knipoog!" },
  { id: "crazy", title: "Gekke Lachebek", icon: "🤪", desc: "Een gigantische gele smiley die onbedaarlijk lacht en rammelt." },
  { id: "water", title: "Waterballon", icon: "🎈", desc: "Gooi een waterballon tegen het scherm en laat het druipen!" },
  { id: "guitar", title: "Luchtgitaar", icon: "🎸", desc: "Scheur op een vette elektrische gitaar met bliksem en sterren!" },
  { id: "heart", title: "Hartjes Explosie", icon: "💖", desc: "Een groot kloppend hart dat kapot schiet in tientallen harten." },
  { id: "ghost", title: "Buzzi Spookje", icon: "👻", desc: "Een spooky groen Buzzi-spookje dat over je scherm zweeft!" },
  { id: "kiss", title: "Klop Kus-afdruk", icon: "💋", desc: "Een grote lippenstift-kusafdruk die op je scherm stempelt!" },
  { id: "disco", title: "Retro Disco Bal", icon: "🪩", desc: "Laat een flitsende neon discobal over je scherm draaien!" },
  { id: "laser", title: "Neon Laser Ogen", icon: "👁️", desc: "Zet je laserblik op scherp en splits het scherm in tweeën!" },
  { id: "alien", title: "Spaceship UFO", icon: "🛸", desc: "Laat een buitenaards ruimteschip de boel ontvoeren met felle lichten!" },
  { id: "banana", title: "Dansende Banaan", icon: "🍌", desc: "De legendarische dansende banaan swingt over je scherm!" },
  { id: "cat", title: "Miauwend Poesje", icon: "🐱", desc: "Een schattig oranje katje dat spint en over je scherm huppelt!" },
  { id: "dog", title: "Kwispelend Hondje", icon: "🐶", desc: "Een dolenthousiaste puppy die je beeldscherm aflikt!" },
  { id: "poop", title: "Draaiende Drol", icon: "💩", desc: "Een maffe lachende drol met retro-synthesizer scheetgeluiden!" },
  { id: "money", title: "Euro Geldregen", icon: "💸", desc: "Laat het dikke eurobiljetten regenen over je chatvenster!" },
  { id: "pinguin", title: "Dansende Buzzi Pinguïn", icon: "🐧", desc: "De legendarische retro dansende Linux pinguïn swingt zijn heupen!" },
  { id: "heartbreaker", title: "Buzzi Heartbreaker", icon: "💔", desc: "Een pijnlijk gebroken hart dat over je scherm barst!" },
  { id: "matrix", title: "Retro Matrix Rain", icon: "👾", desc: "Hack het chatvenster met vallende groene cryptische Buzzi matrixcodes!" },
  { id: "bee", title: "Buzzi Honingbij", icon: "🐝", desc: "Een maffe bij die zoemend het scherm vult met zoete glinsterhoning!" }
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  activeId,
  activeType,
  activeChannel,
  activeContact,
  messages,
  isTyping,
  onSendMessage,
  onBuzzIncoming,
  myDisplayName,
  myAvatar,
  myUserId,
  onUserTyping,
  isBlocked = false,
  onToggleBlock,
  isUserPremium = false,
  onOpenPremiumModal,
  siteLanguage = "NL"
}) => {
  const t = (key: string) => {
    return translateUI(siteLanguage, key);
  };

  const [inputText, setInputText] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showEmoticonPicker, setShowEmoticonPicker] = useState(false);
  const [showWinksPicker, setShowWinksPicker] = useState(false);
  const [activeWink, setActiveWink] = useState<string | null>(null);
  const [showWinkClose, setShowWinkClose] = useState(true);
  const lastActiveId = useRef<string | null>(null);
  const processedWinkIds = useRef<Set<string>>(new Set());

  // Webcam, spellen en bestand overdracht
  const [showWebcamCall, setShowWebcamCall] = useState(false);
  const [showGameDuel, setShowGameDuel] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset webcam call en game duel bij gespreks-wisseling
    setShowWebcamCall(false);
    setShowGameDuel(false);
    setCurrentGameId(undefined);
  }, [activeId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Triggers MSN file transfer card in history logs
      onSendMessage(
        `*Verstuurt bestand: ${file.name} (${formattedSize})*`,
        false,
        false,
        undefined,
        {
          name: file.name,
          size: formattedSize,
          progress: 0,
          status: "sending",
          dataUrl: dataUrl
        }
      );
    };
    reader.readAsDataURL(file);

    if (e.target) {
      e.target.value = "";
    }
  };
  
  // Custom font styling for retro Buzzi customization
  const [mmsColor, setMmsColor] = useState<string>("#1d5fb0"); // Buzzi classic blue text
  const [mmsFont, setMmsFont] = useState<string>("Comic Sans MS"); // Comic Sans default lol
  const [isBold, setIsBold] = useState(true);
  const [showColorPanel, setShowColorPanel] = useState(true);

// Music Ticker Playlists & Dynamic States
  const CONTACT_PLAYLISTS: Record<string, string[]> = {
    queen: [
      "Linkin Park - In The End",
      "Evanescence - Bring Me To Life",
      "Eminem - Lose Yourself",
      "O-Zone - Dragostea Din Tei"
    ],
    wouter: [
      "Linkin Park - Numb",
      "Slipknot - Duality",
      "Green Day - American Idiot",
      "The Rasmus - In the Shadows"
    ],
    kelly: [
      "Britney Spears - Toxic",
      "Kylie Minogue - Can't Get You Out Of My Head",
      "Beyoncé - Crazy In Love",
      "OutKast - Hey Ya!"
    ],
    danny: [
      "System Of A Down - Chop Suey!",
      "Limp Bizkit - Behind Blue Eyes",
      "Sum 41 - Still Waiting",
      "Blink-182 - I Miss You"
    ],
    sanne: [
      "Las Ketchup - The Ketchup Song",
      "Avril Lavigne - Sk8er Boi",
      "Anastacia - Left Outside Alone",
      "Black Eyed Peas - Where Is The Love?"
    ]
  };

  const CHANNEL_PLAYLIST = [
    "Tiësto - Traffic (Live at Innercity 2003)",
    "DJ Jean - The Launch (Remix)",
    "ATB - 9 PM (Till I Come)",
    "Alice Deejay - Better Off Alone",
    "Armin van Buuren - Shivers"
  ];

  const [contactMusic, setContactMusic] = useState<Record<string, { trackIndex: number; isPlaying: boolean }>>({
    queen: { trackIndex: 0, isPlaying: true },
    wouter: { trackIndex: 0, isPlaying: true },
    kelly: { trackIndex: 0, isPlaying: true },
    danny: { trackIndex: 0, isPlaying: true },
    sanne: { trackIndex: 0, isPlaying: true },
  });

  const [channelMusic, setChannelMusic] = useState<{ trackIndex: number; isPlaying: boolean }>({
    trackIndex: 0,
    isPlaying: true
  });

  const getMusicStatus = () => {
    if (activeType === "channel") {
      return {
        track: CHANNEL_PLAYLIST[channelMusic.trackIndex],
        isPlaying: channelMusic.isPlaying,
        type: "radio"
      };
    }

    const playlist = CONTACT_PLAYLISTS[activeId] || [
      activeContact?.listeningTo || "Krezip - I Would Stay",
      "Eminem - Lose Yourself",
      "Keane - Somewhere Only We Know"
    ];

    const state = contactMusic[activeId] || { trackIndex: 0, isPlaying: true };
    
    let track = playlist[state.trackIndex % playlist.length];
    if (state.trackIndex === 0 && activeContact?.listeningTo) {
      track = activeContact.listeningTo;
    }

    return {
      track,
      isPlaying: state.isPlaying,
      type: "contact"
    };
  };

  const handleMusicPrev = () => {
    hiveAudio.playHoneyPop();
    if (activeType === "channel") {
      setChannelMusic(prev => ({
        ...prev,
        trackIndex: (prev.trackIndex - 1 + CHANNEL_PLAYLIST.length) % CHANNEL_PLAYLIST.length
      }));
    } else {
      const playlist = CONTACT_PLAYLISTS[activeId] || [
        activeContact?.listeningTo || "Krezip - I Would Stay",
        "Eminem - Lose Yourself",
        "Keane - Somewhere Only We Know"
      ];
      setContactMusic(prev => {
        const current = prev[activeId] || { trackIndex: 0, isPlaying: true };
        return {
          ...prev,
          [activeId]: {
            ...current,
            trackIndex: (current.trackIndex - 1 + playlist.length) % playlist.length
          }
        };
      });
    }
  };

  const handleMusicNext = () => {
    hiveAudio.playHoneyPop();
    if (activeType === "channel") {
      setChannelMusic(prev => ({
        ...prev,
        trackIndex: (prev.trackIndex + 1) % CHANNEL_PLAYLIST.length
      }));
    } else {
      const playlist = CONTACT_PLAYLISTS[activeId] || [
        activeContact?.listeningTo || "Krezip - I Would Stay",
        "Eminem - Lose Yourself",
        "Keane - Somewhere Only We Know"
      ];
      setContactMusic(prev => {
        const current = prev[activeId] || { trackIndex: 0, isPlaying: true };
        return {
          ...prev,
          [activeId]: {
            ...current,
            trackIndex: (current.trackIndex + 1) % playlist.length
          }
        };
      });
    }
  };

  const handleMusicTogglePlay = () => {
    hiveAudio.playHoneyPop();
    if (activeType === "channel") {
      setChannelMusic(prev => ({
        ...prev,
        isPlaying: !prev.isPlaying
      }));
    } else {
      setContactMusic(prev => {
        const current = prev[activeId] || { trackIndex: 0, isPlaying: true };
        return {
          ...prev,
          [activeId]: {
            ...current,
            isPlaying: !current.isPlaying
          }
        };
      });
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Monitor incoming messages for Winks to trigger the full screen play and synth sound!
  useEffect(() => {
    if (activeId !== lastActiveId.current) {
      // Chat switched! Mark all existing historical winks in this room as already played/processed
      messages.forEach(msg => {
        if (msg.isWink && msg.id) {
          processedWinkIds.current.add(msg.id);
        }
      });
      lastActiveId.current = activeId;
      return;
    }

    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg && lastMsg.isWink && lastMsg.winkId) {
      if (processedWinkIds.current.has(lastMsg.id)) {
        return;
      }
      processedWinkIds.current.add(lastMsg.id);
      setActiveWink(lastMsg.winkId);

      // Play matching synth sound
      if (lastMsg.winkId === "pig") {
        hiveAudio.playPigWink();
      } else if (lastMsg.winkId === "crazy") {
        hiveAudio.playCrazyWink();
      } else if (lastMsg.winkId === "water") {
        hiveAudio.playWaterWink();
      } else if (lastMsg.winkId === "guitar") {
        hiveAudio.playGuitarWink();
      } else if (lastMsg.winkId === "heart") {
        hiveAudio.playHeartWink();
      } else if (lastMsg.winkId === "ghost") {
        hiveAudio.playGhostWink();
      } else if (lastMsg.winkId === "kiss") {
        hiveAudio.playKissWink();
      } else if (lastMsg.winkId === "disco") {
        hiveAudio.playDiscoWink();
      } else if (lastMsg.winkId === "laser") {
        hiveAudio.playLaserWink();
      } else if (lastMsg.winkId === "alien") {
        hiveAudio.playAlienWink();
      } else if (lastMsg.winkId === "banana") {
        hiveAudio.playBananaWink();
      } else if (lastMsg.winkId === "cat") {
        hiveAudio.playCatWink();
      } else if (lastMsg.winkId === "dog") {
        hiveAudio.playDogWink();
      } else if (lastMsg.winkId === "poop") {
        hiveAudio.playPoopWink();
      } else if (lastMsg.winkId === "money") {
        hiveAudio.playMoneyWink();
      } else if (lastMsg.winkId === "pinguin") {
        hiveAudio.playPinguinWink();
      } else if (lastMsg.winkId === "heartbreaker") {
        hiveAudio.playHeartbreakerWink();
      } else if (lastMsg.winkId === "matrix") {
        hiveAudio.playMatrixWink();
      } else if (lastMsg.winkId === "bee") {
        hiveAudio.playBeeWink();
      }

      setShowWinkClose(true);

      const timer = setTimeout(() => {
        setActiveWink(null);
      }, 5000);

      const closeTimer = setTimeout(() => {
        setShowWinkClose(false);
      }, 2500);

      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }
  }, [messages, activeId]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), false);
    
    // Play message send/receive chime
    hiveAudio.playNotification();
    setInputText("");
    setShowEmoticonPicker(false);
    setShowWinksPicker(false);
  };

  const handleSendWink = (winkId: string, title: string) => {
    onSendMessage(`*Stuurt knipoog: ${title}*`, false, true, winkId);
    setShowWinksPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Direct Nudge (Duwtje) Trigger
  const triggerNudge = () => {
    if (isBlocked) return;
    hiveAudio.playNudge();
    
    // Animate local shake
    setIsShaking(true);
    onBuzzIncoming();
    setTimeout(() => setIsShaking(false), 650);

    // Send the specialized Buzz system message
    onSendMessage(`🚨 DUWTJE! Directe aandacht vereist!`, true);
  };

  const handleEmoticonClick = (code: string) => {
    setInputText(prev => prev + " " + code + " ");
    setShowEmoticonPicker(false);
  };

  // Helper to highlight emoticon codes in text with beautiful 2xl emojis for that nostalgic feel
  const renderMessageContent = (text: string) => {
    if (!text) return "";
    
    // Sort emoticons by code length descending to match longer ones first (e.g. :-D before :D)
    const sortedEmoticonCodes = [...BUZZI_EMOTICONS].sort((a, b) => b.code.length - a.code.length);
    
    // Create direct regex matcher for codes
    const escapedCodes = sortedEmoticonCodes.map(em => em.code.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`(${escapedCodes.join('|')})`, 'gi');
    
    const parts = text.split(regex);
    return parts.map((part, index) => {
      const match = sortedEmoticonCodes.find(em => em.code.toLowerCase() === part.toLowerCase());
      if (match) {
        return (
          <span
            key={index}
            className="inline-block text-lg hover:scale-125 transition-transform cursor-help align-middle mx-0.5"
            title={match.code}
          >
            {match.char}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <motion.div 
      className="flex-1 bg-white flex flex-col h-full relative"
      animate={isShaking ? {
        x: [0, -12, 12, -9, 9, -6, 6, -3, 3, 0],
        y: [0, 6, -6, 4, -4, 3, -3, 0],
        rotate: [0, -1, 1, -0.5, 0.5, 0]
      } : {}}
      transition={{ duration: 0.65, ease: "linear" }}
    >
      {/* Buzzi Active Conversation Header Info */}
      <div className="bg-[#cbdcf0] border-b border-[#9ebcd1] px-5 py-3 flex items-center justify-between shadow-inner">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
              {activeType === "channel" 
                ? `👥 Groep: #${activeChannel?.name}` 
                : <>
                    💬 
                    <span>
                      {activeContact?.name}
                    </span>
                    <span className="text-xs text-slate-500 font-normal truncate">&lt;{activeContact?.email}&gt;</span>
                    {activeContact?.listeningTo && (
                      <span className="bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-bold py-0.5 px-1.5 rounded-full flex items-center gap-1 shrink-0">
                        <Music className="w-2.5 h-2.5 text-sky-600 animate-pulse" />
                        Luistert nu: {activeContact.listeningTo}
                      </span>
                    )}
                  </>}
            </span>
            <span className={`w-2 h-2 rounded-full ${
              activeContact?.status === "online" ? "bg-green-500" :
              activeContact?.status === "bezet" ? "bg-red-500" :
              activeContact?.status === "afwezig" ? "bg-orange-400" :
              "bg-gray-400"
            }`} />
          </div>
          <p className="text-[11px] text-slate-500 italic truncate mt-0.5 max-w-[420px]">
            {activeType === "channel" ? activeChannel?.description : activeContact?.personalMessage}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {activeType === "dm" && onToggleBlock && (
            <button
              onClick={onToggleBlock}
              className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors shadow-xs ${
                isBlocked
                  ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300"
                  : "bg-red-100 hover:bg-red-200 text-red-800 border border-red-300"
              }`}
            >
              {isBlocked ? "🔓 Deblokkeer contact" : "🚫 Blokkeer contact"}
            </button>
          )}
        </div>
      </div>

      {/* Buzzi Action Toolbar (Buttons directly below header for tools) */}
      <div className="bg-[#e9f2fc] border-b border-[#bad0e3] px-3 py-1 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Nudge! (Duwtje) */}
          <button
            onClick={triggerNudge}
            className="hover:bg-[#cfe1f5] text-slate-700 px-2 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 border border-transparent hover:border-[#9ebcd1]"
            title="Schud het scherm van je gesprekspartner!"
          >
            <BellRing className="w-3.5 h-3.5 text-red-500 animate-bounce" />
            <span className="font-semibold text-red-700">Duwtje sturen!</span>
          </button>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          {/* Hidden File Input for transfers */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />

          {/* Cameragesprek (Video calling) */}
          {activeType === "dm" && (
            <button
              type="button"
              onClick={() => {
                const callId = `call-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                onSendMessage(
                  "📹 Wil een videoverbinding met je starten!",
                  false,
                  false,
                  undefined,
                  undefined,
                  false,
                  undefined,
                  undefined,
                  true,
                  callId
                );
                setShowWebcamCall(true);
                setShowGameDuel(false);
                hiveAudio.playHoneyPop();
              }}
              disabled={activeContact?.status === "offline"}
              className="hover:bg-[#cfe1f5] text-slate-700 px-2 py-1 rounded text-xs flex items-center gap-1 transition-all active:scale-95 border border-transparent hover:border-[#9ebcd1] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Start een retro videocall / webcam-gesprek!"
            >
              <Video className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-semibold text-sky-800">{t("Video")}</span>
            </button>
          )}

          {/* Bestand versturen (File Sharing) */}
          {activeType === "dm" && (
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
                hiveAudio.playHoneyPop();
              }}
              disabled={activeContact?.status === "offline"}
              className="hover:bg-[#cfe1f5] text-slate-700 px-2 py-1 rounded text-xs flex items-center gap-1 transition-all active:scale-95 border border-transparent hover:border-[#9ebcd1] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title={t("Bestand verzenden")}
            >
              <Paperclip className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold text-amber-800">{t("Bestand verzenden")}</span>
            </button>
          )}

          {/* Spelletjes Duel (Gaming) */}
          {activeType === "dm" && (
            <button
              type="button"
              onClick={() => {
                setShowGameDuel(true);
                setShowWebcamCall(false);
                hiveAudio.playHoneyPop();
              }}
              disabled={activeContact?.status === "offline"}
              className="hover:bg-[#cfe1f5] text-slate-700 px-2 py-1 rounded text-xs flex items-center gap-1 transition-all active:scale-95 border border-transparent hover:border-[#9ebcd1] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title={t("Spel spelen ! 🎮")}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="font-semibold text-emerald-800">{t("Spellen")}</span>
            </button>
          )}

          {activeType === "dm" && <div className="w-px h-4 bg-slate-300 mx-1" />}

          {/* Letters customization */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/60 border border-slate-300 rounded-lg shadow-sm">
            <button
              onClick={() => {
                setShowColorPanel(!showColorPanel);
                hiveAudio.playHoneyPop();
              }}
              className="flex items-center gap-1 cursor-pointer hover:bg-slate-200/50 px-1 py-0.5 rounded text-[10px] font-bold text-slate-600 focus:outline-none transition-all"
              title="Klap kleurenpaneel in of uit"
            >
              <Palette className="w-3.5 h-3.5 text-slate-500" />
              <span>Kleur {showColorPanel ? "▲" : "▼"}</span>
            </button>
            
            {showColorPanel && (
              <div className="flex items-center gap-1 overflow-x-auto max-w-[140px] sm:max-w-[220px] scrollbar-thin pl-1 border-l border-slate-300 ml-1 py-0.5 animate-fade-in">
                {[
                  { hex: "#121212", name: "Zwart" },
                  { hex: "#1d5fb0", name: "Blauw" },
                  { hex: "#00a8e8", name: "Lichtblauw" },
                  { hex: "#d11f25", name: "Rood" },
                  { hex: "#e5097f", name: "Roze" },
                  { hex: "#15a13c", name: "Groen" },
                  { hex: "#ef7c00", name: "Oranje" },
                  { hex: "#fbc531", name: "Geel" },
                  { hex: "#7d1b8c", name: "Paars" },
                  { hex: "#8c52ff", name: "Lavendel" },
                  { hex: "#ff5757", name: "Warm Koraal" },
                  { hex: "#00c49f", name: "Jade Mint" },
                  { hex: "#a4b0be", name: "Retro Grijs" },
                  { hex: "#b8860b", name: "Messing Goud" },
                  { hex: "#ff4757", name: "Liefde Rood" },
                  { hex: "#2ed573", name: "Neon Groen" },
                  { hex: "#1e90ff", name: "Neon Blauw" },
                ].map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      setMmsColor(c.hex);
                      hiveAudio.playHoneyPop();
                    }}
                    className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer active:scale-90 border flex items-center justify-center shrink-0 ${
                      mmsColor === c.hex 
                        ? "border-slate-800 scale-110 shadow-sm ring-1 ring-slate-400" 
                        : "border-slate-200 hover:scale-105"
                    }`}
                    title={c.name}
                    style={{ backgroundColor: c.hex }}
                  >
                    {mmsColor === c.hex && (
                      <span className="w-1 h-1 rounded-full bg-white shadow-xs" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setMmsFont(prev => prev === "Comic Sans MS" ? "Courier New" : prev === "Courier New" ? "Georgia" : "Comic Sans MS");
              hiveAudio.playHoneyPop();
            }}
            className="hover:bg-[#cfe1f5] text-slate-700 px-2 py-1 rounded text-xs flex items-center gap-1 cursor-pointer"
            title="Klik om lettertype te wisselen (Comic Sans, Courier, Georgia)"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] text-slate-500">{mmsFont}</span>
          </button>

          <button
            onClick={() => setIsBold(!isBold)}
            className={`hover:bg-[#cfe1f5] text-slate-700 px-2 py-0.5 rounded text-xs font-bold font-serif cursor-pointer ${isBold ? "bg-[#cfe1f5]/60 border border-slate-300" : ""}`}
            title="Zet vette letters aan/uit"
          >
            A
          </button>
        </div>

        {/* Emoticon list trigger */}
        <div className="flex items-center gap-1.5 relative">
          <div className="relative">
            <button
              onClick={() => {
                setShowEmoticonPicker(!showEmoticonPicker);
                setShowWinksPicker(false);
                hiveAudio.playHoneyPop();
              }}
              className="hover:bg-[#cfe1f5] text-[#1d5c8a] px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer border border-[#bad0e3]/40"
            >
              <Smile className="w-3.5 h-3.5 text-amber-500" />
              <span>Emoticons :-D</span>
            </button>

            {showEmoticonPicker && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-[#8da7c1] rounded-md shadow-xl p-2.5 grid grid-cols-5 gap-1.5 w-48 z-50 animate-fade-in">
                <div className="col-span-5 text-[10px] text-slate-400 font-bold border-b border-slate-100 pb-1 mb-1">
                  Kies retro Emoticon:
                </div>
                {BUZZI_EMOTICONS.map((em) => (
                  <button
                    key={em.code}
                    onClick={() => handleEmoticonClick(em.code)}
                    className="p-1 text-center hover:bg-[#e4ecf7] rounded text-lg transition-transform active:scale-90 cursor-pointer"
                    title={`${em.name} (${em.code})`}
                  >
                    {em.char}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Winks list trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowWinksPicker(!showWinksPicker);
                setShowEmoticonPicker(false);
                hiveAudio.playHoneyPop();
              }}
              className="hover:bg-[#cfe1f5] text-[#1d5c8a] px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer border border-[#bad0e3]/40 bg-gradient-to-r from-pink-50 to-white"
              title={t("Wink versturen")}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
              <span className="text-pink-700">{t("Winks")} 😉</span>
            </button>

            {showWinksPicker && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-[#8da7c1] rounded-md shadow-xl p-3 w-64 z-50 animate-fade-in text-left">
                <div className="text-[10.5px] text-pink-600 font-extrabold border-b border-slate-100 pb-1.5 mb-2 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Kies retro Wink (Knipoog):</span>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {WINKS_LIST.map((wink) => (
                    <button
                      key={wink.id}
                      onClick={() => handleSendWink(wink.id, wink.title)}
                      className="w-full flex items-center gap-2.5 p-1.5 text-left hover:bg-pink-50 rounded transition-all group cursor-pointer border border-transparent hover:border-pink-200"
                    >
                      <span className="text-2xl filter drop-shadow group-hover:scale-115 transition-transform select-none">
                        {wink.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 group-hover:text-pink-700 flex items-center gap-1">
                          <span>{wink.title}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 truncate mt-0.5">{wink.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Chat Canvas: Message Feed on the Left, Display Avatars on the Right */}
      <div className="flex-1 flex overflow-hidden bg-slate-50 relative">

        {/* Column 1: Messaging Feed */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="text-[10px] text-slate-400 text-center select-none font-sans py-1 border-b border-dashed border-slate-100">
            Gespreksbeveiliging is actief. Je chats worden beveiligd bewaard.
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.senderId === "me" || (myUserId && msg.senderId === myUserId && msg.senderName === myDisplayName);
              const isQueen = msg.senderId === "queen";
              const isBuzz = msg.isBuzz;

              // Classic Buzzi inline Nudge rendering
              if (isBuzz) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mx-auto max-w-lg bg-orange-100 border border-orange-300 text-orange-950 px-4 py-2.5 rounded-lg text-xs leading-none font-sans text-center my-3 relative shadow-sm"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-bounce">🚨</span>
                      <span>
                        <strong>{msg.senderName}</strong> heeft je zojuist een **Duwtje** (Nudge) gegeven.
                      </span>
                      <span>🚨</span>
                    </div>
                  </motion.div>
                );
              }

              // Custom Retro Buzzi MSN Game Invitation Card
              if (msg.isGameDuel) {
                const DutchGameName = msg.gameType === "tictactoe" 
                  ? "Boter-Kaas-en-Eieren" 
                  : msg.gameType === "connect4"
                  ? "Vier-op-een-rij"
                  : msg.gameType === "snake"
                  ? "Buzzi Slang (Snake)"
                  : msg.gameType === "memory"
                  ? "Geheugen Trainer"
                  : "Steen, Papier, Schaar";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mx-auto max-w-sm bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 p-4 rounded-xl text-xs font-sans shadow-md my-4 border-b-emerald-600 border-r-emerald-600"
                  >
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="bg-emerald-100 p-1 rounded-full text-emerald-700">
                        <Gamepad2 className="w-4 h-4 animate-pulse" />
                      </div>
                      <span className="font-extrabold text-emerald-950 text-[11px] uppercase tracking-wider">
                        🎮 Buzzi Duel Zone
                      </span>
                    </div>
                    <p className="text-slate-700 mb-3.5 leading-relaxed text-[11px]">
                      <strong>{msg.senderName}</strong> nodigt je uit voor een legendarische match <strong>{DutchGameName}</strong>! Durf jij de strijd aan?
                    </p>
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-mono">Status: Uitgenodigd...</span>
                      <button
                        onClick={() => {
                          setCurrentGameId(msg.gameId);
                          setShowGameDuel(true);
                          hiveAudio.playHoneyPop();
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded border-b-2 border-emerald-800 text-[10px] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        ⚔️ SPEEL NU!
                      </button>
                    </div>
                  </motion.div>
                );
              }

              // Custom Retro Buzzi Webcampopp calling Invitation Card
              if (msg.isCallInvite) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mx-auto max-w-sm bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-400 p-4 rounded-xl text-xs font-sans shadow-md my-4 border-b-sky-600 border-r-sky-600"
                  >
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="bg-sky-100 p-1 rounded-full text-sky-700">
                        <Video className="w-4 h-4 animate-pulse text-sky-600" />
                      </div>
                      <span className="font-extrabold text-sky-950 text-[11px] uppercase tracking-wider">
                        📹 Buzzi Videoverbinding
                      </span>
                    </div>
                    <p className="text-slate-700 mb-3.5 leading-relaxed text-[11px]">
                      <strong>{msg.senderName}</strong> nodigt je uit voor een <strong>videogesprek</strong> op de live webcam! Neem je op?
                    </p>
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-500 font-mono">Status: Oproep...</span>
                      {isMe ? (
                        <span className="text-[10px] text-slate-400 italic font-medium">Bellen...</span>
                      ) : (
                        <button
                          onClick={() => {
                            setShowWebcamCall(true);
                            hiveAudio.playHoneyPop();
                          }}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-3 py-1.5 rounded border-b-2 border-sky-800 text-[10px] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          📞 OPNEMEN
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-0.5 leading-relaxed font-sans"
                >
                  {/* Buzzi style message header: "Robbin zegt (12:04):" */}
                  <div className="text-xs select-none flex items-center gap-1 pt-1">
                    <span className={`font-bold inline-flex items-center gap-1.5 ${isMe ? "text-slate-500" : isQueen ? "text-sky-700" : "text-emerald-700"}`}>
                      {(msg.senderName?.toLowerCase().includes("robbin") || msg.senderName?.toLowerCase().includes("admin") || msg.senderName?.toLowerCase().includes("operator")) && (
                        <span className="text-amber-500 animate-pulse text-[11px]" title="Buzzi Systeem Administrator 👑">👑</span>
                      )}
                      {msg.senderName} zegt:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({msg.timestamp})</span>
                  </div>

                  {/* Buzzi style message content text inside window */}
                  {msg.fileTransfer ? (
                    <FileTransfer
                      fileName={msg.fileTransfer.name}
                      fileSize={msg.fileTransfer.size}
                      isMe={isMe}
                      senderName={msg.senderName}
                      dataUrl={msg.fileTransfer.dataUrl}
                      onFinished={() => {
                        // After sending completes successfully, we can simulate an automated speech bubble!
                        if (isMe && activeId) {
                          setTimeout(() => {
                            let responsePhrase = "Bedankt voor het bestand! Ontvangen op mijn pc. :-) (Y)";
                            if (activeId === "queen") {
                              responsePhrase = "📊 DIRECT_P2P RECEIVE: Bestand ontvangen en opgeslagen in mijn retro-AI databasesectie! Hartelijk dank! 👍";
                            } else if (activeId === "kelly") {
                              responsePhrase = "Aah thx!! Leuk nostalgia bestandje zeg! (H)";
                            } else if (activeId === "wouter") {
                              responsePhrase = "Super vet! Ik zet hem direct op mijn bureaublad! \\m/";
                            } else if (activeId === "danny") {
                              responsePhrase = "Hoppa, bestand binnengehaald op 45 KB/s! Werkt perfect!";
                            } else if (activeId === "sanne") {
                              responsePhrase = "Ooh super lief!! Dankjewel voor het doorsturen! ✨";
                            }
                            
                            onSendMessage(responsePhrase, false);
                          }, 1500);
                        }
                      }}
                    />
                  ) : (
                    <div 
                      className="text-sm pl-4 pr-1 break-words whitespace-pre-wrap selection:bg-amber-200"
                      style={{ 
                        color: isMe ? mmsColor : isQueen ? "#111111" : "#1a1a1a",
                        fontFamily: isMe ? mmsFont : "sans-serif",
                        fontWeight: isMe && isBold ? "bold" : "normal"
                      }}
                    >
                      {renderMessageContent(msg.text)}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Buzzi Ticker indicator "Buzzi Bot is typing a message..." */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] text-slate-400 italic pl-4 py-1.5 flex items-center gap-2.5"
              >
                <div className="flex gap-0.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce delay-300" />
                </div>
                <span>
                  {activeContact ? activeContact.name : "Je gesprekspartner"} is een bericht aan het typen...
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Column 2: Side Display Pictures (The iconic huge Buzzi avatars on the right) */}
        <div className="w-[105px] border-l border-[#bad0e3]/60 bg-[#edf3f9] p-3 flex flex-col justify-between items-center select-none flex-shrink-0">
          
          {/* Active Contact Avatar */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold tracking-tight uppercase mb-1">Hun DP</span>
            <div className="w-[82px] h-[82px] bg-white p-1 rounded border-2 border-[#aabed4] shadow flex items-center justify-center overflow-hidden">
              {activeContact && isCustomAvatar(activeContact.avatar) ? (
                <img src={activeContact.avatar} alt="Active Contact" className="w-full h-full object-cover rounded-xs" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-4xl filter drop-shadow-sm select-none">
                  {activeContact ? activeContact.avatar : "👥"}
                </span>
              )}
            </div>
            <span className="text-[9.5px] font-semibold text-slate-600 truncate max-w-[80px] mt-1 text-center font-mono">
              {activeContact ? activeContact.name.split(" ")[0] : "Groep"}
            </span>
          </div>

          <div className="h-px w-14 bg-slate-300/60 my-2" />

          {/* My Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-[82px] h-[82px] bg-white p-1 rounded border-2 border-[#aabed4] shadow flex items-center justify-center overflow-hidden hover:rotate-2 transition-transform">
              {isCustomAvatar(myAvatar) ? (
                <img src={myAvatar} alt="My Avatar" className="w-full h-full object-cover rounded-xs" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-4xl filter drop-shadow-sm select-none">{myAvatar}</span>
              )}
            </div>
            <span className="text-[9.5px] font-semibold text-slate-600 truncate max-w-[80px] mt-1 text-center font-mono">
              {myDisplayName.split(" ")[0]}
            </span>
            <span className="text-[9px] text-[#2c659e] font-bold mt-0.5">Jijzelf</span>
          </div>

        </div>

        {/* Full-screen retro Buzzi Winks Overlays */}
        {activeWink && (
          <div 
            onClick={() => setActiveWink(null)}
            className="absolute inset-0 z-50 pointer-events-auto cursor-pointer"
            title="Klik ergens om te sluiten"
          >
            {/* Authentic Buzzi Close Button for Winks */}
            {showWinkClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveWink(null);
                }}
                className="absolute top-4 right-4 bg-white/95 hover:bg-white text-slate-800 hover:text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold font-sans text-sm border border-slate-300 shadow-md z-50 pointer-events-auto cursor-pointer transition-all active:scale-90"
                title="Sluit knipoog"
              >
                ✕
              </button>
            )}

            {/* Pink Pig Wink */}
            {activeWink === "pig" && (
              <div className="absolute inset-0 bg-pink-100/30 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <div className="absolute top-10 left-10 text-xl animate-pulse opacity-40">🎈</div>
                <div className="absolute bottom-16 right-12 text-2xl animate-pulse opacity-40">🎈</div>

                <motion.div
                  initial={{ y: 200, scale: 0.3, rotate: -45 }}
                  animate={{ 
                    y: [150, -20, 10, -5, 0], 
                    scale: [0.3, 1.4, 1.4, 1.2, 1.2],
                    rotate: [0, 15, -15, 10, 0]
                  }}
                  transition={{ duration: 1.8, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <motion.div 
                    animate={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ delay: 1, duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    className="text-[120px] sm:text-[160px] filter drop-shadow-xl select-none"
                  >
                    🐷
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.5, 2, 0.5], y: [-20, -120, -180, -200] }}
                    transition={{ delay: 1.5, duration: 2 }}
                    className="text-4xl absolute pointer-events-none"
                  >
                    💖
                  </motion.div>

                  <div className="text-pink-700 font-extrabold text-xs font-sans tracking-wide bg-white/95 border border-pink-200 shadow-md px-4 py-2 rounded-full mt-4 animate-bounce">
                    *OINK OINK!* 🐽 *Knipoog!*
                  </div>
                </motion.div>
              </div>
            )}

            {/* Crazy Laugh Wink */}
            {activeWink === "crazy" && (
              <div className="absolute inset-0 bg-yellow-50/10 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.5] }}
                  transition={{ delay: 0.5, duration: 1.5 }}
                  className="absolute top-1/4 left-10 bg-amber-400 ring-4 ring-white text-stone-900 font-extrabold text-xs px-3 py-1.5 rounded-lg -rotate-12 shadow-lg"
                >
                  HA HA HA! 😂
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.5] }}
                  transition={{ delay: 1.2, duration: 1.5 }}
                  className="absolute bottom-1/4 right-8 bg-[#e31e24] ring-4 ring-white text-white font-extrabold text-xs px-3 py-1.5 rounded-lg rotate-12 shadow-lg"
                >
                  W00T! XD
                </motion.div>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: [0, 1.6, 1.6, 1.4, 0], 
                    rotate: [0, 20, -20, 20, -720] 
                  }}
                  transition={{ duration: 3.5, ease: "easeInOut" }}
                  className="flex flex-col items-center"
                >
                  <div className="text-[130px] sm:text-[180px] filter drop-shadow-2xl animate-bounce">
                    🤪
                  </div>
                  <div className="bg-amber-400 font-bold border-2 border-stone-800 text-stone-900 text-xs shadow-md px-4 py-1.5 rounded-xl mt-2 animate-pulse">
                    Lachen is gezond! :-P
                  </div>
                </motion.div>
              </div>
            )}

            {/* Water Balloon Wink */}
            {activeWink === "water" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.1, 1], opacity: [0, 1, 1, 1] }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="absolute inset-0 bg-[#00aeef]/20 flex flex-col items-center justify-center"
                >
                  <div className="text-sky-500 text-[180px] sm:text-[250px] font-extrabold filter drop-shadow opacity-95 animate-pulse">
                    💦
                  </div>
                  <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#00aeef]/25 via-[#00aeef]/10 to-transparent blur-xs pointer-events-none" />

                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: [0, 100, 250], opacity: [0, 0.8, 0] }}
                    transition={{ delay: 0.7, duration: 3.5 }}
                    className="text-4xl absolute font-bold text-sky-600/80"
                  >
                    💧
                  </motion.div>

                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: [0, 80, 200], opacity: [0, 0.8, 0] }}
                    transition={{ delay: 1, duration: 4 }}
                    className="text-4xl absolute font-bold text-sky-600/80 left-[15%]"
                  >
                    💧
                  </motion.div>

                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: [0, 120, 280], opacity: [0, 0.8, 0] }}
                    transition={{ delay: 0.5, duration: 3 }}
                    className="text-5xl absolute font-bold text-sky-600/80 right-[20%]"
                  >
                    💧
                  </motion.div>

                  <div className="absolute bottom-16 bg-white/95 border-2 border-sky-400 shadow-md px-4 py-2 rounded-xl text-sky-800 font-extrabold text-xs animate-bounce">
                    *SPLASSHHH!* 🎈💦 Je scherm is nat!
                  </div>
                </motion.div>
              </div>
            )}

            {/* Air Guitar Wink */}
            {activeWink === "guitar" && (
              <div className="absolute inset-0 bg-indigo-950/30 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <div className="absolute top-8 left-1/4 text-4xl animate-bounce">⚡</div>
                <div className="absolute top-1/2 right-1/4 text-5xl animate-pulse">⚡</div>
                <div className="absolute bottom-12 left-12 text-3xl animate-bounce">⚡</div>

                <div className="absolute top-12 right-12 text-3xl animate-pulse text-indigo-300">🎵</div>
                <div className="absolute bottom-20 right-20 text-4xl animate-bounce text-indigo-300">🎶</div>

                <motion.div
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: [0, 1.4, 1.5, 1.3, 0],
                    rotate: [0, 360, 340, 380, 720]
                  }}
                  transition={{ duration: 4.5, ease: "easeInOut" }}
                  className="flex flex-col items-center"
                >
                  <div className="text-[130px] sm:text-[180px] filter drop-shadow-2xl animate-bounce">
                    🎸
                  </div>
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-900 font-black border-2 border-stone-900 shadow-lg px-5 py-2 rounded-xl mt-4 text-xs tracking-widest uppercase animate-pulse">
                    🎸 *ROCK ON!* 🤘⚡
                  </div>
                </motion.div>
              </div>
            )}

            {/* Heartburst Wink */}
            {activeWink === "heart" && (
              <div className="absolute inset-0 bg-red-50/10 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0], 
                    scale: [0.2, 1.5, 1.5, 0.4],
                    x: [-20, -180, -250],
                    y: [0, -100, -150]
                  }}
                  transition={{ duration: 3 }}
                  className="absolute text-3xl pointer-events-none"
                >
                  💖
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0], 
                    scale: [0.2, 1.5, 1.5, 0.4],
                    x: [20, 180, 250],
                    y: [0, -120, -160]
                  }}
                  transition={{ duration: 2.8 }}
                  className="absolute text-3xl pointer-events-none"
                >
                  💕
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0], 
                    scale: [0.2, 1.5, 1.5, 0.4],
                    x: [-30, -130, -180],
                    y: [0, 120, 180]
                  }}
                  transition={{ duration: 3.2 }}
                  className="absolute text-3xl pointer-events-none"
                >
                  💓
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0], 
                    scale: [0.2, 1.5, 1.5, 0.4],
                    x: [30, 130, 180],
                    y: [0, 140, 200]
                  }}
                  transition={{ duration: 2.9 }}
                  className="absolute text-3xl pointer-events-none"
                >
                  💝
                </motion.div>

                <motion.div
                  initial={{ scale: 0.3 }}
                  animate={{ 
                    scale: [0.3, 1.4, 1.4, 0],
                  }}
                  transition={{ duration: 4.5, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="text-[130px] sm:text-[180px] filter drop-shadow-2xl"
                  >
                    ❤️
                  </motion.div>
                  <div className="bg-red-500 text-white font-extrabold border-2 border-red-200 shadow-md px-4 py-2 rounded-full mt-4 text-xs tracking-wide animate-bounce">
                    *KABOOM!* ❤️ Hartjes Liefde!
                  </div>
                </motion.div>
              </div>
            )}

            {/* Spooky Ghost Wink */}
            {activeWink === "ghost" && (
              <div className="absolute inset-0 bg-emerald-950/20 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <motion.div
                  initial={{ x: -300, y: 100, scale: 0.2 }}
                  animate={{ 
                    x: [-300, 100, -50, 0],
                    y: [100, -80, 50, 0],
                    scale: [0.2, 1.8, 1.5, 1.3] 
                  }}
                  transition={{ duration: 4.5, ease: "easeInOut" }}
                  className="flex flex-col items-center"
                >
                  <div className="text-[130px] sm:text-[180px] filter drop-shadow-[0_15px_15px_rgba(52,211,153,0.4)] animate-bounce">
                    👻
                  </div>
                  <div className="bg-[#8cc63f] text-slate-900 font-extrabold border-2 border-slate-900 shadow-lg px-5 py-2 rounded-xl mt-4 text-xs animate-pulse">
                    🎃 BOE!!! SCHROK JE? 😱👻
                  </div>
                </motion.div>
              </div>
            )}

            {/* Smaak Kus Wink */}
            {activeWink === "kiss" && (
              <div className="absolute inset-0 bg-rose-200/20 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ 
                    scale: [0, 2.2, 1.8],
                    rotate: [0, 15, -10]
                  }}
                  transition={{ duration: 1.5, ease: "backOut" }}
                  className="flex flex-col items-center"
                >
                  <div className="text-[140px] sm:text-[200px] filter drop-shadow-[0_10px_10px_rgba(225,29,72,0.5)]">
                    💋
                  </div>
                  <div className="bg-rose-600 text-white font-black border-2 border-white shadow-xl px-4 py-2 rounded-full mt-4 text-xs animate-bounce uppercase tracking-wide">
                    *SMACK!* 💋 Een dikke kus!
                  </div>
                </motion.div>
              </div>
            )}

            {/* Retro Disco Bal Wink */}
            {activeWink === "disco" && (
              <div className="absolute inset-0 bg-fuchsia-950/30 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/10 via-cyan-500/10 to-transparent animate-pulse pointer-events-none" />
                <motion.div
                  initial={{ y: -300, scale: 0.5 }}
                  animate={{ 
                    y: [-300, 0, -20, 0],
                    scale: [0.5, 1.5, 1.3, 1.3]
                  }}
                  transition={{ duration: 2.2, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="text-[140px] sm:text-[180px] filter drop-shadow-[0_10px_20px_rgba(168,85,247,0.6)]"
                  >
                    🪩
                  </motion.div>
                  <div className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-extrabold border-2 border-white shadow-lg px-6 py-2 rounded-xl mt-6 text-xs uppercase tracking-widest animate-pulse">
                    🕺 FEESTJE! DANSEN! 💃✨
                  </div>
                </motion.div>
              </div>
            )}

            {/* Laser Ogen Wink */}
            {activeWink === "laser" && (
              <div className="absolute inset-0 bg-red-950/20 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.4, 1.4, 1.2, 0] }}
                  transition={{ duration: 4.5 }}
                  className="flex flex-col items-center relative"
                >
                  <div className="text-[120px] filter drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] relative animate-bounce">
                    👀
                    <div className="absolute top-[35%] left-[20%] w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_15px_6px_rgba(239,68,68,1)] animate-ping" />
                    <div className="absolute top-[35%] right-[20%] w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_15px_6px_rgba(239,68,68,1)] animate-ping" />
                  </div>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: ["0%", "100%", "100%", "0%"] }}
                    transition={{ delay: 0.5, duration: 3 }}
                    className="absolute h-1 bg-red-500 shadow-[0_0_10px_3px_rgba(239,68,68,1)] top-16 left-1/2 -translate-x-1/2"
                  />
                  <div className="bg-red-600 text-white font-black border-2 border-red-200 shadow-xl px-4 py-2 rounded-full mt-4 text-xs tracking-wider animate-pulse uppercase">
                    ⚡ LASERBLIK GEACTIVEERD! 👁️🔥
                  </div>
                </motion.div>
              </div>
            )}

            {/* Spaceship UFO Wink */}
            {activeWink === "alien" && (
              <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: [0, 0.6, 0.6, 0], height: ["0%", "80%", "80%", "0%"] }}
                  transition={{ delay: 0.8, duration: 3.2 }}
                  className="absolute top-10 w-44 bg-gradient-to-b from-green-400/60 to-transparent blur-xs"
                />
                <motion.div
                  initial={{ y: -200 }}
                  animate={{ y: [-200, -50, -50, -250] }}
                  transition={{ duration: 4.5, times: [0, 0.2, 0.8, 1] }}
                  className="flex flex-col items-center relative animate-bounce"
                >
                  <div className="text-[120px] filter drop-shadow-[0_10px_20px_rgba(74,222,128,0.5)]">
                    🛸
                  </div>
                  <motion.div
                    initial={{ y: 200, opacity: 0, scale: 0.5 }}
                    animate={{ y: [200, 30, -20], opacity: [0, 1, 0], scale: [0.5, 1.2, 0.2] }}
                    transition={{ delay: 1.2, duration: 2.2 }}
                    className="text-4xl absolute"
                  >
                    🐮
                  </motion.div>
                </motion.div>
                <div className="absolute bottom-16 bg-green-500 text-stone-950 font-black border-2 border-white shadow-xl px-4 py-2 rounded-full text-xs animate-bounce uppercase">
                  👽 WE ARE NOT ALONE! 🛸✨
                </div>
              </div>
            )}

            {/* Dansende Banaan Wink */}
            {activeWink === "banana" && (
              <div className="absolute inset-0 bg-yellow-500/10 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <motion.div
                  initial={{ x: -300, rotate: 0 }}
                  animate={{ 
                    x: [-300, 0, 0, 300], 
                    rotate: [0, 360, 720, 1080],
                    y: [0, -30, 30, 0] 
                  }}
                  transition={{ duration: 4.5, times: [0, 0.25, 0.75, 1] }}
                  className="flex flex-col items-center relative"
                >
                  <motion.div
                    animate={{ y: [-15, 15, -15] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="text-[140px] filter drop-shadow-xl select-none"
                  >
                    🍌
                  </motion.div>
                  <div className="bg-yellow-400 text-stone-900 font-bold border-2 border-stone-950 shadow-md px-4 py-2 rounded-xl mt-4 text-xs tracking-wider animate-bounce">
                    🍌 IT'S PEANUT BUTTER JELLY TIME! 💃
                  </div>
                </motion.div>
              </div>
            )}

            {/* Miauwend Poesje Wink */}
            {activeWink === "cat" && (
              <div className="absolute inset-0 bg-orange-100/20 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <motion.div
                  initial={{ y: 250, opacity: 0, scale: 0.2 }}
                  animate={{ 
                    y: [250, 0, -20, 0], 
                    opacity: [0, 1, 1, 1],
                    scale: [0.2, 1.3, 1.1, 1]
                  }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{ rotate: [-8, 8, -8] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                    className="text-[150px] filter drop-shadow-xl"
                  >
                    🐱
                  </motion.div>
                  <div className="bg-gradient-to-r from-orange-400 to-amber-500 text-white font-extrabold border-2 border-orange-600 shadow-xl px-5 py-2.5 rounded-full text-xs uppercase tracking-widest animate-pulse mt-3">
                    🐾 Miaaauuuuw! *Spint vrolijk* 😽
                  </div>
                </motion.div>
              </div>
            )}

            {/* Kwispelend Hondje Wink */}
            {activeWink === "dog" && (
              <div className="absolute inset-0 bg-blue-50/30 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: [0, 1.4, 1.1], rotate: [-180, 15, 0] }}
                  transition={{ duration: 1.5 }}
                  className="flex flex-col items-center relative"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 0.25 }}
                    className="text-[140px] filter drop-shadow-2xl z-10"
                  >
                    🐶
                  </motion.div>
                  {/* Drool screen splat simulation */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.8, 1.5], opacity: [0, 0.75, 0.75] }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute inset-x-0 -top-10 w-44 h-44 mx-auto rounded-full bg-cyan-200/40 border-4 border-cyan-100/60 blur-xs flex items-center justify-center"
                  >
                    <span className="text-[50px] animate-pulse">💦</span>
                  </motion.div>
                  <div className="bg-sky-600 text-white font-black border-2 border-sky-800 shadow-xl px-4 py-2 rounded-xl text-xs uppercase tracking-wide animate-bounce mt-4 z-20">
                    🐾 Woef woef! *Likt je beeldscherm af!* 👅
                  </div>
                </motion.div>
              </div>
            )}

            {/* Draaiende Drol Wink */}
            {activeWink === "poop" && (
              <div className="absolute inset-0 bg-amber-900/10 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <motion.div
                  initial={{ y: -300, scale: 0.1, rotate: 0 }}
                  animate={{ 
                    y: [-300, 30, -10, 0], 
                    scale: [0.1, 1.3, 1],
                    rotate: [0, 720, 1080]
                  }}
                  transition={{ duration: 2.2, ease: "backOut" }}
                  className="flex flex-col items-center"
                >
                  <div className="text-[150px] filter drop-shadow-xl animate-bounce">
                    💩
                  </div>
                  <div className="bg-amber-800 text-amber-50 font-extrabold border-2 border-amber-950 shadow-2xl px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider mt-4 flex items-center gap-1.5 animate-pulse">
                    💨 *PFFFRRTT!* GRAVITEIT GEVERFDE SCHEET! 💨
                  </div>
                </motion.div>
              </div>
            )}

            {/* Euro Geldregen Wink */}
            {activeWink === "money" && (
              <div className="absolute inset-0 bg-emerald-950/10 flex flex-col items-center justify-between pointer-events-auto overflow-hidden select-none animate-fade-in p-10">
                <div className="absolute inset-0 flex flex-wrap gap-8 justify-around content-start opacity-75 overflow-hidden z-10">
                  {[...Array(24)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: -100, x: Math.random() * 40 - 20, rotate: Math.random() * 360, opacity: 0 }}
                      animate={{ 
                        y: [ -100, 600 ], 
                        opacity: [0, 1, 1, 0],
                        rotate: Math.random() * 720 + 180
                      }}
                      transition={{ 
                        duration: 3 + Math.random() * 2, 
                        delay: Math.random() * 1.5,
                        repeat: Infinity 
                      }}
                      className="text-4xl shrink-0"
                    >
                      {i % 3 === 0 ? "💸" : i % 3 === 1 ? "💵" : "💶"}
                    </motion.div>
                  ))}
                </div>

                <div className="m-auto z-20 flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.4, 1] }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="p-8 bg-emerald-600 border-4 border-white text-white rounded-full shadow-2xl flex flex-col items-center text-center justify-center shrink-0 w-44 h-44"
                  >
                    <span className="text-6xl animate-bounce">💰</span>
                    <span className="text-lg font-black tracking-tighter mt-1">€ CA$H €</span>
                  </motion.div>
                  <div className="bg-emerald-900/90 text-emerald-300 border border-emerald-500 shadow-xl px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase mt-6 tracking-wide animate-pulse z-20">
                    💰 MAAK BIJLAGE: BUZZI PREMIUM VERDIENSTEN! 💎
                  </div>
                </div>
              </div>
            )}

            {/* Dansende Buzzi Pinguïn Wink */}
            {activeWink === "pinguin" && (
              <div className="absolute inset-0 bg-blue-900/15 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in">
                <div className="absolute inset-x-0 bottom-12 flex justify-between px-12 opacity-30 pointer-events-none">
                  <span className="text-8xl animate-bounce">❄️</span>
                  <span className="text-8xl animate-bounce delay-300">❄️</span>
                </div>
                <motion.div
                  initial={{ x: -250, y: 100, rotate: -20, scale: 0.5 }}
                  animate={{
                    x: [-250, 0, 50, -50, 0],
                    y: [100, -20, 10, -10, 0],
                    rotate: [-20, 15, -15, 12, 0],
                    scale: [0.5, 1.4, 1]
                  }}
                  transition={{ duration: 2.8, ease: "easeInOut" }}
                  className="flex flex-col items-center z-20"
                >
                  <div className="text-[140px] filter drop-shadow-2xl animate-pulse relative">
                    🐧
                    <span className="absolute -top-3 -right-3 text-4xl animate-bounce">🎵</span>
                  </div>
                  
                  <div className="bg-blue-600 text-white font-extrabold border-2 border-white shadow-2xl px-5 py-2.5 rounded-full text-xs uppercase tracking-wider mt-4 animate-bounce border-b-4 border-r-4">
                    🐧 WADDLE WADDLE! De legendarische tango-pinguïn is er! 🐧
                  </div>
                </motion.div>
              </div>
            )}

            {/* Buzzi Heartbreaker Wink */}
            {activeWink === "heartbreaker" && (
              <div className="absolute inset-0 bg-red-900/10 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in p-6">
                <div className="absolute inset-0 opacity-40 z-10 pointer-events-none flex flex-wrap gap-12 justify-around">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 300, scale: 0.2 }}
                      animate={{ y: -400, scale: [0.2, 1.2, 0.5] }}
                      transition={{ duration: 3, delay: i * 0.15, repeat: Infinity }}
                      className="text-3xl"
                    >
                      💔
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ scale: 0.1, y: -100 }}
                  animate={{
                    scale: [0.1, 1.5, 1.1, 1],
                    y: [-100, 20, 0]
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="z-20 text-center flex flex-col items-center"
                >
                  <div className="text-[160px] filter drop-shadow-2xl relative">
                    <motion.span
                      animate={{
                        rotate: [0, -5, 5, -15, 15],
                        scale: [1, 1.05, 0.95, 1],
                      }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="inline-block"
                    >
                      💔
                    </motion.span>
                  </div>

                  <div className="bg-red-700 text-red-50 font-black border-2 border-red-900 shadow-2xl px-6 py-3 rounded-lg text-xs uppercase tracking-wide mt-4 animate-pulse">
                    💔 BUZZI HEARTBREAKER... WIJ ZIJN DOOR HET DOLLE HEEN! 💔
                  </div>
                </motion.div>
              </div>
            )}

            {/* Retro Matrix Rain Wink */}
            {activeWink === "matrix" && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in p-10 font-mono">
                <div className="absolute inset-0 grid grid-cols-12 opacity-30 select-none overflow-hidden text-[10px] text-green-500 font-mono leading-none z-10">
                  {[...Array(12)].map((_, col) => (
                    <motion.div
                      key={col}
                      initial={{ y: -500 }}
                      animate={{ y: 500 }}
                      transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 2
                      }}
                      className="flex flex-col gap-0.5"
                    >
                      {"010101110011011001010101BUZZIPROFIELREGELN".split("").map((char, index) => (
                        <span key={index} className="text-emerald-400 font-bold opacity-80">{char}</span>
                      ))}
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="z-20 border border-green-500 bg-black/80 p-6 rounded-md text-center max-w-sm shadow-emerald-500/20 shadow-2xl"
                >
                  <div className="text-5xl mb-4 animate-pulse">👾</div>
                  <h3 className="text-emerald-400 font-bold tracking-widest text-[13px] uppercase mb-2">Hacking Chat Terminal</h3>
                  <div className="text-emerald-500 text-[10px] tracking-wide mb-4 leading-relaxed bg-black/50 p-2.5 rounded border border-emerald-900/40 text-left">
                    CD .. <br />
                    LOADING DIRECT CHAT PROTOCOL v1.0.4... <br />
                    SECURE CONSOLE ACCESSED SUCCESFULLY ✅ <br />
                    BUZZI SYSTEMS IN CONTROL...
                  </div>
                  <div className="text-xs text-black bg-emerald-500 font-bold px-3 py-1 rounded inline-block animate-pulse">
                    📟 MATRIX OVERRIDE
                  </div>
                </motion.div>
              </div>
            )}

            {/* Buzzi Honingbij Wink */}
            {activeWink === "bee" && (
              <div className="absolute inset-0 bg-amber-500/10 flex flex-col items-center justify-center pointer-events-auto overflow-hidden select-none animate-fade-in p-6 font-sans">
                <div className="absolute inset-0 z-10 pointer-events-none flex flex-wrap gap-20">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0, rotate: 0 }}
                      animate={{
                        scale: [0, 1.2, 1],
                        opacity: [0, 0.9, 0.9, 0],
                        y: [50, -100]
                      }}
                      transition={{ duration: 2.2, delay: i * 0.3 }}
                      className="text-4xl absolute"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${15 + Math.random() * 70}%`
                      }}
                    >
                      🍯
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ x: 150, y: -200, scale: 0.2 }}
                  animate={{
                    x: [150, -50, 50, 0],
                    y: [-200, 50, -20, 0],
                    scale: [0.2, 1.5, 1.1, 1]
                  }}
                  transition={{ duration: 2.4, ease: "backOut" }}
                  className="z-20 text-center flex flex-col items-center"
                >
                  <div className="text-[150px] animate-bounce filter drop-shadow-2xl">
                    🐝
                  </div>

                  <div className="bg-amber-655 text-amber-50 bg-amber-600 border-2 border-amber-950 px-5 py-2.5 rounded-xl shadow-2xl text-[11px] uppercase tracking-wider mt-4 animate-pulse border-b-4 border-r-4">
                    🍯 ZOEM ZOEM! Zoete Honing Direct op je Scherm! 🍯
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

      </div>



      {/* Blocked Contact Warning Banner */}
      {isBlocked && (
        <div className="bg-red-50 border-t border-b border-red-200 text-red-800 px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-pulse shrink-0">
          <span>⚠️ Je hebt deze contactpersoon geblokkeerd. Deblokkeer eerst om berichten te sturen of te ontvangen.</span>
        </div>
      )}

      {/* Input Action Panel (Separated into rich area text in MSI clone) */}
      <div className="p-4 bg-white border-t border-[#bad0e3] shadow-inner-lg">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          
          {/* Quick-action trigger */}
          <button 
            type="button"
            onClick={triggerNudge}
            disabled={isBlocked}
            className={`p-3 rounded-xl border transition-all focus:outline-none flex-shrink-0 active:scale-90 ${
              isBlocked 
                ? "bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed" 
                : "bg-red-50 hover:bg-red-100 hover:text-red-700 text-red-500 border border-red-200 cursor-pointer"
            }`}
            title={isBlocked ? "Gedeblokkeerd vereist" : "Geef een Duwtje!"}
          >
            <Volume2 className={`w-5 h-5 ${isBlocked ? "text-stone-300" : "text-red-500 animate-pulse"}`} />
          </button>

          {/* Chat input form */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              disabled={isBlocked}
              onChange={(e) => {
                setInputText(e.target.value);
                if (onUserTyping) {
                  onUserTyping();
                }
              }}
              onKeyDown={handleKeyPress}
              placeholder={
                isBlocked
                  ? "⚠️ " + t("Deblokkeer")
                  : activeId === "queen"
                    ? "🤖 Buzzi Bot (H) - 2004..."
                    : t("Typ een bericht...")
              }
              className={`w-full border rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 placeholder-stone-400 font-sans shadow-inner ${
                isBlocked
                  ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                  : "bg-stone-50 text-stone-900 border-slate-300 focus:ring-[#1d5c8a]/50 focus:border-[#1d5c8a]"
              }`}
              maxLength={1000}
            />
            {inputText.trim() && !isBlocked && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 text-xs font-mono select-none">
                {inputText.length}/1000
              </span>
            )}
          </div>

          {/* Send buttons */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isBlocked}
            className={`p-3 rounded-xl transition-all shadow focus:outline-none flex-shrink-0 flex items-center justify-center ${
              inputText.trim() && !isBlocked
                ? "bg-[#2576b5] hover:bg-[#1d5c8a] active:scale-95 text-white cursor-pointer"
                : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200/50 shadow-none"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Absolute Overlays for Webcam calling and Gaming */}
      {showWebcamCall && activeContact && (
        <WebcamCall
          activeContactId={activeId}
          activeContactName={activeContact.name}
          activeContactAvatar={activeContact.avatar}
          myUserId={myUserId}
          onClose={() => setShowWebcamCall(false)}
        />
      )}

      {showGameDuel && activeContact && (
        <ChatGameDuel
          activeContactId={activeId}
          activeContactName={activeContact.name}
          activeContactAvatar={activeContact.avatar}
          myUserId={myUserId}
          myDisplayName={myDisplayName}
          initialGameId={currentGameId}
          onClose={() => {
            setShowGameDuel(false);
            setCurrentGameId(undefined);
          }}
          onSendGameStatusMessage={(statusText, isGameDuel, gameType, gId) => {
            onSendMessage(
              statusText,
              false,
              false,
              undefined,
              undefined,
              isGameDuel,
              gameType,
              gId
            );
          }}
        />
      )}
    </motion.div>
  );
};
