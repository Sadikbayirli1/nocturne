export const LOCALES = ["tr", "en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const APPEARANCES = ["dark", "light"] as const;
export type Appearance = (typeof APPEARANCES)[number];

export const ROOM_THEMES = [
  "violet",
  "obsidian",
  "ember",
  "aurora",
  "ivory",
] as const;
export type RoomTheme = (typeof ROOM_THEMES)[number];

export type TrackSource = "youtube" | "audio" | "upload";

export type Track = {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
  source: TrackSource;
  youtubeId?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  addedById?: string;
  addedByName?: string;
};

export type Profile = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  status: "available" | "away";
  musicMuted: boolean;
  locale: Locale;
  appearance: Appearance;
};

export type Friend = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  status: "available" | "away";
  relation: "accepted" | "outgoing" | "incoming";
  friendshipId: string;
};

export type RoomSummary = {
  id: string;
  name: string;
  theme: RoomTheme;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  hasPassword: boolean;
  currentTitle: string | null;
  role: "owner" | "member";
};

export type RoomMember = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: "owner" | "member";
  status: "available" | "away";
  musicMuted: boolean;
};

export type JoinRequest = {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
};

export type Playback = {
  track: Track | null;
  isPlaying: boolean;
  positionMs: number;
  startedAt: number | null;
  volume: number;
  controllerId: string | null;
  controllerName: string | null;
  updatedAt: number;
};

export type ChatKind = "text" | "image" | "voice" | "system";

export type ChatMessage = {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  kind: ChatKind;
  body: string;
  mediaUrl: string | null;
  createdAt: string;
  receipt: "sent" | "delivered" | "read";
};

export type AppNotification = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export type HistoryItem = {
  id: string;
  track: Track;
  playedBy: string | null;
  playedAt: string;
};

export type RoomSnapshot = {
  room: {
    id: string;
    name: string;
    theme: RoomTheme;
    ownerId: string;
    hasPassword: boolean;
    createdAt: string;
  };
  members: RoomMember[];
  requests: JoinRequest[];
  queue: Track[];
  playback: Playback;
  messages: ChatMessage[];
  history: HistoryItem[];
  selfRole: "owner" | "member";
};

export type RoomAccess =
  | { status: "member"; snapshot: RoomSnapshot }
  | { status: "need-join"; roomName: string; theme: RoomTheme; hasPassword: boolean; pending: boolean }
  | { status: "missing" };

export const LIMITS = {
  imageChars: 700_000,
  avatarChars: 450_000,
  voiceChars: 900_000,
  audioChars: 2_800_000,
  messageChars: 2000,
  roomName: 48,
  displayName: 40,
  libraryMax: 40,
} as const;
