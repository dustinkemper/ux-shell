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
  description?: string
  parentId?: string
  children?: Asset[]
  isPinned?: boolean
  // Extended metadata for different asset types
  connectionMetadata?: ConnectionMetadata
  pipelineMetadata?: PipelineMetadata
  // Catalog-specific fields
  quality?: number
  owner?: string
  modified?: Date
  location?: string
  tags?: string[]
  collections?: string[]
}

// Connection-specific metadata
export interface ConnectionMetadata {
  connectionType: 'database' | 'data-warehouse' | 'lakehouse' | 'api' | 'file'
  host?: string
  port?: number
  database?: string
  username?: string
  schema?: string
  account?: string
  warehouse?: string
  role?: string
  apiKey?: string
  clientId?: string
  clientSecret?: string
  accountId?: string
  // Note: In real app, password would be encrypted/stored securely
}

// Pipeline-specific metadata
export interface PipelineMetadata {
  sourceConnectionId: string
  destinationConnectionId: string
  selectedTableIds: string[]
  description?: string
  workspace?: string
}

// Table interface for pipeline table selection
export interface Table {
  id: string
  name: string
  datatype?: string
  primaryKeyColumns?: string[]
  foreignKeyColumns?: string[]
  rowCount?: number
  schema?: string
  otherMetadata?: Record<string, unknown>
}

// Tab types
export type TabState = 'default' | 'hover' | 'focus' | 'edit' | 'loading' | 'error'
export type TabStatus = 'clean' | 'dirty' | 'error' | null

export type PageType =
  | 'catalog'
  | 'catalog-filtered'
  | 'asset-type-selector'
  | 'create-connection'
  | 'create-pipeline'
  | 'create-asset'

export interface Tab {
  id: string
  label: string
  icon?: string
  assetId?: string
  pageType?: PageType // For page tabs (not asset tabs)
  pageData?: {
    assetType?: AssetType
  }
  isLocked: boolean
  content?: React.ReactNode
  state?: TabState
  status?: TabStatus
}

// Sidebar state
export type SidebarState = 'expanded' | 'collapsed' | 'minimized'

export type FlyoutType = 'catalog' | 'more' | null

// Navigation state
export interface NavigationState {
  currentRoute?: string
  selectedAsset?: Asset
}

