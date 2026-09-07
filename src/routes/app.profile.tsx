import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { bootstrapMe, updateProfile } from "@/lib/server/api";
import { useSettings } from "@/lib/settings";
import type { Appearance, Locale, Profile } from "@/lib/types";
import { ensureNotifyPermission } from "@/lib/browser-notify";
import { compressImage } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LanguageSwitcher } from "@/components/language-switcher";

export const Route = createFileRoute("/app/profile")({ component: ProfilePage });

function ProfilePage() {
  const { t, setLocale } = useI18n();
  const { setAppearance, applyProfile } = useSettings();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [notifyOn, setNotifyOn] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted",
  );
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void bootstrapMe().then((res) => {
      setProfile(res.profile);
      setName(res.profile.displayName);
      applyProfile(res.profile);
    });
  }, [applyProfile]);

  async function save(patch: Partial<Profile> & { displayName?: string; avatarUrl?: string | null }) {
    try {
      const next = await updateProfile({
        data: {
          displayName: patch.displayName,
          avatarUrl: patch.avatarUrl,
          status: patch.status,
          musicMuted: patch.musicMuted,
          locale: patch.locale,
          appearance: patch.appearance,
        },
      });
      setProfile(next);
      applyProfile(next);
      toast.success(t("profile.saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
    }
  }

  if (!profile) {
    return <div className="h-64 animate-pulse rounded-[22px] bg-secondary" />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <h1 className="font-display text-3xl tracking-tight">{t("profile.title")}</h1>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full">
          <Avatar src={profile.avatarUrl} name={profile.displayName} size="lg" />
        </button>
        <div>
          <p className="text-sm font-medium">{t("profile.photo")}</p>
          <Button size="sm" variant="secondary" className="mt-2" onClick={() => fileRef.current?.click()}>
            {t("library.upload")}
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            const url = await compressImage(file, 256, 0.85);
            await save({ avatarUrl: url });
          }}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dn">{t("profile.name")}</Label>
        <div className="flex gap-2">
          <Input id="dn" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
          <Button onClick={() => void save({ displayName: name })}>{t("profile.save")}</Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("profile.language")}</Label>
        <LanguageSwitcher />
        <div className="flex gap-2">
          {(["tr", "en", "ar"] as Locale[]).map((loc) => (
            <button
              key={loc}
              type="button"
              className="sr-only"
              onClick={() => {
                setLocale(loc);
                void save({ locale: loc });
              }}
            />
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const loc = (document.documentElement.lang as Locale) || "tr";
            void save({ locale: loc === "en" || loc === "ar" ? loc : "tr" });
          }}
        >
          {t("profile.save")}
        </Button>
      </div>

      <div className="flex items-center justify-between rounded-[16px] border border-border bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium">{t("profile.appearance")}</p>
          <p className="text-xs text-muted-foreground">
            {profile.appearance === "light" ? t("profile.light") : t("profile.dark")}
          </p>
        </div>
        <Switch
          checked={profile.appearance === "dark"}
          onCheckedChange={(on) => {
            const appearance: Appearance = on ? "dark" : "light";
            setAppearance(appearance);
            void save({ appearance });
          }}
        />
      </div>

      <div className="flex items-center justify-between rounded-[16px] border border-border bg-card px-4 py-3">
        <p className="text-sm font-medium">{t("profile.away")}</p>
        <Switch
          checked={profile.status === "away"}
          onCheckedChange={(on) => void save({ status: on ? "away" : "available" })}
        />
      </div>

      <div className="flex items-center justify-between rounded-[16px] border border-border bg-card px-4 py-3">
        <p className="text-sm font-medium">{t("profile.mute")}</p>
        <Switch
          checked={profile.musicMuted}
          onCheckedChange={(on) => void save({ musicMuted: on })}
        />
      </div>

      <div className="flex items-center justify-between rounded-[16px] border border-border bg-card px-4 py-3">
        <p className="text-sm font-medium">{t("profile.notify")}</p>
        <Button
          size="sm"
          variant="secondary"
          onClick={async () => {
            const ok = await ensureNotifyPermission();
            setNotifyOn(ok);
          }}
        >
          {notifyOn ? t("profile.notifyOn") : t("profile.notifyOff")}
        </Button>
      </div>
    </div>
  );
}
