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
    <div className="flex flex-1 flex-col gap-2 border-t border-b border-border px-1 py-2">
      <Button
        variant="ghost"
        className={cn(
          "h-9",
          isCollapsed ? "w-full justify-center" : "justify-start gap-2 px-2"
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
      {isExpanded && (
        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {pinnedItems.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-muted-foreground">
              {!isCollapsed && 'No pinned items'}
            </div>
          ) : (
            pinnedItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "group min-h-[36px] gap-px rounded-[4px] shadow-[0px_1px_4px_rgba(12,12,13,0.05)] transition-colors",
                  isCollapsed 
                    ? "w-full justify-center p-[2px]" 
                    : "justify-start pl-[2px] pr-[8px] py-[2px] hover:bg-[#e0e5ec]"
                )}
                onClick={() => handlePinClick(item)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip p-[10px]">
                  <Pin className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
                </div>
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
