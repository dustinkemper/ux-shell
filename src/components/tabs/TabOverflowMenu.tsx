import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown, File, Home } from 'lucide-react'
import { useTabStore } from '@/stores/tabStore'
import { useCatalogStore } from '@/stores/catalogStore'
import type { AssetType, Tab } from '@/types'
import { getAssetIcon, getIconByName, getPageIcon } from '@/lib/iconUtils'

interface TabOverflowMenuProps {
  overflowTabs: Tab[]
  onSelectTab?: (tabId: string) => void
}

export default function TabOverflowMenu({
  overflowTabs,
  onSelectTab,
}: TabOverflowMenuProps) {
  const { setActiveTab } = useTabStore()
  const { getAsset } = useCatalogStore()

  const isAssetType = (value: string): value is AssetType => {
    return [
      'connection',
      'pipeline',
      'analytics-app',
      'automation',
      'dataflow',
      'data-product',
      'knowledge-base',
      'monitor-view',
      'script',
      'predict',
      'table-recipe',
      'glossary',
      'ai-assistant',
      'workspace',
      'folder',
    ].includes(value)
  }

  const getIconComponent = (tab: Tab) => {
    if (tab.id === 'home') {
      return Home
    }

    if (tab.icon) {
      if (isAssetType(tab.icon)) {
        return getAssetIcon(tab.icon)
      }
      return getIconByName(tab.icon)
    }

    if (tab.pageType) {
      return getPageIcon(tab.pageType)
    }

    if (tab.assetId) {
      const asset = getAsset(tab.assetId)
      if (asset) {
        return getAssetIcon(asset.type)
      }
    }

    return File
  }

  const handleSelect = (tabId: string) => {
    if (onSelectTab) {
      onSelectTab(tabId)
      return
    }
    setActiveTab(tabId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-11 w-8 border-l border-r rounded-none"
          style={{
            borderColor: 'rgba(0,0,0,0.15)',
          }}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {overflowTabs.map((tab) => {
          const IconComponent = getIconComponent(tab)

          return (
          <DropdownMenuItem
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
          >
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{tab.label}</span>
            </div>
          </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

