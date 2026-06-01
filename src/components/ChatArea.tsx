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
  onSendMessage: (text: string, isBuzz?: boolean) => void;
  onBuzzIncoming: () => void;
  myDisplayName: string;
  myAvatar: string;
}

const MSN_EMOTICONS = [
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
  myAvatar
}) => {
  const [inputText, setInputText] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [showEmoticonPicker, setShowEmoticonPicker] = useState(false);
  
  // Custom font styling for retro MSN customization
  const [mmsColor, setMmsColor] = useState<string>("#1d5fb0"); // MSN classic blue text
  const [mmsFont, setMmsFont] = useState<string>("Comic Sans MS"); // Comic Sans default lol
  const [isBold, setIsBold] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), false);
    
    // Play message send/receive chime
    hiveAudio.playNotification();
    setInputText("");
    setShowEmoticonPicker(false);
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
    
    // Simple inline matching of MSN emoticons
    MSN_EMOTICONS.forEach(em => {
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
      {/* MSN Active Conversation Header Info */}
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
          <div className="bg-white/80 border border-sky-200 rounded px-2.5 py-1 flex items-center gap-1 text-[10px] text-slate-600 font-mono">
            <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>56K MODEM</span>
          </div>
        </div>
      </div>

      {/* MSN Action Toolbar (Buttons directly below header for tools) */}
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
          <button
            onClick={() => {
              const colors = ["#1d5fb0", "#15a13c", "#d11f25", "#ef7c00", "#7d1b8c", "#121212"];
              const curIdx = colors.indexOf(mmsColor);
              setMmsColor(colors[(curIdx + 1) % colors.length]);
              hiveAudio.playHoneyPop();
            }}
            className="hover:bg-[#cfe1f5] text-slate-700 p-1.5 rounded cursor-pointer flex items-center gap-1"
            title="Verander letterkleur"
          >
            <Palette className="w-3.5 h-3.5 text-blue-600" />
            <span className="w-2.5 h-2.5 rounded-full inline-block border border-slate-400" style={{ backgroundColor: mmsColor }} />
          </button>

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
        <div className="relative">
          <button
            onClick={() => {
              setShowEmoticonPicker(!showEmoticonPicker);
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
              {MSN_EMOTICONS.map((em) => (
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
      </div>

      {/* Two-Column Chat Canvas: Message Feed on the Left, Display Avatars on the Right */}
      <div className="flex-1 flex overflow-hidden bg-slate-50 relative">

        {/* Column 1: Messaging Feed */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="text-[10px] text-slate-400 text-center select-none font-sans py-1 border-b border-dashed border-slate-100">
            Gespreksbeveiliging is actief. Je praat over een 56k inbelverbinding.
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.senderId === "me";
              const isQueen = msg.senderId === "queen";
              const isBuzz = msg.isBuzz;

              // Classic MSN inline Nudge rendering
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
                  {/* MSN style message header: "Robbin zegt (12:04):" */}
                  <div className="text-xs select-none flex items-center gap-1.5 pt-1">
                    <span className={`font-bold ${isMe ? "text-slate-500" : isQueen ? "text-sky-700" : "text-emerald-700"}`}>
                      {msg.senderName} zegt:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({msg.timestamp})</span>
                  </div>

                  {/* MSN style message content text inside window */}
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

            {/* MSN Ticker indicator "Gemini is typing a message..." */}
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

        {/* Column 2: Side Display Pictures (The iconic huge MSN avatars on the right) */}
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
                  ? "Vraag deze retro Gemini MSN-bot alles over 2004..."
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

        {/* Retro Dutch ad banner block (the ultimate nostalgic addition!) */}
        <div className="max-w-4xl mx-auto mt-3 bg-gradient-to-r from-yellow-100 via-amber-50 to-yellow-100 border border-yellow-200 rounded p-1.5 text-center text-[10px] text-slate-600 font-sans flex items-center justify-between shadow-sm select-none relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#e31e24] text-white font-extrabold text-[8px] px-1 tracking-widest uppercase">JAMBA!</div>
          <div className="flex-1 text-center font-medium truncate">
            🔥 <strong>NIEUWE RINGTONE:</strong> sms <em className="text-red-600 font-bold">FROG</em> naar <em className="text-blue-600 font-bold">4040</em> voor de Crazy Frog Ringtone op je Nokia 3310! (€1.50 p/b) 🔥
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); triggerNudge(); }} className="text-sky-600 hover:underline font-bold text-[9px] pr-8 ml-2">Klik hier!</a>
        </div>
      </div>
    </motion.div>
  );
};
