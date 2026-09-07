export async function ensureNotifyPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function pushBrowserNotification(title: string, body: string, href?: string | null) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!document.hidden) return;
  try {
    const n = new Notification(title, { body, silent: false });
    n.onclick = () => {
      window.focus();
      if (href) window.location.href = href;
      n.close();
    };
  } catch {
    /* ignore */
  }
}
