/** Pastille aux initiales du porteur d'une action (ex: « Anna VALIER » → « AV »). */
export function OwnerAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
  return (
    <span
      title={name}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[10px] font-semibold text-[var(--color-accent)]"
      aria-hidden
    >
      {initials || "?"}
    </span>
  )
}
