import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AiModelOption {
  id: string
  label: string
  hint: string
}

export const AI_MODEL_OPTIONS: AiModelOption[] = [
  { id: "claude-opus-5", label: "Claude Opus 5", hint: "Recommandé — le plus précis" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5", hint: "Bon compromis coût / qualité" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", hint: "Le plus rapide et économique" },
]

interface AiState {
  apiKey: string
  model: string
  setApiKey: (apiKey: string) => void
  setModel: (model: string) => void
  clear: () => void
  isConfigured: () => boolean
}

export const useAiStore = create<AiState>()(
  persist(
    (set, get) => ({
      apiKey: "",
      model: AI_MODEL_OPTIONS[0].id,
      setApiKey: (apiKey) => set({ apiKey: apiKey.trim() }),
      setModel: (model) => set({ model }),
      clear: () => set({ apiKey: "" }),
      isConfigured: () => get().apiKey.trim().length > 0,
    }),
    { name: "nld-ai-settings" },
  ),
)
