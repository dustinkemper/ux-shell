import {
  ChevronRight,
  Pin,
  MoreHorizontal,
  File,
  Folder,
  X,
  Search,
  LayoutGrid,
  Library,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  RotateCw,
  ArrowDownAZ,
  Plus,
  Sparkles,
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
import type { Asset, AssetType, FlyoutType } from '@/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'

// Mock data for different flyout types
const getCatalogData = (): Asset[] => [
  {
    id: 'ws1',
    name: 'Workspace 1',
    type: 'workspace',
    children: [
      {
        id: 'folder1',
        name: 'Folder 1',
        type: 'folder',
        parentId: 'ws1',
        children: [
          { id: 'app1', name: 'Analytics App 1', type: 'analytics-app', parentId: 'folder1' },
          { id: 'pipeline1', name: 'Data Pipeline 1', type: 'pipeline', parentId: 'folder1' },
        ],
      },
      { id: 'app2', name: 'Analytics App 2', type: 'analytics-app', parentId: 'ws1' },
    ],
  },
  {
    id: 'ws2',
    name: 'Workspace 2',
    type: 'workspace',
    children: [
      { id: 'kb1', name: 'Knowledge Base 1', type: 'knowledge-base', parentId: 'ws2' },
    ],
  },
]

const getWorkspacesData = (): Asset[] => getCatalogData()

// Tools panel data organized by sections
const getToolsData = () => {
  return {
    'Data integration': [
      { id: 'connection', name: 'Connection', type: 'connection' as AssetType },
      { id: 'pipeline', name: 'Pipeline', type: 'pipeline' as AssetType },
      { id: 'lakehouse', name: 'Lakehouse clusters', type: 'connection' as AssetType },
      { id: 'monitor-view', name: 'Monitor view', type: 'monitor-view' as AssetType },
      { id: 'api-builder', name: 'API builder', type: 'connection' as AssetType },
    ],
    'Data Prep': [
      { id: 'dataflow', name: 'Data flow', type: 'dataflow' as AssetType },
      { id: 'table-recipe', name: 'Table recipe', type: 'table-recipe' as AssetType },
      { id: 'script', name: 'Script', type: 'script' as AssetType },
    ],
    'Data Quality': [
      { id: 'data-product', name: 'Data product', type: 'data-product' as AssetType },
      { id: 'quality-rules', name: 'Quality rules', type: 'monitor-view' as AssetType },
      { id: 'policies', name: 'Policies & Regulations', type: 'monitor-view' as AssetType },
      { id: 'glossary', name: 'Glossary', type: 'glossary' as AssetType },
      { id: 'stewardship', name: 'Stewardship', type: 'monitor-view' as AssetType },
    ],
    Analytics: [
      { id: 'analytics-app', name: 'Analytics app', type: 'analytics-app' as AssetType },
      { id: 'notes', name: 'Notes', type: 'analytics-app' as AssetType },
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

const getIconForType = (type: AssetType) => {
  switch (type) {
    case 'workspace':
      return <Folder className="h-4 w-4 text-[#5e656a]" />
    case 'folder':
      return <Folder className="h-4 w-4 text-[#5e656a]" />
    default:
      return <File className="h-4 w-4 text-[#5e656a]" />
  }
}

const getHeaderIcon = (flyoutType: FlyoutType) => {
  switch (flyoutType) {
    case 'catalog':
      return <Library className="h-4 w-4 text-[#18191a]" />
    case 'workspaces':
      return <LayoutGrid className="h-4 w-4 text-[#18191a]" />
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
    case 'workspaces':
      return 'Workspaces'
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
  onPinClick: (item: Asset) => void
  selectedId?: string
}

function TreeItem({ item, level, onItemClick, onPinClick, selectedId }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { pinnedItems, pinItem, unpinItem } = useSidebarStore()
  const isPinned = pinnedItems.some((p) => p.id === item.id)
  const hasChildren = item.children && item.children.length > 0
  const isSelected = selectedId === item.id

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
          'group flex h-8 items-center gap-2 rounded-[4px] px-2 py-1 transition-colors relative',
          isSelected
            ? 'bg-[#ebf1ff] border border-[#d6e7ff]'
            : 'hover:bg-[#e0e5ec]'
        )}
        style={{ paddingLeft: level > 0 ? `${8 + level * 16}px` : '8px' }}
      >
        {level > 0 && (
          <div
            className="absolute left-[8px] top-0 bottom-0 w-px bg-[#c7cfd1]"
            style={{ height: '32px' }}
          />
        )}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] hover:bg-gray-200/50 transition-colors"
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 text-[#18191a] transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
        ) : (
          <div className="h-4 w-4 shrink-0" />
        )}
        <div className="flex h-4 w-4 shrink-0 items-center justify-center">
          {getIconForType(item.type)}
        </div>
        <button
          onClick={handleClick}
          className="flex min-w-0 flex-1 items-center overflow-hidden"
        >
          <span
            className={cn(
              'text-sm leading-4 whitespace-nowrap overflow-hidden text-ellipsis',
              isSelected ? 'text-[#225a94] font-medium' : 'text-[#18191a]'
            )}
          >
            {item.name}
          </span>
        </button>
        <div className="ml-auto flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-[4px] p-1 hover:bg-gray-200/50"
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
              'h-8 w-8 rounded-[4px] p-1 hover:bg-gray-200/50',
              isPinned && 'text-[#18191a]'
            )}
            onClick={handlePin}
          >
            <Pin
              className={cn('h-4 w-4 text-[#5e656a]', isPinned && 'fill-current')}
            />
          </Button>
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {item.children!.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              level={level + 1}
              onItemClick={onItemClick}
              onPinClick={onPinClick}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  item: Asset
  onItemClick: (item: Asset) => void
}

function MenuItem({ item, onItemClick }: MenuItemProps) {
  return (
    <div
      className="flex h-8 items-center gap-2 rounded-[4px] px-1 py-1 transition-colors hover:bg-[#e0e5ec] cursor-pointer"
      onClick={() => onItemClick(item)}
    >
      <div className="flex h-4 w-4 shrink-0 items-center justify-center">
        <File className="h-4 w-4 text-[#5e656a]" />
      </div>
      <span className="flex-1 text-sm leading-4 text-[#18191a] whitespace-nowrap overflow-hidden text-ellipsis">
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
        className="flex h-4 w-4 items-center justify-center rounded-[4px] p-1 hover:bg-gray-200/50 transition-colors"
      >
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-[#18191a]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#18191a]" />
        )}
      </button>
    </div>
  )
}

export default function FlyoutPanel() {
  const { flyoutType, closeFlyout } = useSidebarStore()
  const { openTab } = useTabStore()
  const [searchQuery, setSearchQuery] = useState('')
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

  const getData = () => {
    switch (flyoutType) {
      case 'catalog':
        return getCatalogData()
      case 'workspaces':
        return getWorkspacesData()
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

  const handleItemClick = (item: Asset) => {
    setSelectedItemId(item.id)
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
      case 'workspaces':
      case 'catalog':
        return 'Search for files'
      default:
        return 'Search'
    }
  }

  const filteredData = searchQuery
    ? data.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data

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
          onClick={() => {}}
        >
          <MoreHorizontal className="h-4 w-4 text-[#18191a]" />
        </Button>
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
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-[4px] bg-[#f7fafb] px-2 py-2">
            <Search className="h-4 w-4 shrink-0 text-[#18191a]" />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm leading-5 text-[#18191a] placeholder:text-[#18191a] outline-none"
            />
          </div>
          {(flyoutType === 'workspaces' || flyoutType === 'catalog') && (
            <div className="flex items-center gap-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-[4px] p-[10px] hover:bg-gray-200/50"
              >
                <ArrowDownAZ className="h-4 w-4 text-[#5e656a]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-[4px] p-[10px] hover:bg-gray-200/50"
              >
                <FolderPlus className="h-4 w-4 text-[#5e656a]" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-[4px] p-[10px] hover:bg-gray-200/50"
              >
                <RotateCw className="h-4 w-4 text-[#5e656a]" />
              </Button>
            </div>
          )}
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
                  selectedFilter === 'favorites'
                    ? 'bg-white text-[#18191a] hover:bg-[#f0f0f0]'
                    : 'text-[#5e656a] hover:bg-white/50'
                )}
                onClick={() => setSelectedFilter('favorites')}
              >
                Favorites
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  'h-8 flex-1 rounded-[6px] px-3 text-sm transition-colors',
                  selectedFilter === 'collections'
                    ? 'bg-white text-[#18191a] hover:bg-[#f0f0f0]'
                    : 'text-[#5e656a] hover:bg-white/50'
                )}
                onClick={() => setSelectedFilter('collections')}
              >
                Collections
              </Button>
            </div>
          </div>
        )}

        {/* Create New Button - Workspaces */}
        {flyoutType === 'workspaces' && (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              className="h-9 w-full gap-2 rounded-[8px] bg-[#f7fafb] px-2 py-2 text-sm font-semibold text-[#5e656a] hover:bg-[#f7fafb]"
            >
              <Plus className="h-4 w-4" />
              Create new
            </Button>
          </div>
        )}

        {/* Divider */}
        {(flyoutType === 'workspaces' || flyoutType === 'catalog' || flyoutType === 'more') && (
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
          ) : (
            <div className="flex flex-col gap-0">
              {filteredData.map((item) => (
                <TreeItem
                  key={item.id}
                  item={item}
                  level={0}
                  onItemClick={handleItemClick}
                  onPinClick={() => {}}
                  selectedId={selectedItemId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Action Button - Catalog */}
        {flyoutType === 'catalog' && (
          <div className="flex flex-col items-start p-0">
            <div className="flex w-full items-start">
              <Button
                className="h-9 w-full gap-2 rounded-[8px] bg-[#328be5] px-2 py-2 text-sm font-semibold text-white hover:bg-[#328be5]/90"
              >
                Open catalog
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
