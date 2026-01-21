import { useEffect, useState } from 'react'
import SidebarNavigation from './SidebarNavigation'
import TabBar from './TabBar'
import ContentArea from './ContentArea'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useCatalogStore } from '@/stores/catalogStore'

export default function AppLayout() {
  const { state } = useSidebarStore()
  const isMinimized = state === 'minimized'
  const { loadAssets, isUsingFallback, lastError, isLoading } = useCatalogStore()
  const [isErrorExpanded, setIsErrorExpanded] = useState(false)

  useEffect(() => {
    void loadAssets()
  }, [loadAssets])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      {isUsingFallback && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
          <div className="flex items-center justify-center gap-2">
            <span className="font-medium">Supabase disconnected.</span>
            <span>Using local fallback data.</span>
            {lastError && (
              <button
                type="button"
                className="ml-1 text-amber-900/80 hover:text-amber-900"
                onClick={() => setIsErrorExpanded((prev) => !prev)}
                aria-expanded={isErrorExpanded}
                aria-label="Toggle error details"
              >
                {isErrorExpanded ? '▾' : '▸'}
              </button>
            )}
            <button
              type="button"
              className="ml-2 rounded border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900 hover:bg-amber-200 disabled:opacity-50"
              onClick={() => void loadAssets()}
              disabled={isLoading}
            >
              {isLoading ? 'Retrying…' : 'Retry'}
            </button>
          </div>
          {lastError && isErrorExpanded && (
            <div className="mx-auto mt-1 max-w-4xl text-[11px] text-amber-900/80">
              {lastError}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {!isMinimized && <SidebarNavigation />}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TabBar />
          <ContentArea />
        </div>
      </div>
    </div>
  )
}
