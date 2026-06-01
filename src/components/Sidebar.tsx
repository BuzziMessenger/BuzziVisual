/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Channel, Contact, StatusType } from "../types";
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Music, 
  ChevronDown as DropdownIcon,
  Search,
  MessageSquare,
  Bot
} from "lucide-react";

interface SidebarProps {
  channels: Channel[];
  contacts: Contact[];
  activeId: string;
  activeType: "channel" | "dm";
  onSelectChannel: (channelId: string) => void;
  onSelectDM: (contactId: string) => void;
  userEmail: string;
  onSignOut?: () => void;
  
  // Custom User Profile State for MSN Clone
  userDisplayName: string;
  onUpdateDisplayName: (name: string) => void;
  userPersonalMessage: string;
  onUpdatePersonalMessage: (msg: string) => void;
  userStatus: StatusType;
  onUpdateStatus: (status: StatusType) => void;
  userAvatar: string;
  onUpdateAvatar: (avatar: string) => void;
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
  userDisplayName,
  onUpdateDisplayName,
  userPersonalMessage,
  onUpdatePersonalMessage,
  userStatus,
  onUpdateStatus,
  userAvatar,
  onUpdateAvatar
}) => {
  // Collapsible groups states
  const [onlineExpanded, setOnlineExpanded] = useState(true);
  const [offlineExpanded, setOfflineExpanded] = useState(true);
  const [chatbotsExpanded, setChatbotsExpanded] = useState(true);

  // Edit fields visibility
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [tempName, setTempName] = useState(userDisplayName);
  const [tempMessage, setTempMessage] = useState(userPersonalMessage);

  const handleUpdateName = () => {
    onUpdateDisplayName(tempName.trim() || userEmail.split("@")[0]);
    setIsEditingName(false);
  };

  const handleUpdateMessage = () => {
    onUpdatePersonalMessage(tempMessage.trim() || "Typ hier je weergavenaam of statusbericht...");
    setIsEditingMessage(false);
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

  // Categorize Contacts
  const chatbots = contacts.filter(c => c.id === "queen"); // Gemini AI Bot
  const onlineContacts = contacts.filter(c => c.id !== "queen" && c.status !== "offline");
  const offlineContacts = contacts.filter(c => c.id !== "queen" && c.status === "offline");

  return (
    <div className="w-80 bg-[#e4ecf7] text-slate-800 flex flex-col h-full border-r border-[#6f8da5] select-none font-sans shadow-md">
      {/* MSN Messenger Title Bar / Header Decoration */}
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

      {/* Profile Box Area (Classic MSN top panel with Display Picture Frame) */}
      <div className="p-4 bg-gradient-to-b from-[#f2f7fc] to-[#d6e5f4] border-b border-[#9ebcd1] flex gap-3.5 relative overflow-hidden">
        {/* MSN light glare shine background effect */}
        <div className="absolute inset-0 bg-[#ffffff]/25 pointer-events-none transform -skew-y-12 origin-top-left scale-150" />

        {/* Display Picture Container (with iconic MSN thick square gradient frame) */}
        <div className="relative group flex-shrink-0 z-10">
          <div className="w-14 h-14 bg-white p-0.5 rounded-md border-2 border-[#86a8cf] shadow-md flex items-center justify-center overflow-hidden hover:scale-105 transition-all">
            <span className="text-3xl select-none">{userAvatar}</span>
          </div>
          {/* Custom Avatar quick picker popup (click to rotate smileys) */}
          <button 
            onClick={() => {
              const avatars = ["🧑‍🚀", "⚡", "🛹", "🤘", "🎮", "🎸", "🎧", "🍕", "🐶"];
              const curIdx = avatars.indexOf(userAvatar);
              const nextAvatar = avatars[(curIdx + 1) % avatars.length];
              onUpdateAvatar(nextAvatar);
            }} 
            className="absolute -bottom-1 -right-1 bg-[#1d5c8a] text-white p-1 rounded-full text-[8px] border border-white/60 shadow hover:bg-sky-600 cursor-pointer"
            title="Klik om weergaveafbeelding te wijzigen"
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
                className="text-sm font-bold text-slate-800 hover:bg-[#cfe1f5] px-1 py-0.5 rounded cursor-pointer truncate max-w-[150px]"
                title="Klik om je weergavenaam aan te passen (H)"
              >
                {userDisplayName}
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

          {/* MSN Personal Status Tagline ("Type what you are listening to...") */}
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

          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 truncate">
            <Music className="w-3 h-3 text-sky-600 flex-shrink-0 animate-pulse" />
            <span className="truncate">Nu luistert naar: <em className="text-sky-800">My Chemical Romance - Helena (v1)</em></span>
          </div>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="mt-1.5 self-start text-[10px] text-[#2c659e] hover:text-red-700 font-bold hover:underline cursor-pointer uppercase tracking-wider flex items-center gap-1"
            >
              <span>🚪 Afmelden (Sign Out)</span>
            </button>
          )}
        </div>
      </div>

      {/* Search contacts bar (reminiscent of MSN Windows Live 7.x/8.0 search) */}
      <div className="p-2 bg-[#f0f4f9] border-b border-[#bad0e3] flex items-center gap-1.5">
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <input 
          type="text"
          placeholder="Zoeken naar contacten..."
          className="bg-transparent border-none text-xs w-full focus:outline-none placeholder-slate-400"
          disabled
        />
        <span className="text-[9px] bg-slate-200 text-slate-500 px-1 py-0.2 rounded">56kb/s</span>
      </div>

      {/* Buddy List (Collapsible Groups with Classic Arrows) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-white border-[#9ebcd1] custom-scrollbar">

        {/* Group 1: Chat Robots */}
        <div>
          <button 
            onClick={() => setChatbotsExpanded(!chatbotsExpanded)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 px-1 py-1 hover:bg-[#f3f7fb] rounded border-b border-[#e9eff5]"
          >
            <div className="flex items-center gap-1">
              {chatbotsExpanded ? <ChevronDown className="w-3 h-3 text-slate-600" /> : <ChevronRight className="w-3 h-3 text-slate-600" />}
              <span>MSN Chat Robots ({chatbots.length}/{chatbots.length})</span>
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
                            {contact.name} <span className="text-sky-600 text-[10px] font-normal font-mono">({contact.email})</span>
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
                      
                      <div className="flex-1 min-w-0 pr-1">
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {contact.name}
                        </span>
                        <p className="text-[10.5px] text-slate-400 italic truncate leading-none mt-0.5">
                          &ldquo;{contact.personalMessage}&rdquo;
                        </p>
                      </div>

                      {contact.listeningTo && (
                        <Music className="w-3 h-3 text-sky-600 flex-shrink-0" title={`Luistert naar: ${contact.listeningTo}`} />
                      )}
                    </button>
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
                  <li key={contact.id}>
                    <button
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left opacity-60 hover:bg-[#f9f9F9]"
                      onClick={() => onSelectDM(contact.id)}
                    >
                      <div className="relative">
                        <span className="text-lg bg-slate-100 border border-slate-200 py-0.5 px-1 rounded block leading-none saturate-50">{contact.avatar}</span>
                        <span className="absolute -bottom-1 -right-1 leading-none">{getStatusIcon("offline")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-slate-600 font-medium truncate block">{contact.name}</span>
                        <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">({contact.email})</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Group 4: MSN Groepsgesprekken / Kanalen */}
        <div>
          <button 
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 px-1 py-1 hover:bg-[#f3f7fb] rounded border-b border-[#e9eff5]"
          >
            <div className="flex items-center gap-1">
              <ChevronDown className="w-3 h-3 text-slate-600" />
              <span> MSN Groepsgesprekken ({channels.length})</span>
            </div>
          </button>
          
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
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-green-700 shadow-sm" />
          <span className="font-semibold text-[11px] font-sans">Buzzi Service: Verbonden</span>
        </div>
        <span className="text-[10px] font-mono font-medium text-slate-500">v7.5.0311</span>
      </div>
    </div>
  );
};
