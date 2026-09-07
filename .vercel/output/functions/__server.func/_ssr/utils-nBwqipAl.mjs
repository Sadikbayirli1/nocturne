import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-nBwqipAl.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function asJson(value) {
	if (typeof value === "string") return JSON.parse(value);
	return value;
}
function uid(prefix = "") {
	return `${prefix}${crypto.randomUUID().replace(/-/g, "")}`.slice(0, 32);
}
function roomCode() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	const bytes = /* @__PURE__ */ new Uint8Array(8);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => alphabet[b % 32]).join("");
}
function parseYoutubeId(input) {
	const trimmed = input.trim();
	if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
	try {
		const url = new URL(trimmed);
		if (url.hostname === "youtu.be") {
			const id = url.pathname.replace("/", "");
			return /^[\w-]{11}$/.test(id) ? id : null;
		}
		if (url.hostname.includes("youtube.com")) {
			const v = url.searchParams.get("v");
			if (v && /^[\w-]{11}$/.test(v)) return v;
			const embed = url.pathname.match(/\/embed\/([\w-]{11})/);
			if (embed?.[1]) return embed[1];
			const shorts = url.pathname.match(/\/shorts\/([\w-]{11})/);
			if (shorts?.[1]) return shorts[1];
		}
	} catch {
		return null;
	}
	return null;
}
var IMAGE_PREFIXES = [
	"data:image/jpeg",
	"data:image/jpg",
	"data:image/png",
	"data:image/webp",
	"data:image/gif",
	"data:image/svg+xml"
];
var AUDIO_PREFIXES = [
	"data:audio/mpeg",
	"data:audio/mp3",
	"data:audio/wav",
	"data:audio/ogg",
	"data:audio/webm",
	"data:audio/mp4",
	"data:audio/aac",
	"data:audio/x-m4a",
	"data:audio/m4a"
];
function isSafeImageSrc(src) {
	if (!src) return false;
	if (src.startsWith("https://") || src.startsWith("blob:")) return true;
	return IMAGE_PREFIXES.some((p) => src.startsWith(p));
}
function isSafeAudioSrc(src) {
	if (!src) return false;
	if (src.startsWith("https://") || src.startsWith("blob:")) return true;
	return AUDIO_PREFIXES.some((p) => src.startsWith(p));
}
async function fileToDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("read failed"));
		reader.onload = () => resolve(String(reader.result ?? ""));
		reader.readAsDataURL(file);
	});
}
async function compressImage(file, maxEdge = 1280, quality = .82) {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
	const w = Math.max(1, Math.round(bitmap.width * scale));
	const h = Math.max(1, Math.round(bitmap.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) return fileToDataUrl(file);
	ctx.drawImage(bitmap, 0, 0, w, h);
	bitmap.close();
	return canvas.toDataURL("image/jpeg", quality);
}
function formatDuration(ms) {
	if (!Number.isFinite(ms) || ms < 0) return "0:00";
	const total = Math.floor(ms / 1e3);
	return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}
function coverFromSeed(seed) {
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = h * 31 + seed.charCodeAt(i) >>> 0;
	const h1 = h % 360;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="hsl(${h1},55%,18%)"/>
        <stop offset="1" stop-color="hsl(${(h1 + 48 + h % 40) % 360},50%,32%)"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <circle cx="200" cy="200" r="86" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="10"/>
    <circle cx="200" cy="200" r="18" fill="rgba(255,255,255,.22)"/>
    <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="2"/>
  </svg>`;
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function initials(name) {
	return (name ?? "N").trim().split(/\s+/).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("") || "N";
}
//#endregion
export { fileToDataUrl as a, isSafeAudioSrc as c, roomCode as d, uid as f, coverFromSeed as i, isSafeImageSrc as l, cn as n, formatDuration as o, compressImage as r, initials as s, asJson as t, parseYoutubeId as u };
