import { o as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as isSafeAudioSrc, l as isSafeImageSrc, n as cn, o as formatDuration, r as compressImage, u as parseYoutubeId } from "./utils-nBwqipAl.mjs";
import { i as searchCatalog, t as NOCTURNE_COLLECTION } from "./catalog-CmFGBXGd.mjs";
import { A as CheckCheck, C as Link2, D as DoorOpen, E as History, O as Copy, T as ImagePlus, _ as Play, a as Volume2, c as UserMinus, d as Trash2, f as SkipForward, g as Plus, h as Send, i as VolumeX, k as Check, m as Shield, p as SkipBack, v as Pause, y as Mic } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useI18n, n as Route$1 } from "./router-BLbSF1bt.mjs";
import { E as updateProfile, T as sendMessage, _ as pollRoom, c as getRoomAccess, d as kickMember, f as leaveRoom, i as bootstrapMe, l as inviteFriendToRoom, m as listLibrary, o as decideJoin, p as listFriends, r as addToQueue, s as deleteRoom, t as ackMessages, u as joinRoom, v as pushPlayback, x as resolveYoutube, y as removeFromQueue } from "./api-C37XoPYF.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { t as LanguageSwitcher } from "./language-switcher-CFvIBj1M.mjs";
import { t as RedirectToSignIn } from "./gates-eHyJWLc8.mjs";
import { t as Logo } from "./logo-B3K3wLQZ.mjs";
import { t as Avatar } from "./avatar-CTPe4NrP.mjs";
import { t as Button } from "./button-DECHDznd.mjs";
import { t as Input } from "./input-CwqjP0As.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { r as pushBrowserNotification, t as Switch } from "./switch-BB_YhFGS.mjs";
import { i as Viewport, n as Scrollbar, r as Thumb, t as Root } from "../_libs/radix-ui__react-scroll-area.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/room._code-BHWzPHS2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FAST_POLL_MS = 400;
var IDLE_POLL_MS = 2e3;
var PING_INTERVAL_MS = 2e3;
var STALL_MS = 1e4;
var MAX_RECOVERY_ATTEMPTS = 3;
var SIGNAL_RETRY_DELAYS_MS = [250, 750];
function defaultIceServers() {
	return [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }];
}
var P2PRoom = class {
	opts;
	peers = /* @__PURE__ */ new Map();
	/** Per-remote-peer signal delivery chains (order-preserving). */
	signalQueues = /* @__PURE__ */ new Map();
	cursor = 0;
	pollTimer = null;
	pingTimer = null;
	closed = false;
	everPolled = false;
	lastPeersFingerprint = "";
	constructor(opts) {
		this.opts = opts;
	}
	/**
	* The first poll IS the join: it registers this peer and returns the
	* roster. A failed first poll (cold DB, offline tab) must not strand the
	* room: the loop and timers start regardless and the next poll retries.
	*/
	async join() {
		try {
			await this.pollOnce();
		} catch {}
		if (this.closed) return;
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
		this.pingTimer = setInterval(() => {
			this.pingAll();
			this.watchdog();
		}, PING_INTERVAL_MS);
	}
	close() {
		this.closed = true;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		if (this.pingTimer) clearInterval(this.pingTimer);
		for (const slot of this.peers.values()) slot.pc.close();
		this.peers.clear();
		fetch("/api/rtc", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				op: "leave",
				room: this.opts.room,
				peer: this.opts.selfId
			}),
			keepalive: true
		}).catch(() => {});
	}
	/** Send on the unreliable game-state channel (drops stale packets). */
	broadcast(data) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		for (const slot of this.peers.values()) if (slot.state?.readyState === "open") slot.state.send(wire);
	}
	/** Send reliably (ordered) to one peer, or to all when peerId is omitted. */
	send(data, peerId) {
		const wire = JSON.stringify({
			t: "d",
			d: data
		});
		const targets = peerId ? [this.peers.get(peerId)] : [...this.peers.values()];
		for (const slot of targets) if (slot?.reliable?.readyState === "open") slot.reliable.send(wire);
	}
	peerList() {
		return [...this.peers.values()].map((s) => ({ ...s.info }));
	}
	schedulePoll(delay) {
		if (this.closed) return;
		if (this.pollTimer) clearTimeout(this.pollTimer);
		this.pollTimer = setTimeout(() => void this.poll(), delay);
	}
	anyPairConnecting() {
		for (const s of this.peers.values()) {
			if (s.terminal) continue;
			if (s.info.connectionState !== "connected") return true;
		}
		return false;
	}
	async pollOnce() {
		const params = new URLSearchParams({
			room: this.opts.room,
			peer: this.opts.selfId,
			name: this.opts.name ?? "",
			since: String(this.cursor)
		});
		const res = await fetch(`/api/rtc?${params}`);
		if (this.closed) return;
		if (!res.ok) throw new Error(`signaling poll failed: ${res.status}`);
		const body = await res.json();
		if (this.closed) return;
		if (!this.everPolled) {
			this.everPolled = true;
			this.opts.onConnected?.();
		}
		this.reconcileRoster(body.peers);
		const roster = new Set(body.peers.map((p) => p.id));
		for (const sig of body.signals) {
			this.cursor = Math.max(this.cursor, sig.id);
			await this.onSignal(sig.from, sig.kind, sig.payload, roster);
			if (this.closed) return;
		}
	}
	async poll() {
		if (this.closed) return;
		try {
			await this.pollOnce();
		} catch {}
		this.schedulePoll(this.anyPairConnecting() ? FAST_POLL_MS : IDLE_POLL_MS);
	}
	reconcileRoster(peers) {
		const alive = new Set(peers.map((p) => p.id));
		for (const p of peers) {
			if (p.id === this.opts.selfId) continue;
			const existing = this.peers.get(p.id);
			if (existing) existing.info.name = p.name;
			else this.connectTo(p.id, p.name, this.opts.selfId > p.id);
		}
		for (const [id, slot] of this.peers) if (!alive.has(id)) {
			slot.pc.close();
			this.peers.delete(id);
		}
		this.emitPeers();
	}
	connectTo(peerId, name, initiator) {
		if (this.closed) return null;
		const pc = new RTCPeerConnection({ iceServers: this.opts.iceServers ?? defaultIceServers() });
		const slot = {
			pc,
			makingOffer: false,
			ignoreOffer: false,
			pendingCandidates: [],
			lastProgressAt: Date.now(),
			recoveryAttempts: 0,
			info: {
				id: peerId,
				name,
				connectionState: pc.connectionState,
				candidateType: null,
				rttMs: null
			}
		};
		this.peers.set(peerId, slot);
		pc.onicecandidate = (e) => {
			if (e.candidate) this.sendSignal(peerId, "ice", e.candidate.toJSON());
		};
		pc.onconnectionstatechange = () => {
			slot.info.connectionState = pc.connectionState;
			if (pc.connectionState === "connecting" || pc.connectionState === "connected") slot.lastProgressAt = Date.now();
			if (pc.connectionState === "connected") {
				slot.recoveryAttempts = 0;
				slot.terminal = false;
				this.readCandidateType(slot);
			}
			this.emitPeers();
			if (pc.connectionState === "failed") pc.restartIce();
			if (pc.connectionState === "failed" || pc.connectionState === "disconnected") this.schedulePoll(FAST_POLL_MS);
		};
		pc.onnegotiationneeded = async () => {
			try {
				slot.makingOffer = true;
				await pc.setLocalDescription();
				await this.sendSignal(peerId, "offer", pc.localDescription.toJSON());
			} catch {} finally {
				slot.makingOffer = false;
			}
		};
		pc.ondatachannel = (e) => this.attachChannel(slot, e.channel);
		if (initiator) {
			this.attachChannel(slot, pc.createDataChannel("state", {
				ordered: false,
				maxRetransmits: 0
			}));
			this.attachChannel(slot, pc.createDataChannel("reliable", { ordered: true }));
		}
		return slot;
	}
	attachChannel(slot, channel) {
		if (channel.label === "state") slot.state = channel;
		else slot.reliable = channel;
		channel.onopen = () => {
			slot.lastProgressAt = Date.now();
		};
		channel.onmessage = (e) => {
			let msg;
			try {
				msg = JSON.parse(e.data);
			} catch {
				return;
			}
			if (msg.t === "ping") {
				if (slot.state?.readyState === "open") slot.state.send(JSON.stringify({ t: "pong" }));
			} else if (msg.t === "pong") {
				if (slot.pingSentAt) {
					slot.info.rttMs = Math.round(performance.now() - slot.pingSentAt);
					slot.pingSentAt = void 0;
					this.emitPeers();
				}
			} else this.opts.onMessage?.(slot.info.id, msg.d, channel.label === "state" ? "state" : "reliable");
		};
	}
	/** Apply buffered ICE candidates once a remote description is in place. */
	async flushPendingCandidates(slot) {
		while (slot.pendingCandidates.length > 0) {
			const candidate = slot.pendingCandidates.shift();
			try {
				await slot.pc.addIceCandidate(candidate);
			} catch (err) {
				if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
			}
			if (this.closed) return;
		}
	}
	async onSignal(from, kind, payload, roster) {
		if (this.closed) return;
		let slot = this.peers.get(from);
		if (!slot) {
			if (!roster.has(from)) return;
			const created = this.connectTo(from, "", false);
			if (!created) return;
			slot = created;
		}
		const polite = this.opts.selfId < from;
		try {
			if (kind === "offer" || kind === "answer") {
				const description = payload;
				const collision = kind === "offer" && (slot.makingOffer || slot.pc.signalingState !== "stable");
				slot.ignoreOffer = !polite && collision;
				if (slot.ignoreOffer) return;
				try {
					await slot.pc.setRemoteDescription(description);
				} catch (err) {
					if (kind !== "offer" || slot.recreatedForOffer) throw err;
					const attempts = slot.recoveryAttempts;
					const name = slot.info.name;
					slot.pc.close();
					this.peers.delete(from);
					const fresh = this.connectTo(from, name, false);
					if (!fresh) return;
					fresh.recoveryAttempts = attempts;
					fresh.recreatedForOffer = true;
					slot = fresh;
					await slot.pc.setRemoteDescription(description);
				}
				if (this.closed) return;
				await this.flushPendingCandidates(slot);
				if (this.closed) return;
				if (kind === "offer") {
					await slot.pc.setLocalDescription();
					if (this.closed) return;
					await this.sendSignal(from, "answer", slot.pc.localDescription.toJSON());
				}
			} else if (kind === "ice") {
				const candidate = payload;
				if (!slot.pc.remoteDescription) {
					slot.pendingCandidates.push(candidate);
					return;
				}
				try {
					await slot.pc.addIceCandidate(candidate);
				} catch (err) {
					if (!slot.ignoreOffer) console.warn("[p2p] addIceCandidate failed:", err);
				}
			}
		} catch {}
	}
	/**
	* Signals are serialized per remote peer (a candidate must never overtake
	* its SDP into the DB) and retried on failure with short backoff.
	*/
	sendSignal(to, kind, payload) {
		const next = (this.signalQueues.get(to) ?? Promise.resolve()).then(() => this.postSignal(to, kind, payload));
		this.signalQueues.set(to, next.catch(() => {}));
		return next;
	}
	async postSignal(to, kind, payload) {
		for (let attempt = 0;; attempt++) {
			if (this.closed) return;
			try {
				const res = await fetch("/api/rtc", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						op: "signal",
						room: this.opts.room,
						from: this.opts.selfId,
						to,
						kind,
						payload
					})
				});
				if (res.ok) return;
				throw new Error(`signal POST failed: ${res.status}`);
			} catch (err) {
				if (attempt >= SIGNAL_RETRY_DELAYS_MS.length) {
					console.warn(`[p2p] signal ${kind} to ${to} failed after retries`, err);
					return;
				}
				await new Promise((r) => setTimeout(r, SIGNAL_RETRY_DELAYS_MS[attempt]));
			}
		}
	}
	pingAll() {
		const wire = JSON.stringify({ t: "ping" });
		for (const slot of this.peers.values()) {
			if (slot.state?.readyState !== "open") continue;
			const stale = slot.pingSentAt !== void 0 && performance.now() - slot.pingSentAt > 2 * PING_INTERVAL_MS;
			if (slot.pingSentAt === void 0 || stale) {
				slot.pingSentAt = performance.now();
				slot.state.send(wire);
			}
		}
	}
	/**
	* Stuck-pair recovery, piggybacked on the ping interval. A pair that has
	* made no progress for STALL_MS gets rebuilt by the dialer with a FRESH
	* RTCPeerConnection (new DTLS identity — fixes the suspend/resume
	* fingerprint wedge). After MAX_RECOVERY_ATTEMPTS the pair is terminal:
	* visible to the app as its last connectionState, ignored by fast-poll.
	*/
	watchdog() {
		if (this.closed) return;
		const now = Date.now();
		for (const [peerId, slot] of this.peers) {
			const live = slot.pc.connectionState;
			if (live !== slot.info.connectionState) {
				slot.info.connectionState = live;
				if (live === "connecting" || live === "connected") slot.lastProgressAt = now;
				this.emitPeers();
			}
			if (slot.terminal || live === "connected") continue;
			if (now - slot.lastProgressAt <= STALL_MS) continue;
			if (slot.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
				slot.terminal = true;
				this.emitPeers();
				continue;
			}
			slot.recoveryAttempts += 1;
			slot.lastProgressAt = now;
			if (this.opts.selfId > peerId) {
				const { name } = slot.info;
				const attempts = slot.recoveryAttempts;
				slot.pc.close();
				this.peers.delete(peerId);
				const fresh = this.connectTo(peerId, name, true);
				if (fresh) fresh.recoveryAttempts = attempts;
				this.schedulePoll(FAST_POLL_MS);
			}
		}
	}
	async readCandidateType(slot) {
		try {
			const stats = await slot.pc.getStats();
			let selected;
			stats.forEach((s) => {
				if (s.type === "candidate-pair" && s.nominated) selected = s;
			});
			const localId = selected?.localCandidateId;
			if (localId) {
				const local = stats.get(localId);
				slot.info.candidateType = local?.candidateType ?? null;
				this.emitPeers();
			}
		} catch {}
	}
	emitPeers() {
		const list = this.peerList();
		const fingerprint = JSON.stringify(list.map((p) => [
			p.id,
			p.name,
			p.connectionState,
			p.candidateType,
			p.rttMs
		]));
		if (fingerprint === this.lastPeersFingerprint) return;
		this.lastPeersFingerprint = fingerprint;
		this.opts.onPeersChanged?.(list);
	}
};
function defaultRoom() {
	if (typeof window === "undefined") return "room-ssr";
	return `room-${window.location.hostname.split(".")[0]}`.slice(0, 64);
}
function useP2PRoom(options = {}) {
	const enabled = options.enabled !== false;
	const [selfId] = (0, import_react.useState)(() => `p-${Math.random().toString(36).slice(2, 10)}`);
	const [room] = (0, import_react.useState)(() => options.room ?? defaultRoom());
	const [name] = (0, import_react.useState)(() => options.name ?? selfId);
	const [peers, setPeers] = (0, import_react.useState)([]);
	const [joined, setJoined] = (0, import_react.useState)(false);
	const roomRef = (0, import_react.useRef)(null);
	const listeners = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		const p2p = new P2PRoom({
			room,
			selfId,
			name,
			onPeersChanged: setPeers,
			onMessage: (from, data, channel) => {
				for (const fn of listeners.current) fn(from, data, channel);
			},
			onConnected: () => setJoined(true)
		});
		roomRef.current = p2p;
		p2p.join();
		return () => {
			roomRef.current = null;
			p2p.close();
		};
	}, [
		room,
		selfId,
		name,
		enabled
	]);
	return {
		selfId,
		room,
		peers,
		joined,
		broadcast: (0, import_react.useCallback)((data) => roomRef.current?.broadcast(data), []),
		send: (0, import_react.useCallback)((data, peerId) => roomRef.current?.send(data, peerId), []),
		onMessage: (0, import_react.useCallback)((fn) => {
			listeners.current.add(fn);
			return () => {
				listeners.current.delete(fn);
			};
		}, [])
	};
}
function ScrollArea({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
		className: cn("relative overflow-hidden", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrollbar, {
			orientation: "vertical",
			className: "flex w-2 touch-none p-px select-none",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, { className: "relative flex-1 rounded-full bg-border" })
		})]
	});
}
var EMOJIS = [
	"♡",
	"♪",
	"✦",
	"☾",
	"★",
	"✓",
	"•",
	"∞",
	"▲",
	"◆"
];
function ChatPanel({ messages, selfId, onSend }) {
	const { t } = useI18n();
	const [text, setText] = (0, import_react.useState)("");
	const [recording, setRecording] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const endRef = (0, import_react.useRef)(null);
	const mediaRef = (0, import_react.useRef)(null);
	const chunksRef = (0, import_react.useRef)([]);
	const fileRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);
	async function submitText(extra = "") {
		const body = (text + extra).trim();
		if (!body) return;
		setBusy(true);
		try {
			await onSend({
				kind: "text",
				body
			});
			setText("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t("common.error"));
		} finally {
			setBusy(false);
		}
	}
	async function startRec() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const rec = new MediaRecorder(stream);
			chunksRef.current = [];
			rec.ondataavailable = (e) => {
				if (e.data.size) chunksRef.current.push(e.data);
			};
			rec.onstop = async () => {
				stream.getTracks().forEach((tr) => tr.stop());
				const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
				if (blob.size > 7e5) {
					toast.error(t("library.tooBig"));
					return;
				}
				const url = await blobToDataUrl(blob);
				setBusy(true);
				try {
					await onSend({
						kind: "voice",
						mediaUrl: url
					});
				} catch (err) {
					toast.error(err instanceof Error ? err.message : t("common.error"));
				} finally {
					setBusy(false);
				}
			};
			mediaRef.current = rec;
			rec.start();
			setRecording(true);
		} catch {
			toast.error(t("common.error"));
		}
	}
	function stopRec() {
		mediaRef.current?.stop();
		mediaRef.current = null;
		setRecording(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-[320px] flex-col rounded-[22px] border border-border bg-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "h-[min(52vh,420px)] flex-1 p-3",
			children: messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-2 py-10 text-center text-sm text-muted-foreground",
				children: t("room.emptyChat")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-3",
				children: [messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: cn("flex gap-2", m.userId === selfId && "flex-row-reverse"),
					children: [m.kind !== "system" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						src: m.avatarUrl,
						name: m.displayName,
						size: "sm"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("max-w-[80%]", m.kind === "system" && "mx-auto max-w-none"),
						children: m.kind === "system" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-center text-xs text-muted-foreground",
							children: m.body
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-1 text-[11px] text-muted-foreground",
								children: m.displayName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("rounded-[16px] px-3 py-2 text-sm", m.userId === selfId ? "bg-primary text-primary-foreground" : "bg-secondary"),
								children: [
									m.kind === "text" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "whitespace-pre-wrap break-words",
										children: m.body
									}),
									m.kind === "image" && m.mediaUrl && isSafeImageSrc(m.mediaUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: m.mediaUrl,
										alt: "",
										className: "max-h-52 rounded-[12px] object-cover"
									}),
									m.kind === "voice" && m.mediaUrl && (isSafeAudioSrc(m.mediaUrl) || m.mediaUrl.startsWith("data:audio/")) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
										controls: true,
										src: m.mediaUrl,
										className: "max-w-full"
									})
								]
							}),
							m.userId === selfId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground",
								children: [m.receipt === "read" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-3 text-primary" }) : m.receipt === "delivered" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }), t(`receipt.${m.receipt}`)]
							})
						] })
					})]
				}, m.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-border p-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 flex flex-wrap gap-1",
				children: EMOJIS.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "grid h-8 w-8 place-items-center rounded-[8px] text-sm hover:bg-accent",
					onClick: () => setText((v) => v + e),
					children: e
				}, e))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex items-center gap-1",
				onSubmit: (ev) => {
					ev.preventDefault();
					submitText();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "image/jpeg,image/png,image/webp,image/gif",
						className: "hidden",
						onChange: async (ev) => {
							const file = ev.target.files?.[0];
							ev.target.value = "";
							if (!file) return;
							if (file.size > 4e6) {
								toast.error(t("library.tooBig"));
								return;
							}
							setBusy(true);
							try {
								await onSend({
									kind: "image",
									mediaUrl: await compressImage(file, 1280, .8)
								});
							} catch (err) {
								toast.error(err instanceof Error ? err.message : t("common.error"));
							} finally {
								setBusy(false);
							}
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "icon",
						variant: "ghost",
						onClick: () => fileRef.current?.click(),
						"aria-label": t("room.photo"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "icon",
						variant: recording ? "destructive" : "ghost",
						onMouseDown: () => void startRec(),
						onMouseUp: stopRec,
						onTouchStart: () => void startRec(),
						onTouchEnd: stopRec,
						"aria-label": t("room.voice"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: text,
						onChange: (e) => setText(e.target.value),
						placeholder: recording ? t("room.recording") : t("room.message"),
						maxLength: 2e3,
						disabled: busy
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "icon",
						disabled: busy || !text.trim(),
						"aria-label": t("room.add"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {})
					})
				]
			})]
		})]
	});
}
function blobToDataUrl(blob) {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(String(r.result ?? ""));
		r.onerror = () => reject(/* @__PURE__ */ new Error("read failed"));
		r.readAsDataURL(blob);
	});
}
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex w-full touch-none items-center select-none", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary bg-primary-foreground shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" })]
	});
}
function loadYt() {
	if (typeof window === "undefined") return Promise.resolve();
	if (window.YT?.Player) return Promise.resolve();
	return new Promise((resolve) => {
		const existing = document.querySelector("script[data-yt]");
		const prev = window.onYouTubeIFrameAPIReady;
		window.onYouTubeIFrameAPIReady = () => {
			prev?.();
			resolve();
		};
		if (!existing) {
			const tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			tag.dataset.yt = "1";
			document.body.appendChild(tag);
		}
	});
}
function NowPlaying({ playback, localMuted, displayPosition, onToggle, onSeek, onPrev, onNext, onVolume, onEnded, onDuration }) {
	const { t } = useI18n();
	const audioRef = (0, import_react.useRef)(null);
	const ytHostRef = (0, import_react.useRef)(null);
	const ytRef = (0, import_react.useRef)(null);
	const track = playback.track;
	const effectiveVolume = localMuted ? 0 : playback.volume;
	(0, import_react.useEffect)(() => {
		const audio = audioRef.current;
		if (!audio) return;
		audio.volume = effectiveVolume / 100;
	}, [effectiveVolume]);
	(0, import_react.useEffect)(() => {
		ytRef.current?.setVolume(effectiveVolume);
	}, [effectiveVolume]);
	(0, import_react.useEffect)(() => {
		const audio = audioRef.current;
		if (!track || track.source === "youtube") {
			if (audio) {
				audio.pause();
				audio.removeAttribute("src");
			}
			return;
		}
		const src = track.audioUrl;
		if (!src || !isSafeAudioSrc(src) && !src.startsWith("https://")) return;
		if (audio && audio.src !== src) audio.src = src;
		const apply = async () => {
			if (!audio) return;
			const target = displayPosition / 1e3;
			if (Math.abs(audio.currentTime - target) > 1.6) try {
				audio.currentTime = target;
			} catch {}
			if (playback.isPlaying) try {
				await audio.play();
			} catch {}
			else audio.pause();
		};
		apply();
	}, [
		track,
		playback.isPlaying,
		displayPosition
	]);
	(0, import_react.useEffect)(() => {
		if (!track?.youtubeId) {
			ytRef.current?.destroy();
			ytRef.current = null;
			return;
		}
		let cancelled = false;
		(async () => {
			await loadYt();
			if (cancelled || !ytHostRef.current || !window.YT?.Player) return;
			if (!ytRef.current) ytRef.current = new window.YT.Player(ytHostRef.current, {
				videoId: track.youtubeId,
				playerVars: {
					autoplay: 0,
					controls: 0,
					rel: 0,
					modestbranding: 1,
					playsinline: 1
				},
				events: {
					onReady: () => {
						ytRef.current?.setVolume(effectiveVolume);
						ytRef.current?.seekTo(displayPosition / 1e3, true);
						if (playback.isPlaying) ytRef.current?.playVideo();
					},
					onStateChange: (e) => {
						if (e.data === window.YT?.PlayerState?.ENDED) onEnded();
						const dur = ytRef.current?.getDuration?.();
						if (dur && dur > 0) onDuration(dur * 1e3);
					}
				}
			});
			else {
				ytRef.current.loadVideoById({
					videoId: track.youtubeId,
					startSeconds: displayPosition / 1e3
				});
				ytRef.current.setVolume(effectiveVolume);
				if (!playback.isPlaying) ytRef.current.pauseVideo();
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [track?.id, track?.youtubeId]);
	(0, import_react.useEffect)(() => {
		const yt = ytRef.current;
		if (!yt || !track?.youtubeId) return;
		try {
			const cur = yt.getCurrentTime() * 1e3;
			if (Math.abs(cur - displayPosition) > 1800) yt.seekTo(displayPosition / 1e3, true);
			if (playback.isPlaying) yt.playVideo();
			else yt.pauseVideo();
		} catch {}
	}, [
		playback.isPlaying,
		displayPosition,
		track?.youtubeId
	]);
	const cover = track?.thumbnailUrl && isSafeImageSrc(track.thumbnailUrl) ? track.thumbnailUrl : null;
	const duration = track?.durationMs || 0;
	const progress = duration > 0 ? Math.min(1, displayPosition / duration) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-[28px] border border-border bg-card p-5 md:p-7",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-6 md:flex-row md:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto aspect-square w-56 overflow-hidden rounded-[22px] bg-secondary md:mx-0 md:w-64",
					children: [cover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: cover,
						alt: "",
						className: "h-full w-full object-cover"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-full place-items-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Equalizer, { playing: playback.isPlaying && !localMuted })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("absolute inset-x-0 bottom-0 flex h-14 items-end justify-center gap-1 pb-3", !playback.isPlaying && "eq-paused"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Equalizer, {
							playing: playback.isPlaying && !localMuted,
							overlay: true
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.18em] text-primary uppercase",
							children: playback.isPlaying ? t("app.nowPlaying") : t("app.idle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display mt-1 text-2xl tracking-tight md:text-3xl",
							children: track?.title ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: track?.artist ?? ""
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: playback.controllerName ? t("room.controlledBy", { name: playback.controllerName }) : t("room.nobody")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								min: 0,
								max: Math.max(duration, 1),
								step: 500,
								value: [Math.min(displayPosition, duration || displayPosition)],
								onValueChange: (v) => onSeek(v[0] ?? 0),
								disabled: !track
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-xs tabular-nums text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDuration(displayPosition) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDuration(duration) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid h-11 w-11 place-items-center rounded-full hover:bg-accent",
									onClick: onPrev,
									"aria-label": t("player.prev"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground pressable",
									onClick: onToggle,
									"aria-label": playback.isPlaying ? t("player.pause") : t("player.play"),
									children: playback.isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-6 ms-0.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid h-11 w-11 place-items-center rounded-full hover:bg-accent",
									onClick: onNext,
									"aria-label": t("player.next"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ms-auto flex w-36 items-center gap-2",
									children: [effectiveVolume === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										min: 0,
										max: 100,
										value: [playback.volume],
										onValueChange: (v) => onVolume(v[0] ?? 0),
										"aria-label": t("player.volume")
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "sr-only",
							"aria-hidden": true,
							style: { width: `${progress * 100}%` }
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
				ref: audioRef,
				onEnded,
				onLoadedMetadata: (e) => {
					const d = e.currentTarget.duration;
					if (Number.isFinite(d) && d > 0) onDuration(d * 1e3);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-4 overflow-hidden rounded-[16px] bg-black/40", track?.source === "youtube" ? "block" : "hidden"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: ytHostRef,
					className: "aspect-video w-full max-h-56",
					id: "nocturne-yt"
				})
			})
		]
	});
}
function Equalizer({ playing, overlay }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex h-8 items-end gap-1", !playing && "eq-paused", overlay && "h-6"),
		children: [
			0,
			1,
			2,
			3,
			4
		].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "eq-bar w-1.5 rounded-full bg-primary",
			style: { height: overlay ? 18 : 28 }
		}, i))
	});
}
var Tabs = Root2;
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		className: cn("inline-flex h-11 items-center justify-center gap-1 rounded-[14px] bg-secondary p-1 text-muted-foreground", className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		className: cn("inline-flex h-9 flex-1 items-center justify-center rounded-[10px] px-3 text-sm font-medium transition-colors data-[state=active]:bg-card data-[state=active]:text-foreground", className),
		...props
	});
}
function TabsContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
		className: cn("mt-3 outline-none", className),
		...props
	});
}
function QueuePanel({ queue, currentId, library, onAdd, onRemove }) {
	const { t } = useI18n();
	const [q, setQ] = (0, import_react.useState)("");
	const [hits, setHits] = (0, import_react.useState)(NOCTURNE_COLLECTION);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const filteredCollection = (0, import_react.useMemo)(() => searchCatalog(q).filter((t) => t.source !== "youtube" || q.length > 0), [q]);
	async function runSearch(value) {
		setQ(value);
		if (parseYoutubeId(value) || value.includes("youtube") || value.includes("youtu.be")) {
			setBusy(true);
			try {
				const res = await resolveYoutube({ data: { input: value } });
				setHits(res.tracks);
			} catch (err) {
				toast.error(err instanceof Error ? err.message : t("common.error"));
			} finally {
				setBusy(false);
			}
			return;
		}
		setHits(searchCatalog(value));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[22px] border border-border bg-card p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "px-1 pb-2 text-sm font-medium",
				children: t("room.queue")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "h-44",
				children: queue.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-2 py-8 text-center text-sm text-muted-foreground",
					children: t("room.emptyQueue")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1",
					children: queue.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("flex items-center gap-2 rounded-[12px] px-2 py-1.5", track.id === currentId && "bg-primary/10"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, { track }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm",
									children: track.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: [track.artist, track.durationMs ? ` · ${formatDuration(track.durationMs)}` : ""]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid h-9 w-9 place-items-center rounded-[8px] text-muted-foreground hover:bg-accent",
								onClick: () => void onRemove(track.id),
								"aria-label": t("common.delete"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					}, track.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "collection",
				className: "mt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "collection",
								children: t("room.collection")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "youtube",
								children: t("room.youtube")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "uploads",
								children: t("room.uploads")
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: q,
							onChange: (e) => void runSearch(e.target.value),
							placeholder: t("room.search")
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "collection",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackHits, {
							tracks: filteredCollection.filter((x) => x.source === "audio"),
							onAdd
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "youtube",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackHits, {
							tracks: hits.filter((x) => x.source === "youtube"),
							onAdd,
							loading: busy
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "uploads",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackHits, {
							tracks: library,
							onAdd
						})
					})
				]
			})
		]
	});
}
function TrackHits({ tracks, onAdd, loading }) {
	const { t } = useI18n();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-6 text-center text-sm text-muted-foreground",
		children: t("common.loading")
	});
	if (tracks.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-6 text-center text-sm text-muted-foreground",
		children: t("room.emptyQueue")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		className: "h-52",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-1",
			children: tracks.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-2 rounded-[12px] px-2 py-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cover, { track }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm",
							children: track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: track.artist
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => void onAdd(track),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3" }), t("room.add")]
					})
				]
			}, track.id))
		})
	});
}
function Cover({ track }) {
	const src = track.thumbnailUrl && isSafeImageSrc(track.thumbnailUrl) ? track.thumbnailUrl : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "h-10 w-10 shrink-0 overflow-hidden rounded-[8px] bg-secondary",
		children: src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: "",
			className: "h-full w-full object-cover"
		}) : null
	});
}
function RoomPage() {
	const { code } = Route$1.useParams();
	const roomCode = code.toUpperCase();
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 w-56 animate-pulse rounded-[22px] bg-secondary" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomGate, {
		code: roomCode,
		userId: user.id
	});
}
function RoomGate({ code, userId }) {
	const { t } = useI18n();
	const [access, setAccess] = (0, import_react.useState)(null);
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const reload = (0, import_react.useCallback)(async () => {
		const res = await getRoomAccess({ data: { code } });
		setAccess(res);
	}, [code]);
	(0, import_react.useEffect)(() => {
		reload().catch(() => setAccess({ status: "missing" }));
	}, [reload]);
	if (!access) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: t("common.loading")
		})
	});
	if (access.status === "missing") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl",
				children: t("room.missing")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/app",
					children: t("nav.rooms")
				})
			})]
		})
	});
	if (access.status === "need-join") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center px-4",
		"data-theme": access.theme,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm space-y-4 rounded-[28px] border border-border bg-card p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl tracking-tight",
					children: access.roomName
				}),
				access.pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: t("room.pending")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [access.hasPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "space-y-3",
					onSubmit: async (e) => {
						e.preventDefault();
						setBusy(true);
						try {
							await joinRoom({ data: {
								code,
								password,
								mode: "password"
							} });
							await reload();
						} catch (err) {
							toast.error(err instanceof Error ? err.message : t("common.error"));
						} finally {
							setBusy(false);
						}
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: t("room.needPassword")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: t("room.enterPassword")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: busy,
							children: t("room.join")
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: access.hasPassword ? "outline" : "default",
					className: "w-full",
					disabled: busy,
					onClick: async () => {
						setBusy(true);
						try {
							await joinRoom({ data: {
								code,
								mode: "request"
							} });
							await reload();
						} catch (err) {
							toast.error(err instanceof Error ? err.message : t("common.error"));
						} finally {
							setBusy(false);
						}
					},
					children: t("room.request")
				})] })
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoomSession, {
		code,
		userId,
		initial: access.snapshot
	});
}
function RoomSession({ code, userId, initial }) {
	const { t } = useI18n();
	const navigate = useNavigate();
	const [snap, setSnap] = (0, import_react.useState)(initial);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [library, setLibrary] = (0, import_react.useState)([]);
	const [friends, setFriends] = (0, import_react.useState)([]);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [now, setNow] = (0, import_react.useState)(Date.now());
	const playbackRef = (0, import_react.useRef)(snap.playback);
	playbackRef.current = snap.playback;
	const lastNotify = (0, import_react.useRef)({
		song: snap.playback.track?.id,
		members: snap.members.length,
		msgs: snap.messages.length
	});
	const p2p = useP2PRoom({
		room: code,
		name: snap.members.find((m) => m.userId === userId)?.displayName ?? "Listener",
		enabled: true
	});
	(0, import_react.useEffect)(() => {
		bootstrapMe().then((r) => setProfile(r.profile));
		listLibrary().then(setLibrary).catch(() => setLibrary([]));
		listFriends().then((rows) => setFriends(rows.filter((f) => f.relation === "accepted"))).catch(() => setFriends([]));
	}, []);
	const applySnap = (0, import_react.useCallback)((next, force = false) => {
		setSnap((prev) => {
			if (!force && next.playback.updatedAt < prev.playback.updatedAt) return {
				...next,
				playback: prev.playback
			};
			return next;
		});
	}, []);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => {
			pollRoom({ data: { code } }).then((s) => applySnap(s)).catch(() => void 0);
			ackMessages({ data: {
				code,
				stage: "delivered"
			} }).catch(() => void 0);
		}, 1600);
		return () => window.clearInterval(id);
	}, [code, applySnap]);
	(0, import_react.useEffect)(() => {
		return p2p.onMessage((_from, data) => {
			const msg = data;
			if (msg?.t === "playback" && msg.playback) setSnap((prev) => msg.playback.updatedAt >= prev.playback.updatedAt ? {
				...prev,
				playback: msg.playback
			} : prev);
			if (msg?.t === "refresh") pollRoom({ data: { code } }).then((s) => applySnap(s, true));
		});
	}, [
		p2p,
		code,
		applySnap
	]);
	(0, import_react.useEffect)(() => {
		const tmr = window.setInterval(() => setNow(Date.now()), 250);
		return () => window.clearInterval(tmr);
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (e.code === "Space") {
				e.preventDefault();
				controlToggle();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [snap.playback]);
	(0, import_react.useEffect)(() => {
		if (snap.playback.track?.id && snap.playback.track.id !== lastNotify.current.song) {
			lastNotify.current.song = snap.playback.track.id;
			pushBrowserNotification(snap.playback.track.title, snap.playback.track.artist, `/room/${code}`);
		}
		if (snap.members.length > lastNotify.current.members) {
			lastNotify.current.members = snap.members.length;
			const last = snap.members[snap.members.length - 1];
			if (last && last.userId !== userId) pushBrowserNotification(last.displayName, t("notify.join"), `/room/${code}`);
		} else lastNotify.current.members = snap.members.length;
		if (snap.messages.length > lastNotify.current.msgs) {
			const last = snap.messages[snap.messages.length - 1];
			lastNotify.current.msgs = snap.messages.length;
			if (last && last.userId !== userId && last.kind !== "system") pushBrowserNotification(last.displayName, last.body || t("notify.message"), `/room/${code}`);
		}
	}, [
		snap,
		code,
		userId,
		t
	]);
	(0, import_react.useEffect)(() => {
		ackMessages({ data: {
			code,
			stage: "read"
		} }).catch(() => void 0);
	}, [code, snap.messages.length]);
	const displayPosition = (0, import_react.useMemo)(() => {
		const pb = snap.playback;
		if (pb.isPlaying && pb.startedAt) return Math.max(0, pb.positionMs + (now - pb.startedAt));
		return pb.positionMs;
	}, [snap.playback, now]);
	const localMuted = Boolean(profile?.musicMuted || profile?.status === "away");
	const persistPlayback = (0, import_react.useCallback)(async (playback, enqueueHistory = false) => {
		const next = {
			...playback,
			updatedAt: Date.now(),
			controllerId: userId
		};
		setSnap((prev) => ({
			...prev,
			playback: next
		}));
		p2p.send({
			t: "playback",
			playback: next
		});
		try {
			await pushPlayback({ data: {
				code,
				playback: next,
				enqueueHistory
			} });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : t("common.error"));
		}
	}, [
		code,
		p2p,
		t,
		userId
	]);
	async function controlToggle() {
		const pb = playbackRef.current;
		if (!pb.track) {
			const first = snap.queue[0];
			if (!first) return;
			await persistPlayback({
				...pb,
				track: first,
				isPlaying: true,
				positionMs: 0,
				startedAt: Date.now()
			}, true);
			return;
		}
		if (pb.isPlaying) {
			const pos = pb.startedAt ? pb.positionMs + (Date.now() - pb.startedAt) : pb.positionMs;
			await persistPlayback({
				...pb,
				isPlaying: false,
				positionMs: pos,
				startedAt: null
			});
		} else await persistPlayback({
			...pb,
			isPlaying: true,
			startedAt: Date.now()
		});
	}
	async function playTrack(track, history = true) {
		const pb = playbackRef.current;
		await persistPlayback({
			...pb,
			track,
			isPlaying: true,
			positionMs: 0,
			startedAt: Date.now()
		}, history);
	}
	async function nextTrack() {
		const q = snap.queue;
		if (q.length === 0) return;
		const nxt = q[(q.findIndex((x) => x.id === snap.playback.track?.id) + 1) % q.length];
		if (nxt) await playTrack(nxt);
	}
	async function prevTrack() {
		const q = snap.queue;
		if (q.length === 0) return;
		const prv = q[(q.findIndex((x) => x.id === snap.playback.track?.id) - 1 + q.length) % q.length];
		if (prv) await playTrack(prv);
	}
	const me = snap.members.find((m) => m.userId === userId);
	const isOwner = snap.selfRole === "owner";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh",
		"data-theme": snap.room.theme,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-border/80 bg-background/80 px-4 py-3 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-medium",
								children: snap.room.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: t(`theme.${snap.room.theme}`)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ms-auto flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageSwitcher, { className: "hidden sm:inline-flex" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: async () => {
										const url = `${window.location.origin}/room/${code}`;
										await navigator.clipboard.writeText(url);
										setCopied(true);
										toast.success(t("room.copied"));
										window.setTimeout(() => setCopied(false), 1500);
									},
									children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden sm:inline",
										children: t("room.copy")
									})]
								}),
								!isOwner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: async () => {
										await leaveRoom({ data: { code } });
										navigate({ to: "/app" });
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorOpen, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden sm:inline",
										children: t("room.leave")
									})]
								}),
								isOwner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: async () => {
										if (!window.confirm(t("room.delete"))) return;
										await deleteRoom({ data: { code } });
										navigate({ to: "/app" });
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_340px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NowPlaying, {
							playback: snap.playback,
							localMuted,
							displayPosition,
							onToggle: () => void controlToggle(),
							onSeek: (ms) => {
								const pb = playbackRef.current;
								persistPlayback({
									...pb,
									positionMs: ms,
									startedAt: pb.isPlaying ? Date.now() : null
								});
							},
							onPrev: () => void prevTrack(),
							onNext: () => void nextTrack(),
							onVolume: (n) => {
								const pb = playbackRef.current;
								persistPlayback({
									...pb,
									volume: n
								});
							},
							onEnded: () => void nextTrack(),
							onDuration: (ms) => {
								const pb = playbackRef.current;
								if (pb.track && (!pb.track.durationMs || Math.abs(pb.track.durationMs - ms) > 500)) persistPlayback({
									...pb,
									track: {
										...pb.track,
										durationMs: ms
									}
								});
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-4 rounded-[18px] border border-border bg-card px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: profile?.status === "away",
									onCheckedChange: async (on) => {
										const next = await updateProfile({ data: { status: on ? "away" : "available" } });
										setProfile(next);
									}
								}), t("room.away")]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: Boolean(profile?.musicMuted),
									onCheckedChange: async (on) => {
										const next = await updateProfile({ data: { musicMuted: on } });
										setProfile(next);
									}
								}), t("room.muteMe")]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "lg:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
								defaultValue: "queue",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
										className: "w-full",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
												value: "queue",
												children: t("room.queue")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
												value: "chat",
												children: t("room.chat")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
												value: "people",
												children: t("room.people")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
												value: "history",
												children: t("room.history")
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
										value: "queue",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueueBlock, {
											snap,
											library,
											onAdd: async (track) => {
												const next = await addToQueue({ data: {
													code,
													track
												} });
												applySnap(next, true);
												p2p.send({ t: "refresh" });
												if (!snap.playback.track) await playTrack(track);
											},
											onRemove: async (id) => {
												const next = await removeFromQueue({ data: {
													code,
													trackId: id
												} });
												applySnap(next, true);
												p2p.send({ t: "refresh" });
											}
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
										value: "chat",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPanel, {
											messages: snap.messages,
											selfId: userId,
											onSend: async (payload) => {
												const next = await sendMessage({ data: {
													code,
													...payload
												} });
												applySnap(next, true);
												p2p.send({ t: "refresh" });
											}
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
										value: "people",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(People, {
											snap,
											isOwner,
											friends,
											userId,
											onKick: async (id) => {
												const next = await kickMember({ data: {
													code,
													userId: id
												} });
												applySnap(next, true);
											},
											onDecide: async (requestId, accept) => {
												const next = await decideJoin({ data: {
													code,
													requestId,
													accept
												} });
												applySnap(next, true);
											},
											onInvite: async (id) => {
												const next = await inviteFriendToRoom({ data: {
													code,
													userId: id
												} });
												applySnap(next, true);
											}
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
										value: "history",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryList, { snap })
									})
								]
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "hidden space-y-4 lg:block",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueueBlock, {
							snap,
							library,
							onAdd: async (track) => {
								const next = await addToQueue({ data: {
									code,
									track
								} });
								applySnap(next, true);
								p2p.send({ t: "refresh" });
								if (!snap.playback.track) await playTrack(track);
							},
							onRemove: async (id) => {
								const next = await removeFromQueue({ data: {
									code,
									trackId: id
								} });
								applySnap(next, true);
								p2p.send({ t: "refresh" });
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPanel, {
							messages: snap.messages,
							selfId: userId,
							onSend: async (payload) => {
								const next = await sendMessage({ data: {
									code,
									...payload
								} });
								applySnap(next, true);
								p2p.send({ t: "refresh" });
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(People, {
							snap,
							isOwner,
							friends,
							userId,
							onKick: async (id) => {
								const next = await kickMember({ data: {
									code,
									userId: id
								} });
								applySnap(next, true);
							},
							onDecide: async (requestId, accept) => {
								const next = await decideJoin({ data: {
									code,
									requestId,
									accept
								} });
								applySnap(next, true);
							},
							onInvite: async (id) => {
								const next = await inviteFriendToRoom({ data: {
									code,
									userId: id
								} });
								applySnap(next, true);
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryList, { snap })
					]
				})]
			}),
			me ? null : null
		]
	});
}
function QueueBlock({ snap, library, onAdd, onRemove }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueuePanel, {
		queue: snap.queue,
		currentId: snap.playback.track?.id,
		library,
		onAdd,
		onRemove
	});
}
function People({ snap, isOwner, friends, userId, onKick, onDecide, onInvite }) {
	const { t } = useI18n();
	const inRoom = new Set(snap.members.map((m) => m.userId));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-[22px] border border-border bg-card p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "flex items-center gap-2 px-1 pb-2 text-sm font-medium",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4" }), t("room.people")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: snap.members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 rounded-[12px] px-2 py-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							src: m.avatarUrl,
							name: m.displayName,
							size: "sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-sm",
								children: [m.displayName, m.role === "owner" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ms-2 text-[10px] tracking-wide text-gold uppercase",
									children: t("room.owner")
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-muted-foreground",
								children: [m.status === "away" ? t("common.away") : t("common.online"), m.musicMuted ? ` · ${t("room.muteMe")}` : ""]
							})]
						}),
						isOwner && m.userId !== userId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid h-9 w-9 place-items-center rounded-[8px] hover:bg-accent",
							onClick: () => void onKick(m.userId),
							"aria-label": t("room.kick"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMinus, { className: "size-4" })
						})
					]
				}, m.userId))
			}),
			isOwner && snap.requests.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 border-t border-border pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-2 flex items-center gap-1 px-1 text-xs font-medium text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3" }), t("room.requests")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: snap.requests.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
								src: r.avatarUrl,
								name: r.displayName,
								size: "sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "min-w-0 flex-1 truncate text-sm",
								children: r.displayName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => void onDecide(r.id, true),
								children: t("room.approve")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => void onDecide(r.id, false),
								children: t("room.decline")
							})
						]
					}, r.id))
				})]
			}),
			isOwner && friends.some((f) => !inRoom.has(f.userId)) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 border-t border-border pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 px-1 text-xs font-medium text-muted-foreground",
					children: t("room.invite")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1",
					children: friends.filter((f) => !inRoom.has(f.userId)).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 px-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
								src: f.avatarUrl,
								name: f.displayName,
								size: "sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "min-w-0 flex-1 truncate text-sm",
								children: f.displayName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "secondary",
								onClick: () => void onInvite(f.userId),
								children: t("room.invite")
							})
						]
					}, f.userId))
				})]
			})
		]
	});
}
function HistoryList({ snap }) {
	const { t } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-[22px] border border-border bg-card p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
			className: "flex items-center gap-2 px-1 pb-2 text-sm font-medium",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4" }), t("room.history")]
		}), snap.history.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-2 py-6 text-center text-sm text-muted-foreground",
			children: t("room.emptyHistory")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "h-40",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: snap.history.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-[12px] px-2 py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm",
						children: h.track.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs text-muted-foreground",
						children: h.track.artist
					})]
				}, h.id))
			})
		})]
	});
}
//#endregion
export { RoomPage as component };
