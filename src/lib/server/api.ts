import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { hashSecret, verifySecret } from "@/lib/hash";
import { assertRate } from "@/lib/rate-limit";
import { asJson, isSafeAudioSrc, isSafeImageSrc, parseYoutubeId, roomCode, uid } from "@/lib/utils";
import { cloneTrack, searchCatalog, YOUTUBE_CATALOG } from "@/lib/catalog";
import { LIMITS, ROOM_THEMES, type Appearance, type Locale, type Playback, type RoomTheme, type Track } from "@/lib/types";
import {
  ensureProfile,
  getMemberRole,
  loadSnapshot,
  notify,
  requireMember,
  systemMessage,
} from "./helpers";

async function sessionProfile(userId: string) {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const u = await getSessionUser();
  return ensureProfile(userId, u?.name ?? u?.email ?? "Listener", u?.image ?? null);
}

export const bootstrapMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const profile = await sessionProfile(context.userId);
    const sql = await getSql();
    const notes = await sql.query<{
      id: string;
      kind: string;
      title: string;
      body: string;
      href: string | null;
      read: boolean;
      created_at: string;
    }>(
      `select id, kind, title, body, href, read, created_at::text as created_at
       from notifications where user_id = $1
       order by created_at desc limit 30`,
      [context.userId],
    );
    return {
      profile,
      notifications: notes.map((n) => ({
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        href: n.href,
        read: Boolean(n.read),
        createdAt: n.created_at,
      })),
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: {
    displayName?: string;
    avatarUrl?: string | null;
    status?: "available" | "away";
    musicMuted?: boolean;
    locale?: Locale;
    appearance?: Appearance;
  }) => d)
  .handler(async ({ context, data }) => {
    assertRate(`prof:${context.userId}`, 20, 10_000);
    await sessionProfile(context.userId);
    const sql = await getSql();
    const name = data.displayName?.trim().slice(0, LIMITS.displayName);
    if (data.avatarUrl && data.avatarUrl.length > LIMITS.avatarChars) {
      throw new Error("Image is too large");
    }
    if (data.avatarUrl && !isSafeImageSrc(data.avatarUrl) && data.avatarUrl !== null) {
      throw new Error("Invalid image");
    }
    await sql.query(
      `update profiles set
         display_name = coalesce($2, display_name),
         avatar_url = case when $3::text = '__skip' then avatar_url else $3 end,
         status = coalesce($4, status),
         music_muted = coalesce($5, music_muted),
         locale = coalesce($6, locale),
         appearance = coalesce($7, appearance),
         updated_at = now()
       where user_id = $1`,
      [
        context.userId,
        name || null,
        data.avatarUrl === undefined ? "__skip" : data.avatarUrl,
        data.status ?? null,
        data.musicMuted ?? null,
        data.locale ?? null,
        data.appearance ?? null,
      ],
    );
    return sessionProfile(context.userId);
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql.query(`update notifications set read = true where user_id = $1`, [context.userId]);
    return { ok: true };
  });

export const listRooms = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await sessionProfile(context.userId);
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      name: string;
      theme: string;
      owner_id: string;
      owner_name: string;
      member_count: number;
      has_password: boolean;
      current_title: string | null;
      role: string;
    }>(
      `select r.id, r.name, r.theme, r.owner_id,
              coalesce(op.display_name, 'Host') as owner_name,
              (select count(*)::int from room_members m where m.room_id = r.id) as member_count,
              (r.password_hash is not null) as has_password,
              pb.track->>'title' as current_title,
              me.role
       from room_members me
       join rooms r on r.id = me.room_id
       left join profiles op on op.user_id = r.owner_id
       left join room_playback pb on pb.room_id = r.id
       where me.user_id = $1
       order by r.created_at desc`,
      [context.userId],
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      theme: (ROOM_THEMES.includes(r.theme as RoomTheme) ? r.theme : "violet") as RoomTheme,
      ownerId: r.owner_id,
      ownerName: r.owner_name,
      memberCount: Number(r.member_count) || 1,
      hasPassword: Boolean(r.has_password),
      currentTitle: r.current_title,
      role: r.role === "owner" ? ("owner" as const) : ("member" as const),
    }));
  });

export const createRoom = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { name: string; password?: string; theme?: RoomTheme }) => d)
  .handler(async ({ context, data }) => {
    assertRate(`croom:${context.userId}`, 8, 60_000);
    const profile = await sessionProfile(context.userId);
    const name = data.name.trim().slice(0, LIMITS.roomName);
    if (name.length < 2) throw new Error("Room name is too short");
    const theme = ROOM_THEMES.includes(data.theme as RoomTheme) ? (data.theme as RoomTheme) : "violet";
    const password = data.password?.trim();
    const id = roomCode();
    const sql = await getSql();
    await sql.query(
      `insert into rooms (id, name, owner_id, password_hash, theme) values ($1, $2, $3, $4, $5)`,
      [id, name, context.userId, password ? hashSecret(password) : null, theme],
    );
    await sql.query(
      `insert into room_members (room_id, user_id, role) values ($1, $2, 'owner')`,
      [id, context.userId],
    );
    await sql.query(`insert into room_playback (room_id) values ($1)`, [id]);
    await systemMessage(id, context.userId, `${profile.displayName} opened the room`);
    return { id };
  });

export const getRoomAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { code: string }) => d)
  .handler(async ({ context, data }) => {
    await sessionProfile(context.userId);
    const code = data.code.trim().toUpperCase();
    const sql = await getSql();
    const rooms = await sql.query<{
      id: string;
      name: string;
      theme: string;
      password_hash: string | null;
    }>(`select id, name, theme, password_hash from rooms where id = $1`, [code]);
    const room = rooms[0];
    if (!room) return { status: "missing" as const };
    const role = await getMemberRole(code, context.userId);
    if (role) {
      return { status: "member" as const, snapshot: await loadSnapshot(code, context.userId) };
    }
    const pending = await sql.query<{ id: string }>(
      `select id from join_requests where room_id = $1 and user_id = $2 and status = 'pending'`,
      [code, context.userId],
    );
    return {
      status: "need-join" as const,
      roomName: room.name,
      theme: (ROOM_THEMES.includes(room.theme as RoomTheme) ? room.theme : "violet") as RoomTheme,
      hasPassword: Boolean(room.password_hash),
      pending: pending.length > 0,
    };
  });

export const joinRoom = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string; password?: string; mode: "password" | "request" }) => d)
  .handler(async ({ context, data }) => {
    assertRate(`join:${context.userId}`, 12, 30_000);
    const profile = await sessionProfile(context.userId);
    const code = data.code.trim().toUpperCase();
    const sql = await getSql();
    const rooms = await sql.query<{
      id: string;
      name: string;
      owner_id: string;
      password_hash: string | null;
    }>(`select id, name, owner_id, password_hash from rooms where id = $1`, [code]);
    const room = rooms[0];
    if (!room) throw new Error("Room not found");
    const existing = await getMemberRole(code, context.userId);
    if (existing) return { status: "member" as const };

    if (data.mode === "password") {
      if (!room.password_hash) throw new Error("This room has no password");
      if (!data.password || !verifySecret(data.password, room.password_hash)) {
        throw new Error("Incorrect password");
      }
      await sql.query(
        `insert into room_members (room_id, user_id, role) values ($1, $2, 'member')
         on conflict do nothing`,
        [code, context.userId],
      );
      await systemMessage(code, context.userId, `${profile.displayName} joined`);
      await notify({
        userId: room.owner_id,
        kind: "join",
        title: profile.displayName,
        body: "joined the room",
        href: `/room/${code}`,
      });
      return { status: "member" as const };
    }

    await sql.query(
      `insert into join_requests (id, room_id, user_id, status)
       values ($1, $2, $3, 'pending')
       on conflict (room_id, user_id) do update set status = 'pending'`,
      [uid("jr"), code, context.userId],
    );
    await notify({
      userId: room.owner_id,
      kind: "request",
      title: profile.displayName,
      body: `wants to join ${room.name}`,
      href: `/room/${code}`,
    });
    return { status: "pending" as const };
  });

export const decideJoin = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string; requestId: string; accept: boolean }) => d)
  .handler(async ({ context, data }) => {
    const role = await requireMember(data.code, context.userId);
    if (role !== "owner") throw new Error("Only the host can decide");
    const sql = await getSql();
    const rows = await sql.query<{ id: string; user_id: string; status: string }>(
      `select id, user_id, status from join_requests where id = $1 and room_id = $2`,
      [data.requestId, data.code],
    );
    const req = rows[0];
    if (!req) throw new Error("Request not found");
    await sql.query(`update join_requests set status = $2 where id = $1`, [
      req.id,
      data.accept ? "accepted" : "declined",
    ]);
    if (data.accept) {
      await sql.query(
        `insert into room_members (room_id, user_id, role) values ($1, $2, 'member')
         on conflict do nothing`,
        [data.code, req.user_id],
      );
      const p = await ensureProfile(req.user_id);
      await systemMessage(data.code, req.user_id, `${p.displayName} joined`);
      await notify({
        userId: req.user_id,
        kind: "invite",
        title: "You're in",
        body: "The host approved your request",
        href: `/room/${data.code}`,
      });
    }
    return loadSnapshot(data.code, context.userId);
  });

export const kickMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string; userId: string }) => d)
  .handler(async ({ context, data }) => {
    const role = await requireMember(data.code, context.userId);
    if (role !== "owner") throw new Error("Only the host can remove people");
    if (data.userId === context.userId) throw new Error("Host cannot be removed");
    const sql = await getSql();
    await sql.query(`delete from room_members where room_id = $1 and user_id = $2`, [
      data.code,
      data.userId,
    ]);
    const p = await ensureProfile(data.userId);
    await systemMessage(data.code, context.userId, `${p.displayName} was removed`);
    return loadSnapshot(data.code, context.userId);
  });

export const leaveRoom = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string }) => d)
  .handler(async ({ context, data }) => {
    const role = await requireMember(data.code, context.userId);
    if (role === "owner") throw new Error("Host must delete the room instead");
    const profile = await sessionProfile(context.userId);
    const sql = await getSql();
    await sql.query(`delete from room_members where room_id = $1 and user_id = $2`, [
      data.code,
      context.userId,
    ]);
    await systemMessage(data.code, context.userId, `${profile.displayName} left`);
    return { ok: true };
  });

export const deleteRoom = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string }) => d)
  .handler(async ({ context, data }) => {
    const role = await requireMember(data.code, context.userId);
    if (role !== "owner") throw new Error("Only the host can delete the room");
    const sql = await getSql();
    await sql.query(`delete from messages where room_id = $1`, [data.code]);
    await sql.query(`delete from queue_items where room_id = $1`, [data.code]);
    await sql.query(`delete from room_playback where room_id = $1`, [data.code]);
    await sql.query(`delete from join_requests where room_id = $1`, [data.code]);
    await sql.query(`delete from listen_history where room_id = $1`, [data.code]);
    await sql.query(`delete from room_members where room_id = $1`, [data.code]);
    await sql.query(`delete from rooms where id = $1`, [data.code]);
    return { ok: true };
  });

export const pollRoom = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { code: string }) => d)
  .handler(async ({ context, data }) => {
    await requireMember(data.code, context.userId);
    return loadSnapshot(data.code, context.userId);
  });

export const pushPlayback = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string; playback: Playback; enqueueHistory?: boolean }) => d)
  .handler(async ({ context, data }) => {
    assertRate(`pb:${context.userId}`, 40, 10_000);
    await requireMember(data.code, context.userId);
    const profile = await sessionProfile(context.userId);
    const sql = await getSql();
    const pb = data.playback;
    await sql.query(
      `insert into room_playback
         (room_id, track, is_playing, position_ms, started_at, volume, controller_id, controller_name, updated_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, now())
       on conflict (room_id) do update set
         track = excluded.track,
         is_playing = excluded.is_playing,
         position_ms = excluded.position_ms,
         started_at = excluded.started_at,
         volume = excluded.volume,
         controller_id = excluded.controller_id,
         controller_name = excluded.controller_name,
         updated_at = now()`,
      [
        data.code,
        pb.track ? JSON.stringify(pb.track) : null,
        pb.isPlaying,
        Math.max(0, Math.floor(pb.positionMs)),
        pb.startedAt,
        Math.min(100, Math.max(0, pb.volume)),
        context.userId,
        profile.displayName,
      ],
    );
    if (data.enqueueHistory && pb.track) {
      await sql.query(
        `insert into listen_history (id, room_id, track, played_by) values ($1, $2, $3, $4)`,
        [uid("hst"), data.code, JSON.stringify(pb.track), context.userId],
      );
      const members = await sql.query<{ user_id: string }>(
        `select user_id from room_members where room_id = $1 and user_id <> $2`,
        [data.code, context.userId],
      );
      for (const m of members) {
        await notify({
          userId: m.user_id,
          kind: "song",
          title: pb.track.title,
          body: pb.track.artist,
          href: `/room/${data.code}`,
        });
      }
    }
    return { ok: true };
  });

export const addToQueue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string; track: Track }) => d)
  .handler(async ({ context, data }) => {
    assertRate(`q:${context.userId}`, 30, 20_000);
    await requireMember(data.code, context.userId);
    const profile = await sessionProfile(context.userId);
    if (data.track.audioUrl && data.track.audioUrl.startsWith("data:") && data.track.audioUrl.length > LIMITS.audioChars) {
      throw new Error("Audio file is too large");
    }
    if (data.track.audioUrl && !isSafeAudioSrc(data.track.audioUrl) && !data.track.audioUrl.startsWith("https://")) {
      throw new Error("Invalid audio");
    }
    const track = cloneTrack(data.track, context.userId, profile.displayName);
    const sql = await getSql();
    const max = await sql.query<{ m: number | null }>(
      `select max(sort_order) as m from queue_items where room_id = $1`,
      [data.code],
    );
    const order = (max[0]?.m ?? 0) + 1;
    await sql.query(
      `insert into queue_items (id, room_id, track, sort_order, added_by) values ($1, $2, $3, $4, $5)`,
      [track.id, data.code, JSON.stringify(track), order, context.userId],
    );
    return loadSnapshot(data.code, context.userId);
  });

export const removeFromQueue = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string; trackId: string }) => d)
  .handler(async ({ context, data }) => {
    await requireMember(data.code, context.userId);
    const sql = await getSql();
    await sql.query(`delete from queue_items where room_id = $1 and id = $2`, [
      data.code,
      data.trackId,
    ]);
    return loadSnapshot(data.code, context.userId);
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string; kind: "text" | "image" | "voice"; body?: string; mediaUrl?: string }) => d)
  .handler(async ({ context, data }) => {
    assertRate(`msg:${context.userId}`, 40, 15_000);
    await requireMember(data.code, context.userId);
    const body = (data.body ?? "").trim().slice(0, LIMITS.messageChars);
    if (data.kind === "text" && !body) throw new Error("Message is empty");
    if (data.kind === "image") {
      if (!data.mediaUrl || !isSafeImageSrc(data.mediaUrl)) throw new Error("Invalid image");
      if (data.mediaUrl.length > LIMITS.imageChars) throw new Error("Image is too large");
    }
    if (data.kind === "voice") {
      if (!data.mediaUrl || (!isSafeAudioSrc(data.mediaUrl) && !data.mediaUrl.startsWith("data:audio/"))) {
        throw new Error("Invalid voice note");
      }
      if (data.mediaUrl.length > LIMITS.voiceChars) throw new Error("Voice note is too large");
    }
    const sql = await getSql();
    const id = uid("msg");
    await sql.query(
      `insert into messages (id, room_id, user_id, kind, body, media_url)
       values ($1, $2, $3, $4, $5, $6)`,
      [id, data.code, context.userId, data.kind, body, data.mediaUrl ?? null],
    );
    const members = await sql.query<{ user_id: string }>(
      `select user_id from room_members where room_id = $1 and user_id <> $2`,
      [data.code, context.userId],
    );
    const profile = await sessionProfile(context.userId);
    for (const m of members) {
      await notify({
        userId: m.user_id,
        kind: "message",
        title: profile.displayName,
        body: data.kind === "text" ? body.slice(0, 80) : data.kind,
        href: `/room/${data.code}`,
      });
    }
    return loadSnapshot(data.code, context.userId);
  });

export const ackMessages = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string; stage: "delivered" | "read" }) => d)
  .handler(async ({ context, data }) => {
    await requireMember(data.code, context.userId);
    const sql = await getSql();
    await sql.query(
      `insert into message_acks (message_id, user_id, stage)
       select id, $2, $3 from messages
       where room_id = $1 and user_id <> $2
       on conflict do nothing`,
      [data.code, context.userId, data.stage],
    );
    return { ok: true };
  });

export const listFriends = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await sessionProfile(context.userId);
    const sql = await getSql();
    const rows = await sql.query<{
      id: string;
      requester_id: string;
      addressee_id: string;
      status: string;
      other_id: string;
      display_name: string;
      avatar_url: string | null;
      user_status: string;
    }>(
      `select f.id, f.requester_id, f.addressee_id, f.status,
              case when f.requester_id = $1 then f.addressee_id else f.requester_id end as other_id,
              coalesce(p.display_name, 'Listener') as display_name,
              p.avatar_url,
              coalesce(p.status, 'available') as user_status
       from friendships f
       join profiles p on p.user_id = case when f.requester_id = $1 then f.addressee_id else f.requester_id end
       where (f.requester_id = $1 or f.addressee_id = $1)
         and f.status in ('pending', 'accepted')
       order by f.created_at desc`,
      [context.userId],
    );
    return rows.map((r) => ({
      userId: r.other_id,
      displayName: r.display_name,
      avatarUrl: r.avatar_url,
      status: r.user_status === "away" ? ("away" as const) : ("available" as const),
      relation:
        r.status === "accepted"
          ? ("accepted" as const)
          : r.requester_id === context.userId
            ? ("outgoing" as const)
            : ("incoming" as const),
      friendshipId: r.id,
    }));
  });

export const searchPeople = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { q: string }) => d)
  .handler(async ({ context, data }) => {
    assertRate(`search:${context.userId}`, 20, 10_000);
    const q = data.q.trim().slice(0, 40);
    if (q.length < 1) return [];
    const sql = await getSql();
    const rows = await sql.query<{
      user_id: string;
      display_name: string;
      avatar_url: string | null;
      status: string;
    }>(
      `select user_id, display_name, avatar_url, status
       from profiles
       where user_id <> $1 and display_name ilike $2
       order by display_name
       limit 20`,
      [context.userId, `%${q}%`],
    );
    return rows.map((r) => ({
      userId: r.user_id,
      displayName: r.display_name,
      avatarUrl: r.avatar_url,
      status: r.status === "away" ? ("away" as const) : ("available" as const),
    }));
  });

export const sendFriendRequest = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { userId: string }) => d)
  .handler(async ({ context, data }) => {
    assertRate(`fr:${context.userId}`, 15, 30_000);
    if (data.userId === context.userId) throw new Error("Cannot add yourself");
    const profile = await sessionProfile(context.userId);
    const sql = await getSql();
    const existing = await sql.query<{ id: string; status: string }>(
      `select id, status from friendships
       where (requester_id = $1 and addressee_id = $2)
          or (requester_id = $2 and addressee_id = $1)`,
      [context.userId, data.userId],
    );
    if (existing[0]) return { ok: true };
    await sql.query(
      `insert into friendships (id, requester_id, addressee_id, status) values ($1, $2, $3, 'pending')`,
      [uid("fr"), context.userId, data.userId],
    );
    await notify({
      userId: data.userId,
      kind: "invite",
      title: profile.displayName,
      body: "sent a friend request",
      href: "/app/friends",
    });
    return { ok: true };
  });

export const respondFriend = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { friendshipId: string; accept: boolean }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql.query<{ id: string; addressee_id: string }>(
      `select id, addressee_id from friendships where id = $1`,
      [data.friendshipId],
    );
    const row = rows[0];
    if (!row || row.addressee_id !== context.userId) throw new Error("Request not found");
    if (data.accept) {
      await sql.query(`update friendships set status = 'accepted' where id = $1`, [row.id]);
    } else {
      await sql.query(`update friendships set status = 'declined' where id = $1`, [row.id]);
    }
    return { ok: true };
  });

export const inviteFriendToRoom = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { code: string; userId: string }) => d)
  .handler(async ({ context, data }) => {
    const role = await requireMember(data.code, context.userId);
    if (role !== "owner") throw new Error("Only the host can invite directly");
    const sql = await getSql();
    await sql.query(
      `insert into room_members (room_id, user_id, role) values ($1, $2, 'member')
       on conflict do nothing`,
      [data.code, data.userId],
    );
    const rooms = await sql.query<{ name: string }>(`select name from rooms where id = $1`, [
      data.code,
    ]);
    const p = await ensureProfile(data.userId);
    await systemMessage(data.code, data.userId, `${p.displayName} was invited`);
    await notify({
      userId: data.userId,
      kind: "invite",
      title: rooms[0]?.name ?? "Room",
      body: "You've been invited",
      href: `/room/${data.code}`,
    });
    return loadSnapshot(data.code, context.userId);
  });

export const listLibrary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<{ id: string; track: unknown }>(
      `select id, track from library_tracks where user_id = $1 order by created_at desc`,
      [context.userId],
    );
    return rows.map((r) => asJson<Track>(r.track));
  });

export const addLibraryTrack = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { track: Track }) => d)
  .handler(async ({ context, data }) => {
    assertRate(`lib:${context.userId}`, 20, 30_000);
    const sql = await getSql();
    const count = await sql.query<{ n: number }>(
      `select count(*)::int as n from library_tracks where user_id = $1`,
      [context.userId],
    );
    if ((count[0]?.n ?? 0) >= LIMITS.libraryMax) throw new Error("Library is full");
    if (data.track.audioUrl && data.track.audioUrl.startsWith("data:") && data.track.audioUrl.length > LIMITS.audioChars) {
      throw new Error("Audio file is too large");
    }
    const profile = await sessionProfile(context.userId);
    const track = cloneTrack(data.track, context.userId, profile.displayName);
    await sql.query(
      `insert into library_tracks (id, user_id, track) values ($1, $2, $3)`,
      [track.id, context.userId, JSON.stringify(track)],
    );
    return track;
  });

export const removeLibraryTrack = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql.query(`delete from library_tracks where id = $1 and user_id = $2`, [
      data.id,
      context.userId,
    ]);
    return { ok: true };
  });

export const resolveYoutube = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { input: string }) => d)
  .handler(async ({ context, data }) => {
    assertRate(`yt:${context.userId}`, 20, 20_000);
    const id = parseYoutubeId(data.input);
    if (!id) {
      return { tracks: searchCatalog(data.input) };
    }
    const known = YOUTUBE_CATALOG.find((t) => t.youtubeId === id);
    if (known) return { tracks: [known] };
    let title = "YouTube";
    let artist = "YouTube";
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
      );
      if (res.ok) {
        const json = (await res.json()) as { title?: string; author_name?: string };
        title = json.title?.slice(0, 120) || title;
        artist = json.author_name?.slice(0, 80) || artist;
      }
    } catch {
      /* oembed optional */
    }
    const track: Track = {
      id: `yt-${id}`,
      title,
      artist,
      durationMs: 0,
      source: "youtube",
      youtubeId: id,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
    return { tracks: [track] };
  });

export const catalogQuery = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { q: string }) => d)
  .handler(async ({ data }) => {
    return searchCatalog(data.q);
  });
