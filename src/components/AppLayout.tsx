import SidebarNavigation from './SidebarNavigation'
import TabBar from './TabBar'
import ContentArea from './ContentArea'
import { useSidebarStore } from '@/stores/sidebarStore'

export default function AppLayout() {
  const { state } = useSidebarStore()
  const isMinimized = state === 'minimized'

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {!isMinimized && <SidebarNavigation />}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TabBar />
          <ContentArea />
        </div>
      </div>
    </div>
  )
}
