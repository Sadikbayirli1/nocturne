import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { markNotificationsRead } from "@/lib/server/api";
import type { AppNotification } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NotificationsBell({
  items,
  onRead,
}: {
  items: AppNotification[];
  onRead: () => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="relative grid h-11 w-11 place-items-center rounded-[12px] hover:bg-accent"
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unread) {
            void markNotificationsRead().then(onRead);
          }
        }}
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        )}
      </button>
      {open && (
        <div className="absolute end-0 z-40 mt-2 w-80 overflow-hidden rounded-[18px] border border-border bg-popover p-2 shadow-xl">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("notify.empty")}</p>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {items.map((n) => (
                <li key={n.id}>
                  {n.href ? (
                    <a
                      href={n.href}
                      className={cn(
                        "block rounded-[12px] px-3 py-2 hover:bg-accent",
                        !n.read && "bg-primary/8",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.body}</p>
                    </a>
                  ) : (
                    <div className="rounded-[12px] px-3 py-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.body}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
