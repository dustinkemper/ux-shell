import { create } from 'zustand'
import type { Tab, Asset, PageType } from '@/types'

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  openTab: (asset: Asset) => void
  openPageTab: (pageType: PageType, label: string, icon?: string, pageData?: Tab['pageData']) => void
  renameTab: (tabId: string, label: string) => void
  setTabIcon: (tabId: string, icon?: string) => void
  setTabAsset: (tabId: string, asset: Asset) => void
  setTabPage: (tabId: string, pageType: PageType, label: string, icon?: string, pageData?: Tab['pageData']) => void
  closeTab: (tabId: string) => void
  closeTabsLeft: (tabId: string) => void
  closeTabsRight: (tabId: string) => void
  closeOtherTabs: (tabId: string) => void
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
  openPageTab: (pageType, label, icon, pageData) => {
    const tabs = get().tabs
    if (pageType === 'catalog-filtered') {
      const requestedType = pageData?.assetType
      const existingTab = tabs.find(
        (t) => t.pageType === 'catalog-filtered' && t.pageData?.assetType === requestedType
      )
      if (existingTab) {
        set({ activeTabId: existingTab.id })
        return
      }
    } else {
      const existingTab = tabs.find((t) => t.pageType === pageType)
      if (existingTab) {
        set({ activeTabId: existingTab.id })
        return
      }
    }
    const baseId = `page-${pageType}`
    const idInUse = tabs.some((t) => t.id === baseId)
    const newTabId = idInUse ? `${baseId}-${Date.now()}` : baseId
    const newTab: Tab = {
      id: newTabId,
      label,
      pageType,
      icon,
      pageData,
      isLocked: false,
    }
    set({
      tabs: [...tabs, newTab],
      activeTabId: newTab.id,
    })
  },
  renameTab: (tabId, label) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, label } : tab
      ),
    }))
  },
  setTabIcon: (tabId, icon) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, icon } : tab
      ),
    }))
  },
  setTabAsset: (tabId, asset) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              label: asset.name,
              assetId: asset.id,
              pageType: undefined,
              icon: asset.type,
            }
          : tab
      ),
    }))
  },
  setTabPage: (tabId, pageType, label, icon, pageData) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              label,
              pageType,
              assetId: undefined,
              icon,
              pageData,
            }
          : tab
      ),
    }))
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
  closeTabsLeft: (tabId) => {
    const tabs = get().tabs
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId)
    if (tabIndex === -1) return
    const nextTabs = tabs.filter(
      (tab, index) => tab.isLocked || index >= tabIndex
    )
    set({ tabs: nextTabs, activeTabId: tabId })
  },
  closeTabsRight: (tabId) => {
    const tabs = get().tabs
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId)
    if (tabIndex === -1) return
    const nextTabs = tabs.filter(
      (tab, index) => tab.isLocked || index <= tabIndex
    )
    set({ tabs: nextTabs, activeTabId: tabId })
  },
  closeOtherTabs: (tabId) => {
    const tabs = get().tabs
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId)
    if (tabIndex === -1) return
    const nextTabs = tabs.filter(
      (tab, index) => tab.isLocked || index === tabIndex
    )
    set({ tabs: nextTabs, activeTabId: tabId })
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


