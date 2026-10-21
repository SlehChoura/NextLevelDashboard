import { FileDrop } from "../components/common/FileDrop"
import { PageHeader } from "../components/ui/PageHeader"
import { ImportFeedback } from "../components/common/ImportFeedback"
import { ClearBrowserDataButton } from "../components/common/ClearBrowserDataButton"
import { useCombinedImport } from "../hooks/useCombinedImport"
import { formatDataDate, useLastDataUpdate } from "../hooks/useLastDataUpdate"
import { usePilotageStore } from "../store/pilotageStore"
import { useActionsStore } from "../store/actionsStore"
import { useReportStore } from "../store/reportStore"
import { useHistoryStore } from "../store/historyStore"
import { downloadCombinedTemplate } from "../lib/combinedImport"

const card = "rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] p-5"

/**
 * Page dédiée à la mise à jour des données : import du fichier de suivi, téléchargement du fichier
 * actuel, historique des mises à jour et données du navigateur. Les pages de consultation n'en
 * gardent qu'un lien discret.
 */
export function DonneesPage() {
  const values = usePilotageStore((s) => s.values)
  const targets = usePilotageStore((s) => s.targets)
  const actions = useActionsStore((s) => s.actions)
  const report = useReportStore((s) => s.report)
  const snapshots = useHistoryStore((s) => s.snapshots)
  const lastUpdate = useLastDataUpdate()
  const { importMessage, importWarnings, handleImportFile } = useCombinedImport()

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageHeader
        title="Mise à jour des données"
        description={
        <>
          Toutes les pages sont alimentées par un seul fichier Excel à 3 onglets (« Suivi pilotage », « Actions »,
          « Agents IA4CYB »). Données actuelles au{" "}
          <strong className="text-[var(--color-text)]">{formatDataDate(lastUpdate)}</strong>.
        </>
        }
      />

      <section className={`${card} mt-8`}>
        <h2 className="text-sm font-semibold text-[var(--color-text)]">1. Télécharger le fichier actuel</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Fichier pré-rempli avec les données en place (objectifs, actions, agents), à compléter dans Excel.
        </p>
        <button
          onClick={() => downloadCombinedTemplate(values, targets, actions, report)}
          className="mt-3 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Télécharger ia4cyb-suivi-complet.xlsx
        </button>
      </section>

      <section className={`${card} mt-4`}>
        <h2 className="text-sm font-semibold text-[var(--color-text)]">2. Importer le fichier à jour</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Le fichier fait foi : il met à jour le pilotage, remplace la liste des actions et met à jour le dashboard
          des agents. Les incohérences détectées sont listées après l'import.
        </p>
        <div className="mt-3">
          <FileDrop onFile={handleImportFile} accept=".xlsx,.xls,.csv" hint="Fichier Excel à 3 onglets (.xlsx), 5 Mo maximum" />
        </div>
        <ImportFeedback message={importMessage} warnings={importWarnings} />
      </section>

      <section className={`${card} mt-4`}>
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Historique des mises à jour</h2>
        <ul className="mt-2 divide-y divide-[var(--color-border)] text-sm">
          {snapshots
            .slice()
            .reverse()
            .map((s) => (
              <li key={s.date} className="flex justify-between gap-3 py-1.5">
                <span className="text-[var(--color-text)]">
                  {new Date(s.date + "T00:00:00").toLocaleDateString("fr-FR")}
                </span>
                <span className="text-[var(--color-text-muted)]">
                  {s.dashboard.agents} agents · {s.dashboard.missions} missions · {Object.keys(s.values).length} objectifs
                </span>
              </li>
            ))}
        </ul>
      </section>

      <section className={`${card} mt-4 text-sm text-[var(--color-text-muted)]`}>
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Confidentialité</h2>
        <p className="mt-1">
          Les données importées restent dans ce navigateur (localStorage), rien n'est envoyé à un serveur. Sur un
          poste partagé, effacez-les après usage : le site affichera de nouveau les données de référence.
        </p>
        <div className="mt-3">
          <ClearBrowserDataButton />
        </div>
      </section>
    </div>
  )
}
