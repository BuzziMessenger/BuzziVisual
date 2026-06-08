/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isBuzz?: boolean; // True if it is a Nudge/Duwtje
  isWink?: boolean; // True if a fullscreen Wink
  winkId?: string; // e.g. "pig", "crazy", "water", "guitar", "heart"
  isGameDuel?: boolean; // Game invite
  gameType?: "tictactoe" | "connect4" | "rps" | "snake" | "memory";
  gameId?: string;
  gameStatus?: "inviting" | "ended" | "active";
  isCallInvite?: boolean; // Real WebRTC calling invite
  callId?: string;
  callStatus?: "dialing" | "connecting" | "active" | "ended";
  customFontColor?: string; // Buzzi custom text color
  customFontFamily?: string; // Buzzi custom font
  fileTransfer?: {
    name: string;
    size: string;
    progress: number; // 0-100
    status: "sending" | "completed" | "failed";
    dataUrl?: string;
  };
}

export type StatusType = "online" | "bezet" | "afwezig" | "offline";

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: StatusType;
  personalMessage: string;
  listeningTo?: string; // Buzzi Music feature: "Luistert nu naar: ..."
  isPremium?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  unreadCount?: number;
}
