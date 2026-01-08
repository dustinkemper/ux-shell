import { Plus, Library, Grid3x3, MoreHorizontal } from 'lucide-react'
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
    <div className="flex flex-col gap-2 px-1 py-3">
      <Button
        onClick={handleCreateNew}
        className={cn(
          "h-9 bg-green-600 text-white hover:bg-green-700",
          isCollapsed ? "w-full justify-center" : "w-full justify-start gap-2"
        )}
      >
        <Plus className="h-4 w-4 shrink-0" />
        {!isCollapsed && <span className="text-sm font-semibold">Create new</span>}
      </Button>
      <div className="h-px bg-border" />
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          className={cn(
            "group min-h-[36px] gap-px rounded-[4px] shadow-[0px_1px_4px_rgba(12,12,13,0.05)] transition-colors",
            isCollapsed 
              ? "w-full justify-center p-[2px]" 
              : "justify-start pl-[2px] pr-[8px] py-[2px] hover:bg-[#e0e5ec]"
          )}
          onClick={() => openFlyout('catalog')}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip p-[10px]">
            <Library className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
          </div>
          {!isCollapsed && (
            <span className="truncate text-sm leading-4 text-[#404040]">Catalog</span>
          )}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "group min-h-[36px] gap-px rounded-[4px] shadow-[0px_1px_4px_rgba(12,12,13,0.05)] transition-colors",
            isCollapsed 
              ? "w-full justify-center p-[2px]" 
              : "justify-start pl-[2px] pr-[8px] py-[2px] hover:bg-[#e0e5ec]"
          )}
          onClick={() => openFlyout('workspaces')}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip p-[10px]">
            <Grid3x3 className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
          </div>
          {!isCollapsed && (
            <span className="truncate text-sm leading-4 text-[#404040]">Workspaces</span>
          )}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "group min-h-[36px] gap-px rounded-[4px] shadow-[0px_1px_4px_rgba(12,12,13,0.05)] transition-colors",
            isCollapsed 
              ? "w-full justify-center p-[2px]" 
              : "justify-start pl-[2px] pr-[8px] py-[2px] hover:bg-[#e0e5ec]"
          )}
          onClick={() => openFlyout('more')}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip p-[10px]">
            <MoreHorizontal className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
          </div>
          {!isCollapsed && (
            <span className="truncate text-sm leading-4 text-[#404040]">More</span>
          )}
        </Button>
      </div>
    </div>
  )
}
