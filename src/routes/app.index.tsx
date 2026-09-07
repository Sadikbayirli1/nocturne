import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { listRooms } from "@/lib/server/api";
import type { RoomSummary } from "@/lib/types";
import { CreateRoomDialog } from "@/components/create-room-dialog";

export const Route = createFileRoute("/app/")({ component: RoomsPage });

function RoomsPage() {
  const { t } = useI18n();
  const user = useCurrentUser();
  const [rooms, setRooms] = useState<RoomSummary[] | null>(null);

  useEffect(() => {
    void listRooms()
      .then(setRooms)
      .catch(() => setRooms([]));
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">
            {t("app.greeting", { name: user?.displayName ?? "—" })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("app.sub")}</p>
        </div>
        <CreateRoomDialog />
      </div>

      {rooms === null ? (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[22px] bg-secondary" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="mt-12 rounded-[28px] border border-dashed border-border px-6 py-16 text-center">
          <p className="text-muted-foreground">{t("app.empty")}</p>
          <div className="mt-4 flex justify-center">
            <CreateRoomDialog />
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {rooms.map((room) => (
            <li key={room.id}>
              <Link
                to="/room/$code"
                params={{ code: room.id }}
                className="block rounded-[22px] border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-[0.16em] text-primary uppercase">
                      {t(`theme.${room.theme}`)}
                    </p>
                    <h2 className="font-display mt-1 text-2xl tracking-tight">{room.name}</h2>
                  </div>
                  {room.hasPassword && <Lock className="size-4 text-muted-foreground" />}
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  {t("app.members", { n: room.memberCount })}
                  <span>·</span>
                  {room.currentTitle ? `${t("app.nowPlaying")} · ${room.currentTitle}` : t("app.idle")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
