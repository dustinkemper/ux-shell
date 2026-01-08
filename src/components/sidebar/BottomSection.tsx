import { Bell, BookOpen, Settings2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useSidebarStore } from '@/stores/sidebarStore'
import { cn } from '@/lib/utils'

export default function BottomSection() {
  const { state } = useSidebarStore()
  const isCollapsed = state === 'collapsed'

  return (
    <div className="flex flex-col gap-1 py-2">
      <div className={cn("h-[44px] flex items-center", isCollapsed ? "px-1 justify-center" : "px-1")}>
        <Button variant="ghost" className={cn(
          "group gap-px rounded-[4px] transition-colors p-1 font-normal hover:bg-[#e0e5ec]",
          isCollapsed 
            ? "h-[36px] w-[36px] justify-center" 
            : "h-full w-full justify-start"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip">
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
      </div>
      <div className={cn("h-[44px] flex items-center", isCollapsed ? "px-1 justify-center" : "px-1")}>
        <Button variant="ghost" className={cn(
          "group gap-px rounded-[4px] transition-colors p-1 font-normal hover:bg-[#e0e5ec]",
          isCollapsed 
            ? "h-[36px] w-[36px] justify-center" 
            : "h-full w-full justify-start"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip">
            <BookOpen className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
          </div>
          {!isCollapsed && (
            <span className="truncate text-sm leading-4 text-[#404040]">Learning Center</span>
          )}
        </Button>
      </div>
      <div className={cn("h-[44px] flex items-center", isCollapsed ? "px-1 justify-center" : "px-1")}>
        <Button variant="ghost" className={cn(
          "group gap-px rounded-[4px] transition-colors p-1 font-normal hover:bg-[#e0e5ec]",
          isCollapsed 
            ? "h-[36px] w-[36px] justify-center" 
            : "h-full w-full justify-start"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip">
            <Settings2 className="h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]" />
          </div>
          {!isCollapsed && (
            <span className="truncate text-sm leading-4 text-[#404040]">Preferences</span>
          )}
        </Button>
      </div>
      <div className={cn("h-[44px] flex items-center", isCollapsed ? "px-1 justify-center" : "px-1")}>
        <Button variant="ghost" className={cn(
          "group rounded-[4px] transition-colors p-1 font-normal hover:bg-[#e0e5ec]",
          isCollapsed 
            ? "h-[36px] w-[36px] justify-center gap-px" 
            : "h-full w-full justify-start gap-2"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-clip">
            <Avatar className="h-8 w-8 shrink-0">
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
    </div>
  )
}
