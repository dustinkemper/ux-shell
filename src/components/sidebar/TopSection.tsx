import { Plus, Library, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/stores/sidebarStore'
import { useTabStore } from '@/stores/tabStore'
import { cn } from '@/lib/utils'

export default function TopSection() {
  const { state, flyoutType, openFlyout } = useSidebarStore()

  const handleCreateNew = () => {
    const { openPageTab } = useTabStore.getState()
    openPageTab('asset-type-selector', 'Create New', 'Plus')
  }

  const isCollapsed = state === 'collapsed'

  const isCatalogActive = flyoutType === 'catalog'
  const isMoreActive = flyoutType === 'more'

  return (
    <div className={cn(
      "flex flex-col gap-[4px]",
      isCollapsed ? "p-[4px]" : "p-3"
    )}>
      <Button
        size={undefined}
        onClick={handleCreateNew}
        className={cn(
          "bg-green-600 text-white hover:bg-green-700 h-[36px] font-normal",
          isCollapsed ? "w-[36px] justify-center" : "w-full justify-start gap-2"
        )}
        style={{
          paddingLeft: isCollapsed ? '4px' : '8px',
          paddingRight: isCollapsed ? '4px' : '8px',
          paddingTop: '0px',
          paddingBottom: '0px'
        }}
      >
        <Plus className="h-4 w-4 shrink-0" />
        {!isCollapsed && <span className="text-sm">Create new</span>}
      </Button>
      <Button
        variant="ghost"
        size={undefined}
        className={cn(
          "group gap-px rounded-[4px] border border-transparent transition-colors font-normal h-[36px]",
          isCatalogActive ? "bg-[#ebf1ff] border-[#d6e7ff]" : "hover:bg-[#e0e5ec]",
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
        onClick={() => openFlyout('catalog')}
      >
        <Library className={cn(
          "h-4 w-4 shrink-0",
          isCatalogActive
            ? "text-[#225a94]"
            : "text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]",
          isCollapsed ? "" : "mr-2"
        )} />
        {!isCollapsed && (
          <span className={cn(
            "truncate text-sm leading-4",
            isCatalogActive ? "text-[#225a94] font-medium" : "text-[#404040]"
          )}>
            Catalog
          </span>
        )}
      </Button>
      <Button
        variant="ghost"
        size={undefined}
        className={cn(
          "group gap-px rounded-[4px] border border-transparent transition-colors font-normal h-[36px]",
          isMoreActive ? "bg-[#ebf1ff] border-[#d6e7ff]" : "hover:bg-[#e0e5ec]",
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
        onClick={() => openFlyout('more')}
      >
        <MoreHorizontal className={cn(
          "h-4 w-4 shrink-0",
          isMoreActive
            ? "text-[#225a94]"
            : "text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]",
          isCollapsed ? "" : "mr-2"
        )} />
        {!isCollapsed && (
          <span className={cn(
            "truncate text-sm leading-4",
            isMoreActive ? "text-[#225a94] font-medium" : "text-[#404040]"
          )}>
            More
          </span>
        )}
      </Button>
    </div>
  )
}
