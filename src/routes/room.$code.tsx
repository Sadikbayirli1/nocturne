import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  Copy,
  DoorOpen,
  History,
  Link2,
  Shield,
  Trash2,
  UserMinus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { pushBrowserNotification } from "@/lib/browser-notify";
import { useI18n } from "@/lib/i18n";
import { useP2PRoom } from "@/lib/multiplayer";
import {
  ackMessages,
  addToQueue,
  bootstrapMe,
  decideJoin,
  deleteRoom,
  getRoomAccess,
  inviteFriendToRoom,
  joinRoom,
  kickMember,
  leaveRoom,
  listFriends,
  listLibrary,
  pollRoom,
  pushPlayback,
  removeFromQueue,
  sendMessage,
  updateProfile,
} from "@/lib/server/api";
import type { Friend, Playback, Profile, RoomAccess, RoomSnapshot, Track } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChatPanel } from "@/components/chat-panel";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { NowPlaying } from "@/components/now-playing";
import { QueuePanel } from "@/components/queue-panel";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/room/$code")({ component: RoomPage });

function RoomPage() {
  const { code } = Route.useParams();
  const roomCode = code.toUpperCase();
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="h-24 w-56 animate-pulse rounded-[22px] bg-secondary" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <RoomGate code={roomCode} userId={user.id} />;
}

function RoomGate({ code, userId }: { code: string; userId: string }) {
  const { t } = useI18n();
  const [access, setAccess] = useState<RoomAccess | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const res = await getRoomAccess({ data: { code } });
    setAccess(res);
  }, [code]);

  useEffect(() => {
    void reload().catch(() => setAccess({ status: "missing" }));
  }, [reload]);

  if (!access) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }
  if (access.status === "missing") {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="text-center">
          <p className="font-display text-2xl">{t("room.missing")}</p>
          <Button asChild className="mt-4">
            <Link to="/app">{t("nav.rooms")}</Link>
          </Button>
        </div>
      </main>
    );
  }
  if (access.status === "need-join") {
    return (
      <main className="grid min-h-dvh place-items-center px-4" data-theme={access.theme}>
        <div className="w-full max-w-sm space-y-4 rounded-[28px] border border-border bg-card p-6">
          <Logo />
          <h1 className="font-display text-2xl tracking-tight">{access.roomName}</h1>
          {access.pending ? (
            <p className="text-sm text-muted-foreground">{t("room.pending")}</p>
          ) : (
            <>
              {access.hasPassword && (
                <form
                  className="space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    try {
                      await joinRoom({ data: { code, password, mode: "password" } });
                      await reload();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : t("common.error"));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <p className="text-sm text-muted-foreground">{t("room.needPassword")}</p>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("room.enterPassword")}
                  />
                  <Button type="submit" className="w-full" disabled={busy}>
                    {t("room.join")}
                  </Button>
                </form>
              )}
              <Button
                variant={access.hasPassword ? "outline" : "default"}
                className="w-full"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await joinRoom({ data: { code, mode: "request" } });
                    await reload();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : t("common.error"));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t("room.request")}
              </Button>
            </>
          )}
        </div>
      </main>
    );
  }
  return <RoomSession code={code} userId={userId} initial={access.snapshot} />;
}

function RoomSession({
  code,
  userId,
  initial,
}: {
  code: string;
  userId: string;
  initial: RoomSnapshot;
}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [snap, setSnap] = useState(initial);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [library, setLibrary] = useState<Track[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const playbackRef = useRef(snap.playback);
  playbackRef.current = snap.playback;
  const lastNotify = useRef({ song: snap.playback.track?.id, members: snap.members.length, msgs: snap.messages.length });

  const p2p = useP2PRoom({
    room: code,
    name: snap.members.find((m) => m.userId === userId)?.displayName ?? "Listener",
    enabled: true,
  });

  useEffect(() => {
    void bootstrapMe().then((r) => setProfile(r.profile));
    void listLibrary().then(setLibrary).catch(() => setLibrary([]));
    void listFriends()
      .then((rows) => setFriends(rows.filter((f) => f.relation === "accepted")))
      .catch(() => setFriends([]));
  }, []);

  const applySnap = useCallback((next: RoomSnapshot, force = false) => {
    setSnap((prev) => {
      if (!force && next.playback.updatedAt < prev.playback.updatedAt) {
        return { ...next, playback: prev.playback };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      void pollRoom({ data: { code } })
        .then((s) => applySnap(s))
        .catch(() => undefined);
      void ackMessages({ data: { code, stage: "delivered" } }).catch(() => undefined);
    }, 1600);
    return () => window.clearInterval(id);
  }, [code, applySnap]);

  useEffect(() => {
    return p2p.onMessage((_from, data) => {
      const msg = data as { t?: string; playback?: Playback };
      if (msg?.t === "playback" && msg.playback) {
        setSnap((prev) =>
          msg.playback!.updatedAt >= prev.playback.updatedAt
            ? { ...prev, playback: msg.playback! }
            : prev,
        );
      }
      if (msg?.t === "refresh") {
        void pollRoom({ data: { code } }).then((s) => applySnap(s, true));
      }
    });
  }, [p2p, code, applySnap]);

  useEffect(() => {
    const tmr = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(tmr);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        void controlToggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap.playback]);

  useEffect(() => {
    if (snap.playback.track?.id && snap.playback.track.id !== lastNotify.current.song) {
      lastNotify.current.song = snap.playback.track.id;
      pushBrowserNotification(snap.playback.track.title, snap.playback.track.artist, `/room/${code}`);
    }
    if (snap.members.length > lastNotify.current.members) {
      lastNotify.current.members = snap.members.length;
      const last = snap.members[snap.members.length - 1];
      if (last && last.userId !== userId) {
        pushBrowserNotification(last.displayName, t("notify.join"), `/room/${code}`);
      }
    } else {
      lastNotify.current.members = snap.members.length;
    }
    if (snap.messages.length > lastNotify.current.msgs) {
      const last = snap.messages[snap.messages.length - 1];
      lastNotify.current.msgs = snap.messages.length;
      if (last && last.userId !== userId && last.kind !== "system") {
        pushBrowserNotification(last.displayName, last.body || t("notify.message"), `/room/${code}`);
      }
    }
  }, [snap, code, userId, t]);

  useEffect(() => {
    void ackMessages({ data: { code, stage: "read" } }).catch(() => undefined);
  }, [code, snap.messages.length]);

  const displayPosition = useMemo(() => {
    const pb = snap.playback;
    if (pb.isPlaying && pb.startedAt) {
      return Math.max(0, pb.positionMs + (now - pb.startedAt));
    }
    return pb.positionMs;
  }, [snap.playback, now]);

  const localMuted = Boolean(profile?.musicMuted || profile?.status === "away");

  const persistPlayback = useCallback(
    async (playback: Playback, enqueueHistory = false) => {
      const next = { ...playback, updatedAt: Date.now(), controllerId: userId };
      setSnap((prev) => ({ ...prev, playback: next }));
      p2p.send({ t: "playback", playback: next });
      try {
        await pushPlayback({ data: { code, playback: next, enqueueHistory } });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t("common.error"));
      }
    },
    [code, p2p, t, userId],
  );

  async function controlToggle() {
    const pb = playbackRef.current;
    if (!pb.track) {
      const first = snap.queue[0];
      if (!first) return;
      await persistPlayback(
        {
          ...pb,
          track: first,
          isPlaying: true,
          positionMs: 0,
          startedAt: Date.now(),
        },
        true,
      );
      return;
    }
    if (pb.isPlaying) {
      const pos = pb.startedAt ? pb.positionMs + (Date.now() - pb.startedAt) : pb.positionMs;
      await persistPlayback({ ...pb, isPlaying: false, positionMs: pos, startedAt: null });
    } else {
      await persistPlayback({ ...pb, isPlaying: true, startedAt: Date.now() });
    }
  }

  async function playTrack(track: Track, history = true) {
    const pb = playbackRef.current;
    await persistPlayback(
      {
        ...pb,
        track,
        isPlaying: true,
        positionMs: 0,
        startedAt: Date.now(),
      },
      history,
    );
  }

  async function nextTrack() {
    const q = snap.queue;
    if (q.length === 0) return;
    const idx = q.findIndex((x) => x.id === snap.playback.track?.id);
    const nxt = q[(idx + 1) % q.length];
    if (nxt) await playTrack(nxt);
  }

  async function prevTrack() {
    const q = snap.queue;
    if (q.length === 0) return;
    const idx = q.findIndex((x) => x.id === snap.playback.track?.id);
    const prv = q[(idx - 1 + q.length) % q.length];
    if (prv) await playTrack(prv);
  }

  const me = snap.members.find((m) => m.userId === userId);
  const isOwner = snap.selfRole === "owner";

  return (
    <div className="min-h-dvh" data-theme={snap.room.theme}>
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link to="/app">
            <Logo />
          </Link>
          <div className="min-w-0">
            <p className="truncate font-medium">{snap.room.name}</p>
            <p className="text-xs text-muted-foreground">{t(`theme.${snap.room.theme}`)}</p>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                const url = `${window.location.origin}/room/${code}`;
                await navigator.clipboard.writeText(url);
                setCopied(true);
                toast.success(t("room.copied"));
                window.setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              <span className="hidden sm:inline">{t("room.copy")}</span>
            </Button>
            {!isOwner && (
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await leaveRoom({ data: { code } });
                  void navigate({ to: "/app" });
                }}
              >
                <DoorOpen className="size-4" />
                <span className="hidden sm:inline">{t("room.leave")}</span>
              </Button>
            )}
            {isOwner && (
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  if (!window.confirm(t("room.delete"))) return;
                  await deleteRoom({ data: { code } });
                  void navigate({ to: "/app" });
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <NowPlaying
            playback={snap.playback}
            localMuted={localMuted}
            displayPosition={displayPosition}
            onToggle={() => void controlToggle()}
            onSeek={(ms) => {
              const pb = playbackRef.current;
              void persistPlayback({
                ...pb,
                positionMs: ms,
                startedAt: pb.isPlaying ? Date.now() : null,
              });
            }}
            onPrev={() => void prevTrack()}
            onNext={() => void nextTrack()}
            onVolume={(n) => {
              const pb = playbackRef.current;
              void persistPlayback({ ...pb, volume: n });
            }}
            onEnded={() => void nextTrack()}
            onDuration={(ms) => {
              const pb = playbackRef.current;
              if (pb.track && (!pb.track.durationMs || Math.abs(pb.track.durationMs - ms) > 500)) {
                void persistPlayback({ ...pb, track: { ...pb.track, durationMs: ms } });
              }
            }}
          />

          <div className="flex flex-wrap items-center gap-4 rounded-[18px] border border-border bg-card px-4 py-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={profile?.status === "away"}
                onCheckedChange={async (on) => {
                  const next = await updateProfile({ data: { status: on ? "away" : "available" } });
                  setProfile(next);
                }}
              />
              {t("room.away")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={Boolean(profile?.musicMuted)}
                onCheckedChange={async (on) => {
                  const next = await updateProfile({ data: { musicMuted: on } });
                  setProfile(next);
                }}
              />
              {t("room.muteMe")}
            </label>
          </div>

          <div className="lg:hidden">
            <Tabs defaultValue="queue">
              <TabsList className="w-full">
                <TabsTrigger value="queue">{t("room.queue")}</TabsTrigger>
                <TabsTrigger value="chat">{t("room.chat")}</TabsTrigger>
                <TabsTrigger value="people">{t("room.people")}</TabsTrigger>
                <TabsTrigger value="history">{t("room.history")}</TabsTrigger>
              </TabsList>
              <TabsContent value="queue">
                <QueueBlock
                  snap={snap}
                  library={library}
                  onAdd={async (track) => {
                    const next = await addToQueue({ data: { code, track } });
                    applySnap(next, true);
                    p2p.send({ t: "refresh" });
                    if (!snap.playback.track) await playTrack(track);
                  }}
                  onRemove={async (id) => {
                    const next = await removeFromQueue({ data: { code, trackId: id } });
                    applySnap(next, true);
                    p2p.send({ t: "refresh" });
                  }}
                />
              </TabsContent>
              <TabsContent value="chat">
                <ChatPanel
                  messages={snap.messages}
                  selfId={userId}
                  onSend={async (payload) => {
                    const next = await sendMessage({ data: { code, ...payload } });
                    applySnap(next, true);
                    p2p.send({ t: "refresh" });
                  }}
                />
              </TabsContent>
              <TabsContent value="people">
                <People
                  snap={snap}
                  isOwner={isOwner}
                  friends={friends}
                  userId={userId}
                  onKick={async (id) => {
                    const next = await kickMember({ data: { code, userId: id } });
                    applySnap(next, true);
                  }}
                  onDecide={async (requestId, accept) => {
                    const next = await decideJoin({ data: { code, requestId, accept } });
                    applySnap(next, true);
                  }}
                  onInvite={async (id) => {
                    const next = await inviteFriendToRoom({ data: { code, userId: id } });
                    applySnap(next, true);
                  }}
                />
              </TabsContent>
              <TabsContent value="history">
                <HistoryList snap={snap} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <aside className="hidden space-y-4 lg:block">
          <QueueBlock
            snap={snap}
            library={library}
            onAdd={async (track) => {
              const next = await addToQueue({ data: { code, track } });
              applySnap(next, true);
              p2p.send({ t: "refresh" });
              if (!snap.playback.track) await playTrack(track);
            }}
            onRemove={async (id) => {
              const next = await removeFromQueue({ data: { code, trackId: id } });
              applySnap(next, true);
              p2p.send({ t: "refresh" });
            }}
          />
          <ChatPanel
            messages={snap.messages}
            selfId={userId}
            onSend={async (payload) => {
              const next = await sendMessage({ data: { code, ...payload } });
              applySnap(next, true);
              p2p.send({ t: "refresh" });
            }}
          />
          <People
            snap={snap}
            isOwner={isOwner}
            friends={friends}
            userId={userId}
            onKick={async (id) => {
              const next = await kickMember({ data: { code, userId: id } });
              applySnap(next, true);
            }}
            onDecide={async (requestId, accept) => {
              const next = await decideJoin({ data: { code, requestId, accept } });
              applySnap(next, true);
            }}
            onInvite={async (id) => {
              const next = await inviteFriendToRoom({ data: { code, userId: id } });
              applySnap(next, true);
            }}
          />
          <HistoryList snap={snap} />
        </aside>
      </div>
      {me ? null : null}
    </div>
  );
}

function QueueBlock({
  snap,
  library,
  onAdd,
  onRemove,
}: {
  snap: RoomSnapshot;
  library: Track[];
  onAdd: (t: Track) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  return (
    <QueuePanel
      queue={snap.queue}
      currentId={snap.playback.track?.id}
      library={library}
      onAdd={onAdd}
      onRemove={onRemove}
    />
  );
}

function People({
  snap,
  isOwner,
  friends,
  userId,
  onKick,
  onDecide,
  onInvite,
}: {
  snap: RoomSnapshot;
  isOwner: boolean;
  friends: Friend[];
  userId: string;
  onKick: (id: string) => Promise<void>;
  onDecide: (id: string, accept: boolean) => Promise<void>;
  onInvite: (id: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const inRoom = new Set(snap.members.map((m) => m.userId));
  return (
    <section className="rounded-[22px] border border-border bg-card p-3">
      <h3 className="flex items-center gap-2 px-1 pb-2 text-sm font-medium">
        <Link2 className="size-4" />
        {t("room.people")}
      </h3>
      <ul className="space-y-1">
        {snap.members.map((m) => (
          <li key={m.userId} className="flex items-center gap-2 rounded-[12px] px-2 py-1.5">
            <Avatar src={m.avatarUrl} name={m.displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                {m.displayName}
                {m.role === "owner" && (
                  <span className="ms-2 text-[10px] tracking-wide text-gold uppercase">
                    {t("room.owner")}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {m.status === "away" ? t("common.away") : t("common.online")}
                {m.musicMuted ? ` · ${t("room.muteMe")}` : ""}
              </p>
            </div>
            {isOwner && m.userId !== userId && (
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-[8px] hover:bg-accent"
                onClick={() => void onKick(m.userId)}
                aria-label={t("room.kick")}
              >
                <UserMinus className="size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {isOwner && snap.requests.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 flex items-center gap-1 px-1 text-xs font-medium text-muted-foreground">
            <Shield className="size-3" />
            {t("room.requests")}
          </p>
          <ul className="space-y-2">
            {snap.requests.map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <Avatar src={r.avatarUrl} name={r.displayName} size="sm" />
                <p className="min-w-0 flex-1 truncate text-sm">{r.displayName}</p>
                <Button size="sm" onClick={() => void onDecide(r.id, true)}>
                  {t("room.approve")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void onDecide(r.id, false)}>
                  {t("room.decline")}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {isOwner && friends.some((f) => !inRoom.has(f.userId)) && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">{t("room.invite")}</p>
          <ul className="space-y-1">
            {friends
              .filter((f) => !inRoom.has(f.userId))
              .map((f) => (
                <li key={f.userId} className="flex items-center gap-2 px-1">
                  <Avatar src={f.avatarUrl} name={f.displayName} size="sm" />
                  <p className="min-w-0 flex-1 truncate text-sm">{f.displayName}</p>
                  <Button size="sm" variant="secondary" onClick={() => void onInvite(f.userId)}>
                    {t("room.invite")}
                  </Button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function HistoryList({ snap }: { snap: RoomSnapshot }) {
  const { t } = useI18n();
  return (
    <section className="rounded-[22px] border border-border bg-card p-3">
      <h3 className="flex items-center gap-2 px-1 pb-2 text-sm font-medium">
        <History className="size-4" />
        {t("room.history")}
      </h3>
      {snap.history.length === 0 ? (
        <p className="px-2 py-6 text-center text-sm text-muted-foreground">{t("room.emptyHistory")}</p>
      ) : (
        <ScrollArea className="h-40">
          <ul className="space-y-1">
            {snap.history.map((h) => (
              <li key={h.id} className="rounded-[12px] px-2 py-1.5">
                <p className="truncate text-sm">{h.track.title}</p>
                <p className="truncate text-xs text-muted-foreground">{h.track.artist}</p>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </section>
  );
}
