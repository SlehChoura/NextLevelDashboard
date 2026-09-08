import { Link } from "react-router-dom"

const FEATURES = [
  {
    title: "Import Excel",
    text: "Déposez votre fichier de suivi : les critères importants (statut, sévérité, échéances…) sont reconnus automatiquement à partir des en-têtes de colonnes.",
  },
  {
    title: "Analyse IA",
    text: "Pas de template qui correspond ? L'IA (Claude) lit votre fichier et détermine elle-même les critères pertinents à suivre — nécessite une clé API personnelle.",
  },
  {
    title: "Saisie via formulaire",
    text: "Pas de fichier Excel sous la main ? Renseignez les mêmes critères via un formulaire pour générer le rapport.",
  },
  {
    title: "Templates métier",
    text: "Suivi de projet, audit & pentest, vulnérabilités, comité de pilotage, incidents : partez d'un modèle adapté à votre situation.",
  },
  {
    title: "Charte graphique",
    text: "Thème inspiré Wavestone par défaut, personnalisable intégralement (couleurs, logo) pour coller à votre charte ou celle de votre client.",
  },
]

export function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
        Reporting cybersécurité
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">
        Transformez vos suivis de projet en dashboards de reporting, en quelques minutes.
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
        Importez un fichier Excel ou saisissez vos critères, choisissez un template adapté à
        votre situation, et obtenez un dashboard prêt à présenter — aux couleurs de votre
        charte graphique.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          to="/templates"
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          Créer un dashboard
        </Link>
        <Link
          to="/theme"
          className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)]"
        >
          Régler la charte graphique
        </Link>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">{f.title}</h2>
            <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm text-[var(--color-text-muted)]">
        <span className="font-medium text-[var(--color-text)]">Confidentialité — </span>
        toutes les données (fichiers importés, saisies, rapports) restent dans votre navigateur ;
        rien n'est envoyé à un serveur. Seule exception : la fonctionnalité « Analyse IA », qui
        envoie le contenu du fichier analysé à l'API d'Anthropic si vous choisissez de l'utiliser.
        Pensez tout de même à vider le stockage local sur un poste partagé.
      </div>
    </div>
  )
}
