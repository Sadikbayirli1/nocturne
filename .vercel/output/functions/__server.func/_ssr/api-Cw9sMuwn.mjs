import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as getSql } from "./db-D0SnWfr8.mjs";
import { t as authMiddleware } from "./middleware-B4AqKLNa.mjs";
import { c as isSafeAudioSrc, d as roomCode, f as uid, l as isSafeImageSrc, t as asJson, u as parseYoutubeId } from "./utils-nBwqipAl.mjs";
import { i as searchCatalog, n as YOUTUBE_CATALOG, r as cloneTrack } from "./catalog-CmFGBXGd.mjs";
import { n as ROOM_THEMES, t as LIMITS } from "./types-BLxICGWs.mjs";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/api-Cw9sMuwn.js
function hashSecret(plain) {
	const salt = randomBytes(16).toString("hex");
	return `${salt}:${createHash("sha256").update(salt + plain).digest("hex")}`;
}
function verifySecret(plain, stored) {
	const [salt, hash] = stored.split(":");
	if (!salt || !hash) return false;
	const next = createHash("sha256").update(salt + plain).digest("hex");
	const a = Buffer.from(hash);
	const b = Buffer.from(next);
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}
var hits = /* @__PURE__ */ new Map();
function rateLimit(key, max, windowMs) {
	const now = Date.now();
	const cur = hits.get(key);
	if (!cur || now - cur.t > windowMs) {
		hits.set(key, {
			n: 1,
			t: now
		});
		return true;
	}
	if (cur.n >= max) return false;
	cur.n += 1;
	return true;
}
function assertRate(key, max, windowMs) {
	if (!rateLimit(key, max, windowMs)) throw new Error("Too many requests. Please wait a moment.");
}
async function ensureProfile(userId, fallbackName, fallbackAvatar) {
	const sql = await getSql();
	const existing = await sql.query(`select user_id, display_name, avatar_url, status, music_muted, locale, appearance
     from profiles where user_id = $1`, [userId]);
	if (existing[0]) return mapProfile(existing[0]);
	const name = (fallbackName ?? "Listener").slice(0, 40) || "Listener";
	await sql.query(`insert into profiles (user_id, display_name, avatar_url)
     values ($1, $2, $3)
     on conflict (user_id) do nothing`, [
		userId,
		name,
		fallbackAvatar ?? null
	]);
	const rows = await sql.query(`select user_id, display_name, avatar_url, status, music_muted, locale, appearance
     from profiles where user_id = $1`, [userId]);
	if (!rows[0]) return {
		userId,
		displayName: name,
		avatarUrl: fallbackAvatar ?? null,
		status: "available",
		musicMuted: false,
		locale: "tr",
		appearance: "dark"
	};
	return mapProfile(rows[0]);
}
function mapProfile(row) {
	return {
		userId: row.user_id,
		displayName: row.display_name,
		avatarUrl: row.avatar_url,
		status: row.status === "away" ? "away" : "available",
		musicMuted: Boolean(row.music_muted),
		locale: row.locale === "en" || row.locale === "ar" ? row.locale : "tr",
		appearance: row.appearance === "light" ? "light" : "dark"
	};
}
async function notify(opts) {
	await (await getSql()).query(`insert into notifications (id, user_id, kind, title, body, href)
     values ($1, $2, $3, $4, $5, $6)`, [
		uid("ntf"),
		opts.userId,
		opts.kind,
		opts.title,
		opts.body ?? "",
		opts.href ?? null
	]);
}
async function getMemberRole(roomId, userId) {
	const role = (await (await getSql()).query(`select role from room_members where room_id = $1 and user_id = $2`, [roomId, userId]))[0]?.role;
	if (role === "owner" || role === "member") return role;
	return null;
}
async function requireMember(roomId, userId) {
	const role = await getMemberRole(roomId, userId);
	if (!role) throw new Error("Not a member of this room");
	return role;
}
async function loadSnapshot(roomId, userId) {
	const sql = await getSql();
	const room = (await sql.query(`select id, name, theme, owner_id, password_hash, created_at::text as created_at
     from rooms where id = $1`, [roomId]))[0];
	if (!room) throw new Error("Room not found");
	const members = (await sql.query(`select m.user_id, m.role, coalesce(p.display_name, 'Listener') as display_name,
            p.avatar_url, coalesce(p.status, 'available') as status,
            coalesce(p.music_muted, false) as music_muted
     from room_members m
     left join profiles p on p.user_id = m.user_id
     where m.room_id = $1
     order by m.joined_at`, [roomId])).map((r) => ({
		userId: r.user_id,
		displayName: r.display_name,
		avatarUrl: r.avatar_url,
		role: r.role === "owner" ? "owner" : "member",
		status: r.status === "away" ? "away" : "available",
		musicMuted: Boolean(r.music_muted)
	}));
	const self = members.find((m) => m.userId === userId);
	if (!self) throw new Error("Not a member of this room");
	const requests = (self.role === "owner" ? await sql.query(`select j.id, j.user_id, coalesce(p.display_name, 'Listener') as display_name,
                  p.avatar_url, j.created_at::text as created_at
           from join_requests j
           left join profiles p on p.user_id = j.user_id
           where j.room_id = $1 and j.status = 'pending'
           order by j.created_at`, [roomId]) : []).map((r) => ({
		id: r.id,
		userId: r.user_id,
		displayName: r.display_name,
		avatarUrl: r.avatar_url,
		createdAt: r.created_at
	}));
	const queue = (await sql.query(`select track from queue_items where room_id = $1 order by sort_order, created_at`, [roomId])).map((r) => asJson(r.track));
	const p = (await sql.query(`select track, is_playing, position_ms, started_at, volume, controller_id, controller_name,
            updated_at::text as updated_at
     from room_playback where room_id = $1`, [roomId]))[0];
	const playback = p ? {
		track: p.track ? asJson(p.track) : null,
		isPlaying: Boolean(p.is_playing),
		positionMs: Number(p.position_ms) || 0,
		startedAt: p.started_at == null ? null : Number(p.started_at),
		volume: Number(p.volume) || 80,
		controllerId: p.controller_id,
		controllerName: p.controller_name,
		updatedAt: Date.parse(p.updated_at) || Date.now()
	} : {
		track: null,
		isPlaying: false,
		positionMs: 0,
		startedAt: null,
		volume: 80,
		controllerId: null,
		controllerName: null,
		updatedAt: 0
	};
	const msgRows = await sql.query(`select m.id, m.room_id, m.user_id, m.kind, m.body, m.media_url,
            m.created_at::text as created_at,
            coalesce(p.display_name, 'Listener') as display_name, p.avatar_url
     from messages m
     left join profiles p on p.user_id = m.user_id
     where m.room_id = $1
     order by m.created_at desc
     limit 80`, [roomId]);
	const ids = msgRows.map((m) => m.id);
	const ackRows = ids.length === 0 ? [] : await sql.query(`select message_id, stage, count(*)::int as n from message_acks
           where message_id = any($1::text[]) and user_id <> $2
           group by message_id, stage`, [ids, userId]);
	const ackMap = /* @__PURE__ */ new Map();
	for (const a of ackRows) {
		const cur = ackMap.get(a.message_id) ?? {
			delivered: 0,
			read: 0
		};
		if (a.stage === "read") cur.read += a.n;
		if (a.stage === "delivered") cur.delivered += a.n;
		ackMap.set(a.message_id, cur);
	}
	const messages = msgRows.slice().reverse().map((m) => {
		const ack = ackMap.get(m.id);
		let receipt = "sent";
		if (ack && ack.read > 0) receipt = "read";
		else if (ack && ack.delivered > 0) receipt = "delivered";
		return {
			id: m.id,
			roomId: m.room_id,
			userId: m.user_id,
			displayName: m.display_name,
			avatarUrl: m.avatar_url,
			kind: [
				"text",
				"image",
				"voice",
				"system"
			].includes(m.kind) ? m.kind : "text",
			body: m.body,
			mediaUrl: m.media_url,
			createdAt: m.created_at,
			receipt
		};
	});
	const history = (await sql.query(`select id, track, played_by, played_at::text as played_at
     from listen_history where room_id = $1
     order by played_at desc limit 40`, [roomId])).map((h) => ({
		id: h.id,
		track: asJson(h.track),
		playedBy: h.played_by,
		playedAt: h.played_at
	}));
	const theme = [
		"violet",
		"obsidian",
		"ember",
		"aurora",
		"ivory"
	].includes(room.theme) ? room.theme : "violet";
	return {
		room: {
			id: room.id,
			name: room.name,
			theme,
			ownerId: room.owner_id,
			hasPassword: Boolean(room.password_hash),
			createdAt: room.created_at
		},
		members,
		requests,
		queue,
		playback,
		messages,
		history,
		selfRole: self.role
	};
}
async function systemMessage(roomId, userId, body) {
	await (await getSql()).query(`insert into messages (id, room_id, user_id, kind, body) values ($1, $2, $3, 'system', $4)`, [
		uid("msg"),
		roomId,
		userId,
		body
	]);
}
async function sessionProfile(userId) {
	const { getSessionUser } = await import("./verify.server-D3IVFG-C.mjs");
	const u = await getSessionUser();
	return ensureProfile(userId, u?.name ?? u?.email ?? "Listener", u?.image ?? null);
}
var bootstrapMe_createServerFn_handler = createServerRpc({
	id: "d4166942886c67af27a6c1c6e38eb4c88d1bae9330c5b945e1c0dddd645e61aa",
	name: "bootstrapMe",
	filename: "src/lib/server/api.ts"
}, (opts) => bootstrapMe.__executeServer(opts));
var bootstrapMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(bootstrapMe_createServerFn_handler, async ({ context }) => {
	return {
		profile: await sessionProfile(context.userId),
		notifications: (await (await getSql()).query(`select id, kind, title, body, href, read, created_at::text as created_at
       from notifications where user_id = $1
       order by created_at desc limit 30`, [context.userId])).map((n) => ({
			id: n.id,
			kind: n.kind,
			title: n.title,
			body: n.body,
			href: n.href,
			read: Boolean(n.read),
			createdAt: n.created_at
		}))
	};
});
var updateProfile_createServerFn_handler = createServerRpc({
	id: "53f7c290724cb151e6f92fa6364cca19a90f8af9fae8f97e415e979917af37ec",
	name: "updateProfile",
	filename: "src/lib/server/api.ts"
}, (opts) => updateProfile.__executeServer(opts));
var updateProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(updateProfile_createServerFn_handler, async ({ context, data }) => {
	assertRate(`prof:${context.userId}`, 20, 1e4);
	await sessionProfile(context.userId);
	const sql = await getSql();
	const name = data.displayName?.trim().slice(0, LIMITS.displayName);
	if (data.avatarUrl && data.avatarUrl.length > LIMITS.avatarChars) throw new Error("Image is too large");
	if (data.avatarUrl && !isSafeImageSrc(data.avatarUrl) && data.avatarUrl !== null) throw new Error("Invalid image");
	await sql.query(`update profiles set
         display_name = coalesce($2, display_name),
         avatar_url = case when $3::text = '__skip' then avatar_url else $3 end,
         status = coalesce($4, status),
         music_muted = coalesce($5, music_muted),
         locale = coalesce($6, locale),
         appearance = coalesce($7, appearance),
         updated_at = now()
       where user_id = $1`, [
		context.userId,
		name || null,
		data.avatarUrl === void 0 ? "__skip" : data.avatarUrl,
		data.status ?? null,
		data.musicMuted ?? null,
		data.locale ?? null,
		data.appearance ?? null
	]);
	return sessionProfile(context.userId);
});
var markNotificationsRead_createServerFn_handler = createServerRpc({
	id: "feafd6ce3fd421d62eb31b119e9ea77c42b624f16a4b8fc15b251338d0d527d9",
	name: "markNotificationsRead",
	filename: "src/lib/server/api.ts"
}, (opts) => markNotificationsRead.__executeServer(opts));
var markNotificationsRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(markNotificationsRead_createServerFn_handler, async ({ context }) => {
	await (await getSql()).query(`update notifications set read = true where user_id = $1`, [context.userId]);
	return { ok: true };
});
var listRooms_createServerFn_handler = createServerRpc({
	id: "f231ade5ab1591150743deea92e1000a5fdb41e6bdf6f2d41082641e4dc9abf7",
	name: "listRooms",
	filename: "src/lib/server/api.ts"
}, (opts) => listRooms.__executeServer(opts));
var listRooms = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listRooms_createServerFn_handler, async ({ context }) => {
	await sessionProfile(context.userId);
	return (await (await getSql()).query(`select r.id, r.name, r.theme, r.owner_id,
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
       order by r.created_at desc`, [context.userId])).map((r) => ({
		id: r.id,
		name: r.name,
		theme: ROOM_THEMES.includes(r.theme) ? r.theme : "violet",
		ownerId: r.owner_id,
		ownerName: r.owner_name,
		memberCount: Number(r.member_count) || 1,
		hasPassword: Boolean(r.has_password),
		currentTitle: r.current_title,
		role: r.role === "owner" ? "owner" : "member"
	}));
});
var createRoom_createServerFn_handler = createServerRpc({
	id: "402b3eeffaaaf9865d7f20abec578b64e2959b292411b08048af728807b4ad81",
	name: "createRoom",
	filename: "src/lib/server/api.ts"
}, (opts) => createRoom.__executeServer(opts));
var createRoom = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(createRoom_createServerFn_handler, async ({ context, data }) => {
	assertRate(`croom:${context.userId}`, 8, 6e4);
	const profile = await sessionProfile(context.userId);
	const name = data.name.trim().slice(0, LIMITS.roomName);
	if (name.length < 2) throw new Error("Room name is too short");
	const theme = ROOM_THEMES.includes(data.theme) ? data.theme : "violet";
	const password = data.password?.trim();
	const id = roomCode();
	const sql = await getSql();
	await sql.query(`insert into rooms (id, name, owner_id, password_hash, theme) values ($1, $2, $3, $4, $5)`, [
		id,
		name,
		context.userId,
		password ? hashSecret(password) : null,
		theme
	]);
	await sql.query(`insert into room_members (room_id, user_id, role) values ($1, $2, 'owner')`, [id, context.userId]);
	await sql.query(`insert into room_playback (room_id) values ($1)`, [id]);
	await systemMessage(id, context.userId, `${profile.displayName} opened the room`);
	return { id };
});
var getRoomAccess_createServerFn_handler = createServerRpc({
	id: "55b859b63d6361cf4865f904b9c30df93a609e1fb92a2a6ff50596260e359175",
	name: "getRoomAccess",
	filename: "src/lib/server/api.ts"
}, (opts) => getRoomAccess.__executeServer(opts));
var getRoomAccess = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(getRoomAccess_createServerFn_handler, async ({ context, data }) => {
	await sessionProfile(context.userId);
	const code = data.code.trim().toUpperCase();
	const sql = await getSql();
	const room = (await sql.query(`select id, name, theme, password_hash from rooms where id = $1`, [code]))[0];
	if (!room) return { status: "missing" };
	if (await getMemberRole(code, context.userId)) return {
		status: "member",
		snapshot: await loadSnapshot(code, context.userId)
	};
	const pending = await sql.query(`select id from join_requests where room_id = $1 and user_id = $2 and status = 'pending'`, [code, context.userId]);
	return {
		status: "need-join",
		roomName: room.name,
		theme: ROOM_THEMES.includes(room.theme) ? room.theme : "violet",
		hasPassword: Boolean(room.password_hash),
		pending: pending.length > 0
	};
});
var joinRoom_createServerFn_handler = createServerRpc({
	id: "7a1225bb56e0ddc5a649776749f651dd72a48dc466d7a23bc6a35b3fca2bb8ec",
	name: "joinRoom",
	filename: "src/lib/server/api.ts"
}, (opts) => joinRoom.__executeServer(opts));
var joinRoom = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(joinRoom_createServerFn_handler, async ({ context, data }) => {
	assertRate(`join:${context.userId}`, 12, 3e4);
	const profile = await sessionProfile(context.userId);
	const code = data.code.trim().toUpperCase();
	const sql = await getSql();
	const room = (await sql.query(`select id, name, owner_id, password_hash from rooms where id = $1`, [code]))[0];
	if (!room) throw new Error("Room not found");
	if (await getMemberRole(code, context.userId)) return { status: "member" };
	if (data.mode === "password") {
		if (!room.password_hash) throw new Error("This room has no password");
		if (!data.password || !verifySecret(data.password, room.password_hash)) throw new Error("Incorrect password");
		await sql.query(`insert into room_members (room_id, user_id, role) values ($1, $2, 'member')
         on conflict do nothing`, [code, context.userId]);
		await systemMessage(code, context.userId, `${profile.displayName} joined`);
		await notify({
			userId: room.owner_id,
			kind: "join",
			title: profile.displayName,
			body: "joined the room",
			href: `/room/${code}`
		});
		return { status: "member" };
	}
	await sql.query(`insert into join_requests (id, room_id, user_id, status)
       values ($1, $2, $3, 'pending')
       on conflict (room_id, user_id) do update set status = 'pending'`, [
		uid("jr"),
		code,
		context.userId
	]);
	await notify({
		userId: room.owner_id,
		kind: "request",
		title: profile.displayName,
		body: `wants to join ${room.name}`,
		href: `/room/${code}`
	});
	return { status: "pending" };
});
var decideJoin_createServerFn_handler = createServerRpc({
	id: "cb182f94acc57d87ab591572d079d7ae5458ca4e2a2ae6692ddd273ed2243a09",
	name: "decideJoin",
	filename: "src/lib/server/api.ts"
}, (opts) => decideJoin.__executeServer(opts));
var decideJoin = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(decideJoin_createServerFn_handler, async ({ context, data }) => {
	if (await requireMember(data.code, context.userId) !== "owner") throw new Error("Only the host can decide");
	const sql = await getSql();
	const req = (await sql.query(`select id, user_id, status from join_requests where id = $1 and room_id = $2`, [data.requestId, data.code]))[0];
	if (!req) throw new Error("Request not found");
	await sql.query(`update join_requests set status = $2 where id = $1`, [req.id, data.accept ? "accepted" : "declined"]);
	if (data.accept) {
		await sql.query(`insert into room_members (room_id, user_id, role) values ($1, $2, 'member')
         on conflict do nothing`, [data.code, req.user_id]);
		const p = await ensureProfile(req.user_id);
		await systemMessage(data.code, req.user_id, `${p.displayName} joined`);
		await notify({
			userId: req.user_id,
			kind: "invite",
			title: "You're in",
			body: "The host approved your request",
			href: `/room/${data.code}`
		});
	}
	return loadSnapshot(data.code, context.userId);
});
var kickMember_createServerFn_handler = createServerRpc({
	id: "868d834283dc7106e4bb897e8b93b2d727b8429705b96e26ba6457322b172e47",
	name: "kickMember",
	filename: "src/lib/server/api.ts"
}, (opts) => kickMember.__executeServer(opts));
var kickMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(kickMember_createServerFn_handler, async ({ context, data }) => {
	if (await requireMember(data.code, context.userId) !== "owner") throw new Error("Only the host can remove people");
	if (data.userId === context.userId) throw new Error("Host cannot be removed");
	await (await getSql()).query(`delete from room_members where room_id = $1 and user_id = $2`, [data.code, data.userId]);
	const p = await ensureProfile(data.userId);
	await systemMessage(data.code, context.userId, `${p.displayName} was removed`);
	return loadSnapshot(data.code, context.userId);
});
var leaveRoom_createServerFn_handler = createServerRpc({
	id: "60d36ad2571d3af670e3fdc2d65662acb15deaec7b89b36064fd24c3f4884b94",
	name: "leaveRoom",
	filename: "src/lib/server/api.ts"
}, (opts) => leaveRoom.__executeServer(opts));
var leaveRoom = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(leaveRoom_createServerFn_handler, async ({ context, data }) => {
	if (await requireMember(data.code, context.userId) === "owner") throw new Error("Host must delete the room instead");
	const profile = await sessionProfile(context.userId);
	await (await getSql()).query(`delete from room_members where room_id = $1 and user_id = $2`, [data.code, context.userId]);
	await systemMessage(data.code, context.userId, `${profile.displayName} left`);
	return { ok: true };
});
var deleteRoom_createServerFn_handler = createServerRpc({
	id: "8266b8518c9b20a26a02470dd936a46c5983f75b0d599f5856fc0e7039b39958",
	name: "deleteRoom",
	filename: "src/lib/server/api.ts"
}, (opts) => deleteRoom.__executeServer(opts));
var deleteRoom = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(deleteRoom_createServerFn_handler, async ({ context, data }) => {
	if (await requireMember(data.code, context.userId) !== "owner") throw new Error("Only the host can delete the room");
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
var pollRoom_createServerFn_handler = createServerRpc({
	id: "eac1b205d31845b629d0d09a816a3bc8979a9c8673b51e73b97af32d9ca90169",
	name: "pollRoom",
	filename: "src/lib/server/api.ts"
}, (opts) => pollRoom.__executeServer(opts));
var pollRoom = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(pollRoom_createServerFn_handler, async ({ context, data }) => {
	await requireMember(data.code, context.userId);
	return loadSnapshot(data.code, context.userId);
});
var pushPlayback_createServerFn_handler = createServerRpc({
	id: "a2032cdfc2471ed3f7fbe97f865c12dce2bb16b71f0e3d7a5ab44d03732caa4c",
	name: "pushPlayback",
	filename: "src/lib/server/api.ts"
}, (opts) => pushPlayback.__executeServer(opts));
var pushPlayback = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(pushPlayback_createServerFn_handler, async ({ context, data }) => {
	assertRate(`pb:${context.userId}`, 40, 1e4);
	await requireMember(data.code, context.userId);
	const profile = await sessionProfile(context.userId);
	const sql = await getSql();
	const pb = data.playback;
	await sql.query(`insert into room_playback
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
         updated_at = now()`, [
		data.code,
		pb.track ? JSON.stringify(pb.track) : null,
		pb.isPlaying,
		Math.max(0, Math.floor(pb.positionMs)),
		pb.startedAt,
		Math.min(100, Math.max(0, pb.volume)),
		context.userId,
		profile.displayName
	]);
	if (data.enqueueHistory && pb.track) {
		await sql.query(`insert into listen_history (id, room_id, track, played_by) values ($1, $2, $3, $4)`, [
			uid("hst"),
			data.code,
			JSON.stringify(pb.track),
			context.userId
		]);
		const members = await sql.query(`select user_id from room_members where room_id = $1 and user_id <> $2`, [data.code, context.userId]);
		for (const m of members) await notify({
			userId: m.user_id,
			kind: "song",
			title: pb.track.title,
			body: pb.track.artist,
			href: `/room/${data.code}`
		});
	}
	return { ok: true };
});
var addToQueue_createServerFn_handler = createServerRpc({
	id: "6048a5095a274f3e56e9d4751ca0a2591104189003e84d5bb1a9fe48f75b74fd",
	name: "addToQueue",
	filename: "src/lib/server/api.ts"
}, (opts) => addToQueue.__executeServer(opts));
var addToQueue = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(addToQueue_createServerFn_handler, async ({ context, data }) => {
	assertRate(`q:${context.userId}`, 30, 2e4);
	await requireMember(data.code, context.userId);
	const profile = await sessionProfile(context.userId);
	if (data.track.audioUrl && data.track.audioUrl.startsWith("data:") && data.track.audioUrl.length > LIMITS.audioChars) throw new Error("Audio file is too large");
	if (data.track.audioUrl && !isSafeAudioSrc(data.track.audioUrl) && !data.track.audioUrl.startsWith("https://")) throw new Error("Invalid audio");
	const track = cloneTrack(data.track, context.userId, profile.displayName);
	const sql = await getSql();
	const order = ((await sql.query(`select max(sort_order) as m from queue_items where room_id = $1`, [data.code]))[0]?.m ?? 0) + 1;
	await sql.query(`insert into queue_items (id, room_id, track, sort_order, added_by) values ($1, $2, $3, $4, $5)`, [
		track.id,
		data.code,
		JSON.stringify(track),
		order,
		context.userId
	]);
	return loadSnapshot(data.code, context.userId);
});
var removeFromQueue_createServerFn_handler = createServerRpc({
	id: "1e1ca7b5043316853c92f5aa405f795fc435ea7056be8f49b1cedb5d910a74e3",
	name: "removeFromQueue",
	filename: "src/lib/server/api.ts"
}, (opts) => removeFromQueue.__executeServer(opts));
var removeFromQueue = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(removeFromQueue_createServerFn_handler, async ({ context, data }) => {
	await requireMember(data.code, context.userId);
	await (await getSql()).query(`delete from queue_items where room_id = $1 and id = $2`, [data.code, data.trackId]);
	return loadSnapshot(data.code, context.userId);
});
var sendMessage_createServerFn_handler = createServerRpc({
	id: "053954e82c986ac7796898193f9c2c1fa3068615c49fc19b9bc58d6a6419f3d2",
	name: "sendMessage",
	filename: "src/lib/server/api.ts"
}, (opts) => sendMessage.__executeServer(opts));
var sendMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(sendMessage_createServerFn_handler, async ({ context, data }) => {
	assertRate(`msg:${context.userId}`, 40, 15e3);
	await requireMember(data.code, context.userId);
	const body = (data.body ?? "").trim().slice(0, LIMITS.messageChars);
	if (data.kind === "text" && !body) throw new Error("Message is empty");
	if (data.kind === "image") {
		if (!data.mediaUrl || !isSafeImageSrc(data.mediaUrl)) throw new Error("Invalid image");
		if (data.mediaUrl.length > LIMITS.imageChars) throw new Error("Image is too large");
	}
	if (data.kind === "voice") {
		if (!data.mediaUrl || !isSafeAudioSrc(data.mediaUrl) && !data.mediaUrl.startsWith("data:audio/")) throw new Error("Invalid voice note");
		if (data.mediaUrl.length > LIMITS.voiceChars) throw new Error("Voice note is too large");
	}
	const sql = await getSql();
	const id = uid("msg");
	await sql.query(`insert into messages (id, room_id, user_id, kind, body, media_url)
       values ($1, $2, $3, $4, $5, $6)`, [
		id,
		data.code,
		context.userId,
		data.kind,
		body,
		data.mediaUrl ?? null
	]);
	const members = await sql.query(`select user_id from room_members where room_id = $1 and user_id <> $2`, [data.code, context.userId]);
	const profile = await sessionProfile(context.userId);
	for (const m of members) await notify({
		userId: m.user_id,
		kind: "message",
		title: profile.displayName,
		body: data.kind === "text" ? body.slice(0, 80) : data.kind,
		href: `/room/${data.code}`
	});
	return loadSnapshot(data.code, context.userId);
});
var ackMessages_createServerFn_handler = createServerRpc({
	id: "17151a647c7b6db0af323f7bb3eb98ec6faee363beb13696c649d5096dca9744",
	name: "ackMessages",
	filename: "src/lib/server/api.ts"
}, (opts) => ackMessages.__executeServer(opts));
var ackMessages = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(ackMessages_createServerFn_handler, async ({ context, data }) => {
	await requireMember(data.code, context.userId);
	await (await getSql()).query(`insert into message_acks (message_id, user_id, stage)
       select id, $2, $3 from messages
       where room_id = $1 and user_id <> $2
       on conflict do nothing`, [
		data.code,
		context.userId,
		data.stage
	]);
	return { ok: true };
});
var listFriends_createServerFn_handler = createServerRpc({
	id: "beb9d94438d11a73b14f076b4bbdc1269be30a491158b287b029bc3f4d22c237",
	name: "listFriends",
	filename: "src/lib/server/api.ts"
}, (opts) => listFriends.__executeServer(opts));
var listFriends = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listFriends_createServerFn_handler, async ({ context }) => {
	await sessionProfile(context.userId);
	return (await (await getSql()).query(`select f.id, f.requester_id, f.addressee_id, f.status,
              case when f.requester_id = $1 then f.addressee_id else f.requester_id end as other_id,
              coalesce(p.display_name, 'Listener') as display_name,
              p.avatar_url,
              coalesce(p.status, 'available') as user_status
       from friendships f
       join profiles p on p.user_id = case when f.requester_id = $1 then f.addressee_id else f.requester_id end
       where (f.requester_id = $1 or f.addressee_id = $1)
         and f.status in ('pending', 'accepted')
       order by f.created_at desc`, [context.userId])).map((r) => ({
		userId: r.other_id,
		displayName: r.display_name,
		avatarUrl: r.avatar_url,
		status: r.user_status === "away" ? "away" : "available",
		relation: r.status === "accepted" ? "accepted" : r.requester_id === context.userId ? "outgoing" : "incoming",
		friendshipId: r.id
	}));
});
var searchPeople_createServerFn_handler = createServerRpc({
	id: "bbd675023822ee2c1f2fd57fac4a2c08858c73a5c6c291f95b0ddfe44a9bb281",
	name: "searchPeople",
	filename: "src/lib/server/api.ts"
}, (opts) => searchPeople.__executeServer(opts));
var searchPeople = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(searchPeople_createServerFn_handler, async ({ context, data }) => {
	assertRate(`search:${context.userId}`, 20, 1e4);
	const q = data.q.trim().slice(0, 40);
	if (q.length < 1) return [];
	return (await (await getSql()).query(`select user_id, display_name, avatar_url, status
       from profiles
       where user_id <> $1 and display_name ilike $2
       order by display_name
       limit 20`, [context.userId, `%${q}%`])).map((r) => ({
		userId: r.user_id,
		displayName: r.display_name,
		avatarUrl: r.avatar_url,
		status: r.status === "away" ? "away" : "available"
	}));
});
var sendFriendRequest_createServerFn_handler = createServerRpc({
	id: "553c698ba0573a72dfba5e5304c0b510cc9cf48d600178b2242301ab39049d11",
	name: "sendFriendRequest",
	filename: "src/lib/server/api.ts"
}, (opts) => sendFriendRequest.__executeServer(opts));
var sendFriendRequest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(sendFriendRequest_createServerFn_handler, async ({ context, data }) => {
	assertRate(`fr:${context.userId}`, 15, 3e4);
	if (data.userId === context.userId) throw new Error("Cannot add yourself");
	const profile = await sessionProfile(context.userId);
	const sql = await getSql();
	if ((await sql.query(`select id, status from friendships
       where (requester_id = $1 and addressee_id = $2)
          or (requester_id = $2 and addressee_id = $1)`, [context.userId, data.userId]))[0]) return { ok: true };
	await sql.query(`insert into friendships (id, requester_id, addressee_id, status) values ($1, $2, $3, 'pending')`, [
		uid("fr"),
		context.userId,
		data.userId
	]);
	await notify({
		userId: data.userId,
		kind: "invite",
		title: profile.displayName,
		body: "sent a friend request",
		href: "/app/friends"
	});
	return { ok: true };
});
var respondFriend_createServerFn_handler = createServerRpc({
	id: "31e6733eaeba79a78a2bebdd53e8d93389752a2089614b884410d6f515972e2b",
	name: "respondFriend",
	filename: "src/lib/server/api.ts"
}, (opts) => respondFriend.__executeServer(opts));
var respondFriend = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(respondFriend_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const row = (await sql.query(`select id, addressee_id from friendships where id = $1`, [data.friendshipId]))[0];
	if (!row || row.addressee_id !== context.userId) throw new Error("Request not found");
	if (data.accept) await sql.query(`update friendships set status = 'accepted' where id = $1`, [row.id]);
	else await sql.query(`update friendships set status = 'declined' where id = $1`, [row.id]);
	return { ok: true };
});
var inviteFriendToRoom_createServerFn_handler = createServerRpc({
	id: "66dbc88eeb7a2c2e6dfff745b92e9f237d9f3288307b16bac645f78daa60208a",
	name: "inviteFriendToRoom",
	filename: "src/lib/server/api.ts"
}, (opts) => inviteFriendToRoom.__executeServer(opts));
var inviteFriendToRoom = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(inviteFriendToRoom_createServerFn_handler, async ({ context, data }) => {
	if (await requireMember(data.code, context.userId) !== "owner") throw new Error("Only the host can invite directly");
	const sql = await getSql();
	await sql.query(`insert into room_members (room_id, user_id, role) values ($1, $2, 'member')
       on conflict do nothing`, [data.code, data.userId]);
	const rooms = await sql.query(`select name from rooms where id = $1`, [data.code]);
	const p = await ensureProfile(data.userId);
	await systemMessage(data.code, data.userId, `${p.displayName} was invited`);
	await notify({
		userId: data.userId,
		kind: "invite",
		title: rooms[0]?.name ?? "Room",
		body: "You've been invited",
		href: `/room/${data.code}`
	});
	return loadSnapshot(data.code, context.userId);
});
var listLibrary_createServerFn_handler = createServerRpc({
	id: "05864b1c2b07d2a8476bffc56b09df11c9e75d8b6a1c33e8c2b615380653eb35",
	name: "listLibrary",
	filename: "src/lib/server/api.ts"
}, (opts) => listLibrary.__executeServer(opts));
var listLibrary = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listLibrary_createServerFn_handler, async ({ context }) => {
	return (await (await getSql()).query(`select id, track from library_tracks where user_id = $1 order by created_at desc`, [context.userId])).map((r) => asJson(r.track));
});
var addLibraryTrack_createServerFn_handler = createServerRpc({
	id: "19590d87fb0f055b64f872bdcc67e25de6e1d3e6e0bccce6048e9377b391eee9",
	name: "addLibraryTrack",
	filename: "src/lib/server/api.ts"
}, (opts) => addLibraryTrack.__executeServer(opts));
var addLibraryTrack = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(addLibraryTrack_createServerFn_handler, async ({ context, data }) => {
	assertRate(`lib:${context.userId}`, 20, 3e4);
	const sql = await getSql();
	if (((await sql.query(`select count(*)::int as n from library_tracks where user_id = $1`, [context.userId]))[0]?.n ?? 0) >= LIMITS.libraryMax) throw new Error("Library is full");
	if (data.track.audioUrl && data.track.audioUrl.startsWith("data:") && data.track.audioUrl.length > LIMITS.audioChars) throw new Error("Audio file is too large");
	const profile = await sessionProfile(context.userId);
	const track = cloneTrack(data.track, context.userId, profile.displayName);
	await sql.query(`insert into library_tracks (id, user_id, track) values ($1, $2, $3)`, [
		track.id,
		context.userId,
		JSON.stringify(track)
	]);
	return track;
});
var removeLibraryTrack_createServerFn_handler = createServerRpc({
	id: "48463594d126528c7884a19ad6cbac86f12094f0780426507d9e60004a6d24f0",
	name: "removeLibraryTrack",
	filename: "src/lib/server/api.ts"
}, (opts) => removeLibraryTrack.__executeServer(opts));
var removeLibraryTrack = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(removeLibraryTrack_createServerFn_handler, async ({ context, data }) => {
	await (await getSql()).query(`delete from library_tracks where id = $1 and user_id = $2`, [data.id, context.userId]);
	return { ok: true };
});
var resolveYoutube_createServerFn_handler = createServerRpc({
	id: "09f3ab92d8d6fd13b503521f0d75526d3a4804c169edcf9a91a0534030486309",
	name: "resolveYoutube",
	filename: "src/lib/server/api.ts"
}, (opts) => resolveYoutube.__executeServer(opts));
var resolveYoutube = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => d).handler(resolveYoutube_createServerFn_handler, async ({ context, data }) => {
	assertRate(`yt:${context.userId}`, 20, 2e4);
	const id = parseYoutubeId(data.input);
	if (!id) return { tracks: searchCatalog(data.input) };
	const known = YOUTUBE_CATALOG.find((t) => t.youtubeId === id);
	if (known) return { tracks: [known] };
	let title = "YouTube";
	let artist = "YouTube";
	try {
		const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`);
		if (res.ok) {
			const json = await res.json();
			title = json.title?.slice(0, 120) || title;
			artist = json.author_name?.slice(0, 80) || artist;
		}
	} catch {}
	return { tracks: [{
		id: `yt-${id}`,
		title,
		artist,
		durationMs: 0,
		source: "youtube",
		youtubeId: id,
		thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
	}] };
});
var catalogQuery_createServerFn_handler = createServerRpc({
	id: "b5186d24b2f0c5fbed4ab0bff4ac3877b0837f1fc11027a48bb672677671a04a",
	name: "catalogQuery",
	filename: "src/lib/server/api.ts"
}, (opts) => catalogQuery.__executeServer(opts));
var catalogQuery = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => d).handler(catalogQuery_createServerFn_handler, async ({ data }) => {
	return searchCatalog(data.q);
});
//#endregion
export { ackMessages_createServerFn_handler, addLibraryTrack_createServerFn_handler, addToQueue_createServerFn_handler, bootstrapMe_createServerFn_handler, catalogQuery_createServerFn_handler, createRoom_createServerFn_handler, decideJoin_createServerFn_handler, deleteRoom_createServerFn_handler, getRoomAccess_createServerFn_handler, inviteFriendToRoom_createServerFn_handler, joinRoom_createServerFn_handler, kickMember_createServerFn_handler, leaveRoom_createServerFn_handler, listFriends_createServerFn_handler, listLibrary_createServerFn_handler, listRooms_createServerFn_handler, markNotificationsRead_createServerFn_handler, pollRoom_createServerFn_handler, pushPlayback_createServerFn_handler, removeFromQueue_createServerFn_handler, removeLibraryTrack_createServerFn_handler, resolveYoutube_createServerFn_handler, respondFriend_createServerFn_handler, searchPeople_createServerFn_handler, sendFriendRequest_createServerFn_handler, sendMessage_createServerFn_handler, updateProfile_createServerFn_handler };
