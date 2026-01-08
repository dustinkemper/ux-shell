import { useSidebarStore } from '@/stores/sidebarStore'
import SidebarHeader from './sidebar/SidebarHeader'
import TopSection from './sidebar/TopSection'
import MiddleSection from './sidebar/MiddleSection'
import BottomSection from './sidebar/BottomSection'
import FlyoutPanel from './sidebar/FlyoutPanel'
import { cn } from '@/lib/utils'

export default function SidebarNavigation() {
  const { state, flyoutType } = useSidebarStore()

  if (state === 'minimized') {
    return (
      <div className="flex h-full w-11 flex-col border-r border-border bg-[#fafafc]">
        <SidebarHeader />
      </div>
    )
  }

  return (
    <div className="relative flex h-full">
      <div
        className={cn(
          'flex h-full flex-col border-r border-[rgba(0,0,0,0.15)] bg-[#f7fafb] transition-all',
          state === 'expanded' ? 'w-[283px]' : 'w-[45px]'
        )}
        style={{
          width: state === 'expanded' ? '283px' : '45px'
        }}
      >
        <SidebarHeader />
        <TopSection />
        <MiddleSection />
        <BottomSection />
      </div>
      {flyoutType && <FlyoutPanel />}
    </div>
  )
}
