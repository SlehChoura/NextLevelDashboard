import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AiModel = "claude-opus-5" | "claude-sonnet-5" | "claude-haiku-4-5"

interface AiSettingsState {
  apiKey: string
  model: AiModel
  setApiKey: (apiKey: string) => void
  setModel: (model: AiModel) => void
  clearApiKey: () => void
}

/**
 * Stockée uniquement dans le localStorage de ce navigateur : la clé n'est jamais envoyée
 * ailleurs qu'à l'API Anthropic, appelée directement depuis le navigateur (pas de backend).
 */
export const useAiSettingsStore = create<AiSettingsState>()(
  persist(
    (set) => ({
      apiKey: "",
      model: "claude-haiku-4-5",
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      clearApiKey: () => set({ apiKey: "" }),
    }),
    { name: "nld-ai-settings" },
  ),
)
