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
  customFontColor?: string; // Buzzi custom text color
  customFontFamily?: string; // Buzzi custom font
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
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  unreadCount?: number;
}
