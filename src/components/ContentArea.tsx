import { useTabStore } from '@/stores/tabStore'
import { useCatalogStore } from '@/stores/catalogStore'
import CatalogPage from './pages/CatalogPage'
import AssetTypeSelectorPage from './pages/AssetTypeSelectorPage'
import CreateConnectionPage from './pages/CreateConnectionPage'
import CreatePipelinePage from './pages/CreatePipelinePage'
import ConnectionDetailPage from './pages/ConnectionDetailPage'
import PipelineDetailPage from './pages/PipelineDetailPage'
import type { Tab } from '@/types'

export default function ContentArea() {
  const { tabs, activeTabId } = useTabStore()
  const { getAsset } = useCatalogStore()
  const getTabContent = (tab: Tab): React.ReactNode => {
    if (tab.pageType) {
      switch (tab.pageType) {
        case 'catalog':
          return <CatalogPage />
        case 'catalog-filtered':
          return (
            <CatalogPage
              filteredType={tab.pageData?.assetType}
              title={tab.label}
            />
          )
        case 'asset-type-selector':
          return <AssetTypeSelectorPage presetType={tab.pageData?.assetType} />
        case 'create-connection':
          return <CreateConnectionPage />
        case 'create-pipeline':
          return <CreatePipelinePage />
        default:
          return (
            <div className="flex h-full w-full items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-2xl font-semibold">{tab.label}</h2>
                <p className="text-muted-foreground">
                  Content for {tab.label} will be displayed here
                </p>
              </div>
            </div>
          )
      }
    }

    if (tab.assetId) {
      const asset = getAsset(tab.assetId)
      if (asset?.type === 'connection') {
        return <ConnectionDetailPage connection={asset} />
      }
      if (asset?.type === 'pipeline') {
        return <PipelineDetailPage pipeline={asset} />
      }
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold">{tab.label}</h2>
          <p className="text-muted-foreground">
            Content for {tab.label} will be displayed here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 w-full overflow-hidden">
      <div className="h-full w-full min-h-0">
        {tabs.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center bg-white">
            <div className="text-muted-foreground">No tab selected</div>
          </div>
        ) : (
          tabs.map((tab) => (
            <div
              key={tab.id}
              className={tab.id === activeTabId ? 'h-full w-full' : 'hidden h-full w-full'}
            >
              {getTabContent(tab)}
            </div>
          ))
        )}
      </div>
    </div>
  )
}


