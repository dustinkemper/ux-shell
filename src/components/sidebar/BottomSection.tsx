import { Bell, BookOpen, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useSidebarStore } from '@/stores/sidebarStore'
import { cn } from '@/lib/utils'

export default function BottomSection() {
  const { state } = useSidebarStore()
  const isCollapsed = state === 'collapsed'

  return (
    <div className="flex flex-col gap-1 border-t border-border px-1 py-2">
      <Button variant="ghost" className={cn(
        "group min-h-[36px] gap-px rounded-[4px] shadow-[0px_1px_4px_rgba(12,12,13,0.05)] transition-colors",
        isCollapsed 
          ? "w-full justify-center p-[2px]" 
          : "justify-start pl-[2px] pr-[8px] py-[2px] hover:bg-[#e0e5ec]"
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip p-[10px]">
          <Bell className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
        </div>
        {!isCollapsed && (
          <span className="truncate text-sm leading-4 text-[#404040]">Notifications</span>
        )}
        {/* Badge can be conditionally rendered here when needed, e.g.: */}
        {/* {badgeCount > 0 && (
          <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 text-xs">
            {badgeCount}
          </Badge>
        )} */}
      </Button>
      <Button variant="ghost" className={cn(
        "group min-h-[36px] gap-px rounded-[4px] shadow-[0px_1px_4px_rgba(12,12,13,0.05)] transition-colors",
        isCollapsed 
          ? "w-full justify-center p-[2px]" 
          : "justify-start pl-[2px] pr-[8px] py-[2px] hover:bg-[#e0e5ec]"
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip p-[10px]">
          <BookOpen className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
        </div>
        {!isCollapsed && (
          <span className="truncate text-sm leading-4 text-[#404040]">Learning Center</span>
        )}
      </Button>
      <Button variant="ghost" className={cn(
        "group min-h-[36px] gap-px rounded-[4px] shadow-[0px_1px_4px_rgba(12,12,13,0.05)] transition-colors",
        isCollapsed 
          ? "w-full justify-center p-[2px]" 
          : "justify-start pl-[2px] pr-[8px] py-[2px] hover:bg-[#e0e5ec]"
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip p-[10px]">
          <Settings className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
        </div>
        {!isCollapsed && (
          <span className="truncate text-sm leading-4 text-[#404040]">Preferences</span>
        )}
      </Button>
      <Button variant="ghost" className={cn(
        "group min-h-[36px] gap-px rounded-[4px] shadow-[0px_1px_4px_rgba(12,12,13,0.05)] transition-colors",
        isCollapsed 
          ? "w-full justify-center p-[2px]" 
          : "justify-start pl-[2px] pr-[8px] py-[2px] hover:bg-[#e0e5ec]"
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip p-[10px]">
          <Avatar className="h-4 w-4 shrink-0">
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
        {!isCollapsed && (
          <span className="truncate text-sm leading-4 text-[#404040]">Anna Purna</span>
        )}
      </Button>
    </div>
  )
}
