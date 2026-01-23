import {
  ChevronRight,
  Pin,
  MoreHorizontal,
  File,
  X,
  Search,
  Library,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Waves,
  Hexagon,
  Scale,
  Landmark,
  HandHelping,
  NotebookText,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useTabStore } from '@/stores/tabStore'
import { useCatalogStore } from '@/stores/catalogStore'
import type { Asset, AssetType, FlyoutType } from '@/types'
import { cn } from '@/lib/utils'
import { getAssetIcon } from '@/lib/iconUtils'
import { useState } from 'react'

// Tools panel data organized by sections
const getToolsData = () => {
  return {
    'Data integration': [
      { id: 'connection', name: 'Connection', type: 'connection' as AssetType },
      { id: 'pipeline', name: 'Pipeline', type: 'pipeline' as AssetType },
      { id: 'lakehouse', name: 'Lakehouse clusters', type: 'connection' as AssetType, icon: 'waves' },
      { id: 'monitor-view', name: 'Monitor view', type: 'monitor-view' as AssetType },
      { id: 'api-builder', name: 'API builder', type: 'connection' as AssetType, icon: 'hexagon' },
    ],
    'Data Prep': [
      { id: 'dataflow', name: 'Data flow', type: 'dataflow' as AssetType },
      { id: 'table-recipe', name: 'Table recipe', type: 'table-recipe' as AssetType },
      { id: 'script', name: 'Script', type: 'script' as AssetType },
    ],
    'Data Quality': [
      { id: 'data-product', name: 'Data product', type: 'data-product' as AssetType },
      { id: 'quality-rules', name: 'Quality rules', type: 'monitor-view' as AssetType, icon: 'scale' },
      { id: 'policies', name: 'Policies & Regulations', type: 'monitor-view' as AssetType, icon: 'landmark' },
      { id: 'glossary', name: 'Glossary', type: 'glossary' as AssetType },
      { id: 'stewardship', name: 'Stewardship', type: 'monitor-view' as AssetType, icon: 'hand-helping' },
    ],
    Analytics: [
      { id: 'analytics-app', name: 'Analytics app', type: 'analytics-app' as AssetType },
      { id: 'notes', name: 'Notes', type: 'analytics-app' as AssetType, icon: 'notebook-text' },
      { id: 'predict', name: 'Predict', type: 'predict' as AssetType },
    ],
    'AI Assistant': [
      { id: 'assistant', name: 'Assistant', type: 'ai-assistant' as AssetType },
      { id: 'knowledge-base', name: 'Knowledge base', type: 'knowledge-base' as AssetType },
    ],
  }
}

const getMoreData = (): Asset[] => [
  { id: 'analytics-apps', name: 'Analytics apps', type: 'analytics-app' },
  { id: 'automations', name: 'Automations', type: 'automation' },
  { id: 'ai-assistant', name: 'AI Assistant', type: 'ai-assistant' },
  { id: 'connections', name: 'Connections', type: 'connection' },
  { id: 'data-pipelines', name: 'Data Pipelines', type: 'pipeline' },
  { id: 'knowledge-base', name: 'Knowledge base', type: 'knowledge-base' },
  { id: 'ml-experiments', name: 'ML Experiments', type: 'predict' },
  { id: 'quality-rules', name: 'Quality rules', type: 'monitor-view' },
  { id: 'script-editor', name: 'Script editor', type: 'script' },
  { id: 'table-recipe', name: 'Table recipe', type: 'table-recipe' },
]

const getHeaderIcon = (flyoutType: FlyoutType) => {
  switch (flyoutType) {
    case 'catalog':
      return <Library className="h-4 w-4 text-[#18191a]" />
    case 'more':
      return <Sparkles className="h-4 w-4 text-[#18191a]" />
    default:
      return null
  }
}

const getHeaderTitle = (flyoutType: FlyoutType) => {
  switch (flyoutType) {
    case 'catalog':
      return 'Catalog'
    case 'more':
      return 'Tools'
    default:
      return ''
  }
}

interface TreeItemProps {
  item: Asset
  level: number
  onItemClick: (item: Asset) => void
  selectedId?: string
  ancestorLines?: boolean[]
  isLast?: boolean
}

function StemSvg({
  level,
  ancestorLines,
  isLast,
}: {
  level: number
  ancestorLines: boolean[]
  isLast: boolean
}) {
  if (level === 0) return null

  const baseIndent = 8
  const indentSize = 40
  const caretWidth = 16
  const iconWidth = 24
  const rowHeight = 32
  const midY = rowHeight / 2
  const stemOffset = caretWidth + iconWidth / 2
  const stemWidth = baseIndent + level * indentSize
  const svgWidth = stemWidth + caretWidth + iconWidth
  const parentLineX = baseIndent + (level - 1) * indentSize + stemOffset
  const stroke = '#8d989c'
  const snap = (value: number) => Math.round(value) + 0.5
  const snappedTop = snap(0)
  const snappedBottom = snap(rowHeight - 1)
  const snappedMid = snap(midY)

  return (
    <svg
      className="absolute left-0 top-0 pointer-events-none"
      width={svgWidth}
      height={rowHeight}
      viewBox={`0 0 ${svgWidth} ${rowHeight}`}
      fill="none"
      shapeRendering="crispEdges"
    >
      {ancestorLines.map((drawLine, index) =>
        drawLine ? (
          <line
            key={`ancestor-${index}`}
            x1={snap(baseIndent + index * indentSize + stemOffset)}
            y1={snappedTop}
            x2={snap(baseIndent + index * indentSize + stemOffset)}
            y2={snappedBottom}
            stroke={stroke}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ) : null
      )}
      <line
        x1={snap(parentLineX)}
        y1={snappedTop}
        x2={snap(parentLineX)}
        y2={isLast ? snappedMid : snappedBottom}
        stroke={stroke}
        strokeWidth={1}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function TreeItem({
  item,
  level,
  onItemClick,
  selectedId,
  ancestorLines = [],
  isLast = false,
}: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { pinnedItems, pinItem, unpinItem } = useSidebarStore()
  const isPinned = pinnedItems.some((p) => p.id === item.id)
  const hasChildren = (item.children?.length ?? 0) > 0
  const baseIndent = 8
  const indentSize = 40
  const caretWidth = 16
  const iconWidth = 24
  const stemWidth = baseIndent + level * indentSize

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPinned) {
      unpinItem(item.id)
    } else {
      pinItem(item)
    }
  }

  const handleClick = () => {
    onItemClick(item)
  }

  return (
    <div className="relative">
      <div
        className={cn(
          'group grid h-8 items-center rounded-[4px] pr-2 transition-colors relative overflow-hidden hover:bg-[#e0e5ec]'
        )}
        style={{
          gridTemplateColumns: `${stemWidth}px ${caretWidth}px ${iconWidth}px 1fr`,
        }}
      >
        <StemSvg
          level={level}
          ancestorLines={ancestorLines}
          isLast={isLast}
        />
        <div className="relative z-10 h-full" />
        {hasChildren ? (
          <div className="relative z-10 flex h-full items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="flex h-4 w-4 items-center justify-center rounded-[4px] hover:bg-gray-200/50 transition-colors"
            >
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-[#18191a] transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>
          </div>
        ) : (
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="h-4 w-4" />
          </div>
        )}
        <div className="relative z-10 flex h-full items-center justify-center">
          {(() => {
            const Icon = getAssetIcon(item.type)
            return <Icon className="h-4 w-4 text-[#5e656a]" />
          })()}
        </div>
        <button
          onClick={handleClick}
          className="relative z-10 flex min-w-0 flex-1 items-center overflow-hidden pr-2 group-hover:pr-16 transition-[padding]"
        >
          <span
            className={cn(
              'min-w-0 text-sm leading-4 whitespace-nowrap overflow-hidden text-ellipsis text-[#18191a]'
            )}
          >
            {item.name}
          </span>
        </button>
        <div
          className={cn(
            'absolute right-1 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1 transition-opacity',
            isPinned
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-[4px] p-1 hover:bg-gray-200/50 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4 text-[#5e656a]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
              <DropdownMenuItem>Properties</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7 rounded-[4px] p-1 hover:bg-gray-200/50',
              isPinned ? 'text-[#18191a] opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
            onClick={handlePin}
            aria-pressed={isPinned}
          >
            <Pin
              className={cn(
                'h-4 w-4',
                isPinned ? 'text-[#18191a] fill-current' : 'text-[#5e656a]'
              )}
            />
          </Button>
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="relative">
          {item.children!.map((child, index) => (
            <TreeItem
              key={child.id}
              item={child}
              level={level + 1}
              onItemClick={onItemClick}
              selectedId={selectedId}
              ancestorLines={[...ancestorLines, !isLast]}
              isLast={index === item.children!.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  item: Asset & { icon?: string }
  onItemClick: (item: Asset) => void
}

const toolIconMap: Record<string, LucideIcon> = {
  waves: Waves,
  hexagon: Hexagon,
  scale: Scale,
  landmark: Landmark,
  'hand-helping': HandHelping,
  'notebook-text': NotebookText,
}

function MenuItem({ item, onItemClick }: MenuItemProps) {
  const Icon = item.icon ? toolIconMap[item.icon] ?? getAssetIcon(item.type) : getAssetIcon(item.type)
  return (
    <div
      className="group flex h-8 min-w-0 items-center gap-2 rounded-[4px] px-1 py-1 transition-colors hover:bg-[#e0e5ec] cursor-pointer"
      onClick={() => onItemClick(item)}
    >
      <div className="flex h-4 w-4 shrink-0 items-center justify-center">
        <Icon className="h-4 w-4 text-[#5e656a]" />
      </div>
      <span className="min-w-0 flex-1 text-sm leading-4 text-[#18191a] whitespace-nowrap overflow-hidden text-ellipsis">
        {item.name}
      </span>
    </div>
  )
}

interface SectionHeaderProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
}

function SectionHeader({ title, isExpanded, onToggle }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 border-b border-[#c7cfd1] px-1 pt-1 pb-0">
      <span className="flex-1 text-sm font-semibold uppercase leading-normal text-[#5e656a]">
        {title}
      </span>
      <button
        onClick={onToggle}
        className="flex h-6 w-6 items-center justify-center rounded-[4px] p-1 hover:bg-gray-200/50 transition-colors"
      >
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-[#18191a]" />
        ) : (
          <ChevronDown className="h-5 w-5 text-[#18191a]" />
        )}
      </button>
    </div>
  )
}

export default function FlyoutPanel() {
  const { flyoutType, closeFlyout } = useSidebarStore()
  const { openTab, openPageTab } = useTabStore()
  const {
    getHierarchicalAssets,
    assets,
    setTypeFilter,
    setActiveFilter,
    setSearchQuery: setCatalogSearchQuery,
  } = useCatalogStore()
  const [searchQuery, setFlyoutSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Data integration': true,
    'Data Prep': true,
    'Data Quality': true,
    Analytics: true,
    'AI Assistant': true,
  })
  const [selectedItemId, setSelectedItemId] = useState<string>()

  if (!flyoutType) return null

  const filterTree = (items: Asset[], query: string): Asset[] => {
    const loweredQuery = query.toLowerCase()
    const result: Asset[] = []
    for (const item of items) {
      const matches = item.name.toLowerCase().includes(loweredQuery)
      const children = item.children ? filterTree(item.children, query) : []
      if (matches || children.length > 0) {
        result.push({
          ...item,
          children: children.length > 0 ? children : item.children,
        })
      }
    }
    return result
  }

  const flattenAssets = (assetList: Asset[]): Asset[] => {
    const result: Asset[] = []
    for (const asset of assetList) {
      result.push(asset)
      if (asset.children) {
        result.push(...flattenAssets(asset.children))
      }
    }
    return result
  }

  const getData = () => {
    switch (flyoutType) {
      case 'catalog':
        return getHierarchicalAssets()
      case 'more':
        return getMoreData()
      default:
        return []
    }
  }

  const getToolsDataBySection = () => {
    return getToolsData()
  }

  const data = getData()
  const toolsData = flyoutType === 'more' ? getToolsDataBySection() : null
  const showFlatList = flyoutType === 'catalog' && selectedFilter !== 'all'

  const getFlatAssets = () => {
    let flattened = flattenAssets(assets).filter(
      (asset) => asset.type !== 'workspace' && asset.type !== 'folder'
    )

    if (searchQuery) {
      const loweredQuery = searchQuery.toLowerCase()
      flattened = flattened.filter((asset) =>
        asset.name.toLowerCase().includes(loweredQuery)
      )
    }

    if (selectedFilter === 'recent') {
      flattened = [...flattened].sort((a, b) => {
        const dateA = a.modified?.getTime() ?? 0
        const dateB = b.modified?.getTime() ?? 0
        return dateB - dateA
      })
    }

    if (selectedFilter === 'favorites') {
      flattened = flattened.filter((asset) => asset.tags?.includes('favorite'))
    }

    return flattened
  }

  const handleItemClick = (item: Asset) => {
    setSelectedItemId(item.id)
    if (flyoutType === 'more') {
      setActiveFilter('all')
      setCatalogSearchQuery('')
      setTypeFilter([item.type])
      openPageTab('catalog-filtered', `Catalog: ${item.name}`, 'Library', {
        assetType: item.type,
      })
      closeFlyout()
      return
    }
    if (item.type !== 'workspace' && item.type !== 'folder') {
      openTab(item)
    }
  }

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }))
  }

  const getSearchPlaceholder = () => {
    switch (flyoutType) {
      case 'more':
        return 'Search'
      case 'catalog':
        return 'Search for files'
      default:
        return 'Search'
    }
  }

  const filteredData = searchQuery ? filterTree(data, searchQuery) : data

  return (
    <div className="flex h-full w-80 flex-col border-r border-[rgba(0,0,0,0.15)] bg-white">
      {/* Header */}
      <div className="flex h-11 items-center gap-1 overflow-hidden px-3 py-1">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip p-[10px]">
            {getHeaderIcon(flyoutType)}
          </div>
          <h3 className="text-base font-medium leading-5 text-[#18191a] truncate">
            {getHeaderTitle(flyoutType)}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-[4px] p-[10px] hover:bg-gray-200/50"
          onClick={closeFlyout}
        >
          <X className="h-4 w-4 text-[#18191a]" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-3">
        {flyoutType === 'catalog' && (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              className="h-9 w-full gap-2 rounded-[8px] border-[#328be5] px-2 py-2 text-sm font-semibold text-[#328be5] hover:bg-[#e9f2ff]"
              onClick={() => {
                openPageTab('catalog', 'Catalog', 'Library')
                closeFlyout()
              }}
            >
              Open Catalog
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* Search Bar */}
        <div className="flex">
          <div className="flex flex-1 items-center gap-2 rounded-[4px] bg-[#f7fafb] px-2 py-2">
            <Search className="h-4 w-4 shrink-0 text-[#18191a]" />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => setFlyoutSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm leading-5 text-[#18191a] placeholder:text-[#18191a] outline-none"
            />
          </div>
        </div>

        {/* Filter Buttons - Tools */}
        {flyoutType === 'more' && (
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-1 gap-2 rounded-[8px] bg-[#f7fafb] p-[2px]">
              <Button
                variant="ghost"
                className={cn(
                  'h-8 flex-1 rounded-[6px] px-3 text-sm transition-colors',
                  selectedFilter === 'all'
                    ? 'bg-white text-[#18191a] hover:bg-[#f0f0f0]'
                    : 'text-[#5e656a] hover:bg-white/50'
                )}
                onClick={() => setSelectedFilter('all')}
              >
                All
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  'h-8 flex-1 rounded-[6px] px-3 text-sm transition-colors',
                  selectedFilter === 'data-integration'
                    ? 'bg-white text-[#18191a] hover:bg-[#f0f0f0]'
                    : 'text-[#5e656a] hover:bg-white/50'
                )}
                onClick={() => setSelectedFilter('data-integration')}
              >
                Data integration
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  'h-8 flex-1 rounded-[6px] px-3 text-sm transition-colors',
                  selectedFilter === 'analytics'
                    ? 'bg-white text-[#18191a] hover:bg-[#f0f0f0]'
                    : 'text-[#5e656a] hover:bg-white/50'
                )}
                onClick={() => setSelectedFilter('analytics')}
              >
                Analytics
              </Button>
            </div>
          </div>
        )}

        {/* Filter Buttons - Catalog */}
        {flyoutType === 'catalog' && (
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-1 gap-2 rounded-[8px] bg-[#f7fafb] p-[2px]">
              <Button
                variant="ghost"
                className={cn(
                  'h-8 flex-1 rounded-[6px] px-3 text-sm transition-colors',
                  selectedFilter === 'all'
                    ? 'bg-white text-[#18191a] hover:bg-[#f0f0f0]'
                    : 'text-[#5e656a] hover:bg-white/50'
                )}
                onClick={() => setSelectedFilter('all')}
              >
                All
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  'h-8 flex-1 rounded-[6px] px-3 text-sm transition-colors',
                  selectedFilter === 'recent'
                    ? 'bg-white text-[#18191a] hover:bg-[#f0f0f0]'
                    : 'text-[#5e656a] hover:bg-white/50'
                )}
                onClick={() => setSelectedFilter('recent')}
              >
                Recent
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  'h-8 flex-1 rounded-[6px] px-3 text-sm transition-colors',
                  selectedFilter === 'favorites'
                    ? 'bg-white text-[#18191a] hover:bg-[#f0f0f0]'
                    : 'text-[#5e656a] hover:bg-white/50'
                )}
                onClick={() => setSelectedFilter('favorites')}
              >
                Favorites
              </Button>
            </div>
          </div>
        )}

        {/* Divider */}
        {(flyoutType === 'catalog' || flyoutType === 'more') && (
          <div className="flex flex-col items-start px-0 py-1">
            <div className="h-px w-full bg-[#c7cfd1]" />
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-y-auto">
          {flyoutType === 'more' && toolsData ? (
            <div className="flex flex-col gap-1 p-2">
              {Object.entries(toolsData).map(([sectionName, items]) => {
                const isExpanded = expandedSections[sectionName] ?? true
                return (
                  <div key={sectionName} className="flex flex-col gap-1">
                    <SectionHeader
                      title={sectionName}
                      isExpanded={isExpanded}
                      onToggle={() => toggleSection(sectionName)}
                    />
                    {isExpanded && (
                      <div className="flex flex-col gap-0">
                        {items.map((item) => (
                          <MenuItem key={item.id} item={item} onItemClick={handleItemClick} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : showFlatList ? (
            <div className="flex flex-col gap-0">
              {getFlatAssets().map((item, index, list) => (
                <TreeItem
                  key={item.id}
                  item={item}
                  level={0}
                  onItemClick={handleItemClick}
                  selectedId={selectedItemId}
                  ancestorLines={[]}
                  isLast={index === list.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {filteredData.map((item, index, list) => (
                <TreeItem
                  key={item.id}
                  item={item}
                  level={0}
                  onItemClick={handleItemClick}
                  selectedId={selectedItemId}
                  ancestorLines={[]}
                  isLast={index === list.length - 1}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
