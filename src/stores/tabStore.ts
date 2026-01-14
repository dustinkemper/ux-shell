import { create } from 'zustand'
import type { Tab, Asset, PageType } from '@/types'

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  openTab: (asset: Asset) => void
  openPageTab: (pageType: PageType, label: string, icon?: string) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  handleOverflow: () => void
}

const createHomeTab = (): Tab => ({
  id: 'home',
  label: 'Home',
  isLocked: true,
})

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [createHomeTab()],
  activeTabId: 'home',
  openTab: (asset) => {
    const tabs = get().tabs
    const existingTab = tabs.find((t) => t.assetId === asset.id)
    if (existingTab) {
      set({ activeTabId: existingTab.id })
      return
    }
    const newTab: Tab = {
      id: `tab-${asset.id}`,
      label: asset.name,
      assetId: asset.id,
      isLocked: false,
      // Icon will be determined by TabItem based on asset type
    }
    set({
      tabs: [...tabs, newTab],
      activeTabId: newTab.id,
    })
  },
  openPageTab: (pageType, label, icon) => {
    const tabs = get().tabs
    const existingTab = tabs.find((t) => t.pageType === pageType)
    if (existingTab) {
      set({ activeTabId: existingTab.id })
      return
    }
    const newTab: Tab = {
      id: `page-${pageType}`,
      label,
      pageType,
      icon,
      isLocked: false,
    }
    set({
      tabs: [...tabs, newTab],
      activeTabId: newTab.id,
    })
  },
  closeTab: (tabId) => {
    const tab = get().tabs.find((t) => t.id === tabId)
    if (tab?.isLocked) return
    const tabs = get().tabs.filter((t) => t.id !== tabId)
    const activeTabId = get().activeTabId
    set({
      tabs,
      activeTabId:
        activeTabId === tabId
          ? tabs.length > 0
            ? tabs[tabs.length - 1].id
            : null
          : activeTabId,
    })
  },
  setActiveTab: (tabId) => set({ activeTabId: tabId }),
  reorderTabs: (fromIndex, toIndex) => {
    const tabs = [...get().tabs]
    // Don't allow reordering the Home tab (index 0)
    if (fromIndex === 0 || toIndex === 0) return
    const [removed] = tabs.splice(fromIndex, 1)
    tabs.splice(toIndex, 0, removed)
    set({ tabs })
  },
  handleOverflow: () => {
    // Placeholder for overflow handling logic
  },
}))


