import { Link, useRouterState } from "@tanstack/react-router";
import { Library, UserRound, Users, Waves } from "lucide-react";
import type { ReactNode } from "react";
import { UserButton } from "@/lib/auth/gates";
import { useI18n } from "@/lib/i18n";
import type { AppNotification } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { NotificationsBell } from "@/components/notifications-bell";

const NAV = [
  { to: "/app", key: "nav.rooms", icon: Waves },
  { to: "/app/friends", key: "nav.friends", icon: Users },
  { to: "/app/library", key: "nav.library", icon: Library },
  { to: "/app/profile", key: "nav.profile", icon: UserRound },
] as const;

export function AppShell({
  children,
  notifications,
  onNotificationsRead,
}: {
  children: ReactNode;
  notifications: AppNotification[];
  onNotificationsRead: () => void;
}) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link to="/app" className="shrink-0">
            <Logo />
          </Link>
          <nav className="ms-4 hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-[12px] px-3 text-sm",
                    active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="size-4" />
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <NotificationsBell items={notifications} onRead={onNotificationsRead} />
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:pb-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 px-2 py-2 backdrop-blur-md md:hidden">
        <div className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 text-[11px]",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
