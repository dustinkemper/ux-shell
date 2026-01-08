import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTabStore } from '@/stores/tabStore'
import type { Tab } from '@/types'
import TabItem from './TabItem'
import TabOverflowMenu from './TabOverflowMenu'
import { useRef, useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableTabItemProps {
  tab: Tab
  isActive: boolean
  index: number
}

function SortableTabItem({ tab, isActive, index }: SortableTabItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: tab.id,
      disabled: tab.isLocked, // Home tab is not draggable
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      {tab.isLocked ? (
        <TabItem tab={tab} isActive={isActive} />
      ) : (
        <div {...attributes} {...listeners} style={{ cursor: 'grab' }}>
          <TabItem tab={tab} isActive={isActive} />
        </div>
      )}
    </div>
  )
}

export default function TabsRegion() {
  const { tabs, activeTabId, openTab, reorderTabs } = useTabStore()
  const [visibleTabs, setVisibleTabs] = useState(tabs)
  const [overflowTabs, setOverflowTabs] = useState<typeof tabs>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const tabsContainerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    // First, show all tabs to measure them
    setVisibleTabs(tabs)
    setOverflowTabs([])
    
    const updateVisibleTabs = () => {
      if (!containerRef.current || !tabsContainerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const toolbarGroup = containerRef.current.parentElement?.querySelector('[data-toolbar-group]') as HTMLElement
      const toolbarWidth = toolbarGroup?.offsetWidth || 132
      const plusButtonWidth = 44
      const overflowMenuWidth = 32
      const availableWidth = containerWidth - toolbarWidth - plusButtonWidth
      
      // Measure tab widths from rendered tabs (they should be at natural width since no flex-1)
      const tabElements = tabsContainerRef.current.querySelectorAll('[data-tab-item]')
      
      if (tabElements.length === 0 || tabElements.length !== tabs.length) {
        // Tabs not fully rendered yet
        return
      }
      
      // Get natural widths from rendered tabs
      const tabWidths: number[] = []
      Array.from(tabElements).forEach((el) => {
        const element = el as HTMLElement
        tabWidths.push(element.offsetWidth || 80)
      })
      
      const visible: typeof tabs = []
      const overflow: typeof tabs = []
      let totalWidth = 0
      
      // Home tab is always visible
      if (tabs.length > 0) {
        visible.push(tabs[0])
        totalWidth += tabWidths[0] || 100
      }
      
      // Try to fit as many tabs as possible
      for (let index = 1; index < tabs.length; index++) {
        const tab = tabs[index]
        const tabWidth = tabWidths[index] || 80
        
        // Check if we can fit this tab
        // If this would be the first tab in overflow, we need space for overflow menu
        const wouldBeFirstOverflow = overflow.length === 0
        const overflowMenuSpace = wouldBeFirstOverflow ? overflowMenuWidth : 0
        
        if (totalWidth + tabWidth + overflowMenuSpace <= availableWidth) {
          visible.push(tab)
          totalWidth += tabWidth
        } else {
          // Can't fit this tab, put it and all remaining tabs in overflow
          overflow.push(...tabs.slice(index))
          break
        }
      }

      setVisibleTabs(visible)
      setOverflowTabs(overflow)
    }

    // Debounce function to prevent excessive updates
    let rafId: number | null = null
    const debouncedUpdate = () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      rafId = requestAnimationFrame(updateVisibleTabs)
    }

    // Use ResizeObserver for more accurate measurements
    const resizeObserver = new ResizeObserver(() => {
      debouncedUpdate()
    })
    
    // Observe the container for size changes
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
      
      // Also observe the parent TabBar container to catch viewport changes
      const tabBarContainer = containerRef.current.parentElement
      if (tabBarContainer) {
        resizeObserver.observe(tabBarContainer)
      }
    }
    
    // Also observe the toolbar group to catch when it changes size
    // Use a small delay to ensure it's rendered
    const observeToolbar = () => {
      const toolbarGroup = containerRef.current?.parentElement?.querySelector('[data-toolbar-group]') as HTMLElement
      if (toolbarGroup) {
        resizeObserver.observe(toolbarGroup)
      }
    }
    observeToolbar()
    // Also try after a short delay in case it's not rendered yet
    const toolbarTimeoutId = setTimeout(observeToolbar, 100)
    
    // Observe the tabs container to catch when tab sizes change
    if (tabsContainerRef.current) {
      resizeObserver.observe(tabsContainerRef.current)
    }
    
    // Also update on window resize (viewport changes)
    window.addEventListener('resize', debouncedUpdate)
    
    // Calculate overflow after tabs are rendered
    const timeoutId = setTimeout(updateVisibleTabs, 50)
    
    return () => {
      resizeObserver.disconnect()
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      clearTimeout(timeoutId)
      clearTimeout(toolbarTimeoutId)
      window.removeEventListener('resize', debouncedUpdate)
    }
  }, [tabs])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = tabs.findIndex((tab) => tab.id === active.id)
    const newIndex = tabs.findIndex((tab) => tab.id === over.id)

    // Don't allow reordering if either index is 0 (Home tab)
    if (oldIndex === 0 || newIndex === 0) return

    reorderTabs(oldIndex, newIndex)
  }

  const handleNewTab = () => {
    // Placeholder: Open new tab dialog
    const newAsset = {
      id: `new-${Date.now()}`,
      name: 'New Tab',
      type: 'workspace' as const,
    }
    openTab(newAsset)
  }

  return (
    <div ref={containerRef} className="flex flex-1 items-center overflow-hidden min-w-0">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleTabs.map((t) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div ref={tabsContainerRef} className="flex flex-1 items-center min-w-0 overflow-hidden">
            {/* Render visible tabs only - measurement happens in useEffect with all tabs rendered initially */}
            {visibleTabs.map((tab, index) => (
              <div key={tab.id} className="flex-shrink-0">
                <SortableTabItem
                  tab={tab}
                  isActive={tab.id === activeTabId}
                  index={index}
                />
              </div>
            ))}
            {overflowTabs.length > 0 && (
              <div className="flex-shrink-0">
                <TabOverflowMenu
                  overflowTabs={overflowTabs.map((t) => ({
                    id: t.id,
                    label: t.label,
                  }))}
                />
              </div>
            )}
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-none border-r border-border"
                onClick={handleNewTab}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

