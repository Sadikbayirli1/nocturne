import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, ListMusic, MessageCircle, Youtube } from "lucide-react";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { t } = useI18n();
  const { isPending } = useCurrentUserState();

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {isPending ? (
            <div className="h-11 w-28 animate-pulse rounded-[10px] bg-secondary" />
          ) : (
            <>
              <SignedOut>
                <Button asChild variant="ghost">
                  <Link to="/login">{t("nav.signIn")}</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button asChild>
                  <Link to="/app">{t("nav.enter")}</Link>
                </Button>
              </SignedIn>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20">
        <section className="enter-1 mx-auto max-w-3xl pt-10 text-center md:pt-16">
          <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
            {t("brand.kicker")}
          </p>
          <h1 className="font-display mt-4 text-4xl leading-[1.1] tracking-tight md:text-6xl">
            {t("landing.hero")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            {t("landing.sub")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {isPending ? (
              <div className="h-12 w-40 animate-pulse rounded-[10px] bg-secondary" />
            ) : (
              <>
                <SignedOut>
                  <Button asChild size="lg">
                    <Link to="/login">
                      {t("landing.cta")}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/login">{t("landing.secondary")}</Link>
                  </Button>
                </SignedOut>
                <SignedIn>
                  <Button asChild size="lg">
                    <Link to="/app">
                      {t("nav.enter")}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </SignedIn>
              </>
            )}
          </div>
        </section>

        <section className="enter-2 mx-auto mt-16 max-w-md rounded-[28px] border border-border bg-card p-5">
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Now playing</p>
          <p className="font-display mt-2 text-2xl">Velvet Frequency</p>
          <p className="text-sm text-muted-foreground">Nocturne Radio</p>
          <div className="mt-4 flex h-10 items-end gap-1">
            {[18, 28, 14, 32, 22, 30, 16, 26].map((h, i) => (
              <span
                key={i}
                className="eq-bar w-1.5 rounded-full bg-primary"
                style={{ height: h }}
              />
            ))}
          </div>
        </section>

        <section className="enter-3 mt-16 grid gap-4 md:grid-cols-2">
          {[
            { icon: ListMusic, t: "landing.f1t", d: "landing.f1d" },
            { icon: MessageCircle, t: "landing.f2t", d: "landing.f2d" },
            { icon: Lock, t: "landing.f3t", d: "landing.f3d" },
            { icon: Youtube, t: "landing.f4t", d: "landing.f4d" },
          ].map((f) => (
            <article key={f.t} className="rounded-[22px] border border-border bg-card p-5">
              <f.icon className="size-5 text-primary" />
              <h2 className="mt-3 text-lg font-medium">{t(f.t)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t(f.d)}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
