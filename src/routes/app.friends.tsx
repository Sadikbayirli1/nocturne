import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { listFriends, respondFriend, searchPeople, sendFriendRequest } from "@/lib/server/api";
import type { Friend } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/friends")({ component: FriendsPage });

function FriendsPage() {
  const { t } = useI18n();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ userId: string; displayName: string; avatarUrl: string | null; status: "available" | "away" }[]>([]);

  async function refresh() {
    const rows = await listFriends();
    setFriends(rows);
  }

  useEffect(() => {
    void refresh().catch(() => setFriends([]));
  }, []);

  const incoming = friends.filter((f) => f.relation === "incoming");
  const accepted = friends.filter((f) => f.relation === "accepted");
  const outgoing = friends.filter((f) => f.relation === "outgoing");

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">{t("nav.friends")}</h1>
        <form
          className="mt-4 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const res = await searchPeople({ data: { q } });
              setHits(res);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : t("common.error"));
            }
          }}
        >
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("friends.search")} />
          <Button type="submit">{t("common.search")}</Button>
        </form>
        {hits.length > 0 && (
          <ul className="mt-3 space-y-2">
            {hits.map((p) => (
              <li key={p.userId} className="flex items-center gap-3 rounded-[16px] border border-border bg-card px-3 py-2">
                <Avatar src={p.avatarUrl} name={p.displayName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.status === "away" ? t("common.away") : t("common.online")}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await sendFriendRequest({ data: { userId: p.userId } });
                      toast.success(t("friends.pending"));
                      await refresh();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : t("common.error"));
                    }
                  }}
                >
                  {t("friends.add")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {incoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t("friends.incoming")}</h2>
          <ul className="space-y-2">
            {incoming.map((f) => (
              <li key={f.friendshipId} className="flex items-center gap-3 rounded-[16px] border border-border bg-card px-3 py-2">
                <Avatar src={f.avatarUrl} name={f.displayName} />
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{f.displayName}</p>
                <Button
                  size="sm"
                  onClick={async () => {
                    await respondFriend({ data: { friendshipId: f.friendshipId, accept: true } });
                    await refresh();
                  }}
                >
                  {t("friends.accept")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await respondFriend({ data: { friendshipId: f.friendshipId, accept: false } });
                    await refresh();
                  }}
                >
                  {t("friends.ignore")}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t("friends.list")}</h2>
        {accepted.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("friends.empty")}</p>
        ) : (
          <ul className="space-y-2">
            {accepted.map((f) => (
              <li key={f.friendshipId} className="flex items-center gap-3 rounded-[16px] border border-border bg-card px-3 py-2">
                <Avatar src={f.avatarUrl} name={f.displayName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.status === "away" ? t("common.away") : t("common.online")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {outgoing.length > 0 && (
          <ul className="mt-3 space-y-2">
            {outgoing.map((f) => (
              <li key={f.friendshipId} className="flex items-center gap-3 rounded-[16px] px-3 py-2 text-sm text-muted-foreground">
                <Avatar src={f.avatarUrl} name={f.displayName} size="sm" />
                {f.displayName} · {t("friends.pending")}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
