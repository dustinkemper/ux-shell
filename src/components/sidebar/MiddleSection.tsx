import { ChevronRight, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useTabStore } from '@/stores/tabStore'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export default function MiddleSection() {
  const { state, pinnedItems } = useSidebarStore()
  const { openTab } = useTabStore()
  const [isExpanded, setIsExpanded] = useState(true)

  const isCollapsed = state === 'collapsed'

  const handlePinClick = (item: typeof pinnedItems[0]) => {
    openTab(item)
  }

  return (
    <div className="flex flex-1 flex-col gap-2 border-t border-b border-[rgba(0,0,0,0.15)] py-2">
      <div className={cn("h-[44px] flex items-center", isCollapsed ? "px-1 justify-center" : "px-1")}>
        <Button
          variant="ghost"
          className={cn(
            "transition-colors p-1",
            isCollapsed ? "h-[36px] w-[36px] justify-center" : "h-full w-full justify-start gap-2 hover:bg-[#e0e5ec]"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronRight
            className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
          {!isCollapsed && (
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Pins
            </span>
          )}
        </Button>
      </div>
      {isExpanded && (
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {pinnedItems.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-muted-foreground">
              {!isCollapsed && 'No pinned items'}
            </div>
          ) : (
            pinnedItems.map((item) => (
              <div key={item.id} className={cn("h-[44px] flex items-center", isCollapsed ? "px-1 justify-center" : "px-1")}>
                <Button
                  variant="ghost"
                  className={cn(
                    "group gap-px rounded-[4px] transition-colors p-1",
                    isCollapsed 
                      ? "h-[36px] w-[36px] justify-center" 
                      : "h-full w-full justify-start hover:bg-[#e0e5ec]"
                  )}
                  onClick={() => handlePinClick(item)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip">
                    <Pin className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
                  </div>
                  {!isCollapsed && (
                    <span className="truncate text-sm leading-4 text-[#404040]">{item.name}</span>
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
