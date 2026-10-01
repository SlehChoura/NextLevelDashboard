/** Résultat d'un import combiné : message de synthèse et, le cas échéant, incohérences du fichier. */
export function ImportFeedback({ message, warnings }: { message: string | null; warnings: string[] }) {
  if (!message) return null
  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm text-[var(--color-text)]">{message}</p>
      {warnings.length > 0 && (
        <details className="rounded-lg border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/[0.06] p-3 text-xs">
          <summary className="cursor-pointer font-semibold text-[var(--color-warning)]">
            {warnings.length} incohérence(s) détectée(s) dans le fichier
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--color-text)]">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
