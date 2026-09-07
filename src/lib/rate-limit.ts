const hits = new Map<string, { n: number; t: number }>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || now - cur.t > windowMs) {
    hits.set(key, { n: 1, t: now });
    return true;
  }
  if (cur.n >= max) return false;
  cur.n += 1;
  return true;
}

export function assertRate(key: string, max: number, windowMs: number) {
  if (!rateLimit(key, max, windowMs)) {
    throw new Error("Too many requests. Please wait a moment.");
  }
}
