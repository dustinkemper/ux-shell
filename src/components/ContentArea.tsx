import { useTabStore } from '@/stores/tabStore'
import { useCatalogStore } from '@/stores/catalogStore'
import CatalogPage from './pages/CatalogPage'
import AssetTypeSelectorPage from './pages/AssetTypeSelectorPage'
import CreatePipelinePage from './pages/CreatePipelinePage'
import ConnectionDetailPage from './pages/ConnectionDetailPage'

export default function ContentArea() {
  const { tabs, activeTabId } = useTabStore()
  const { getAsset } = useCatalogStore()
  const activeTab = tabs.find((t) => t.id === activeTabId)

  if (!activeTab) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="text-muted-foreground">No tab selected</div>
      </div>
    )
  }

  // Render page components for page tabs
  if (activeTab.pageType) {
    switch (activeTab.pageType) {
      case 'catalog':
        return <CatalogPage />
      case 'asset-type-selector':
        return <AssetTypeSelectorPage />
      case 'create-pipeline':
        return <CreatePipelinePage />
      default:
        return (
          <div className="flex h-full w-full items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-2xl font-semibold">{activeTab.label}</h2>
              <p className="text-muted-foreground">
                Content for {activeTab.label} will be displayed here
              </p>
            </div>
          </div>
        )
    }
  }

  // Render asset tabs (existing functionality)
  if (activeTab.assetId) {
    const asset = getAsset(activeTab.assetId)
    if (asset?.type === 'connection') {
      return <ConnectionDetailPage connection={asset} />
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-semibold">{activeTab.label}</h2>
        <p className="text-muted-foreground">
          Content for {activeTab.label} will be displayed here
        </p>
      </div>
    </div>
  )
}


