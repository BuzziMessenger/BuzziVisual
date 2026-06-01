/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Message, Contact, Channel } from "../types";
import { motion, AnimatePresence } from "motion/react";
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
  BellRing
} from "lucide-react";
import { hiveAudio } from "../utils/audio";

interface ChatAreaProps {
  activeId: string;
  activeType: "channel" | "dm";
  activeChannel?: Channel;
  activeContact?: Contact;
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (text: string, isBuzz?: boolean, isWink?: boolean, winkId?: string) => void;
  onBuzzIncoming: () => void;
  myDisplayName: string;
  myAvatar: string;
  myUserId?: string;
}

const BUZZI_EMOTICONS = [
  { code: ":-D", char: "😃", name: "Blij" },
  { code: "(H)", char: "😎", name: "Cool" },
  { code: "(A)", char: "😇", name: "Engeltje" },
  { code: "(L)", char: "❤️", name: "Hartje" },
  { code: "(U)", char: "💔", name: "Gebroken Hart" },
  { code: ":-P", char: "😜", name: "Tong" },
  { code: "(K)", char: "💋", name: "Kus" },
  { code: "(F)", char: "🌹", name: "Roos" },
  { code: "(W)", char: "🥀", name: "Verwelkt" },
  { code: "(coo)", char: "💻", name: "PC" },
  { code: "(grr)", char: "😡", name: "Boos" },
  { code: "(S)", char: "⭐", name: "Ster" },
  { code: "(Y)", char: "👍", name: "Duim op" },
  { code: "(N)", char: "👎", name: "Duim neer" },
  { code: ":-O", char: "😲", name: "Verrast" },
  { code: ";-)", char: "😉", name: "Knipoog" },
  { code: ":-(", char: "😢", name: "Verdrietig" },
  { code: "(8)", char: "🎵", name: "Muziek" },
  { code: "(pl)", char: "🛹", name: "Skateboard" },
  { code: "(pi)", char: "🍕", name: "Pizza" },
  { code: "(beer)", char: "🍺", name: "Bier" },
  { code: "(v)", char: "✌️", name: "Peace" },
];

const WINKS_LIST = [
  { id: "pig", title: "Knipogend Varken", icon: "🐷", desc: "Een vrolijk roze Buzzi-varkentje met een vette knipoog!" },
  { id: "crazy", title: "Gekke Lachebek", icon: "🤪", desc: "Een gigantische gele smiley die onbedaarlijk lacht en rammelt." },
  { id: "water", title: "Waterballon", icon: "🎈", desc: "Gooi een waterballon tegen het scherm en laat het druipen!" },
  { id: "guitar", title: "Luchtgitaar", icon: "🎸", desc: "Scheur op een vette elektrische gitaar met bliksem en sterren!" },
  { id: "heart", title: "Hartjes Explosie", icon: "💖", desc: "Een groot kloppend hart dat kapot schiet in tientallen harten." }
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
  myUserId
}) => {
  const [inputText, setInputText] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showEmoticonPicker, setShowEmoticonPicker] = useState(false);
  const [showWinksPicker, setShowWinksPicker] = useState(false);
  const [activeWink, setActiveWink] = useState<string | null>(null);
  const lastProcessedWinkId = useRef<string | null>(null);
  
  // Custom font styling for retro Buzzi customization
  const [mmsColor, setMmsColor] = useState<string>("#1d5fb0"); // Buzzi classic blue text
  const [mmsFont, setMmsFont] = useState<string>("Comic Sans MS"); // Comic Sans default lol
  const [isBold, setIsBold] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Monitor incoming messages for Winks to trigger the full screen play and synth sound!
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.isWink && lastMsg.winkId) {
      if (lastProcessedWinkId.current === lastMsg.id) {
        return;
      }
      lastProcessedWinkId.current = lastMsg.id;
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
      }

      const timer = setTimeout(() => {
        setActiveWink(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

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
    let result: React.ReactNode = text;
    
    // Simple inline matching of Buzzi emoticons
    BUZZI_EMOTICONS.forEach(em => {
      // Escape for regex safe
      const escapedCode = em.code.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const parts = text.split(new RegExp(`(${escapedCode})`, 'g'));
      
      if (parts.length > 1) {
        result = parts.map((part, i) => {
          if (part === em.code) {
            return (
              <span 
                key={i} 
                className="inline-block text-lg hover:scale-125 transition-transform cursor-help"
                title={em.code}
              >
                {em.char}
              </span>
            );
          }
          return part;
        }) as any;
      }
    });

    return result;
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
            <span className="text-sm font-bold text-slate-800">
              {activeType === "channel" 
                ? `👥 Groep: #${activeChannel?.name}` 
                : `💬 ${activeContact?.name} <${activeContact?.email}>`}
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
          <div className="bg-white/80 border border-emerald-200 rounded px-2.5 py-1 flex items-center gap-1 text-[10px] text-emerald-700 font-bold font-mono">
            <Wifi className="w-3 h-3 text-emerald-600" />
            <span>BUZZI SECURE DIRECT</span>
          </div>
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

          {/* Letters customization */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/60 border border-slate-300 rounded-lg shadow-sm">
            <Palette className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <div className="flex items-center gap-1">
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
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setMmsColor(c.hex);
                    hiveAudio.playHoneyPop();
                  }}
                  className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer active:scale-90 border flex items-center justify-center ${
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
              title="Kies een geanimeerde Wink (Knipoog) over het hele scherm!"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
              <span className="text-pink-700">Knipogen 😉</span>
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
                        <div className="text-xs font-bold text-slate-800 group-hover:text-pink-700">{wink.title}</div>
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

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-0.5 leading-relaxed font-sans"
                >
                  {/* Buzzi style message header: "Robbin zegt (12:04):" */}
                  <div className="text-xs select-none flex items-center gap-1.5 pt-1">
                    <span className={`font-bold ${isMe ? "text-slate-500" : isQueen ? "text-sky-700" : "text-emerald-700"}`}>
                      {msg.senderName} zegt:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({msg.timestamp})</span>
                  </div>

                  {/* Buzzi style message content text inside window */}
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
              <span className="text-4xl filter drop-shadow-sm select-none">
                {activeContact ? activeContact.avatar : "👥"}
              </span>
            </div>
            <span className="text-[9.5px] font-semibold text-slate-600 truncate max-w-[80px] mt-1 text-center font-mono">
              {activeContact ? activeContact.name.split(" ")[0] : "Groep"}
            </span>
          </div>

          <div className="h-px w-14 bg-slate-300/60 my-2" />

          {/* My Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-[82px] h-[82px] bg-white p-1 rounded border-2 border-[#aabed4] shadow flex items-center justify-center overflow-hidden hover:rotate-2 transition-transform">
              <span className="text-4xl filter drop-shadow-sm select-none">{myAvatar}</span>
            </div>
            <span className="text-[9.5px] font-semibold text-slate-600 truncate max-w-[80px] mt-1 text-center font-mono">
              {myDisplayName.split(" ")[0]}
            </span>
            <span className="text-[9px] text-[#2c659e] font-bold mt-0.5">Jijzelf</span>
          </div>

        </div>

        {/* Full-screen retro Buzzi Winks Overlays */}
        {activeWink && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            {/* Authentic Buzzi Close Button for Winks */}
            <button
              onClick={() => setActiveWink(null)}
              className="absolute top-4 right-4 bg-white/95 hover:bg-white text-slate-800 hover:text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold font-sans text-sm border border-slate-300 shadow-md z-50 pointer-events-auto cursor-pointer transition-all active:scale-90"
              title="Sluit knipoog"
            >
              ✕
            </button>

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
          </div>
        )}

      </div>

      {/* Input Action Panel (Separated into rich area text in MSI clone) */}
      <div className="p-4 bg-white border-t border-[#bad0e3] shadow-inner-lg">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          
          {/* Quick-action trigger */}
          <button 
            type="button"
            onClick={triggerNudge}
            className="bg-red-50 hover:bg-red-100 hover:text-red-700 text-red-500 p-3 rounded-xl border border-red-200 transition-all focus:outline-none flex-shrink-0 active:scale-90 cursor-pointer"
            title="Geef een Duwtje!"
          >
            <Volume2 className="w-5 h-5 text-red-500 animate-pulse" />
          </button>

          {/* Chat input form */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                activeId === "queen"
                  ? "Vraag deze retro Buzzi-bot alles over 2004..."
                  : `Schrijf een nostalgisch bericht... (typ emoticons zoals :-D of (H))`
              }
              className="w-full bg-stone-50 text-stone-900 border border-slate-300 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d5c8a]/50 focus:border-[#1d5c8a] placeholder-stone-400 font-sans shadow-inner"
              maxLength={1000}
            />
            {inputText.trim() && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 text-xs font-mono select-none">
                {inputText.length}/1000
              </span>
            )}
          </div>

          {/* Send buttons */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-3 rounded-xl transition-all shadow focus:outline-none flex-shrink-0 flex items-center justify-center cursor-pointer ${
              inputText.trim()
                ? "bg-[#2576b5] hover:bg-[#1d5c8a] active:scale-95 text-white"
                : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200/50 shadow-none"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
