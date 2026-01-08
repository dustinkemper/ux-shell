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
    const updateVisibleTabs = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const toolbarGroup = containerRef.current.parentElement?.querySelector('[data-toolbar-group]') as HTMLElement
      const toolbarWidth = toolbarGroup?.offsetWidth || 132
      const plusButtonWidth = 44
      const overflowMenuWidth = 32 // Width of overflow menu button
      const availableWidth = containerWidth - toolbarWidth - plusButtonWidth
      
      const visible: typeof tabs = []
      const overflow: typeof tabs = []
      
      // Measure actual tab widths from DOM if available
      const tabElements = containerRef.current.querySelectorAll('[data-tab-item]')
      let totalWidth = 0
      
      for (let index = 0; index < tabs.length; index++) {
        const tab = tabs[index]
        
        // Home tab is always visible
        if (index === 0) {
          visible.push(tab)
          const homeTabElement = tabElements[index] as HTMLElement
          totalWidth += homeTabElement?.offsetWidth || 100
          continue
        }

        // Try to get actual width from DOM, otherwise estimate based on label length
        const tabElement = tabElements[index] as HTMLElement
        // Estimate: icon (20px) + padding (16px) + text (8px per char) + borders (2px) + close buttons area (40px)
        const estimatedWidth = Math.min(256, Math.max(80, tab.label.length * 7 + 78))
        const tabWidth = tabElement?.offsetWidth || estimatedWidth
        
        // Check if adding this tab would exceed available width
        // If this would be the first overflow tab, account for overflow menu width
        const spaceNeeded = totalWidth + tabWidth + (overflow.length === 0 ? overflowMenuWidth : 0)
        const wouldExceed = spaceNeeded > availableWidth
        
        if (!wouldExceed) {
          visible.push(tab)
          totalWidth += tabWidth
        } else {
          // Once we start overflowing, all remaining tabs go to overflow
          overflow.push(...tabs.slice(index))
          break
        }
      }

      setVisibleTabs(visible)
      setOverflowTabs(overflow)
    }

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      updateVisibleTabs()
    })
    
    window.addEventListener('resize', updateVisibleTabs)
    
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateVisibleTabs)
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
    <div ref={containerRef} className="flex flex-1 items-center overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleTabs.map((t) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-1 items-center">
            {visibleTabs.map((tab, index) => (
              <SortableTabItem
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTabId}
                index={index}
              />
            ))}
            {overflowTabs.length > 0 && (
              <TabOverflowMenu
                overflowTabs={overflowTabs.map((t) => ({
                  id: t.id,
                  label: t.label,
                }))}
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-none border-r border-border"
              onClick={handleNewTab}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

