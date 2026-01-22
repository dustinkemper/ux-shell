import { useState } from 'react'
import { 
  Search, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  ChevronRight,
  Plus,
  MoreHorizontal,
  Star,
  Pin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCatalogStore } from '@/stores/catalogStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useTabStore } from '@/stores/tabStore'
import type { Asset, AssetType } from '@/types'
import { cn } from '@/lib/utils'
import { getAssetIcon } from '@/lib/iconUtils'

const formatDate = (date?: Date): string => {
  if (!date) return 'Never'
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CatalogPage() {
  const {
    viewMode,
    activeFilter,
    searchQuery,
    setViewMode,
    setActiveFilter,
    setSearchQuery,
    setTypeFilter,
    getFilteredAssets,
    getHierarchicalAssets,
    updateAsset,
    assets,
  } = useCatalogStore()
  const { pinnedItems, pinItem, unpinItem } = useSidebarStore()
  const { openTab, openPageTab } = useTabStore()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['ws1', 'ws2'])) // Default: expand all workspaces

  const hierarchicalAssets = getHierarchicalAssets()


  const toggleExpanded = (assetId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(assetId)) {
        newSet.delete(assetId)
      } else {
        newSet.add(assetId)
      }
      return newSet
    })
  }

  const handleAssetClick = (asset: Asset, e?: React.MouseEvent) => {
    if (asset.type === 'workspace' || asset.type === 'folder') {
      // Toggle expansion on click
      toggleExpanded(asset.id)
      if (e) {
        e.stopPropagation()
      }
    } else {
      // Open asset in tab
      openTab(asset)
    }
  }

  const toggleFavorite = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation()
    const tags = asset.tags ?? []
    const isFavorite = tags.includes('favorite')
    const nextTags = isFavorite ? tags.filter((tag) => tag !== 'favorite') : [...tags, 'favorite']
    updateAsset(asset.id, { tags: nextTags })
  }

  const togglePin = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation()
    const isPinned = pinnedItems.some((item) => item.id === asset.id)
    if (isPinned) {
      unpinItem(asset.id)
    } else {
      pinItem(asset)
    }
  }

  const stripChildren = (asset: Asset): Asset => ({ ...asset, children: undefined })

  const findAssetInTree = (assetList: Asset[], id: string): Asset | undefined => {
    for (const asset of assetList) {
      if (asset.id === id) return asset
      if (asset.children) {
        const found = findAssetInTree(asset.children, id)
        if (found) return found
      }
    }
    return undefined
  }

  // Recursive function to render assets in hierarchy
  const renderAssetRow = (asset: Asset, level: number = 0, parentPath: string[] = []): React.ReactNode => {
    const isExpanded = expandedItems.has(asset.id)
    const hasChildren = asset.children && asset.children.length > 0
    const indentLevel = level * 24 // 24px per level
    const currentPath = [...parentPath, asset.id]

    return (
      <>
        <tr
          key={asset.id}
          className="border-b border-border hover:bg-gray-50 cursor-pointer"
          onClick={(e) => handleAssetClick(asset, e)}
        >
          <td className="px-4 py-3">
            <input
              type="checkbox"
              className="catalog-checkbox"
              onClick={(e) => e.stopPropagation()}
            />
          </td>
          <td className="px-4 py-3" style={{ paddingLeft: `${16 + indentLevel}px` }}>
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpanded(asset.id)
                  }}
                  className="flex h-4 w-4 items-center justify-center rounded hover:bg-gray-200"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className="w-4" /> // Spacer for alignment
              )}
              {(() => {
                const Icon = getAssetIcon(asset.type)
                return <Icon className="h-4 w-4" />
              })()}
              <span className="text-sm">{asset.name}</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <span className="text-sm capitalize">{asset.type.replace('-', ' ')}</span>
          </td>
          <td className="px-4 py-3">
            <span className="text-sm">{asset.owner || '-'}</span>
          </td>
          <td className="px-4 py-3">
            <span className="text-sm">{formatDate(asset.modified)}</span>
          </td>
          <td className="px-4 py-3">
            <span className="text-sm">{asset.location || '-'}</span>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => toggleFavorite(asset, e)}
                aria-label={asset.tags?.includes('favorite') ? 'Remove favorite' : 'Add favorite'}
              >
                <Star
                  className="h-4 w-4"
                  fill={asset.tags?.includes('favorite') ? 'currentColor' : 'none'}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => togglePin(asset, e)}
                aria-label={pinnedItems.some((item) => item.id === asset.id) ? 'Unpin' : 'Pin'}
              >
                <Pin
                  className="h-4 w-4"
                  fill={pinnedItems.some((item) => item.id === asset.id) ? 'currentColor' : 'none'}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && asset.children && (
          <>
            {asset.children.map((child) => renderAssetRow(child, level + 1, currentPath))}
          </>
        )}
      </>
    )
  }

  // Flatten hierarchy for grid view
  const flattenForGrid = (assets: Asset[]): Asset[] => {
    const result: Asset[] = []
    const traverse = (assetList: Asset[]) => {
      for (const asset of assetList) {
        result.push(asset)
        if (asset.children && expandedItems.has(asset.id)) {
          traverse(asset.children)
        }
      }
    }
    traverse(assets)
    return result
  }

  const handleCreateNew = () => {
    openPageTab('asset-type-selector', 'Create New', 'Plus')
  }


  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Catalog</h1>
          <Button
            onClick={handleCreateNew}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create new
          </Button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 border-b border-border">
          {(['all', 'recent', 'favorites'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'px-4 py-2 text-sm font-medium capitalize transition-colors',
                activeFilter === filter
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {filter === 'all' ? 'All' : filter === 'recent' ? 'Recent' : 'Favorites'}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for files"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                Type <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTypeFilter(undefined)}>All Types</DropdownMenuItem>
              {[
                { id: 'connection', label: 'Connection' },
                { id: 'pipeline', label: 'Data Pipeline' },
                { id: 'analytics-app', label: 'Analytics App' },
                { id: 'dataflow', label: 'Data Flow' },
                { id: 'table-recipe', label: 'Table Recipe' },
                { id: 'script', label: 'Script' },
                { id: 'data-product', label: 'Data Product' },
                { id: 'monitor-view', label: 'Monitor View' },
                { id: 'glossary', label: 'Glossary' },
                { id: 'knowledge-base', label: 'Knowledge Base' },
                { id: 'predict', label: 'Predict' },
                { id: 'ai-assistant', label: 'AI Assistant' },
                { id: 'workspace', label: 'Workspace' },
                { id: 'folder', label: 'Folder' },
              ].map((type) => (
                <DropdownMenuItem
                  key={type.id}
                  onClick={() => setTypeFilter(type.id)}
                >
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                Owner <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All Owners</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                Tags <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All Tags</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                More <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>More options</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-1 border border-border rounded-md p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                "h-7 w-7 p-0",
                viewMode === 'list'
                  ? "bg-[#eef5f7] text-[#18191a] hover:bg-[#e0e5ec]"
                  : "text-[#5e656a] hover:bg-[#e0e5ec]"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                "h-7 w-7 p-0",
                viewMode === 'grid'
                  ? "bg-[#eef5f7] text-[#18191a] hover:bg-[#e0e5ec]"
                  : "text-[#5e656a] hover:bg-[#e0e5ec]"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'list' ? (
          <div className="w-full">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-12">
                    <input
                      type="checkbox"
                      className="catalog-checkbox"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Modified</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-12"></th>
                </tr>
              </thead>
              <tbody>
                {activeFilter === 'all' && hierarchicalAssets.map((asset) => renderAssetRow(asset, 0))}
                {activeFilter === 'recent' &&
                  getFilteredAssets().map((asset) => renderAssetRow(stripChildren(asset), 0))}
                {activeFilter === 'favorites' &&
                  getFilteredAssets().map((asset) => {
                    if (asset.type === 'workspace' || asset.type === 'folder') {
                      const fullAsset = findAssetInTree(assets, asset.id) ?? asset
                      return renderAssetRow(fullAsset, 0)
                    }
                    return renderAssetRow(stripChildren(asset), 0)
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 p-6">
            {flattenForGrid(hierarchicalAssets).map((asset) => {
              const isExpanded = expandedItems.has(asset.id)
              const hasChildren = asset.children && asset.children.length > 0
              
              return (
                <div
                  key={asset.id}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAssetClick(asset)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                    {(() => {
                      const Icon = getAssetIcon(asset.type)
                      return <Icon className="h-5 w-5" />
                    })()}
                  </div>
                  <span className="text-sm font-medium text-center">{asset.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {asset.type.replace('-', ' ')}
                  </span>
                  {hasChildren && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {isExpanded ? (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          <span>Expanded</span>
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-3 w-3" />
                          <span>{asset.children?.length || 0} items</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

