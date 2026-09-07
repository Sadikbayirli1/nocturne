import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { createRoom } from "@/lib/server/api";
import { ROOM_THEMES, type RoomTheme } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const THEME_SWATCH: Record<RoomTheme, string> = {
  violet: "bg-[#8b5cf6]",
  obsidian: "bg-[#c9a227]",
  ember: "bg-[#e06b5a]",
  aurora: "bg-[#5eead4]",
  ivory: "bg-[#d4c4a8]",
};

export function CreateRoomDialog({ triggerClassName }: { triggerClassName?: string }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState<RoomTheme>("violet");
  const [busy, setBusy] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>{t("app.newRoom")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("room.createTitle")}</DialogTitle>
          <DialogDescription>{t("room.passwordHint")}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const res = await createRoom({ data: { name, password: password || undefined, theme } });
              setOpen(false);
              setName("");
              setPassword("");
              void navigate({ to: "/room/$code", params: { code: res.id } });
            } catch (err) {
              toast.error(err instanceof Error ? err.message : t("common.error"));
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="room-name">{t("room.name")}</Label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={48}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-pass">{t("room.password")}</Label>
            <Input
              id="room-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={64}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("room.theme")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_THEMES.map((th) => (
                <button
                  key={th}
                  type="button"
                  onClick={() => setTheme(th)}
                  className={cn(
                    "flex h-11 items-center gap-2 rounded-[12px] border px-3 text-sm",
                    theme === th ? "border-primary bg-primary/10" : "border-border",
                  )}
                >
                  <span className={cn("h-3 w-3 rounded-full", THEME_SWATCH[th])} />
                  {t(`theme.${th}`)}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={busy || name.trim().length < 2}>
            {t("room.create")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
