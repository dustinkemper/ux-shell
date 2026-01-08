import type React from 'react'

// Asset types
export type AssetType =
  | 'connection'
  | 'pipeline'
  | 'analytics-app'
  | 'automation'
  | 'dataflow'
  | 'data-product'
  | 'knowledge-base'
  | 'monitor-view'
  | 'script'
  | 'predict'
  | 'table-recipe'
  | 'glossary'
  | 'ai-assistant'
  | 'workspace'
  | 'folder'

export interface Asset {
  id: string
  name: string
  type: AssetType
  icon?: string
  parentId?: string
  children?: Asset[]
  isPinned?: boolean
}

// Tab types
export interface Tab {
  id: string
  label: string
  icon?: string
  assetId?: string
  isLocked: boolean
  content?: React.ReactNode
}

// Sidebar state
export type SidebarState = 'expanded' | 'collapsed' | 'minimized'

export type FlyoutType = 'catalog' | 'workspaces' | 'more' | null

// Navigation state
export interface NavigationState {
  currentRoute?: string
  selectedAsset?: Asset
}

