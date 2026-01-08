import { create } from 'zustand'
import type { NavigationState, Asset } from '@/types'

interface NavigationStore extends NavigationState {
  setCurrentRoute: (route: string) => void
  setSelectedAsset: (asset: Asset | undefined) => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  currentRoute: undefined,
  selectedAsset: undefined,
  setCurrentRoute: (route) => set({ currentRoute: route }),
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
}))

