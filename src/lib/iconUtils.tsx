import {
  Home,
  File,
  Folder,
  Database,
  Workflow,
  BarChart3,
  Library,
  Plus,
  Code,
  Table2,
  Package,
  BookOpen,
  Eye,
  Brain,
  BookMarked,
  Sparkles,
  LayoutGrid,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import type { AssetType, PageType } from '@/types'

// Icon mapping for asset types
export const getAssetIcon = (type: AssetType): LucideIcon => {
  switch (type) {
    case 'workspace':
    case 'folder':
      return Folder
    case 'connection':
      return Database
    case 'pipeline':
      return Workflow
    case 'analytics-app':
      return BarChart3
    case 'dataflow':
      return Workflow
    case 'table-recipe':
      return Table2
    case 'script':
      return Code
    case 'data-product':
      return Package
    case 'monitor-view':
      return Eye
    case 'glossary':
      return BookOpen
    case 'knowledge-base':
      return BookMarked
    case 'predict':
      return Brain
    case 'ai-assistant':
      return Sparkles
    case 'automation':
      return Workflow
    default:
      return File
  }
}

// Icon mapping for page types
export const getPageIcon = (pageType: PageType): LucideIcon => {
  switch (pageType) {
    case 'catalog':
      return Library
    case 'asset-type-selector':
      return Plus
    case 'create-connection':
      return Database
    case 'create-pipeline':
      return Workflow
    case 'create-asset':
      return Plus
    default:
      return File
  }
}

// Icon mapping for icon name strings (for backward compatibility)
export const getIconByName = (iconName: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    Home,
    File,
    Folder,
    Database,
    Workflow,
    BarChart3,
    Library,
    Plus,
    Code,
    Table2,
    Package,
    BookOpen,
    Eye,
    Brain,
    BookMarked,
    Sparkles,
    LayoutGrid,
    Settings,
  }
  return iconMap[iconName] || File
}
