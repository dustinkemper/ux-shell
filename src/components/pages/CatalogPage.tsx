import { useEffect, useMemo, useState } from 'react'
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
  DropdownMenuCheckboxItem,
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
    setOwnerFilter,
    setTagsFilter,
    selectedTypeFilter,
    selectedOwnerFilter,
    selectedTagsFilter,
    getFilteredAssets,
    getHierarchicalAssets,
    addAsset,
    updateAsset,
    assets,
  } = useCatalogStore()
  const { pinnedItems, pinItem, unpinItem } = useSidebarStore()
  const { openTab, openPageTab } = useTabStore()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['ws_analytics', 'ws_marketing', 'ws_platform'])) // Default: expand all workspaces
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [moveTarget, setMoveTarget] = useState<Asset | null>(null)
  const [moveDestinationId, setMoveDestinationId] = useState('')
  const [blockedMoveIds, setBlockedMoveIds] = useState<Set<string>>(new Set())
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [folderParent, setFolderParent] = useState<Asset | null>(null)
  const [folderName, setFolderName] = useState('')

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

  const findAncestorIds = (assetId: string): string[] => {
    const ancestors: string[] = []
    let current = findAssetInTree(assets, assetId)
    while (current?.parentId) {
      ancestors.push(current.parentId)
      current = findAssetInTree(assets, current.parentId)
    }
    return ancestors
  }

  const getDescendantIds = (asset: Asset): string[] => {
    const result: string[] = []
    const traverse = (node: Asset) => {
      if (!node.children) return
      for (const child of node.children) {
        result.push(child.id)
        traverse(child)
      }
    }
    traverse(asset)
    return result
  }

  const getMoveDestinations = () => {
    const destinations: { id: string; label: string; type: AssetType }[] = []
    const walk = (node: Asset, path: string[]) => {
      if (node.type === 'workspace' || node.type === 'folder') {
        destinations.push({
          id: node.id,
          label: [...path, node.name].join(' / '),
          type: node.type,
        })
      }
      if (node.children) {
        const nextPath = node.type === 'workspace' ? [node.name] : [...path, node.name]
        node.children.forEach((child) => walk(child, nextPath))
      }
    }
    assets.forEach((asset) => walk(asset, []))
    return destinations
  }

  const openMoveDialog = (asset: Asset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const fullAsset = findAssetInTree(assets, asset.id) ?? asset
    const descendants = getDescendantIds(fullAsset)
    setBlockedMoveIds(new Set([asset.id, ...descendants]))
    setMoveTarget(asset)
    setMoveDestinationId(asset.parentId ?? '')
    setIsMoveDialogOpen(true)
  }

  const openFolderDialog = (asset: Asset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setFolderParent(asset)
    setFolderName('')
    setIsFolderDialogOpen(true)
  }

  const moveDestinations = useMemo(() => getMoveDestinations(), [assets])

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
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
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(asset.type === 'workspace' || asset.type === 'folder') && (
                    <DropdownMenuItem onClick={(e) => openFolderDialog(asset, e)}>
                      New Folder
                    </DropdownMenuItem>
                  )}
                  {asset.type !== 'workspace' && (
                    <DropdownMenuItem onClick={(e) => openMoveDialog(asset, e)}>
                      Move
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
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


  const listAssets = useMemo(() => {
    if (activeFilter === 'all') return hierarchicalAssets
    if (activeFilter === 'recent') {
      return getFilteredAssets().map((asset) => stripChildren(asset))
    }
    if (activeFilter === 'favorites') {
      return getFilteredAssets().map((asset) => {
        if (asset.type === 'workspace' || asset.type === 'folder') {
          return findAssetInTree(assets, asset.id) ?? asset
        }
        return stripChildren(asset)
      })
    }
    return hierarchicalAssets
  }, [activeFilter, assets, getFilteredAssets, hierarchicalAssets])

  const hasListResults = listAssets.length > 0

  const activeFilterTags = useMemo(() => {
    const tags: { id: string; label: string; onRemove: () => void }[] = []
    if (activeFilter !== 'all') {
      tags.push({
        id: `view-${activeFilter}`,
        label: `View: ${activeFilter}`,
        onRemove: () => setActiveFilter('all'),
      })
    }
    if (selectedTypeFilter && selectedTypeFilter.length > 0) {
      selectedTypeFilter.forEach((type) => {
        tags.push({
          id: `type-${type}`,
          label: `Type: ${type.replace('-', ' ')}`,
          onRemove: () => {
            const next = selectedTypeFilter.filter((item) => item !== type)
            setTypeFilter(next.length > 0 ? next : undefined)
          },
        })
      })
    }
    if (selectedOwnerFilter) {
      tags.push({
        id: `owner-${selectedOwnerFilter}`,
        label: `Owner: ${selectedOwnerFilter}`,
        onRemove: () => setOwnerFilter(undefined),
      })
    }
    if (selectedTagsFilter && selectedTagsFilter.length > 0) {
      selectedTagsFilter.forEach((tag) => {
        tags.push({
          id: `tag-${tag}`,
          label: `Tag: ${tag}`,
          onRemove: () => {
            const next = selectedTagsFilter.filter((item) => item !== tag)
            setTagsFilter(next.length > 0 ? next : undefined)
          },
        })
      })
    }
    if (searchQuery) {
      tags.push({
        id: 'search',
        label: `Search: ${searchQuery}`,
        onRemove: () => setSearchQuery(''),
      })
    }
    return tags
  }, [
    activeFilter,
    searchQuery,
    selectedOwnerFilter,
    selectedTagsFilter,
    selectedTypeFilter,
    setActiveFilter,
    setOwnerFilter,
    setSearchQuery,
    setTagsFilter,
    setTypeFilter,
  ])

  useEffect(() => {
    const hasFilters =
      activeFilter !== 'all' ||
      (selectedTypeFilter && selectedTypeFilter.length > 0) ||
      selectedOwnerFilter ||
      (selectedTagsFilter && selectedTagsFilter.length > 0) ||
      searchQuery

    if (!hasFilters) return

    const matches = getFilteredAssets()
    if (matches.length === 0) return

    const nextExpanded = new Set(expandedItems)
    matches.forEach((asset) => {
      findAncestorIds(asset.id).forEach((id) => nextExpanded.add(id))
    })
    setExpandedItems(nextExpanded)
  }, [
    activeFilter,
    expandedItems,
    getFilteredAssets,
    searchQuery,
    selectedOwnerFilter,
    selectedTagsFilter,
    selectedTypeFilter,
  ])

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
                {selectedTypeFilter && selectedTypeFilter.length > 0
                  ? `Type (${selectedTypeFilter.length})`
                  : 'Type'}{' '}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTypeFilter(undefined)}>Clear Types</DropdownMenuItem>
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
                <DropdownMenuCheckboxItem
                  key={type.id}
                  checked={selectedTypeFilter?.includes(type.id)}
                  onCheckedChange={(checked) => {
                    const next = new Set(selectedTypeFilter ?? [])
                    if (checked) {
                      next.add(type.id)
                    } else {
                      next.delete(type.id)
                    }
                    const result = Array.from(next)
                    setTypeFilter(result.length > 0 ? result : undefined)
                  }}
                >
                  {type.label}
                </DropdownMenuCheckboxItem>
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
        {activeFilterTags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activeFilterTags.map((tag) => (
              <span
                key={tag.id}
                className="flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                {tag.label}
                <button
                  type="button"
                  className="text-muted-foreground/70 hover:text-foreground"
                  onClick={tag.onRemove}
                  aria-label={`Remove ${tag.label}`}
                >
                  ×
                </button>
              </span>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setActiveFilter('all')
                setSearchQuery('')
                setTypeFilter(undefined)
                setOwnerFilter(undefined)
                setTagsFilter(undefined)
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'list' ? (
          <div className="w-full">
            {hasListResults ? (
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {listAssets.map((asset) => renderAssetRow(asset, 0))}
                </tbody>
              </table>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No results match your filters.
              </div>
            )}
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
      {isFolderDialogOpen && folderParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">New Folder</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a folder under {folderParent.name}
            </p>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">Folder name</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                placeholder="e.g., Q4 Reporting"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFolderDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const name = folderName.trim()
                  if (!name) return
                  addAsset({
                    id: `folder-${Date.now()}`,
                    name,
                    type: 'folder',
                    parentId: folderParent.id,
                  })
                  setIsFolderDialogOpen(false)
                }}
                disabled={!folderName.trim()}
              >
                Create Folder
              </Button>
            </div>
          </div>
        </div>
      )}
      {isMoveDialogOpen && moveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Move asset</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Move {moveTarget.name} to a new location
            </p>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">Destination</label>
              <select
                value={moveDestinationId}
                onChange={(e) => setMoveDestinationId(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select destination</option>
                {moveDestinations
                  .filter((destination) => !blockedMoveIds.has(destination.id))
                  .map((destination) => (
                    <option key={destination.id} value={destination.id}>
                      {destination.label}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsMoveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!moveDestinationId) return
                  updateAsset(moveTarget.id, { parentId: moveDestinationId })
                  setIsMoveDialogOpen(false)
                }}
                disabled={!moveDestinationId || moveDestinationId === moveTarget.parentId}
              >
                Move
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

