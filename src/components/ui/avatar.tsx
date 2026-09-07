import { cn, initials, isSafeImageSrc } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "sm" ? "h-8 w-8 text-[11px]" : size === "lg" ? "h-16 w-16 text-lg" : "h-10 w-10 text-xs";
  const safe = src && isSafeImageSrc(src) ? src : null;
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-secondary font-medium text-secondary-foreground",
        dim,
        className,
      )}
    >
      {safe ? (
        <img src={safe} alt="" className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}
