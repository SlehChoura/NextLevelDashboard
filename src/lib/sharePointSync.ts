/**
 * Fichier SharePoint en ligne, structuré comme le modèle combiné (onglets "Suivi pilotage",
 * "Actions", "Agents IA4CYB") — synchronisé avec les données de ce dashboard.
 *
 * Lecture anonyme, sans connexion Microsoft : nécessite que le lien de partage de ce fichier
 * soit défini sur « Toute personne disposant du lien » (accès anonyme), sans quoi SharePoint
 * refuse la requête. Voir README, section "Synchronisation SharePoint".
 */
export const SHAREPOINT_FILE_URL =
  "https://digiplace.sharepoint.com/:x:/r/sites/WICIACYBER/Shared%20Documents/00%20-%20Steering/02%20-%20Operational%20steering/AI4Cyb/Dashboard%20pilotage%20IA4CYB.xlsx?d=w835fbf52d9c04bc2a7819309471040e3&csf=1&web=1&e=qTVGLg"

/**
 * Transforme un lien de partage SharePoint (qui ouvre normalement la visionneuse Excel Online)
 * en URL de téléchargement direct du fichier, en lui ajoutant le paramètre `download=1`.
 */
function toDirectDownloadUrl(sharingUrl: string): string {
  const url = new URL(sharingUrl)
  url.searchParams.set("download", "1")
  return url.toString()
}

/**
 * Télécharge le contenu actuel du fichier Excel SharePoint (accès anonyme, sans identifiant) et
 * le renvoie sous forme de Blob, prêt pour {@link parseCombinedFile}.
 */
export async function fetchSharePointFile(): Promise<Blob> {
  const response = await fetch(toDirectDownloadUrl(SHAREPOINT_FILE_URL))
  if (!response.ok) {
    throw new Error(`sharepoint-fetch-failed:${response.status}`)
  }
  return response.blob()
}
