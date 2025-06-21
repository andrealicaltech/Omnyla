import { create } from 'zustand'

interface UIState {
  activeTab: string
  isBoardMode: boolean
  setActiveTab: (tab: string) => void
  setBoardMode: (enabled: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'CASE OVERVIEW',
  isBoardMode: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setBoardMode: (enabled) => set({ isBoardMode: enabled }),
})) 