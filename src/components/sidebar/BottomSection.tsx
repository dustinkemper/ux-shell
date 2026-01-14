import { Bell, GraduationCap, Settings2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useSidebarStore } from '@/stores/sidebarStore'
import { cn } from '@/lib/utils'
import avatarAnna from '@/img/avatar-anna.png'

export default function BottomSection() {
  const { state } = useSidebarStore()
  const isCollapsed = state === 'collapsed'

  return (
    <div className={cn(
      "flex flex-col gap-[4px] py-2",
      isCollapsed ? "px-[4px]" : "px-3"
    )}>
      <Button 
        variant="ghost" 
        size={undefined}
        className={cn(
          "group gap-px rounded-[4px] transition-colors font-normal hover:bg-[#e0e5ec] h-[36px]",
          isCollapsed 
            ? "w-[36px] justify-center" 
            : "w-full justify-start"
        )}
        style={{
          paddingLeft: isCollapsed ? '4px' : '8px',
          paddingRight: isCollapsed ? '4px' : '8px',
          paddingTop: '0px',
          paddingBottom: '0px'
        }}
      >
        <Bell className={cn(
          "h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]",
          isCollapsed ? "" : "mr-2"
        )} />
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
      <Button 
        variant="ghost" 
        size={undefined}
        className={cn(
          "group gap-px rounded-[4px] transition-colors font-normal hover:bg-[#e0e5ec] h-[36px]",
          isCollapsed 
            ? "w-[36px] justify-center" 
            : "w-full justify-start"
        )}
        style={{
          paddingLeft: isCollapsed ? '4px' : '8px',
          paddingRight: isCollapsed ? '4px' : '8px',
          paddingTop: '0px',
          paddingBottom: '0px'
        }}
      >
        <GraduationCap className={cn(
          "h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]",
          isCollapsed ? "" : "mr-2"
        )} />
        {!isCollapsed && (
          <span className="truncate text-sm leading-4 text-[#404040]">Learning Center</span>
        )}
      </Button>
      <Button 
        variant="ghost" 
        size={undefined}
        className={cn(
          "group gap-px rounded-[4px] transition-colors font-normal hover:bg-[#e0e5ec] h-[36px]",
          isCollapsed 
            ? "w-[36px] justify-center" 
            : "w-full justify-start"
        )}
        style={{
          paddingLeft: isCollapsed ? '4px' : '8px',
          paddingRight: isCollapsed ? '4px' : '8px',
          paddingTop: '0px',
          paddingBottom: '0px'
        }}
      >
        <Settings2 className={cn(
          "h-4 w-4 shrink-0 text-[rgba(109,109,109,1)] group-hover:text-[rgba(64,64,64,1)]",
          isCollapsed ? "" : "mr-2"
        )} />
        {!isCollapsed && (
          <span className="truncate text-sm leading-4 text-[#404040]">Preferences</span>
        )}
      </Button>
      <Button 
        variant="ghost" 
        size={undefined}
        className={cn(
          "group rounded-[4px] transition-colors font-normal hover:bg-[#e0e5ec] h-[36px]",
          isCollapsed 
            ? "w-[36px] justify-center gap-px" 
            : "w-full justify-start gap-2"
        )}
        style={{
          paddingLeft: isCollapsed ? '4px' : '8px',
          paddingRight: isCollapsed ? '4px' : '8px',
          paddingTop: '0px',
          paddingBottom: '0px'
        }}
      >
        <Avatar className={cn(
          "h-8 w-8 shrink-0",
          isCollapsed ? "" : "mr-2"
        )}>
          <AvatarImage src={avatarAnna} alt="User" />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <span className="truncate text-sm leading-4 text-[#404040]">Anna Purna</span>
        )}
      </Button>
    </div>
  )
}
