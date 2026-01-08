import { ChevronRight, Pin, MoreHorizontal, File, Folder, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useTabStore } from '@/stores/tabStore'
import type { Asset, AssetType } from '@/types'
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
      return <Folder className="h-4 w-4 text-[rgba(109,109,109,1)]" />
    case 'folder':
      return <Folder className="h-4 w-4 text-[rgba(109,109,109,1)]" />
    default:
      return <File className="h-4 w-4 text-[rgba(109,109,109,1)]" />
  }
}

interface TreeItemProps {
  item: Asset
  level: number
  onItemClick: (item: Asset) => void
  onPinClick: (item: Asset) => void
}

function TreeItem({ item, level, onItemClick, onPinClick }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { pinnedItems, pinItem, unpinItem } = useSidebarStore()
  const isPinned = pinnedItems.some((p) => p.id === item.id)
  const hasChildren = item.children && item.children.length > 0

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPinned) {
      unpinItem(item.id)
    } else {
      pinItem(item)
    }
  }

  return (
    <div>
      <div
        className="group flex min-h-[36px] items-center gap-px rounded-[4px] pl-[2px] pr-[8px] py-[2px] transition-colors hover:bg-[#e0e5ec]"
        style={{ paddingLeft: `${2 + level * 16}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-4 w-4 shrink-0 items-center justify-center"
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        ) : (
          <div className="h-4 w-4 shrink-0" />
        )}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip p-[10px]">
          {getIconForType(item.type)}
        </div>
        <button
          onClick={() => onItemClick(item)}
          className="flex min-w-0 flex-1 items-center overflow-hidden"
        >
          <span className="text-sm leading-4 text-[#404040] whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
        </button>
        <div className="ml-auto flex shrink-0 items-center gap-1 hidden group-hover:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[4px] p-[10px] hover:bg-transparent">
                <MoreHorizontal className="h-4 w-4" />
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
              "h-8 w-8 rounded-[4px] p-[10px] hover:bg-transparent",
              isPinned && "text-[#404040]"
            )}
            onClick={handlePin}
          >
            <Pin
              className={cn(
                "h-4 w-4",
                isPinned && "fill-current"
              )}
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
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FlyoutPanel() {
  const { flyoutType, closeFlyout } = useSidebarStore()
  const { openTab } = useTabStore()

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

  const data = getData()

  const handleItemClick = (item: Asset) => {
    if (item.type !== 'workspace' && item.type !== 'folder') {
      openTab(item)
      closeFlyout()
    }
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-white">
      <div className="flex h-11 items-center justify-between border-b border-border px-2">
        <h3 className="text-sm font-semibold capitalize">{flyoutType}</h3>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={closeFlyout}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {data.map((item) => (
          <TreeItem
            key={item.id}
            item={item}
            level={0}
            onItemClick={handleItemClick}
            onPinClick={() => {}}
          />
        ))}
      </div>
    </div>
  )
}
