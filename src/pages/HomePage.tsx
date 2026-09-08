import { Link } from "react-router-dom"

const FEATURES = [
  {
    title: "Analyse par l'IA",
    text: "Déposez un fichier Excel ou CSV quelconque : Claude détermine lui-même les critères pertinents à suivre — pas besoin de template prédéfini ni de colonnes formatées d'une façon précise.",
  },
  {
    title: "Déductions au-delà des colonnes",
    text: "L'IA peut déduire une valeur qui n'est pas une colonne explicite du fichier, par exemple un niveau de maturité à partir d'un commentaire libre.",
  },
  {
    title: "Dashboard prêt à présenter",
    text: "Synthèse RAG, indicateurs clés, graphiques et export PDF (impression navigateur), générés automatiquement à partir de l'analyse.",
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
        Transformez un fichier Excel en dashboard de reporting, analysé par l'IA.
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
        Importez votre fichier de suivi : l'IA (Claude) analyse son contenu, détermine les
        critères pertinents à suivre et génère un dashboard prêt à présenter — aux couleurs de
        votre charte graphique. Nécessite votre propre clé API Anthropic.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          to="/ia"
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          Générer un dashboard
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
        les rapports générés restent stockés dans votre navigateur (localStorage), rien n'est
        envoyé à un serveur applicatif. En revanche, générer un dashboard envoie le contenu du
        fichier analysé à l'API d'Anthropic (Claude), avec votre propre clé API — n'importez pas
        de données confidentielles ou personnelles sans vous en assurer au préalable. Pensez à
        vider le stockage local sur un poste partagé.
      </div>
    </div>
  )
}
