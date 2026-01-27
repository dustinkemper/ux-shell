import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTabStore } from '@/stores/tabStore'
import type { Tab } from '@/types'
import TabItem from './TabItem'
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
  const { tabs, activeTabId, openPageTab, reorderTabs } = useTabStore()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

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

  // Check scroll position and update button visibility
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1) // -1 for rounding
  }

  // Check scroll position on mount and when tabs change
  useEffect(() => {
    checkScrollPosition()
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', checkScrollPosition)
    const resizeObserver = new ResizeObserver(checkScrollPosition)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', checkScrollPosition)
      resizeObserver.disconnect()
    }
  }, [tabs])

  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: -200, behavior: 'smooth' })
  }

  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollBy({ left: 200, behavior: 'smooth' })
  }

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

  return (
    <div className="relative flex flex-1 items-center min-w-0">
      {/* Left scroll button and gradient */}
      {canScrollLeft && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#737f85]/40 to-transparent pointer-events-none z-10" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 h-11 w-8 rounded-none z-20 bg-[#737f85] text-white shadow-sm hover:bg-[#5f6a6f] hover:text-white"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </>
      )}

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
                <SortableTabItem
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeTabId}
                />
              ))}
              {/* New tab button inside scroll - only when no overflow */}
              {!canScrollRight && (
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

      {/* Right scroll button and gradient - positioned before new tab button when overflow */}
      {canScrollRight && (
        <>
          <div className="absolute right-[44px] top-0 bottom-0 w-8 bg-gradient-to-l from-[#737f85]/40 to-transparent pointer-events-none z-10" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-[44px] h-11 w-8 rounded-none z-20 bg-[#737f85] text-white shadow-sm hover:bg-[#5f6a6f] hover:text-white"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* New tab button - outside scroll area when overflow, positioned next to ToolbarGroup */}
      {canScrollRight && (
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

