import { Check, CheckCheck, ImagePlus, Mic, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import type { ChatMessage } from "@/lib/types";
import { compressImage, cn, isSafeAudioSrc, isSafeImageSrc } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const EMOJIS = ["♡", "♪", "✦", "☾", "★", "✓", "•", "∞", "▲", "◆"];

export function ChatPanel({
  messages,
  selfId,
  onSend,
}: {
  messages: ChatMessage[];
  selfId: string;
  onSend: (payload: { kind: "text" | "image" | "voice"; body?: string; mediaUrl?: string }) => Promise<void>;
}) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function submitText(extra = "") {
    const body = (text + extra).trim();
    if (!body) return;
    setBusy(true);
    try {
      await onSend({ kind: "text", body });
      setText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  async function startRec() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        if (blob.size > 700_000) {
          toast.error(t("library.tooBig"));
          return;
        }
        const url = await blobToDataUrl(blob);
        setBusy(true);
        try {
          await onSend({ kind: "voice", mediaUrl: url });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : t("common.error"));
        } finally {
          setBusy(false);
        }
      };
      mediaRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      toast.error(t("common.error"));
    }
  }

  function stopRec() {
    mediaRef.current?.stop();
    mediaRef.current = null;
    setRecording(false);
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-[22px] border border-border bg-card">
      <ScrollArea className="h-[min(52vh,420px)] flex-1 p-3">
        {messages.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-muted-foreground">{t("room.emptyChat")}</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className={cn("flex gap-2", m.userId === selfId && "flex-row-reverse")}>
                {m.kind !== "system" && <Avatar src={m.avatarUrl} name={m.displayName} size="sm" />}
                <div className={cn("max-w-[80%]", m.kind === "system" && "mx-auto max-w-none")}>
                  {m.kind === "system" ? (
                    <p className="text-center text-xs text-muted-foreground">{m.body}</p>
                  ) : (
                    <>
                      <p className="mb-1 text-[11px] text-muted-foreground">{m.displayName}</p>
                      <div
                        className={cn(
                          "rounded-[16px] px-3 py-2 text-sm",
                          m.userId === selfId ? "bg-primary text-primary-foreground" : "bg-secondary",
                        )}
                      >
                        {m.kind === "text" && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                        {m.kind === "image" && m.mediaUrl && isSafeImageSrc(m.mediaUrl) && (
                          <img src={m.mediaUrl} alt="" className="max-h-52 rounded-[12px] object-cover" />
                        )}
                        {m.kind === "voice" && m.mediaUrl && (isSafeAudioSrc(m.mediaUrl) || m.mediaUrl.startsWith("data:audio/")) && (
                          <audio controls src={m.mediaUrl} className="max-w-full" />
                        )}
                      </div>
                      {m.userId === selfId && (
                        <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                          {m.receipt === "read" ? <CheckCheck className="size-3 text-primary" /> : m.receipt === "delivered" ? <CheckCheck className="size-3" /> : <Check className="size-3" />}
                          {t(`receipt.${m.receipt}`)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </li>
            ))}
            <div ref={endRef} />
          </ul>
        )}
      </ScrollArea>
      <div className="border-t border-border p-2">
        <div className="mb-2 flex flex-wrap gap-1">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className="grid h-8 w-8 place-items-center rounded-[8px] text-sm hover:bg-accent"
              onClick={() => setText((v) => v + e)}
            >
              {e}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-1"
          onSubmit={(ev) => {
            ev.preventDefault();
            void submitText();
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={async (ev) => {
              const file = ev.target.files?.[0];
              ev.target.value = "";
              if (!file) return;
              if (file.size > 4_000_000) {
                toast.error(t("library.tooBig"));
                return;
              }
              setBusy(true);
              try {
                const url = await compressImage(file, 1280, 0.8);
                await onSend({ kind: "image", mediaUrl: url });
              } catch (err) {
                toast.error(err instanceof Error ? err.message : t("common.error"));
              } finally {
                setBusy(false);
              }
            }}
          />
          <Button type="button" size="icon" variant="ghost" onClick={() => fileRef.current?.click()} aria-label={t("room.photo")}>
            <ImagePlus />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={recording ? "destructive" : "ghost"}
            onMouseDown={() => void startRec()}
            onMouseUp={stopRec}
            onTouchStart={() => void startRec()}
            onTouchEnd={stopRec}
            aria-label={t("room.voice")}
          >
            <Mic />
          </Button>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={recording ? t("room.recording") : t("room.message")}
            maxLength={2000}
            disabled={busy}
          />
          <Button type="submit" size="icon" disabled={busy || !text.trim()} aria-label={t("room.add")}>
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ""));
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(blob);
  });
}
