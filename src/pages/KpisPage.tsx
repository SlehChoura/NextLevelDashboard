type KpiCategory = {
  title: string
  kpis: string[]
}

const KPI_CATEGORIES: KpiCategory[] = [
  {
    title: "Compétences",
    kpis: [
      "Nombre de Cyber Academy avec contenu IA",
      "Nombre de BT Academy transformées",
      "Nombre de sessions dédiées aux agents IA",
      "Nombre de consultants formés au Vibe Coding",
      "Nombre de certifications Claude obtenues",
    ],
  },
  {
    title: "Agents IA",
    kpis: [
      "Nombre d'agents disponibles",
      "Nombre d'agents industrialisés",
      "Nombre de missions utilisant des agents IA",
    ],
  },
  {
    title: "Plateforme",
    kpis: [
      "Disponibilité de la chaîne CI/CD",
      "Consommation des clés/API",
      "Coûts d'hébergement",
    ],
  },
  {
    title: "Impact",
    kpis: ["Nombre de missions réalisées avec les agents"],
  },
]

export function KpisPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
        Pilotage IA4CYB
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">KPI suivis</h1>
      <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
        Indicateurs clés utilisés pour piloter le développement des compétences, l'adoption des
        agents IA, la plateforme et l'impact sur les missions.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {KPI_CATEGORIES.map((category) => (
          <div
            key={category.title}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
          >
            <h2 className="text-sm font-semibold text-[var(--color-text)]">{category.title}</h2>
            <ul className="mt-3 space-y-2">
              {category.kpis.map((kpi) => (
                <li key={kpi} className="flex gap-2.5 text-sm text-[var(--color-text-muted)]">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  />
                  <span>{kpi}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-text-muted)]">
        <span className="font-medium text-[var(--color-text)]">À terme — </span>
        suivre les gains et la prise de commande liés à des missions réalisées avec des agents IA
        4CYB.
      </div>
    </div>
  )
}
