import { cn } from "@/lib/utils";

export function Logo({ className, markClass }: { className?: string; markClass?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        className={cn("size-8 text-primary", markClass)}
        fill="none"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
        <path
          d="M10 20c4.2-9 8.4-9 12 0"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M20.5 9.5a8 8 0 0 1 0 13"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="13.2" cy="16.2" r="1.4" fill="currentColor" />
      </svg>
      <span className="font-display text-lg tracking-tight">Nocturne</span>
    </span>
  );
}
