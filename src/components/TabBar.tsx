import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/stores/sidebarStore'
import TabsRegion from './tabs/TabsRegion'
import ToolbarGroup from './tabs/ToolbarGroup'

export default function TabBar() {
  const { state, toggleMinimize } = useSidebarStore()
  const isMinimized = state === 'minimized'

  return (
    <div className="flex h-[44px] items-center border-b border-border bg-[#fafafc] overflow-visible">
      {isMinimized && (
        <div className="flex shrink-0 items-center border-r border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMinimize}
            className="h-11 w-11"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}
      <TabsRegion />
      <ToolbarGroup />
    </div>
  )
}
