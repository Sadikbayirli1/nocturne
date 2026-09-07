import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { NOCTURNE_COLLECTION } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import { addLibraryTrack, listLibrary, removeLibraryTrack } from "@/lib/server/api";
import type { Track } from "@/lib/types";
import { coverFromSeed, fileToDataUrl, formatDuration, isSafeImageSrc } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "audio/x-m4a",
];

export const Route = createFileRoute("/app/library")({ component: LibraryPage });

function LibraryPage() {
  const { t } = useI18n();
  const [tracks, setTracks] = useState<Track[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void listLibrary()
      .then(setTracks)
      .catch(() => setTracks([]));
  }, []);

  async function add(track: Track) {
    try {
      const saved = await addLibraryTrack({ data: { track } });
      setTracks((prev) => [saved, ...prev]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{t("library.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("library.sub")}</p>
        </div>
        <Button onClick={() => fileRef.current?.click()}>
          <Upload className="size-4" />
          {t("library.upload")}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept={AUDIO_TYPES.join(",")}
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            if (!AUDIO_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|webm)$/i)) {
              toast.error(t("library.badType"));
              return;
            }
            if (file.size > 2_000_000) {
              toast.error(t("library.tooBig"));
              return;
            }
            const audioUrl = await fileToDataUrl(file);
            const title = file.name.replace(/\.[^.]+$/, "");
            await add({
              id: "tmp",
              title,
              artist: "Upload",
              durationMs: 0,
              source: "upload",
              audioUrl,
              thumbnailUrl: coverFromSeed(title),
            });
          }}
        />
      </div>

      {tracks.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">{t("library.empty")}</p>
      ) : (
        <ul className="mt-8 space-y-2">
          {tracks.map((track) => (
            <li key={track.id} className="flex items-center gap-3 rounded-[16px] border border-border bg-card px-3 py-2">
              <Cover track={track} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{track.title}</p>
                <p className="text-xs text-muted-foreground">
                  {track.artist}
                  {track.durationMs ? ` · ${formatDuration(track.durationMs)}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-[8px] hover:bg-accent"
                onClick={async () => {
                  await removeLibraryTrack({ data: { id: track.id } });
                  setTracks((prev) => prev.filter((x) => x.id !== track.id));
                }}
                aria-label={t("common.delete")}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-12 text-sm font-medium text-muted-foreground">{t("room.collection")}</h2>
      <ul className="mt-3 space-y-2">
        {NOCTURNE_COLLECTION.map((track) => (
          <li key={track.id} className="flex items-center gap-3 rounded-[16px] px-3 py-2">
            <Cover track={track} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{track.title}</p>
              <p className="text-xs text-muted-foreground">{track.artist}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => void add(track)}>
              {t("room.add")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Cover({ track }: { track: Track }) {
  const src = track.thumbnailUrl && isSafeImageSrc(track.thumbnailUrl) ? track.thumbnailUrl : null;
  return (
    <span className="h-10 w-10 overflow-hidden rounded-[8px] bg-secondary">
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : null}
    </span>
  );
}
