import { create } from 'zustand'
import type { SidebarState, FlyoutType, Asset } from '@/types'

interface SidebarStore {
  state: SidebarState
  flyoutType: FlyoutType
  pinnedItems: Asset[]
  toggleCollapse: () => void
  toggleMinimize: () => void
  openFlyout: (type: FlyoutType) => void
  closeFlyout: () => void
  pinItem: (item: Asset) => void
  unpinItem: (itemId: string) => void
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  state: 'expanded',
  flyoutType: null,
  pinnedItems: [],
  toggleCollapse: () =>
    set((state) => ({
      state: state.state === 'expanded' ? 'collapsed' : 'expanded',
    })),
  toggleMinimize: () =>
    set((state) => ({
      state: state.state === 'minimized' ? 'expanded' : 'minimized',
    })),
  openFlyout: (type) => set({ flyoutType: type }),
  closeFlyout: () => set({ flyoutType: null }),
  pinItem: (item) =>
    set((state) => {
      if (state.pinnedItems.some((p) => p.id === item.id)) {
        return state
      }
      return { pinnedItems: [...state.pinnedItems, item] }
    }),
  unpinItem: (itemId) =>
    set((state) => ({
      pinnedItems: state.pinnedItems.filter((p) => p.id !== itemId),
    })),
}))

