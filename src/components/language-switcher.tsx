import { useI18n } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

const OPTIONS: { id: Locale; label: string }[] = [
  { id: "tr", label: "TR" },
  { id: "en", label: "EN" },
  { id: "ar", label: "AR" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-[10px] bg-secondary p-0.5 text-xs font-medium",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setLocale(opt.id)}
          className={cn(
            "h-8 min-w-9 rounded-[8px] px-2 transition-colors",
            locale === opt.id ? "bg-card text-foreground" : "text-muted-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
