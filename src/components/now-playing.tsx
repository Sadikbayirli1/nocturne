import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import type { Playback, Track } from "@/lib/types";
import { cn, formatDuration, isSafeAudioSrc, isSafeImageSrc } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (s: number, allow: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (n: number) => void;
  loadVideoById: (opts: { videoId: string; startSeconds?: number }) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: { onReady?: () => void; onStateChange?: (e: { data: number }) => void };
        },
      ) => YTPlayer;
      PlayerState?: { ENDED: number; PLAYING: number; PAUSED: number };
    };
    onYouTubeIFrameAPIReady?: () => void;
  }
}

function loadYt(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const existing = document.querySelector("script[data-yt]");
    const prev = window.onYouTubeIFrameAPIReady;
    window.onYouTubeIFrameAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.dataset.yt = "1";
      document.body.appendChild(tag);
    }
  });
}

export function NowPlaying({
  playback,
  localMuted,
  displayPosition,
  onToggle,
  onSeek,
  onPrev,
  onNext,
  onVolume,
  onEnded,
  onDuration,
}: {
  playback: Playback;
  localMuted: boolean;
  displayPosition: number;
  onToggle: () => void;
  onSeek: (ms: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onVolume: (n: number) => void;
  onEnded: () => void;
  onDuration: (ms: number) => void;
}) {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement>(null);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const ytRef = useRef<YTPlayer | null>(null);
  const track = playback.track;
  const effectiveVolume = localMuted ? 0 : playback.volume;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = effectiveVolume / 100;
  }, [effectiveVolume]);

  useEffect(() => {
    ytRef.current?.setVolume(effectiveVolume);
  }, [effectiveVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!track || track.source === "youtube") {
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
      }
      return;
    }
    const src = track.audioUrl;
    if (!src || (!isSafeAudioSrc(src) && !src.startsWith("https://"))) return;
    if (audio && audio.src !== src) audio.src = src;
    const apply = async () => {
      if (!audio) return;
      const target = displayPosition / 1000;
      if (Math.abs(audio.currentTime - target) > 1.6) {
        try {
          audio.currentTime = target;
        } catch {
          /* ignore */
        }
      }
      if (playback.isPlaying) {
        try {
          await audio.play();
        } catch {
          /* autoplay may block */
        }
      } else {
        audio.pause();
      }
    };
    void apply();
  }, [track, playback.isPlaying, displayPosition]);

  useEffect(() => {
    if (!track?.youtubeId) {
      ytRef.current?.destroy();
      ytRef.current = null;
      return;
    }
    let cancelled = false;
    void (async () => {
      await loadYt();
      if (cancelled || !ytHostRef.current || !window.YT?.Player) return;
      if (!ytRef.current) {
        ytRef.current = new window.YT.Player(ytHostRef.current, {
          videoId: track.youtubeId,
          playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onReady: () => {
              ytRef.current?.setVolume(effectiveVolume);
              ytRef.current?.seekTo(displayPosition / 1000, true);
              if (playback.isPlaying) ytRef.current?.playVideo();
            },
            onStateChange: (e) => {
              if (e.data === window.YT?.PlayerState?.ENDED) onEnded();
              const dur = ytRef.current?.getDuration?.();
              if (dur && dur > 0) onDuration(dur * 1000);
            },
          },
        });
      } else {
        ytRef.current.loadVideoById({
          videoId: track.youtubeId!,
          startSeconds: displayPosition / 1000,
        });
        ytRef.current.setVolume(effectiveVolume);
        if (!playback.isPlaying) ytRef.current.pauseVideo();
      }
    })();
    return () => {
      cancelled = true;
    };
    // track id only — avoid tearing the player down on every tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.id, track?.youtubeId]);

  useEffect(() => {
    const yt = ytRef.current;
    if (!yt || !track?.youtubeId) return;
    try {
      const cur = yt.getCurrentTime() * 1000;
      if (Math.abs(cur - displayPosition) > 1800) yt.seekTo(displayPosition / 1000, true);
      if (playback.isPlaying) yt.playVideo();
      else yt.pauseVideo();
    } catch {
      /* player not ready */
    }
  }, [playback.isPlaying, displayPosition, track?.youtubeId]);

  const cover =
    track?.thumbnailUrl && isSafeImageSrc(track.thumbnailUrl) ? track.thumbnailUrl : null;
  const duration = track?.durationMs || 0;
  const progress = duration > 0 ? Math.min(1, displayPosition / duration) : 0;

  return (
    <section className="rounded-[28px] border border-border bg-card p-5 md:p-7">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative mx-auto aspect-square w-56 overflow-hidden rounded-[22px] bg-secondary md:mx-0 md:w-64">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center">
              <Equalizer playing={playback.isPlaying && !localMuted} />
            </div>
          )}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 flex h-14 items-end justify-center gap-1 pb-3",
              !playback.isPlaying && "eq-paused",
            )}
          >
            <Equalizer playing={playback.isPlaying && !localMuted} overlay />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
            {playback.isPlaying ? t("app.nowPlaying") : t("app.idle")}
          </p>
          <h2 className="font-display mt-1 text-2xl tracking-tight md:text-3xl">
            {track?.title ?? "—"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{track?.artist ?? ""}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {playback.controllerName
              ? t("room.controlledBy", { name: playback.controllerName })
              : t("room.nobody")}
          </p>

          <div className="mt-5 space-y-2">
            <Slider
              min={0}
              max={Math.max(duration, 1)}
              step={500}
              value={[Math.min(displayPosition, duration || displayPosition)]}
              onValueChange={(v) => onSeek(v[0] ?? 0)}
              disabled={!track}
            />
            <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
              <span>{formatDuration(displayPosition)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full hover:bg-accent"
              onClick={onPrev}
              aria-label={t("player.prev")}
            >
              <SkipBack className="size-5" />
            </button>
            <button
              type="button"
              className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground pressable"
              onClick={onToggle}
              aria-label={playback.isPlaying ? t("player.pause") : t("player.play")}
            >
              {playback.isPlaying ? <Pause className="size-6" /> : <Play className="size-6 ms-0.5" />}
            </button>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full hover:bg-accent"
              onClick={onNext}
              aria-label={t("player.next")}
            >
              <SkipForward className="size-5" />
            </button>
            <div className="ms-auto flex w-36 items-center gap-2">
              {effectiveVolume === 0 ? (
                <VolumeX className="size-4 text-muted-foreground" />
              ) : (
                <Volume2 className="size-4 text-muted-foreground" />
              )}
              <Slider
                min={0}
                max={100}
                value={[playback.volume]}
                onValueChange={(v) => onVolume(v[0] ?? 0)}
                aria-label={t("player.volume")}
              />
            </div>
          </div>
          <div
            className="sr-only"
            aria-hidden
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        onEnded={onEnded}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) onDuration(d * 1000);
        }}
      />
      <div className={cn("mt-4 overflow-hidden rounded-[16px] bg-black/40", track?.source === "youtube" ? "block" : "hidden")}>
        <div ref={ytHostRef} className="aspect-video w-full max-h-56" id="nocturne-yt" />
      </div>
    </section>
  );
}

function Equalizer({ playing, overlay }: { playing: boolean; overlay?: boolean }) {
  return (
    <div className={cn("flex h-8 items-end gap-1", !playing && "eq-paused", overlay && "h-6")}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="eq-bar w-1.5 rounded-full bg-primary"
          style={{ height: overlay ? 18 : 28 }}
        />
      ))}
    </div>
  );
}
