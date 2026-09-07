import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { NOCTURNE_COLLECTION, searchCatalog } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import { resolveYoutube } from "@/lib/server/api";
import type { Track } from "@/lib/types";
import { cn, formatDuration, isSafeImageSrc, parseYoutubeId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function QueuePanel({
  queue,
  currentId,
  library,
  onAdd,
  onRemove,
}: {
  queue: Track[];
  currentId?: string;
  library: Track[];
  onAdd: (track: Track) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Track[]>(NOCTURNE_COLLECTION);
  const [busy, setBusy] = useState(false);

  const filteredCollection = useMemo(() => searchCatalog(q).filter((t) => t.source !== "youtube" || q.length > 0), [q]);

  async function runSearch(value: string) {
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

  return (
    <div className="rounded-[22px] border border-border bg-card p-3">
      <h3 className="px-1 pb-2 text-sm font-medium">{t("room.queue")}</h3>
      <ScrollArea className="h-44">
        {queue.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">{t("room.emptyQueue")}</p>
        ) : (
          <ul className="space-y-1">
            {queue.map((track) => (
              <li
                key={track.id}
                className={cn(
                  "flex items-center gap-2 rounded-[12px] px-2 py-1.5",
                  track.id === currentId && "bg-primary/10",
                )}
              >
                <Cover track={track} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{track.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {track.artist}
                    {track.durationMs ? ` · ${formatDuration(track.durationMs)}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-[8px] text-muted-foreground hover:bg-accent"
                  onClick={() => void onRemove(track.id)}
                  aria-label={t("common.delete")}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>

      <Tabs defaultValue="collection" className="mt-3">
        <TabsList className="w-full">
          <TabsTrigger value="collection">{t("room.collection")}</TabsTrigger>
          <TabsTrigger value="youtube">{t("room.youtube")}</TabsTrigger>
          <TabsTrigger value="uploads">{t("room.uploads")}</TabsTrigger>
        </TabsList>
        <div className="mt-2">
          <Input
            value={q}
            onChange={(e) => void runSearch(e.target.value)}
            placeholder={t("room.search")}
          />
        </div>
        <TabsContent value="collection">
          <TrackHits tracks={filteredCollection.filter((x) => x.source === "audio")} onAdd={onAdd} />
        </TabsContent>
        <TabsContent value="youtube">
          <TrackHits tracks={hits.filter((x) => x.source === "youtube")} onAdd={onAdd} loading={busy} />
        </TabsContent>
        <TabsContent value="uploads">
          <TrackHits tracks={library} onAdd={onAdd} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TrackHits({
  tracks,
  onAdd,
  loading,
}: {
  tracks: Track[];
  onAdd: (track: Track) => Promise<void>;
  loading?: boolean;
}) {
  const { t } = useI18n();
  if (loading) return <p className="py-6 text-center text-sm text-muted-foreground">{t("common.loading")}</p>;
  if (tracks.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">{t("room.emptyQueue")}</p>;
  return (
    <ScrollArea className="h-52">
      <ul className="space-y-1">
        {tracks.map((track) => (
          <li key={track.id} className="flex items-center gap-2 rounded-[12px] px-2 py-1.5">
            <Cover track={track} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{track.title}</p>
              <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => void onAdd(track)}>
              <Plus className="size-3" />
              {t("room.add")}
            </Button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}

function Cover({ track }: { track: Track }) {
  const src = track.thumbnailUrl && isSafeImageSrc(track.thumbnailUrl) ? track.thumbnailUrl : null;
  return (
    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-[8px] bg-secondary">
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : null}
    </span>
  );
}
