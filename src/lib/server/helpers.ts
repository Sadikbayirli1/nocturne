import { getSql } from "@/lib/db";
import { asJson, uid } from "@/lib/utils";
import type {
  ChatMessage,
  HistoryItem,
  JoinRequest,
  Playback,
  Profile,
  RoomMember,
  RoomSnapshot,
  RoomTheme,
  Track,
} from "@/lib/types";

export async function ensureProfile(
  userId: string,
  fallbackName?: string | null,
  fallbackAvatar?: string | null,
): Promise<Profile> {
  const sql = await getSql();
  const existing = await sql.query<{
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    status: string;
    music_muted: boolean;
    locale: string;
    appearance: string;
  }>(
    `select user_id, display_name, avatar_url, status, music_muted, locale, appearance
     from profiles where user_id = $1`,
    [userId],
  );
  if (existing[0]) return mapProfile(existing[0]);

  const name = (fallbackName ?? "Listener").slice(0, 40) || "Listener";
  await sql.query(
    `insert into profiles (user_id, display_name, avatar_url)
     values ($1, $2, $3)
     on conflict (user_id) do nothing`,
    [userId, name, fallbackAvatar ?? null],
  );
  const rows = await sql.query<{
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    status: string;
    music_muted: boolean;
    locale: string;
    appearance: string;
  }>(
    `select user_id, display_name, avatar_url, status, music_muted, locale, appearance
     from profiles where user_id = $1`,
    [userId],
  );
  if (!rows[0]) {
    return {
      userId,
      displayName: name,
      avatarUrl: fallbackAvatar ?? null,
      status: "available",
      musicMuted: false,
      locale: "tr",
      appearance: "dark",
    };
  }
  return mapProfile(rows[0]);
}

function mapProfile(row: {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
  music_muted: boolean;
  locale: string;
  appearance: string;
}): Profile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    status: row.status === "away" ? "away" : "available",
    musicMuted: Boolean(row.music_muted),
    locale: row.locale === "en" || row.locale === "ar" ? row.locale : "tr",
    appearance: row.appearance === "light" ? "light" : "dark",
  };
}

export async function notify(opts: {
  userId: string;
  kind: string;
  title: string;
  body?: string;
  href?: string | null;
}) {
  const sql = await getSql();
  await sql.query(
    `insert into notifications (id, user_id, kind, title, body, href)
     values ($1, $2, $3, $4, $5, $6)`,
    [uid("ntf"), opts.userId, opts.kind, opts.title, opts.body ?? "", opts.href ?? null],
  );
}

export async function getMemberRole(roomId: string, userId: string) {
  const sql = await getSql();
  const rows = await sql.query<{ role: string }>(
    `select role from room_members where room_id = $1 and user_id = $2`,
    [roomId, userId],
  );
  const role = rows[0]?.role;
  if (role === "owner" || role === "member") return role;
  return null;
}

export async function requireMember(roomId: string, userId: string) {
  const role = await getMemberRole(roomId, userId);
  if (!role) throw new Error("Not a member of this room");
  return role;
}

export async function loadSnapshot(roomId: string, userId: string): Promise<RoomSnapshot> {
  const sql = await getSql();
  const rooms = await sql.query<{
    id: string;
    name: string;
    theme: string;
    owner_id: string;
    password_hash: string | null;
    created_at: string;
  }>(
    `select id, name, theme, owner_id, password_hash, created_at::text as created_at
     from rooms where id = $1`,
    [roomId],
  );
  const room = rooms[0];
  if (!room) throw new Error("Room not found");

  const memberRows = await sql.query<{
    user_id: string;
    role: string;
    display_name: string;
    avatar_url: string | null;
    status: string;
    music_muted: boolean;
  }>(
    `select m.user_id, m.role, coalesce(p.display_name, 'Listener') as display_name,
            p.avatar_url, coalesce(p.status, 'available') as status,
            coalesce(p.music_muted, false) as music_muted
     from room_members m
     left join profiles p on p.user_id = m.user_id
     where m.room_id = $1
     order by m.joined_at`,
    [roomId],
  );
  const members: RoomMember[] = memberRows.map((r) => ({
    userId: r.user_id,
    displayName: r.display_name,
    avatarUrl: r.avatar_url,
    role: r.role === "owner" ? "owner" : "member",
    status: r.status === "away" ? "away" : "available",
    musicMuted: Boolean(r.music_muted),
  }));

  const self = members.find((m) => m.userId === userId);
  if (!self) throw new Error("Not a member of this room");

  const requestRows =
    self.role === "owner"
      ? await sql.query<{
          id: string;
          user_id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        }>(
          `select j.id, j.user_id, coalesce(p.display_name, 'Listener') as display_name,
                  p.avatar_url, j.created_at::text as created_at
           from join_requests j
           left join profiles p on p.user_id = j.user_id
           where j.room_id = $1 and j.status = 'pending'
           order by j.created_at`,
          [roomId],
        )
      : [];
  const requests: JoinRequest[] = requestRows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    displayName: r.display_name,
    avatarUrl: r.avatar_url,
    createdAt: r.created_at,
  }));

  const queueRows = await sql.query<{ track: unknown }>(
    `select track from queue_items where room_id = $1 order by sort_order, created_at`,
    [roomId],
  );
  const queue = queueRows.map((r) => asJson<Track>(r.track));

  const playRows = await sql.query<{
    track: unknown;
    is_playing: boolean;
    position_ms: number;
    started_at: number | null;
    volume: number;
    controller_id: string | null;
    controller_name: string | null;
    updated_at: string;
  }>(
    `select track, is_playing, position_ms, started_at, volume, controller_id, controller_name,
            updated_at::text as updated_at
     from room_playback where room_id = $1`,
    [roomId],
  );
  const p = playRows[0];
  const playback: Playback = p
    ? {
        track: p.track ? asJson<Track>(p.track) : null,
        isPlaying: Boolean(p.is_playing),
        positionMs: Number(p.position_ms) || 0,
        startedAt: p.started_at == null ? null : Number(p.started_at),
        volume: Number(p.volume) || 80,
        controllerId: p.controller_id,
        controllerName: p.controller_name,
        updatedAt: Date.parse(p.updated_at) || Date.now(),
      }
    : {
        track: null,
        isPlaying: false,
        positionMs: 0,
        startedAt: null,
        volume: 80,
        controllerId: null,
        controllerName: null,
        updatedAt: 0,
      };

  const msgRows = await sql.query<{
    id: string;
    room_id: string;
    user_id: string;
    kind: string;
    body: string;
    media_url: string | null;
    created_at: string;
    display_name: string;
    avatar_url: string | null;
  }>(
    `select m.id, m.room_id, m.user_id, m.kind, m.body, m.media_url,
            m.created_at::text as created_at,
            coalesce(p.display_name, 'Listener') as display_name, p.avatar_url
     from messages m
     left join profiles p on p.user_id = m.user_id
     where m.room_id = $1
     order by m.created_at desc
     limit 80`,
    [roomId],
  );
  const ids = msgRows.map((m) => m.id);
  const ackRows =
    ids.length === 0
      ? []
      : await sql.query<{ message_id: string; stage: string; n: number }>(
          `select message_id, stage, count(*)::int as n from message_acks
           where message_id = any($1::text[]) and user_id <> $2
           group by message_id, stage`,
          [ids, userId],
        );
  const ackMap = new Map<string, { delivered: number; read: number }>();
  for (const a of ackRows) {
    const cur = ackMap.get(a.message_id) ?? { delivered: 0, read: 0 };
    if (a.stage === "read") cur.read += a.n;
    if (a.stage === "delivered") cur.delivered += a.n;
    ackMap.set(a.message_id, cur);
  }
  const messages: ChatMessage[] = msgRows
    .slice()
    .reverse()
    .map((m) => {
      const ack = ackMap.get(m.id);
      let receipt: ChatMessage["receipt"] = "sent";
      if (ack && ack.read > 0) receipt = "read";
      else if (ack && ack.delivered > 0) receipt = "delivered";
      return {
        id: m.id,
        roomId: m.room_id,
        userId: m.user_id,
        displayName: m.display_name,
        avatarUrl: m.avatar_url,
        kind: (["text", "image", "voice", "system"].includes(m.kind)
          ? m.kind
          : "text") as ChatMessage["kind"],
        body: m.body,
        mediaUrl: m.media_url,
        createdAt: m.created_at,
        receipt,
      };
    });

  const histRows = await sql.query<{
    id: string;
    track: unknown;
    played_by: string | null;
    played_at: string;
  }>(
    `select id, track, played_by, played_at::text as played_at
     from listen_history where room_id = $1
     order by played_at desc limit 40`,
    [roomId],
  );
  const history: HistoryItem[] = histRows.map((h) => ({
    id: h.id,
    track: asJson<Track>(h.track),
    playedBy: h.played_by,
    playedAt: h.played_at,
  }));

  const theme = (
    ["violet", "obsidian", "ember", "aurora", "ivory"].includes(room.theme)
      ? room.theme
      : "violet"
  ) as RoomTheme;

  return {
    room: {
      id: room.id,
      name: room.name,
      theme,
      ownerId: room.owner_id,
      hasPassword: Boolean(room.password_hash),
      createdAt: room.created_at,
    },
    members,
    requests,
    queue,
    playback,
    messages,
    history,
    selfRole: self.role,
  };
}

export async function systemMessage(roomId: string, userId: string, body: string) {
  const sql = await getSql();
  await sql.query(
    `insert into messages (id, room_id, user_id, kind, body) values ($1, $2, $3, 'system', $4)`,
    [uid("msg"), roomId, userId, body],
  );
}

export function stripTrackMedia(track: Track): Track {
  if (track.audioUrl && track.audioUrl.startsWith("data:") && track.audioUrl.length > 80_000) {
    return { ...track, audioUrl: track.audioUrl };
  }
  return track;
}
