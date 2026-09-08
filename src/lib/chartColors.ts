const SEMANTIC_VAR: Record<string, string> = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
  neutral: "var(--color-text-muted)",
}

const ROTATION = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
]

export function colorFor(semantic: string | undefined, index: number): string {
  if (semantic && SEMANTIC_VAR[semantic]) return SEMANTIC_VAR[semantic]
  return ROTATION[index % ROTATION.length]
}
