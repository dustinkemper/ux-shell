import { ChevronLeft, ChevronRight, X, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/stores/sidebarStore'
import { cn } from '@/lib/utils'

export default function SidebarHeader() {
  const { state, toggleCollapse, toggleMinimize } = useSidebarStore()
  const isCollapsed = state === 'collapsed'

  if (state === 'minimized') {
    return (
      <div className="flex h-11 items-center justify-center border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMinimize}
          className="h-9 w-9"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex h-11 items-center border-b border-[rgba(0,0,0,0.15)] bg-[#dfe5e6]",
      isCollapsed ? "justify-center" : "gap-1 px-2"
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleCollapse}
        className="h-9 w-9"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      {!isCollapsed && (
        <>
          <span className="flex flex-1 items-center justify-start text-sm font-medium text-foreground">
            &lt;Tenant name&gt;
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMinimize}
            className="h-9 w-9"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  )
}
