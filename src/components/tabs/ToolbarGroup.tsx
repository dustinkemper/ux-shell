import { Search, HelpCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ToolbarGroup() {
  return (
    <div 
      data-toolbar-group
      className="flex shrink-0 items-center gap-0 border-l border-b border-border bg-[#dfe5e6]"
    >
      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-none">
        <Search className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-none">
        <HelpCircle className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-none">
        <Sparkles className="h-4 w-4" />
      </Button>
    </div>
  )
}

