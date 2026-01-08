import { Plus, Library, LayoutGrid, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useTabStore } from '@/stores/tabStore'
import { cn } from '@/lib/utils'

export default function TopSection() {
  const { state, openFlyout } = useSidebarStore()
  const { openTab } = useTabStore()

  const handleCreateNew = () => {
    // Placeholder: Open template selection
    const templateAsset = {
      id: 'template-selector',
      name: 'Create New',
      type: 'workspace' as const,
    }
    openTab(templateAsset)
  }

  const isCollapsed = state === 'collapsed'

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className={cn("h-[44px] flex items-center", isCollapsed ? "px-2 justify-center" : "px-2")}>
        <Button
          onClick={handleCreateNew}
          className={cn(
            "bg-green-600 text-white hover:bg-green-700 p-1 h-[36px] font-normal",
            isCollapsed ? "w-[36px] justify-center" : "w-full justify-start gap-2"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip">
            <Plus className="h-4 w-4 shrink-0" />
          </div>
          {!isCollapsed && <span className="text-sm">Create new</span>}
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        <div className={cn("h-[44px] flex items-center", isCollapsed ? "px-2 justify-center" : "px-2")}>
          <Button
            variant="ghost"
            className={cn(
              "group gap-px rounded-[4px] transition-colors p-1 font-normal hover:bg-[#e0e5ec]",
              isCollapsed 
                ? "h-[36px] w-[36px] justify-center" 
                : "h-full w-full justify-start"
            )}
            onClick={() => openFlyout('catalog')}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip">
              <Library className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
            </div>
            {!isCollapsed && (
              <span className="truncate text-sm leading-4 text-[#404040]">Catalog</span>
            )}
          </Button>
        </div>
        <div className={cn("h-[44px] flex items-center", isCollapsed ? "px-2 justify-center" : "px-2")}>
          <Button
            variant="ghost"
            className={cn(
              "group gap-px rounded-[4px] transition-colors p-1 font-normal hover:bg-[#e0e5ec]",
              isCollapsed 
                ? "h-[36px] w-[36px] justify-center" 
                : "h-full w-full justify-start"
            )}
            onClick={() => openFlyout('workspaces')}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip">
              <LayoutGrid className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
            </div>
            {!isCollapsed && (
              <span className="truncate text-sm leading-4 text-[#404040]">Workspaces</span>
            )}
          </Button>
        </div>
        <div className={cn("h-[44px] flex items-center", isCollapsed ? "px-2 justify-center" : "px-2")}>
          <Button
            variant="ghost"
            className={cn(
              "group gap-px rounded-[4px] transition-colors p-1 font-normal hover:bg-[#e0e5ec]",
              isCollapsed 
                ? "h-[36px] w-[36px] justify-center" 
                : "h-full w-full justify-start"
            )}
            onClick={() => openFlyout('more')}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip">
              <MoreHorizontal className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
            </div>
            {!isCollapsed && (
              <span className="truncate text-sm leading-4 text-[#404040]">More</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
