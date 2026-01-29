import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useTabStore } from '@/stores/tabStore'
import type { AssetType } from '@/types'
import { cn } from '@/lib/utils'
import { getAssetIcon } from '@/lib/iconUtils'
import { useState } from 'react'

const getIconForType = (type: AssetType, isCollapsed: boolean) => {
  const marginClass = isCollapsed ? '' : 'mr-2'
  const Icon = getAssetIcon(type)
  return (
    <Icon
      className={cn(
        'h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]',
        marginClass
      )}
    />
  )
}

export default function MiddleSection() {
  const { state, pinnedItems } = useSidebarStore()
  const { openPageTab } = useTabStore()
  const [isExpanded, setIsExpanded] = useState(true)

  const isCollapsed = state === 'collapsed'

  const handlePinClick = (item: typeof pinnedItems[0]) => {
    openPageTab('catalog-filtered', `Catalog: ${item.name}`, 'Library', {
      assetType: item.type,
    })
  }

  return (
    <div className={cn(
      "flex flex-1 flex-col gap-[4px] border-t border-b border-[rgba(0,0,0,0.15)] py-2",
      isCollapsed ? "px-[4px]" : "px-3"
    )}>
      <div
        className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <Button
          variant="ghost"
          size={undefined}
          className={cn(
            "transition-colors font-normal hover:bg-[#e0e5ec] h-[36px]",
            isCollapsed ? "w-[36px] justify-center" : "w-full justify-start gap-2"
          )}
          style={{
            paddingLeft: isCollapsed ? '4px' : '8px',
            paddingRight: isCollapsed ? '4px' : '8px',
            paddingTop: '0px',
            paddingBottom: '0px'
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              isCollapsed ? "" : "mr-2",
              isExpanded ? 'rotate-90' : ''
            )}
          />
          {!isCollapsed && (
            <span className="text-xs uppercase text-muted-foreground">
              Pins
            </span>
          )}
        </Button>
      </div>
      {isExpanded && (
        <div className="flex max-h-64 flex-col gap-[4px] overflow-y-auto">
          {pinnedItems.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-muted-foreground">
              {!isCollapsed && 'No pinned items'}
            </div>
          ) : (
            pinnedItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size={undefined}
                className={cn(
                  "group gap-px rounded-[4px] transition-colors font-normal hover:bg-[#e0e5ec] h-[36px]",
                  isCollapsed 
                    ? "w-[36px] justify-center" 
                    : "w-full justify-start"
                )}
                style={{
                  paddingLeft: isCollapsed ? '4px' : '8px',
                  paddingRight: isCollapsed ? '4px' : '8px',
                  paddingTop: '0px',
                  paddingBottom: '0px'
                }}
                onClick={() => handlePinClick(item)}
              >
                {getIconForType(item.type, isCollapsed)}
                {!isCollapsed && (
                  <span className="truncate text-sm leading-4 text-[#404040]">{item.name}</span>
                )}
              </Button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
