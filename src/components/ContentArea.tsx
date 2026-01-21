import { useTabStore } from '@/stores/tabStore'
import { useCatalogStore } from '@/stores/catalogStore'
import CatalogPage from './pages/CatalogPage'
import AssetTypeSelectorPage from './pages/AssetTypeSelectorPage'
import CreateConnectionPage from './pages/CreateConnectionPage'
import CreatePipelinePage from './pages/CreatePipelinePage'
import ConnectionDetailPage from './pages/ConnectionDetailPage'
import PipelineDetailPage from './pages/PipelineDetailPage'

export default function ContentArea() {
  const { tabs, activeTabId } = useTabStore()
  const { getAsset } = useCatalogStore()
  const activeTab = tabs.find((t) => t.id === activeTabId)

  let content: React.ReactNode

  if (!activeTab) {
    content = (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="text-muted-foreground">No tab selected</div>
      </div>
    )
  } else if (activeTab.pageType) {
    switch (activeTab.pageType) {
      case 'catalog':
        content = <CatalogPage />
        break
      case 'asset-type-selector':
        content = <AssetTypeSelectorPage />
        break
      case 'create-connection':
        content = <CreateConnectionPage />
        break
      case 'create-pipeline':
        content = <CreatePipelinePage />
        break
      default:
        content = (
          <div className="flex h-full w-full items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-2xl font-semibold">{activeTab.label}</h2>
              <p className="text-muted-foreground">
                Content for {activeTab.label} will be displayed here
              </p>
            </div>
          </div>
        )
        break
    }
  } else if (activeTab.assetId) {
    const asset = getAsset(activeTab.assetId)
    if (asset?.type === 'connection') {
      content = <ConnectionDetailPage connection={asset} />
    } else if (asset?.type === 'pipeline') {
      content = <PipelineDetailPage pipeline={asset} />
    } else {
      content = (
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
  } else {
    content = (
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

  return (
    <div className="flex min-h-0 flex-1 w-full overflow-hidden">
      <div className="h-full w-full min-h-0">{content}</div>
    </div>
  )
}


