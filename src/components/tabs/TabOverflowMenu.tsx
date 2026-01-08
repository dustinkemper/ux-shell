import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { useTabStore } from '@/stores/tabStore'

interface TabOverflowMenuProps {
  overflowTabs: Array<{ id: string; label: string }>
}

export default function TabOverflowMenu({ overflowTabs }: TabOverflowMenuProps) {
  const { setActiveTab } = useTabStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-11 w-8 border-r rounded-none"
          style={{
            borderColor: 'rgba(0,0,0,0.15)',
          }}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {overflowTabs.map((tab) => (
          <DropdownMenuItem
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

