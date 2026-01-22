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

const LOCAL_PINNED_KEY = 'ux-shell.sidebar.pins'

const loadPinnedItems = (): Asset[] => {
  if (typeof window === 'undefined') return []
  const raw = window.sessionStorage.getItem(LOCAL_PINNED_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Asset[]
  } catch {
    return []
  }
}

const savePinnedItems = (items: Asset[]) => {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(LOCAL_PINNED_KEY, JSON.stringify(items))
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  state: 'expanded',
  flyoutType: null,
  pinnedItems: loadPinnedItems(),
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
      const next = [...state.pinnedItems, item]
      savePinnedItems(next)
      return { pinnedItems: next }
    }),
  unpinItem: (itemId) =>
    set((state) => {
      const next = state.pinnedItems.filter((p) => p.id !== itemId)
      savePinnedItems(next)
      return { pinnedItems: next }
    }),
}))


