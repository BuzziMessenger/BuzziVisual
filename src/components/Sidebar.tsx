/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Channel, Contact, StatusType } from "../types";
import { hiveAudio } from "../utils/audio";
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Music, 
  ChevronDown as DropdownIcon,
  Search,
  MessageSquare,
  Bot,
  Trash2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Disc,
  Radio,
  Sliders
} from "lucide-react";

interface TrackItem {
  title: string;
  url: string;
  artist: string;
  genre: string;
}

const RETRO_PLAYLIST: TrackItem[] = [
  {
    title: "Radio 538 (Live FM) 📻",
    url: "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO538.mp3",
    artist: "TALPA Network",
    genre: "Pop / Top 40"
  },
  {
    title: "Qmusic NL (Live) 📻",
    url: "https://stream.qmusic.nl/qmusic/mp3",
    artist: "DPG Media",
    genre: "Actuele Pop & Hits"
  },
  {
    title: "Radio 10 (Live) 📻",
    url: "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO10.mp3",
    artist: "TALPA Network",
    genre: "Classic Hits"
  },
  {
    title: "Sky Radio (Live) 📻",
    url: "https://playerservices.streamtheworld.com/api/livestream-redirect/SKYRADIO.mp3",
    artist: "TALPA Network",
    genre: "Easy Listening"
  },
  {
    title: "Lekker Rocken: Radio Veronica 📻",
    url: "https://playerservices.streamtheworld.com/api/livestream-redirect/VERONICA.mp3",
    artist: "TALPA Network",
    genre: "Pop & Rock Classics"
  },
  {
    title: "KINK (Alternative Rock) 🎸",
    url: "https://stream.kink.nl/kink.mp3",
    artist: "KINK",
    genre: "Alternative Rock"
  },
  {
    title: "Arrow Classic Rock ⚡",
    url: "https://stream.arrow.nl/arrowrock_mp3",
    artist: "Arrow Classic",
    genre: "Classic Rock"
  },
  {
    title: "JOE (Live Retro Hits) 🕺",
    url: "https://stream.joe.nl/joe_nl/mp3",
    artist: "DPG Media",
    genre: "70s, 80s & 90s Hits"
  },
  {
    title: "SLAM! (Live Electronic) 🔊",
    url: "https://stream.slam.nl/slam_mp3",
    artist: "Mediahuis",
    genre: "Dance & House Hits"
  },
  {
    title: "100% NL (Nederpoppunk) 🇳🇱",
    url: "https://stream.100p.nl/100pctnl.mp3",
    artist: "Mediahuis",
    genre: "Nederlandse Muziek"
  },
  {
    title: "NPO Radio 2 (Live) 📻",
    url: "https://icecast.omroep.nl/radio2-bb-mp3",
    artist: "Publieke Omroep",
    genre: "Pop & Classic Rock"
  },
  {
    title: "NPO 3FM (Live & Nieuw) 📻",
    url: "https://icecast.omroep.nl/3fm-bb-mp3",
    artist: "Publieke Omroep",
    genre: "Pop / Rock & Indie"
  },
  {
    title: "Sublime FM (Jazz & Soul) 🎷",
    url: "https://stream.sublime.nl/sublime_mp3",
    artist: "Mediahuis",
    genre: "Funk, Soul & Jazz"
  },
  {
    title: "BNR Nieuwsradio (Live) 📰",
    url: "https://stream.bnr.nl/bnr_mp3",
    artist: "FD Mediagroep",
    genre: "Nieuws & Actualiteiten"
  },
  {
    title: "Radio 10 - 80s Hits 💫",
    url: "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO10_80S_HITS.mp3",
    artist: "TALPA Network",
    genre: "80s Pop Classics"
  },
  {
    title: "NPO Klassiek (Radio 4) 🎻",
    url: "https://icecast.omroep.nl/radio4-bb-mp3",
    artist: "Publieke Omroep",
    genre: "Klassieke Muziek"
  }
];

interface SidebarProps {
  channels: Channel[];
  contacts: Contact[];
  activeId: string;
  activeType: "channel" | "dm";
  onSelectChannel: (channelId: string) => void;
  onSelectDM: (contactId: string) => void;
  userEmail: string;
  onSignOut?: () => void;
  onDeleteContact?: (contactId: string) => void;
  onCreateChannel?: (name: string, description: string) => Promise<boolean>;
  onAddContact?: (name: string, email: string, avatar: string) => Promise<boolean>;
  
  // Custom User Profile State for Buzzi Clone
  userDisplayName: string;
  onUpdateDisplayName: (name: string) => void;
  userPersonalMessage: string;
  onUpdatePersonalMessage: (msg: string) => void;
  userStatus: StatusType;
  onUpdateStatus: (status: StatusType) => void;
  userAvatar: string;
  onUpdateAvatar: (avatar: string) => void;
  userListeningTo: string;
  onUpdateListeningTo: (msg: string) => void;

  friendRequests?: any[];
  onAcceptFriendRequest?: (id: string, fromName: string, fromEmail: string) => void;
  onDeclineFriendRequest?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  channels,
  contacts,
  activeId,
  activeType,
  onSelectChannel,
  onSelectDM,
  userEmail,
  onSignOut,
  onDeleteContact,
  onCreateChannel,
  onAddContact,
  userDisplayName,
  onUpdateDisplayName,
  userPersonalMessage,
  onUpdatePersonalMessage,
  userStatus,
  onUpdateStatus,
  userAvatar,
  onUpdateAvatar,
  userListeningTo,
  onUpdateListeningTo,
  friendRequests = [],
  onAcceptFriendRequest,
  onDeclineFriendRequest
}) => {
  // Collapsible groups states
  const [onlineExpanded, setOnlineExpanded] = useState(true);
  const [offlineExpanded, setOfflineExpanded] = useState(true);
  const [chatbotsExpanded, setChatbotsExpanded] = useState(true);

  // Avatar Selection & Create Group Modals state
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [createGroupError, setCreateGroupError] = useState("");
  const [createGroupSuccess, setCreateGroupSuccess] = useState(false);

  // Add Contact Modal state
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [addContactName, setAddContactName] = useState("");
  const [addContactEmail, setAddContactEmail] = useState("");
  const [addContactAvatar, setAddContactAvatar] = useState("🧑‍🚀");
  const [addContactError, setAddContactError] = useState("");
  const [addContactSuccess, setAddContactSuccess] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);

  // Edit fields visibility
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [isEditingListening, setIsEditingListening] = useState(false);
  const [tempName, setTempName] = useState(userDisplayName);
  const [tempMessage, setTempMessage] = useState(userPersonalMessage);
  const [tempListening, setTempListening] = useState(userListeningTo);

  // Live Contact Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Buzzi Retro Player status
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [volume, setVolume] = useState(40);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>([4, 4, 4, 4, 4, 4]);

  // Handle cleanup of audio resources
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Sync listening status with track index when playing
  useEffect(() => {
    if (isPlaying) {
      const track = RETRO_PLAYLIST[currentTrackIdx];
      onUpdateListeningTo(track.title);
    } else {
      onUpdateListeningTo("");
    }
  }, [isPlaying, currentTrackIdx]);

  // Adjust volume dynamically
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Direct play/pause functions to bypass mobile/iOS touch-gesture restrictions
  const playTrackDirect = (trackIdx: number) => {
    const audio = audioRef.current;
    if (!audio) {
      console.warn("Audio element not yet mounted in the DOM!");
      return;
    }
    
    const track = RETRO_PLAYLIST[trackIdx];
    
    // Clear previous error handlers
    audio.onerror = null;
    
    // Use target direct stream address for optimal speed, native decoder and no bandwidth throttling
    audio.src = track.url;
    audio.load();
    audio.volume = volume / 100;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Direct play failed/blocked, falling back to secure proxy...", err);
        const fallbackUrl = `/api/proxy-audio?url=${encodeURIComponent(track.url)}`;
        const absoluteFallback = new URL(fallbackUrl, window.location.origin).toString();
        
        if (audio.src !== absoluteFallback) {
          audio.src = absoluteFallback;
          audio.load();
          audio.play().catch((proxyErr) => {
            console.error("Direct and proxy play both blocked or failed:", proxyErr);
          });
        }
      });
    }
    
    // Set dynamic onError delegate to slide over to proxy in case stream loading chokes or drops
    audio.onerror = () => {
      const fallbackUrl = `/api/proxy-audio?url=${encodeURIComponent(track.url)}`;
      const absoluteFallback = new URL(fallbackUrl, window.location.origin).toString();
      if (audio.src !== absoluteFallback) {
        console.warn("Stream error triggered. Initiating proxy recovery stream...");
        audio.src = absoluteFallback;
        audio.load();
        audio.volume = volume / 100;
        audio.play().catch((e) => console.log("Proxy retry failed:", e));
      }
    };
    
    setCurrentTrackIdx(trackIdx);
    setIsPlaying(true);
  };

  const pauseTrackDirect = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  // Visualizer bars dynamic bouncing loop
  useEffect(() => {
    if (!isPlaying) {
      setVisualizerHeights([4, 4, 4, 4, 4, 4]);
      return;
    }

    const interval = setInterval(() => {
      setVisualizerHeights([
        Math.floor(Math.random() * 22) + 2,
        Math.floor(Math.random() * 22) + 2,
        Math.floor(Math.random() * 22) + 2,
        Math.floor(Math.random() * 22) + 2,
        Math.floor(Math.random() * 22) + 2,
        Math.floor(Math.random() * 22) + 2,
      ]);
    }, 150);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying]);

  useEffect(() => {
    setTempName(userDisplayName);
  }, [userDisplayName]);

  useEffect(() => {
    setTempMessage(userPersonalMessage);
  }, [userPersonalMessage]);

  useEffect(() => {
    setTempListening(userListeningTo);
  }, [userListeningTo]);

  const handleUpdateName = () => {
    onUpdateDisplayName(tempName.trim() || userEmail.split("#pwd_")[0].split("@")[0]);
    setIsEditingName(false);
  };

  const handleUpdateMessage = () => {
    onUpdatePersonalMessage(tempMessage.trim() || "Typ hier je weergavenaam of statusbericht...");
    setIsEditingMessage(false);
  };

  const handleUpdateListening = () => {
    onUpdateListeningTo(tempListening.trim());
    setIsEditingListening(false);
  };

  // Get status color & label
  const getStatusIcon = (status: StatusType) => {
    switch (status) {
      case "online":
        return (
          <span className="w-3.5 h-3.5 rounded-full bg-[#39b54a] border border-[#237f30] inline-block shadow-inner flex-shrink-0" />
        );
      case "bezet":
        return (
          <span className="w-3.5 h-3.5 rounded-full bg-[#ef4136] border border-[#a31a12] inline-flex items-center justify-center text-white text-[8px] font-bold shadow-inner flex-shrink-0" title="Bezet">
            <span className="w-1.5 h-0.5 bg-white" />
          </span>
        );
      case "afwezig":
        return (
          <span className="w-3.5 h-3.5 rounded-full bg-[#f7931e] border border-[#ad620a] inline-block shadow-inner flex-shrink-0" title="Afwezig" />
        );
      case "offline":
      default:
        return (
          <span className="w-3.5 h-3.5 rounded-full bg-[#a1a1a1] border border-[#5c5c5c] inline-block shadow-inner flex-shrink-0" title="Offline" />
        );
    }
  };

  const getStatusLabelText = (status: StatusType) => {
    switch (status) {
      case "online": return "Online";
      case "bezet": return "Bezet (Niet storen)";
      case "afwezig": return "Afwezig";
      case "offline": return "Offline weergeven";
    }
  };

  // Filter and Categorize Contacts based on live search
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chatbots = filteredContacts.filter(c => c.id === "queen"); // Buzzi AI Bot
  const onlineContacts = filteredContacts.filter(c => c.id !== "queen" && c.status !== "offline");
  const offlineContacts = filteredContacts.filter(c => c.id !== "queen" && c.status === "offline");

  return (
    <div className="w-80 bg-[#e4ecf7] text-slate-800 flex flex-col h-full border-r border-[#6f8da5] select-none font-sans shadow-md">
      <audio ref={audioRef} className="hidden" />
      {/* Buzzi Messenger Title Bar / Header Decoration */}
      <div className="bg-gradient-to-r from-[#1d6fa5] via-[#469cd2] to-[#1d6fa5] p-2.5 text-white flex items-center justify-between border-b border-[#0f4f7d] shadow-sm">
        <div className="flex items-center gap-1.5">
          {/* Authentic classic green-blue two bubble head logo */}
          <div className="flex -space-x-1 items-center justify-center bg-white/20 px-1.5 py-0.5 rounded border border-white/10">
            <span className="text-[11px] font-bold tracking-tight text-white flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8cc63f] inline-block filter drop-shadow"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00aeef] inline-block filter drop-shadow"></span>
              <span>Buzzi</span>
            </span>
          </div>
          <span className="text-xs font-semibold tracking-wide uppercase font-sans drop-shadow-sm text-sky-50">
            Buzzi Messenger
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Classic small decoration tabs for minimize, maximize, close */}
          <span className="w-4 h-4 rounded bg-[#cfe3f8]/30 border border-white/20 text-[9px] flex items-center justify-center text-sky-100 hover:bg-[#cfe3f8]/50 cursor-pointer">_</span>
          <span className="w-4 h-4 rounded bg-[#cfe3f8]/30 border border-white/20 text-[9px] flex items-center justify-center text-sky-100 hover:bg-[#cfe3f8]/50 cursor-pointer">□</span>
          <span className="w-4 h-4 rounded bg-red-600/80 border border-red-500/30 text-[9px] flex items-center justify-center text-white hover:bg-red-600 cursor-pointer">X</span>
        </div>
      </div>

      {/* Profile Box Area (Classic Buzzi top panel with Display Picture Frame) */}
      <div className="p-4 bg-gradient-to-b from-[#f2f7fc] to-[#d6e5f4] border-b border-[#9ebcd1] flex gap-3.5 relative overflow-hidden">
        {/* Buzzi light glare shine background effect */}
        <div className="absolute inset-0 bg-[#ffffff]/25 pointer-events-none transform -skew-y-12 origin-top-left scale-150" />

        {/* Display Picture Container (with iconic Buzzi thick square gradient frame) */}
        <div className="relative group flex-shrink-0 z-10">
          <div 
            onClick={() => {
              setIsAvatarSelectorOpen(true);
              hiveAudio.playHoneyPop();
            }}
            className="w-14 h-14 bg-white p-0.5 rounded-md border-2 border-[#86a8cf] shadow-md flex items-center justify-center overflow-hidden hover:scale-105 transition-all cursor-pointer"
            title="Klik om weergaveafbeelding te selecteren of te dobbelen"
          >
            <span className="text-3xl select-none">{userAvatar}</span>
          </div>
          {/* Custom Avatar quick picker popup (click to open avatar manager dialog) */}
          <button 
            onClick={() => {
              setIsAvatarSelectorOpen(true);
              hiveAudio.playHoneyPop();
            }} 
            className="absolute -bottom-1 -right-1 bg-[#1d5c8a] text-white p-1 rounded-full text-[8px] border border-white/60 shadow hover:bg-sky-600 cursor-pointer active:scale-95 transition-all"
            title="Weergaveafbeelding wijzigen"
          >
            🔄
          </button>
        </div>

        {/* Name, Status, and Personal Quote message */}
        <div className="flex-1 min-w-0 flex flex-col justify-center z-10">
          <div className="flex items-center gap-1.5">
            {isEditingName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleUpdateName}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                className="w-full text-xs font-semibold bg-white border border-amber-500 rounded px-1 py-0.5 focus:outline-none"
                autoFocus
                maxLength={40}
              />
            ) : (
              <span 
                onClick={() => {
                  setTempName(userDisplayName);
                  setIsEditingName(true);
                }}
                className="text-sm font-bold text-slate-800 hover:bg-[#cfe1f5] px-1 py-0.5 rounded cursor-pointer truncate max-w-[150px] inline-flex items-center gap-1"
                title="Klik om je weergavenaam aan te passen (H)"
              >
                {(userEmail?.toLowerCase() === "prinsrobbin@gmail.com" || userDisplayName?.toLowerCase().includes("robbin") || userDisplayName?.toLowerCase().includes("admin")) && (
                  <span className="text-amber-500 animate-pulse text-xs" title="Buzzi Systeem Administrator 👑">👑</span>
                )}
                <span>{userDisplayName}</span>
              </span>
            )}

            {/* Custom Status Bullet Selector inside Profile block */}
            <div className="relative group">
              <button 
                className="hover:scale-110 active:scale-95 transition-transform translate-y-0.5 cursor-pointer flex items-center"
                title={`Status: ${getStatusLabelText(userStatus)}`}
              >
                {getStatusIcon(userStatus)}
                <DropdownIcon className="w-3 h-3 text-slate-500 -ml-0.5" />
              </button>
              
              {/* Dropdown Menu block */}
              <div className="hidden group-hover:block absolute left-0 top-full bg-white border border-[#8da7c1] rounded bg-white shadow-lg py-1 w-40 z-50 text-xs text-slate-700 animate-fade-in">
                {(["online", "bezet", "afwezig", "offline"] as StatusType[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(st)}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-[#e4ecf7] flex items-center gap-2"
                  >
                    {getStatusIcon(st)}
                    <span>{getStatusLabelText(st)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Buzzi Personal Status Tagline ("Type what you are listening to...") */}
          <div className="mt-1 text-[11px]">
            {isEditingMessage ? (
              <input
                type="text"
                value={tempMessage}
                onChange={(e) => setTempMessage(e.target.value)}
                onBlur={handleUpdateMessage}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateMessage()}
                className="w-full text-[10px] bg-white border border-amber-500 rounded px-1 py-0.5 focus:outline-none"
                autoFocus
                maxLength={80}
              />
            ) : (
              <p
                onClick={() => {
                  setTempMessage(userPersonalMessage);
                  setIsEditingMessage(true);
                }}
                className="text-slate-500 italic hover:text-[#1d5c8a] hover:bg-[#cfe1f5]/80 px-1 py-0.5 rounded cursor-pointer truncate"
                title="Klik om statusbericht te wijzigen"
              >
                &ldquo;{userPersonalMessage}&rdquo;
              </p>
            )}
          </div>

          {isEditingListening ? (
            <input
              type="text"
              value={tempListening}
              onChange={(e) => setTempListening(e.target.value)}
              onBlur={handleUpdateListening}
              onKeyDown={(e) => e.key === "Enter" && handleUpdateListening()}
              className="w-full mt-1 text-[10px] bg-white border border-sky-400 rounded px-1 py-0.5 focus:outline-none"
              autoFocus
              placeholder="Typ status of muziek..."
              maxLength={60}
            />
          ) : (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 truncate group/music">
              <Music className={`w-3 h-3 flex-shrink-0 ${userListeningTo ? "text-sky-600 animate-pulse" : "text-slate-400"}`} />
              {userListeningTo ? (
                <span 
                  onClick={() => {
                    setTempListening(userListeningTo);
                    setIsEditingListening(true);
                  }}
                  className="truncate text-slate-600 hover:text-[#1d5c8a] hover:bg-[#cfe1f5]/80 px-1 rounded cursor-pointer font-sans"
                  title="Klik om muziekstatus te wijzigen"
                >
                  Luistert nu naar: <em className="text-sky-800 font-bold font-sans not-italic">{userListeningTo}</em>
                </span>
              ) : (
                <span 
                  onClick={() => {
                    setTempListening("");
                    setIsEditingListening(true);
                  }}
                  className="text-slate-400 hover:text-[#1d5c8a] cursor-pointer italic font-sans"
                  title="Klik om muziek toe te voegen"
                >
                  Muziekstatus instellen...
                </span>
              )}
              {userListeningTo && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempListening("");
                    onUpdateListeningTo("");
                  }}
                  className="text-[9px] text-rose-500 hover:text-rose-800 font-black cursor-pointer px-1 ml-0.5 opacity-40 hover:opacity-100"
                  title="Muziekstatus leegmaken"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="mt-1.5 self-start text-[10px] text-[#2c659e] hover:text-red-700 font-bold hover:underline cursor-pointer uppercase tracking-wider flex items-center gap-1"
            >
              <span>🚪 Afmelden</span>
            </button>
          )}
        </div>
      </div>

      {/* Search contacts bar (reminiscent of Buzzi Windows Live 7.x/8.0 search) */}
      <div className="p-2 bg-[#f0f4f9] border-b border-[#bad0e3] flex items-center justify-between gap-1.5 align-middle">
        <div className="flex items-center gap-1.5 flex-1 bg-white border border-[#b8cedf] rounded px-2 py-1">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input 
            type="text"
            placeholder="Zoeken..."
            className="bg-transparent border-none text-xs w-full focus:outline-none placeholder-slate-400 select-text text-left"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setIsAddContactOpen(true);
            setAddContactName("");
            setAddContactEmail("");
            setAddContactError("");
            setAddContactSuccess(false);
            hiveAudio.playHoneyPop();
          }}
          className="bg-[#1d5c8a] hover:bg-sky-700 text-white font-extrabold text-[10px] px-2 py-1.5 rounded flex items-center gap-0.5 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0 uppercase tracking-wide"
          title="Voeg een nieuwe vriend toe"
        >
          <span>👤+ Vriend</span>
        </button>
      </div>

      {/* 📻 Winamp 2004 Buzzi Stereo Player */}
      <div className="mx-2 my-2 p-2 bg-[#1b2533] border border-[#2d3a4e] rounded shadow-md text-emerald-400 font-mono text-[11px] select-none">
        <div className="flex items-center justify-between mb-1 text-slate-400 text-[10px] border-b border-[#2d3a4e] pb-1">
          <span className="flex items-center gap-1">
            <Radio className={`w-3 h-3 text-sky-400 ${isPlaying ? "animate-pulse" : ""}`} />
            <span>BUZZI STEREO (WINAMP v2.82)</span>
          </span>
          <span className="text-[9px] bg-sky-950 px-1 py-0.5 rounded text-sky-300 font-bold">STEREO</span>
        </div>

        {/* LCD-style visualization area */}
        <div className="bg-[#0c121d] border border-[#2d3a4e] p-1.5 rounded flex items-center justify-between mb-1.5 relative overflow-hidden">
          <div className="flex-1 min-w-0 pr-2">
            <div className="text-emerald-500 font-bold truncate tracking-tight text-[11px]">
              {isPlaying ? RETRO_PLAYLIST[currentTrackIdx].title : "MUTED / IDLE"}
            </div>
            <div className="text-[9px] text-[#4d6a85] flex gap-2 mt-0.5">
              <span>GENRE: {isPlaying ? RETRO_PLAYLIST[currentTrackIdx].genre : "NONE"}</span>
              <span>BY: {isPlaying ? RETRO_PLAYLIST[currentTrackIdx].artist : "OFFLINE"}</span>
            </div>
          </div>

          {/* Bouncing visualizer vertical frequencies */}
          <div className="flex items-end gap-0.5 h-6 w-12 justify-end flex-shrink-0">
            {visualizerHeights.map((h, i) => (
              <span 
                key={i} 
                className="w-1.5 bg-gradient-to-t from-emerald-600 via-emerald-400 to-green-300 transition-all duration-100"
                style={{ height: `${isPlaying ? h : 2}px` }}
              />
            ))}
          </div>
        </div>

        {/* Volume controller slider bar */}
        <div className="flex items-center gap-2 mb-1.5 text-slate-400 text-[9px] px-0.5">
          <Sliders className="w-3 h-3 text-sky-500 flex-shrink-0" />
          <span className="w-8">VOL: {volume}%</span>
          <input 
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
            title="Systeembediening Volume"
          />
        </div>

        {/* Buttons & controllers */}
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#1f2b3b]">
          <div className="flex gap-1">
            <button
              onClick={() => {
                const prevIdx = currentTrackIdx > 0 ? currentTrackIdx - 1 : RETRO_PLAYLIST.length - 1;
                playTrackDirect(prevIdx);
              }}
              className="px-1.5 py-0.5 bg-gradient-to-b from-[#2d3c52] to-[#141b25] border border-slate-600 text-slate-100 hover:text-white rounded cursor-pointer hover:border-slate-400 flex items-center justify-center text-[10px]"
              title="Vorige nummer"
            >
              ◀◀
            </button>

            {isPlaying ? (
              <button
                onClick={() => {
                  pauseTrackDirect();
                }}
                className="px-2 py-0.5 bg-gradient-to-b from-amber-600 to-amber-900 border border-amber-500 text-white rounded cursor-pointer hover:brightness-110 flex items-center justify-center font-bold text-[10px]"
                title="Pauzeren"
              >
                ❚❚
              </button>
            ) : (
              <button
                onClick={() => {
                  playTrackDirect(currentTrackIdx);
                }}
                className="px-2 py-0.5 bg-gradient-to-b from-emerald-600 to-emerald-900 border border-emerald-500 text-white rounded cursor-pointer hover:brightness-110 flex items-center justify-center font-bold text-[10px]"
                title="Afspelen"
              >
                ▶
              </button>
            )}

            <button
              onClick={() => {
                const nextIdx = (currentTrackIdx + 1) % RETRO_PLAYLIST.length;
                playTrackDirect(nextIdx);
              }}
              className="px-1.5 py-0.5 bg-gradient-to-b from-[#2d3c52] to-[#141b25] border border-slate-600 text-slate-100 hover:text-white rounded cursor-pointer hover:border-slate-400 flex items-center justify-center text-[10px]"
              title="Volgende nummer"
            >
              ▶▶
            </button>
          </div>

          <div className="text-[9px] text-slate-400 font-bold">
            {isPlaying ? "📻 ONLINE STREAM" : "📻 PAUSED"}
          </div>
        </div>
      </div>

      {/* Buddy List (Collapsible Groups with Classic Arrows) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-white border-[#9ebcd1] custom-scrollbar">

        {/* Pending Friend Requests Banner */}
        {friendRequests && friendRequests.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-2.5 animate-pulse shrink-0 space-y-2 mb-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-amber-800">
              <span className="text-base">🔔</span>
              <span className="text-[10.5px] font-black uppercase tracking-wide">Vrienden verzoek!</span>
            </div>
            {friendRequests.map((req) => (
              <div key={req.id} className="bg-white/95 border border-amber-200 p-2 rounded flex flex-col gap-1.5 shadow-xs">
                <div className="text-[11px] font-bold text-slate-700 leading-tight">
                  <span className="text-amber-700 font-extrabold">{req.fromName}</span> ({req.fromEmail}) wil je toevoegen!
                </div>
                <div className="flex justify-start gap-1.5">
                  <button
                    onClick={() => onAcceptFriendRequest?.(req.id, req.fromName, req.fromEmail)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9.5px] uppercase tracking-wider px-2 py-1 rounded shadow-sm border border-emerald-700 cursor-pointer active:scale-95 transition-all"
                  >
                    Accepteren
                  </button>
                  <button
                    onClick={() => onDeclineFriendRequest?.(req.id)}
                    className="bg-slate-500 hover:bg-slate-600 text-white font-black text-[9.5px] uppercase tracking-wider px-2 py-1 rounded shadow-sm border border-slate-600 cursor-pointer active:scale-95 transition-all"
                  >
                    Slaan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Group 1: Chat Robots */}
        <div>
          <button 
            onClick={() => setChatbotsExpanded(!chatbotsExpanded)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 px-1 py-1 hover:bg-[#f3f7fb] rounded border-b border-[#e9eff5]"
          >
            <div className="flex items-center gap-1">
              {chatbotsExpanded ? <ChevronDown className="w-3 h-3 text-slate-600" /> : <ChevronRight className="w-3 h-3 text-slate-600" />}
              <span>Buzzi Chat Robots ({chatbots.length}/{chatbots.length})</span>
            </div>
          </button>

          {chatbotsExpanded && (
            <ul className="mt-1 space-y-0.5 pl-2">
              {chatbots.map((contact) => {
                const isActive = activeType === "dm" && activeId === contact.id;
                return (
                  <li key={contact.id}>
                    <button
                      onClick={() => onSelectDM(contact.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all text-left relative group ${
                        isActive
                          ? "bg-[#cfe1f5] border border-[#a2bfdb]"
                          : "hover:bg-[#f0f4f9]"
                      }`}
                    >
                      <div className="relative">
                        <span className="text-lg bg-slate-50 border border-slate-200 py-0.5 px-1 rounded block leading-none">{contact.avatar}</span>
                        <span className="absolute -bottom-1 -right-1 leading-none">{getStatusIcon(contact.status)}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 truncate block">
                            {contact.name} <span className="text-sky-600 text-[10px] font-normal font-mono">({contact.email.split("#pwd_")[0]})</span>
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 italic truncate leading-none mt-0.5">
                          &ldquo;{contact.personalMessage}&rdquo;
                        </p>
                      </div>

                      <span className="text-[9px] bg-[#8cc63f] border border-[#76aa31] text-white font-bold px-1 rounded shadow-sm scale-90 flex items-center gap-0.5">
                        <Bot className="w-2.5 h-2.5" /> AI
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Group 2: Online Buddies */}
        <div>
          <button 
            onClick={() => setOnlineExpanded(!onlineExpanded)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 px-1 py-1 hover:bg-[#f3f7fb] rounded border-b border-[#e9eff5]"
          >
            <div className="flex items-center gap-1">
              {onlineExpanded ? <ChevronDown className="w-3 h-3 text-slate-600" /> : <ChevronRight className="w-3 h-3 text-slate-600" />}
              <span>Vrienden online ({onlineContacts.length}/{contacts.length - 1})</span>
            </div>
          </button>

          {onlineExpanded && (
            <ul className="mt-1 space-y-0.5 pl-2">
              {onlineContacts.map((contact) => {
                const isActive = activeType === "dm" && activeId === contact.id;
                return (
                  <li key={contact.id} className="group/buddy relative flex items-center justify-between hover:bg-[#f0f4f9] rounded transition-all">
                    <button
                      onClick={() => onSelectDM(contact.id)}
                      className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-left ${
                        isActive
                          ? "bg-[#cfe1f5] border border-[#a2bfdb]"
                          : ""
                      }`}
                    >
                      <div className="relative">
                        <span className="text-lg bg-slate-50 border border-slate-200 py-0.5 px-1 rounded block leading-none">{contact.avatar}</span>
                        <span className="absolute -bottom-1 -right-1 leading-none">{getStatusIcon(contact.status)}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-1">
                        <span className="text-xs font-bold text-slate-800 truncate block flex items-center gap-1">
                          {(contact.name?.toLowerCase().includes("robbin") || contact.email?.toLowerCase().includes("robbin") || contact.name?.toLowerCase().includes("admin")) && (
                            <span className="text-amber-500 animate-pulse text-[10px]" title="Buzzi Systeem Administrator 👑">👑</span>
                          )}
                          <span>{contact.name}</span>
                        </span>
                        <p className="text-[10.5px] text-slate-400 italic truncate leading-none mt-0.5">
                          &ldquo;{contact.personalMessage}&rdquo;
                        </p>
                      </div>

                      {contact.listeningTo && (
                        <Music className="w-3 h-3 text-sky-600 flex-shrink-0" title={`Luistert naar: ${contact.listeningTo}`} />
                      )}
                    </button>

                    {onDeleteContact && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteContact(contact.id);
                        }}
                        className="opacity-0 group-hover/buddy:opacity-100 hover:text-red-600 p-1.5 text-slate-400 rounded-md transition-all mr-1 cursor-pointer hover:bg-red-50"
                        title="Vriend Verwijderen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Group 3: Offline Buddies */}
        <div>
          <button 
            onClick={() => setOfflineExpanded(!offlineExpanded)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 px-1 py-1 hover:bg-[#f3f7fb] rounded border-b border-[#e9eff5]"
          >
            <div className="flex items-center gap-1">
              {offlineExpanded ? <ChevronDown className="w-3 h-3 text-slate-600" /> : <ChevronRight className="w-3 h-3 text-slate-600" />}
              <span>Vrienden offline ({offlineContacts.length})</span>
            </div>
          </button>

          {offlineExpanded && (
            <ul className="mt-1 space-y-0.5 pl-2">
              {offlineContacts.map((contact) => {
                const isActive = activeType === "dm" && activeId === contact.id;
                return (
                  <li key={contact.id} className="group/buddy relative flex items-center justify-between hover:bg-[#f9f9F9] rounded text-left opacity-70 hover:opacity-100 transition-all">
                    <button
                      className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-left"
                      onClick={() => onSelectDM(contact.id)}
                    >
                      <div className="relative">
                        <span className="text-lg bg-slate-100 border border-slate-200 py-0.5 px-1 rounded block leading-none saturate-50">{contact.avatar}</span>
                        <span className="absolute -bottom-1 -right-1 leading-none">{getStatusIcon("offline")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-slate-600 font-medium truncate block flex items-center gap-1">
                          {(contact.name?.toLowerCase().includes("robbin") || contact.email?.toLowerCase().includes("robbin") || contact.name?.toLowerCase().includes("admin")) && (
                            <span className="text-amber-500 text-[10px]" title="Buzzi Systeem Administrator 👑 font-bold">👑</span>
                          )}
                          <span>{contact.name}</span>
                        </span>
                        <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">({contact.email.split("#pwd_")[0]})</p>
                      </div>
                    </button>

                    {onDeleteContact && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteContact(contact.id);
                        }}
                        className="opacity-0 group-hover/buddy:opacity-100 hover:text-red-600 p-1.5 text-slate-400 rounded-md transition-all mr-1 cursor-pointer hover:bg-red-50"
                        title="Vriend Verwijderen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Group 4: Buzzi Groepsgesprekken / Kanalen */}
        <div>
          <div 
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 px-1 py-1 border-b border-[#e9eff5]"
          >
            <div className="flex items-center gap-1">
              <ChevronDown className="w-3 h-3 text-slate-600" />
              <span> Buzzi Groepsgesprekken ({channels.length})</span>
            </div>
            <button
              onClick={() => {
                setIsCreateGroupOpen(true);
                setNewGroupName("");
                setNewGroupDesc("");
                setCreateGroupError("");
                setCreateGroupSuccess(false);
                hiveAudio.playHoneyPop();
              }}
              className="text-[9px] font-black px-1.5 py-0.5 bg-sky-100/80 hover:bg-[#1d5c8a] hover:text-white rounded border border-[#a2bfdb] text-[#1d5c8a] transition-all cursor-pointer active:scale-95"
              title="Maak een nieuw groepsgesprek aan"
            >
              + Groep aanmaken
            </button>
          </div>
          
          <ul className="mt-1 space-y-0.5 pl-2">
            {channels.map((channel) => {
              const isActive = activeType === "channel" && activeId === channel.id;
              return (
                <li key={channel.id}>
                  <button
                    onClick={() => onSelectChannel(channel.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all text-left relative group ${
                      isActive
                        ? "bg-[#cfe1f5] border border-[#a2bfdb]"
                        : "hover:bg-[#f0f4f9]"
                    }`}
                  >
                    <span className="text-lg leading-none">👥</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#1d5c8a] truncate block">
                        #{channel.name}
                      </span>
                      <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">
                        {channel.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

      </div>

      {/* User Info footer (Classic Windows XP bottom status line) */}
      <div className="p-3 bg-[#cbdcf0] border-t border-[#8ca7c1] flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="text-[10.5px] font-mono font-black text-[#1D5C8A]">v7.6.4</span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-green-700 shadow-sm" />
          <span className="font-semibold text-[11px] font-sans">Buzzi Service: Verbonden</span>
        </div>
        <span className="text-[10px] font-mono font-medium text-slate-500">v7.6.4</span>
      </div>

      {/* Avatar Picker Modal */}
      {isAvatarSelectorOpen && (
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-gradient-to-b from-[#f2f6fb] via-[#e2eef9] to-[#d3e5f4] w-full max-w-[340px] rounded-t-xl rounded-b-lg border-2 border-[#1c5c8a] shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1d5c8a] via-[#3a8bca] to-[#1d5c8a] px-3 py-2 flex items-center justify-between text-white border-b border-[#0f3c5e] shrink-0">
              <div className="flex items-center gap-1.5 select-none text-xs font-black uppercase tracking-wide">
                <span>🧩</span>
                <span>Kies je Buzzi Afbeelding</span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsAvatarSelectorOpen(false);
                  hiveAudio.playHoneyPop();
                }}
                className="w-5 h-5 rounded bg-[#e43a3a] hover:bg-[#ff5555] active:scale-95 border border-[#8b1a1a] flex items-center justify-center text-white font-extrabold text-[10px] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Menu options help bar */}
            <div className="px-3 py-1 bg-[#efebd8]/30 border-b border-[#bad0e3] flex justify-between items-center text-[10px] font-bold text-[#1C427F]">
              <span>Typische retro-plaatjes</span>
              <button 
                onClick={() => {
                  const fullAvatars = [
                    "🧑‍🚀", "🦋", "🐝", "🐱", "🐶", "🦊", "🤖", "👽", "🤠", "🧙", "😎", "👾", "🐻", "🦄", "🎮", "🍕",
                    "🍟", "🍦", "🎸", "🎧", "🛹", "⚽", "⚡", "🔥", "🌈", "🎈", "💎", "👑", "🍀", "🎃", "💩", "👻",
                    "🦁", "🐯", "🐼", "🐨", "🐸", "🐵", "🦖", "🍩", "🧁", "🍿", "🚗", "🚀", "💡", "🔮", "🛎️", "🔑"
                  ];
                  const randomEmoji = fullAvatars[Math.floor(Math.random() * fullAvatars.length)];
                  onUpdateAvatar(randomEmoji);
                  hiveAudio.playNotification();
                }}
                className="text-[9.5px] hover:underline bg-[#1d5c8a] hover:bg-sky-700 text-white px-2 py-0.5 rounded flex items-center gap-0.5 shadow-sm font-black transition-all"
              >
                🎲 Dobbelen!
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col items-center">
              {/* Current Preview */}
              <div className="w-16 h-16 bg-white p-1 rounded-md border-3 border-[#86a8cf] shadow-md flex items-center justify-center overflow-hidden mb-3 animate-[pulse_3s_infinite]">
                <span className="text-4xl">{userAvatar}</span>
              </div>

              {/* Grid of 48 Emojis */}
              <div className="bg-[#DCE7F3] p-2 rounded-lg border border-[#bad0e3] grid grid-cols-8 gap-1.5 w-full max-h-[170px] overflow-y-auto custom-scrollbar">
                {[
                  "🧑‍🚀", "🦋", "🐝", "🐱", "🐶", "🦊", "🤖", "👽", "🤠", "🧙", "😎", "👾", "🐻", "🦄", "🎮", "🍕",
                  "🍟", "🍦", "🎸", "🎧", "🛹", "⚽", "⚡", "🔥", "🌈", "🎈", "💎", "👑", "🍀", "🎃", "💩", "👻"
                ].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onUpdateAvatar(emoji);
                      hiveAudio.playHoneyPop();
                    }}
                    className={`aspect-square text-lg rounded bg-white hover:bg-sky-100 border flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                      userAvatar === emoji
                        ? "border-[#1C427F] bg-[#CFE1F5] outline-none ring-2 ring-sky-500 scale-110"
                        : "border-slate-300"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-[#cbdcf0] border-t border-[#bad0e3] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAvatarSelectorOpen(false);
                  hiveAudio.playHoneyPop();
                }}
                className="px-4 py-1.5 rounded bg-[#2C629E] hover:bg-[#1f4a7c] text-white text-[11px] font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
              >
                Opslaan ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newGroupName.trim()) {
                setCreateGroupError("Vul een groepsnaam in.");
                return;
              }
              setCreateGroupError("");
              
              if (onCreateChannel) {
                const success = await onCreateChannel(newGroupName, newGroupDesc);
                if (success) {
                  setCreateGroupSuccess(true);
                  setTimeout(() => {
                    setIsCreateGroupOpen(false);
                    setCreateGroupSuccess(false);
                  }, 1200);
                } else {
                  setCreateGroupError("Aanmaken mislukt. Probeer het opnieuw.");
                }
              }
            }}
            className="bg-gradient-to-b from-[#f2f6fb] via-[#e2eef9] to-[#d3e5f4] w-full max-w-[340px] rounded-t-xl rounded-b-lg border-2 border-[#1c5c8a] shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1d5c8a] via-[#3a8bca] to-[#1d5c8a] px-3 py-2 flex items-center justify-between text-white border-b border-[#0f3c5e] shrink-0">
              <div className="flex items-center gap-1.5 select-none text-xs font-black uppercase tracking-wide">
                <span>👥</span>
                <span>Nieuw Buzzi Groepsgesprek</span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsCreateGroupOpen(false);
                  hiveAudio.playHoneyPop();
                }}
                className="w-5 h-5 rounded bg-[#e43a3a] hover:bg-[#ff5555] active:scale-95 border border-[#8b1a1a] flex items-center justify-center text-white font-extrabold text-[10px] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Menu Info Bar */}
            <div className="px-3 py-1 bg-[#efebd8]/30 border-b border-[#bad0e3] text-[10px] font-bold text-[#1C427F]">
              Groepsgesprekken zijn direct zichtbaar voor iedereen!
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3 text-left">
              {createGroupSuccess ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded p-4 text-center text-emerald-950 font-bold text-xs space-y-1 my-4">
                  <div>🎉 Hoera! Groepsgesprek gemaakt!</div>
                  <div className="text-[10px] font-normal text-emerald-850">Direct open voor al je contactpersonen...</div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-[#1C427F] uppercase tracking-wider block">
                      ★ Groepsnaam
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="bijv: huiswerk-reiskol"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      maxLength={25}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] font-bold select-text"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-[#1C427F] uppercase tracking-wider block">
                      Uitleg / Beschrijving
                    </label>
                    <textarea
                      placeholder="Waar gaat dit groepsgesprek over?"
                      value={newGroupDesc}
                      onChange={(e) => setNewGroupDesc(e.target.value)}
                      maxLength={80}
                      rows={2}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] select-text resize-none font-medium"
                    />
                  </div>

                  {createGroupError && (
                    <div className="text-[10px] font-black text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      ⚠️ {createGroupError}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-[#cbdcf0] border-t border-[#bad0e3] flex justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsCreateGroupOpen(false);
                  hiveAudio.playHoneyPop();
                }}
                className="px-3 py-1.5 rounded bg-[#bdbdbd] border border-[#7b7b7b] hover:bg-white text-slate-800 font-bold text-[10px] active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                Annuleren
              </button>

              {!createGroupSuccess && (
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#2C629E] hover:bg-[#1f4a7c] text-white font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer text-[10.5px] uppercase tracking-wide"
                >
                  Maak Groep Aan 👥
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* 4. MODAL: Vriend Toevoegen */}
      {isAddContactOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[9999] backdrop-blur-xs">
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (!addContactName.trim() || !addContactEmail.trim()) {
                setAddContactError("Naam en e-mailadres zijn verplicht.");
                return;
              }
              setIsAddingContact(true);
              setAddContactError("");
              
              if (onAddContact) {
                const ok = await onAddContact(
                  addContactName.trim(),
                  addContactEmail.trim(),
                  addContactAvatar
                );
                if (ok) {
                  setAddContactSuccess(true);
                  setTimeout(() => {
                    setAddContactSuccess(false);
                    setIsAddContactOpen(false);
                  }, 2000);
                } else {
                  setAddContactError("Kon contactpersoon niet toevoegen. Mogelijk bestaat deze al.");
                }
              } else {
                setAddContactError("Voeg contact handeling is niet beschikbaar.");
              }
              setIsAddingContact(false);
            }}
            className="w-full max-w-sm bg-[#eef4fb] border border-[#769abb] rounded-2xl shadow-2xl p-0 overflow-hidden font-sans select-none flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2c77b0] to-[#1e5881] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
              <span className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-1.5">
                <span>👤</span> MSN Vriend Toevoegen
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAddContactOpen(false);
                  hiveAudio.playHoneyPop();
                }}
                className="text-white hover:text-red-200 transition-colors cursor-pointer text-xs font-bold"
              >
                Sluiten ✕
              </button>
            </div>

            {/* Content Area */}
            <div className="p-5 space-y-4 flex-1">
              {addContactSuccess ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center text-emerald-950 font-bold text-xs space-y-1 my-4 animate-bounce">
                  <div>🎉 Joehoe! Vriend succesvol toegevoegd!</div>
                  <div className="text-[10px] font-normal text-emerald-850">Hij of zij staat nu in de lijst!</div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-[#1C427F] uppercase tracking-wider block">
                      Naam van je vriend
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="bijv: Kelly / Wouter"
                      value={addContactName}
                      onChange={(e) => setAddContactName(e.target.value)}
                      maxLength={25}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] font-bold select-text text-left"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-[#1C427F] uppercase tracking-wider block">
                      Zijn/haar e-mailadres
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="bijv: kelly@live.nl"
                      value={addContactEmail}
                      onChange={(e) => setAddContactEmail(e.target.value)}
                      maxLength={80}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-[#B9CEDF] bg-white text-slate-800 focus:outline-none focus:border-[#4A86E8] select-text text-left font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-[#1C427F] uppercase tracking-wider block">
                      Selecteer een retro Buzzi avatar status
                    </label>
                    <div className="grid grid-cols-5 gap-2 bg-white/80 p-2 border border-[#bad0e3] rounded-lg">
                      {["🧑‍🚀", "👸", "👾", "🦊", "🐯", "🐼", "🕶️", "🎩", "🍕", "🎸"].map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => {
                            setAddContactAvatar(av);
                            hiveAudio.playHoneyPop();
                          }}
                          className={`text-xl p-1.5 rounded transition-transform active:scale-95 text-center cursor-pointer ${
                            addContactAvatar === av
                              ? "bg-sky-200 ring-2 ring-sky-500 scale-110"
                              : "hover:bg-slate-100"
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  {addContactError && (
                    <div className="text-[10px] font-black text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      ⚠️ {addContactError}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-[#cbdcf0] border-t border-[#bad0e3] flex justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsAddContactOpen(false);
                  hiveAudio.playHoneyPop();
                }}
                className="px-3 py-1.5 rounded bg-[#bdbdbd] border border-[#7b7b7b] hover:bg-white text-slate-800 font-bold text-[10px] active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                Annuleren
              </button>

              {!addContactSuccess && (
                <button
                  type="submit"
                  disabled={isAddingContact}
                  className="px-4 py-1.5 rounded bg-[#2C629E] hover:bg-[#1f4a7c] text-white font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer text-[10.5px] uppercase tracking-wide disabled:opacity-50"
                >
                  {isAddingContact ? "Bezig met toevoegen..." : "Toevoegen 👤"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
