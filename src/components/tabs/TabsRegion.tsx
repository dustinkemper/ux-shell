import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTabStore } from '@/stores/tabStore'
import type { Tab } from '@/types'
import TabItem from './TabItem'
import TabOverflowMenu from './TabOverflowMenu'
import { useRef, useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableTabItemProps {
  tab: Tab
  isActive: boolean
}

function SortableTabItem({ tab, isActive }: SortableTabItemProps) {
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
  const { tabs, activeTabId, openPageTab, reorderTabs, setActiveTab } =
    useTabStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef(new Map<string, HTMLDivElement>())
  const [overflowTabs, setOverflowTabs] = useState<Tab[]>([])
  const [hasOverflow, setHasOverflow] = useState(false)

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

  const updateOverflowTabs = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, clientWidth, scrollWidth } = container
    const isOverflowing = scrollWidth > clientWidth + 1
    setHasOverflow(isOverflowing)
    if (!isOverflowing) {
      setOverflowTabs([])
      return
    }

    const epsilon = 1
    const visibleLeft = scrollLeft - epsilon
    const visibleRight = scrollLeft + clientWidth + epsilon
    const nextOverflowTabs = tabs.filter((tab) => {
      const tabNode = tabRefs.current.get(tab.id)
      if (!tabNode) return false
      const tabLeft = tabNode.offsetLeft
      const tabRight = tabLeft + tabNode.offsetWidth
      const isFullyVisible =
        tabLeft >= visibleLeft && tabRight <= visibleRight
      return !isFullyVisible
    })

    setOverflowTabs(nextOverflowTabs)
  }

  // Check overflow on mount and when tabs change
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScrollOrResize = () => {
      requestAnimationFrame(updateOverflowTabs)
    }

    handleScrollOrResize()
    container.addEventListener('scroll', handleScrollOrResize, { passive: true })
    const resizeObserver = new ResizeObserver(handleScrollOrResize)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', handleScrollOrResize)
      resizeObserver.disconnect()
    }
  }, [tabs])

  useEffect(() => {
    if (!activeTabId || !hasOverflow) return
    const container = scrollContainerRef.current
    if (!container) return
    const tabNode = tabRefs.current.get(activeTabId)
    if (!tabNode) return

    const { scrollLeft, clientWidth } = container
    const tabLeft = tabNode.offsetLeft
    const tabRight = tabLeft + tabNode.offsetWidth
    const visibleLeft = scrollLeft
    const visibleRight = scrollLeft + clientWidth

    if (tabLeft < visibleLeft || tabRight > visibleRight) {
      tabNode.scrollIntoView({ behavior: 'smooth', inline: 'center' })
    }
  }, [activeTabId, hasOverflow, tabs])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = tabs.findIndex((tab) => tab.id === active.id)
    const newIndex = tabs.findIndex((tab) => tab.id === over.id)

    // Don't allow reordering if either index is 0 (Home tab)
    if (oldIndex === 0 || newIndex === 0) return

    // Update state immediately - @dnd-kit will handle the animation
    reorderTabs(oldIndex, newIndex)
  }

  const handleNewTab = () => {
    openPageTab('asset-type-selector', 'Create New', 'Plus')
  }

  const handleOverflowSelect = (tabId: string) => {
    setActiveTab(tabId)
    const tabNode = tabRefs.current.get(tabId)
    tabNode?.scrollIntoView({ behavior: 'smooth', inline: 'center' })
  }

  return (
    <div className="relative flex flex-1 items-center min-w-0">
      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex flex-1 items-center overflow-x-auto overflow-y-hidden min-w-0 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <SortableContext
            items={tabs.map((t) => t.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex items-center min-w-max">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  ref={(node) => {
                    if (node) {
                      tabRefs.current.set(tab.id, node)
                    } else {
                      tabRefs.current.delete(tab.id)
                    }
                  }}
                  className="flex-shrink-0"
                >
                  <SortableTabItem
                    tab={tab}
                    isActive={tab.id === activeTabId}
                  />
                </div>
              ))}
              {/* New tab button inside scroll - only when no overflow */}
              {!hasOverflow && (
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
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Overflow menu */}
      {hasOverflow && (
        <div className="flex-shrink-0">
          <TabOverflowMenu
            overflowTabs={overflowTabs}
            onSelectTab={handleOverflowSelect}
          />
        </div>
      )}

      {/* New tab button - outside scroll area when overflow, positioned next to ToolbarGroup */}
      {hasOverflow && (
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
      )}

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

