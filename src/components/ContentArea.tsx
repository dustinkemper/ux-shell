import { useTabStore } from '@/stores/tabStore'

export default function ContentArea() {
  const { tabs, activeTabId } = useTabStore()
  const activeTab = tabs.find((t) => t.id === activeTabId)

  return (
    <div className="flex h-full w-full items-center justify-center bg-white">
      {activeTab ? (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold">{activeTab.label}</h2>
          <p className="text-muted-foreground">
            Content for {activeTab.label} will be displayed here
          </p>
        </div>
      ) : (
        <div className="text-muted-foreground">No tab selected</div>
      )}
    </div>
  )
}

