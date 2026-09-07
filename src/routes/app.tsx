import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { bootstrapMe } from "@/lib/server/api";
import { useSettings } from "@/lib/settings";
import type { AppNotification, Profile } from "@/lib/types";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const { user, isPending } = useCurrentUserState();
  const { applyProfile } = useSettings();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = useCallback(async () => {
    const res = await bootstrapMe();
    setProfile(res.profile);
    setNotifications(res.notifications);
    applyProfile(res.profile);
  }, [applyProfile]);

  useEffect(() => {
    if (!user) return;
    void refresh().catch(() => undefined);
  }, [user, refresh]);

  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="h-24 w-24 animate-pulse rounded-full bg-secondary" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <AppShell
      notifications={notifications}
      onNotificationsRead={() =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    >
      <Outlet />
      <span className="sr-only">{profile?.displayName}</span>
    </AppShell>
  );
}
