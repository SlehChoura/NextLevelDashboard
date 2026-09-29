/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Client ID (App ID) de l'app registration Azure AD (Entra ID) utilisée pour la synchronisation SharePoint. */
  readonly VITE_MSAL_CLIENT_ID?: string
  /** Tenant ID (ou domaine) Azure AD. Par défaut "organizations" (tout compte professionnel/scolaire). */
  readonly VITE_MSAL_TENANT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
