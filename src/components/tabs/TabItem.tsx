import { X, MoreHorizontal, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTabStore } from '@/stores/tabStore'
import type { Tab } from '@/types'
import { cn } from '@/lib/utils'

interface TabItemProps {
  tab: Tab
  isActive: boolean
}

export default function TabItem({ tab, isActive }: TabItemProps) {
  const { closeTab, setActiveTab } = useTabStore()

  const handleClick = () => {
    setActiveTab(tab.id)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    closeTab(tab.id)
  }

  return (
    <div
      data-tab-item
      className={cn(
        'group relative flex h-11 min-w-0 max-w-[256px] items-center justify-center p-[4px] transition-colors border-r',
        isActive
          ? 'bg-white border-b-0'
          : 'bg-[#fafafc] border-b'
      )}
      style={{
        borderColor: 'rgba(0,0,0,0.15)',
      }}
      onClick={handleClick}
    >
      <div
        className={cn(
          'flex min-w-0 flex-1 items-center gap-[4px] rounded-[4px]',
          !isActive && 'group-hover:bg-[#e0e5ec]'
        )}
      >
        <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-clip rounded-[4px] p-[8px]">
          {tab.icon ? (
            <span className="text-xs">{tab.icon}</span>
          ) : (
            <File className="h-5 w-5 text-[rgba(64,64,64,1)]" />
          )}
        </div>
        <span
          className={cn(
            'truncate text-sm font-normal leading-none',
            isActive
              ? 'text-[#404040]'
              : 'text-[rgba(64,64,64,0.76)]'
          )}
        >
          {tab.label}
        </span>
        <div className="ml-auto flex items-center gap-[4px] opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-[4px] p-[8px] hover:bg-transparent"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Close Others</DropdownMenuItem>
              <DropdownMenuItem>Close to Right</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!tab.isLocked && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-[4px] p-[8px] hover:bg-transparent"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleClose(e)
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
