import { X, MoreHorizontal, File, AlertCircle, Loader2, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTabStore } from '@/stores/tabStore'
import { useCatalogStore } from '@/stores/catalogStore'
import type { Tab, AssetType } from '@/types'
import { cn } from '@/lib/utils'
import { getAssetIcon, getPageIcon, getIconByName } from '@/lib/iconUtils'
import { useState } from 'react'

interface TabItemProps {
  tab: Tab
  isActive: boolean
}

export default function TabItem({ tab, isActive }: TabItemProps) {
  const {
    tabs,
    closeTab,
    closeOtherTabs,
    closeTabsLeft,
    closeTabsRight,
    setActiveTab,
  } = useTabStore()
  const { getAsset } = useCatalogStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Get the appropriate icon component
  const isAssetType = (value: string): value is AssetType => {
    return [
      'connection',
      'pipeline',
      'analytics-app',
      'automation',
      'dataflow',
      'data-product',
      'knowledge-base',
      'monitor-view',
      'script',
      'predict',
      'table-recipe',
      'glossary',
      'ai-assistant',
      'workspace',
      'folder',
    ].includes(value)
  }

  const getIconComponent = () => {
    if (tab.id === 'home') {
      return Home
    }
    
    // If an explicit icon is set, prefer it (including asset type icons)
    if (tab.icon) {
      if (isAssetType(tab.icon)) {
        return getAssetIcon(tab.icon)
      }
      return getIconByName(tab.icon)
    }

    // For page tabs, use page type icon
    if (tab.pageType) {
      return getPageIcon(tab.pageType)
    }
    
    // For asset tabs, get icon from asset type
    if (tab.assetId) {
      const asset = getAsset(tab.assetId)
      if (asset) {
        return getAssetIcon(asset.type)
      }
    }
    
    // Default fallback
    return File
  }

  const IconComponent = getIconComponent()

  // Determine the current state
  const state = tab.state || (isHovered ? 'hover' : 'default')
  const isEditState = state === 'edit' || isEditing
  const isLoadingState = state === 'loading'
  const isErrorState = state === 'error'
  const tabIndex = tabs.findIndex((item) => item.id === tab.id)
  const hasClosableLeft = tabs.some(
    (item, index) => index < tabIndex && !item.isLocked
  )
  const hasClosableRight = tabs.some(
    (item, index) => index > tabIndex && !item.isLocked
  )
  const hasClosableOthers = tabs.some(
    (item, index) => index !== tabIndex && !item.isLocked
  )

  const handleClick = () => {
    setActiveTab(tab.id)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    closeTab(tab.id)
  }

  // Figma color values
  const bgDefault = '#f7fafb'
  const bgSelected = 'white'
  const bgLoading = '#e6e6e6'
  const borderColor = '#c7cfd1'
  const textPrimary = '#18191a'
  const textSecondary = '#5e656a'

  // Determine background color
  const getBackgroundColor = () => {
    if (isLoadingState || isErrorState) return bgLoading
    if (isActive) return bgSelected
    return bgDefault
  }

  // Determine border style
  const getBorderStyle = () => {
    if (isActive) {
      return 'border-r border-t-0 border-b-0' // Only right border when selected
    }
    return 'border-r border-b' // Right and bottom border when not selected
  }

  // Determine text color
  const getTextColor = () => {
    if (isLoadingState && !isActive) return textSecondary
    return textPrimary
  }

  return (
    <div
      data-tab-item
      className={cn(
        'group relative flex h-11 min-w-0 max-w-[256px] items-center justify-center p-[4px] transition-colors',
        getBorderStyle()
      )}
      style={{
        backgroundColor: getBackgroundColor(),
        borderColor: borderColor,
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'flex min-w-0 flex-1 items-center gap-[4px] rounded-[4px]',
          // Hover state background
          (isHovered || state === 'hover') && !isActive && 'bg-[#dfe5e6]',
          // Edit state text background
          isEditState && 'bg-[#bcd5fd]'
        )}
      >
        {/* Icon */}
        <div className="flex shrink-0 items-center justify-center overflow-clip rounded-[4px] p-[8px]">
          <IconComponent 
            className="h-5 w-5" 
            style={{ 
              width: '20px',
              height: '20px',
              color: isActive || state === 'hover' || state === 'focus' || isEditState 
                ? textPrimary 
                : textSecondary 
            }} 
          />
        </div>

        {/* Label - with edit state background */}
        {isEditState ? (
          <div className="flex min-w-0 flex-1 items-center justify-center px-0 py-[6px] bg-[#bcd5fd]">
            <span
              className={cn(
                'truncate text-sm font-normal leading-none',
                'text-[#18191a]'
              )}
            >
              {tab.label}
            </span>
          </div>
        ) : (
          <span
            className={cn(
              'truncate text-sm font-normal leading-none min-w-0 flex-1',
              'text-[14px]'
            )}
            style={{
              color: getTextColor(),
            }}
          >
            {tab.label}
          </span>
        )}

        {/* Status indicators or action buttons */}
        <div className="ml-auto flex items-center gap-[4px]">
          {/* Loading state */}
          {isLoadingState && (
            <div className="flex items-center justify-center p-[8px] rounded-[4px] size-[36px]">
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: textPrimary }} />
            </div>
          )}

          {/* Error state */}
          {isErrorState && (
            <div className="flex items-center justify-center p-[8px] rounded-[4px] size-[36px]">
              <AlertCircle className="h-4 w-4" style={{ color: textPrimary }} />
            </div>
          )}

          {/* Status badges */}
          {!isLoadingState && !isErrorState && tab.status && (
            <div className="flex items-center justify-center p-[8px] rounded-[4px] size-[36px]">
              {tab.status === 'clean' && (
                <div className="h-2 w-2 rounded-full border border-gray-400" />
              )}
              {tab.status === 'dirty' && (
                <div className="h-2 w-2 rounded-full bg-red-500" />
              )}
              {tab.status === 'error' && (
                <div className="h-2 w-2 rounded-full bg-red-500 border border-red-600" />
              )}
            </div>
          )}

          {/* Action buttons - show on hover or when active */}
          <div className={cn(
            'flex items-center gap-[2px] transition-opacity',
            (isHovered || isActive) ? 'opacity-100' : 'opacity-0'
          )}>
            {/* Menu button - only show when not in edit state or when selected */}
            {(!isEditState || isActive) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-[4px] p-[8px] hover:bg-gray-200/50"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => closeOtherTabs(tab.id)}
                    disabled={!hasClosableOthers}
                  >
                    Close All Others
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => closeTabsLeft(tab.id)}
                    disabled={!hasClosableLeft}
                  >
                    Close to Left
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => closeTabsRight(tab.id)}
                    disabled={!hasClosableRight}
                  >
                    Close to Right
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Close button or Edit clear button */}
            {isEditState ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-[4px] p-[8px] hover:bg-gray-200/50"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsEditing(false)
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              !tab.isLocked && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[4px] p-[8px] hover:bg-gray-200/50"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleClose(e)
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
