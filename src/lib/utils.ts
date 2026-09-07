import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function asJson<T>(value: unknown): T {
  if (typeof value === "string") return JSON.parse(value) as T;
  return value as T;
}

export function uid(prefix = ""): string {
  const raw = crypto.randomUUID().replace(/-/g, "");
  return `${prefix}${raw}`.slice(0, 32);
}

export function roomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]!).join("");
}

export function parseYoutubeId(input: string): string | null {
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

const IMAGE_PREFIXES = [
  "data:image/jpeg",
  "data:image/jpg",
  "data:image/png",
  "data:image/webp",
  "data:image/gif",
  "data:image/svg+xml",
];
const AUDIO_PREFIXES = [
  "data:audio/mpeg",
  "data:audio/mp3",
  "data:audio/wav",
  "data:audio/ogg",
  "data:audio/webm",
  "data:audio/mp4",
  "data:audio/aac",
  "data:audio/x-m4a",
  "data:audio/m4a",
];

export function isSafeImageSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("https://") || src.startsWith("blob:")) return true;
  return IMAGE_PREFIXES.some((p) => src.startsWith(p));
}

export function isSafeAudioSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("https://") || src.startsWith("blob:")) return true;
  return AUDIO_PREFIXES.some((p) => src.startsWith(p));
}

export function isSafeHttpUrl(src: string): boolean {
  return src.startsWith("https://") || src.startsWith("http://");
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

export async function compressImage(
  file: File,
  maxEdge = 1280,
  quality = 0.82,
): Promise<string> {
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

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0:00";
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function coverFromSeed(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const h1 = h % 360;
  const h2 = (h1 + 48 + (h % 40)) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="hsl(${h1},55%,18%)"/>
        <stop offset="1" stop-color="hsl(${h2},50%,32%)"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <circle cx="200" cy="200" r="86" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="10"/>
    <circle cx="200" cy="200" r="18" fill="rgba(255,255,255,.22)"/>
    <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="2"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function initials(name: string | null | undefined): string {
  const parts = (name ?? "N").trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "N";
}
