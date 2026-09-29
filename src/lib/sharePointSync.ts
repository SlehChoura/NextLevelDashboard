import { InteractionRequiredAuthError, PublicClientApplication, type AccountInfo } from "@azure/msal-browser"

/**
 * Fichier SharePoint en ligne, structuré comme le modèle combiné (onglets "Suivi pilotage",
 * "Actions", "Agents IA4CYB") — synchronisé avec les données de ce dashboard.
 */
export const SHAREPOINT_FILE_URL =
  "https://digiplace.sharepoint.com/:x:/r/sites/WICIACYBER/Shared%20Documents/00%20-%20Steering/02%20-%20Operational%20steering/AI4Cyb/Dashboard%20pilotage%20IA4CYB.xlsx?d=w835fbf52d9c04bc2a7819309471040e3&csf=1&web=1&e=qTVGLg"

const GRAPH_SCOPES = ["Files.Read.All"]

const CLIENT_ID = String(import.meta.env.VITE_MSAL_CLIENT_ID ?? "").trim()
const TENANT_ID = String(import.meta.env.VITE_MSAL_TENANT_ID ?? "").trim()

/** `false` tant que la variable d'environnement de build VITE_MSAL_CLIENT_ID n'a pas été renseignée. */
export const isSharePointSyncConfigured = CLIENT_ID.length > 0

function redirectUri(): string {
  // Sans le hash (#/...) du routeur : MSAL doit revenir sur l'URL de base de l'app, déclarée
  // telle quelle comme "Redirect URI" (plateforme SPA) dans l'app registration Azure AD.
  return window.location.origin + window.location.pathname
}

let msalInstance: PublicClientApplication | null = null
let msalReady: Promise<PublicClientApplication> | null = null

/** Instance MSAL unique, initialisée une seule fois (requis par msal-browser v3+). */
function getMsalInstance(): Promise<PublicClientApplication> {
  if (!msalReady) {
    msalInstance = new PublicClientApplication({
      auth: {
        clientId: CLIENT_ID,
        authority: `https://login.microsoftonline.com/${TENANT_ID || "organizations"}`,
        redirectUri: redirectUri(),
      },
      cache: {
        // localStorage (et non sessionStorage) : la session Microsoft reste active d'un
        // rechargement/réouverture de page à l'autre, condition nécessaire à la synchronisation
        // automatique silencieuse demandée à l'ouverture de la page.
        cacheLocation: "localStorage",
      },
    })
    msalReady = msalInstance.initialize().then(() => msalInstance as PublicClientApplication)
  }
  return msalReady
}

export function getActiveAccount(): AccountInfo | null {
  if (!msalInstance) return null
  return msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0] ?? null
}

/**
 * Compte déjà connecté (session Microsoft précédente retrouvée dans le cache local), sans
 * ouvrir de fenêtre de connexion. `null` si l'utilisateur n'est pas (ou plus) connecté.
 */
export async function getSignedInAccount(): Promise<AccountInfo | null> {
  await getMsalInstance()
  return getActiveAccount()
}

/** Ouvre la fenêtre de connexion Microsoft (compte et autorisations de l'utilisateur connecté). */
export async function signIn(): Promise<AccountInfo> {
  const instance = await getMsalInstance()
  const result = await instance.loginPopup({ scopes: GRAPH_SCOPES })
  instance.setActiveAccount(result.account)
  return result.account
}

export async function signOut(): Promise<void> {
  const instance = await getMsalInstance()
  const account = getActiveAccount()
  await instance.logoutPopup({ account: account ?? undefined })
}

async function getAccessToken(): Promise<string> {
  const instance = await getMsalInstance()
  const account = getActiveAccount()
  if (!account) throw new Error("not-signed-in")
  try {
    const result = await instance.acquireTokenSilent({ scopes: GRAPH_SCOPES, account })
    return result.accessToken
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      const result = await instance.acquireTokenPopup({ scopes: GRAPH_SCOPES, account })
      return result.accessToken
    }
    throw err
  }
}

/**
 * Encode une URL de partage SharePoint/OneDrive au format "shareId" attendu par l'API Microsoft
 * Graph `/shares/{shareId}` : https://learn.microsoft.com/graph/api/shares-get
 */
export function encodeShareId(sharingUrl: string): string {
  const base64 = btoa(unescape(encodeURIComponent(sharingUrl)))
  const base64Url = base64.replace(/=+$/, "").replace(/\//g, "_").replace(/\+/g, "-")
  return `u!${base64Url}`
}

/**
 * Télécharge le contenu actuel du fichier Excel SharePoint (compte et permissions de
 * l'utilisateur connecté) et le renvoie sous forme de Blob, prêt pour {@link parseCombinedFile}.
 */
export async function fetchSharePointFile(): Promise<Blob> {
  const token = await getAccessToken()
  const shareId = encodeShareId(SHAREPOINT_FILE_URL)
  const response = await fetch(`https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem/content`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`graph-fetch-failed:${response.status}`)
  }
  return response.blob()
}
