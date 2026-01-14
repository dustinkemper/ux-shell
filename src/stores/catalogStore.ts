import { create } from 'zustand'
import type { Asset, AssetType } from '@/types'

interface CatalogStore {
  assets: Asset[]
  viewMode: 'grid' | 'list'
  activeFilter: 'all' | 'recent' | 'favorites'
  searchQuery: string
  selectedTypeFilter?: string
  selectedOwnerFilter?: string
  selectedTagsFilter?: string[]
  
  // Actions
  setViewMode: (mode: 'grid' | 'list') => void
  setActiveFilter: (filter: 'all' | 'recent' | 'favorites') => void
  setSearchQuery: (query: string) => void
  setTypeFilter: (type?: string) => void
  setOwnerFilter: (owner?: string) => void
  setTagsFilter: (tags?: string[]) => void
  
  // CRUD operations
  addAsset: (asset: Asset) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
  deleteAsset: (id: string) => void
  getAsset: (id: string) => Asset | undefined
  getAssetsByType: (type: AssetType) => Asset[]
  getConnections: () => Asset[]
  
  // Filtered assets getter
  getFilteredAssets: () => Asset[]
  // Get hierarchical assets (workspaces at top level)
  getHierarchicalAssets: () => Asset[]
}

// Mock initial data - extend existing structure
const initialAssets: Asset[] = [
  {
    id: 'ws1',
    name: 'Workspace 1',
    type: 'workspace',
    owner: 'Ron Swanson',
    modified: new Date('2025-11-17'),
    location: 'Serious Business',
    children: [
      {
        id: 'folder1',
        name: 'Folder 1',
        type: 'folder',
        parentId: 'ws1',
        owner: 'Ron Swanson',
        modified: new Date('2025-11-16'),
        location: 'Serious Business',
        children: [
          { 
            id: 'app1', 
            name: 'Analytics App 1', 
            type: 'analytics-app', 
            parentId: 'folder1',
            owner: 'Ron Swanson',
            modified: new Date('2025-11-15'),
            location: 'Serious Business',
            quality: 82,
          },
          { 
            id: 'pipeline1', 
            name: 'Data Pipeline 1', 
            type: 'pipeline', 
            parentId: 'folder1',
            owner: 'Ron Swanson',
            modified: new Date('2025-11-14'),
            location: 'Serious Business',
            quality: 82,
          },
        ],
      },
      { 
        id: 'app2', 
        name: 'Analytics App 2', 
        type: 'analytics-app', 
        parentId: 'ws1',
        owner: 'Ron Swanson',
        modified: new Date('2025-11-13'),
        location: 'Serious Business',
        quality: 82,
      },
    ],
  },
  {
    id: 'ws2',
    name: 'Workspace 2',
    type: 'workspace',
    owner: 'Ron Swanson',
    modified: new Date('2025-11-12'),
    location: 'Personal',
    children: [
      { 
        id: 'kb1', 
        name: 'Knowledge Base 1', 
        type: 'knowledge-base', 
        parentId: 'ws2',
        owner: 'Ron Swanson',
        modified: new Date('2025-11-11'),
        location: 'Personal',
        quality: 82,
      },
    ],
  },
]

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  assets: initialAssets,
  viewMode: 'list',
  activeFilter: 'all',
  searchQuery: '',
  selectedTypeFilter: undefined,
  selectedOwnerFilter: undefined,
  selectedTagsFilter: undefined,

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTypeFilter: (type) => set({ selectedTypeFilter: type }),
  setOwnerFilter: (owner) => set({ selectedOwnerFilter: owner }),
  setTagsFilter: (tags) => set({ selectedTagsFilter: tags }),

  addAsset: (asset) => {
    const newAsset = {
      ...asset,
      modified: new Date(),
      owner: 'Ron Swanson', // Default owner for new assets
      quality: asset.quality ?? 82, // Default quality
    }
    set((state) => ({
      assets: [...state.assets, newAsset],
    }))
  },

  updateAsset: (id, updates) => {
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === id ? { ...asset, ...updates, modified: new Date() } : asset
      ),
    }))
  },

  deleteAsset: (id) => {
    set((state) => ({
      assets: state.assets.filter((asset) => asset.id !== id),
    }))
  },

  getAsset: (id) => {
    const findAsset = (assets: Asset[]): Asset | undefined => {
      for (const asset of assets) {
        if (asset.id === id) return asset
        if (asset.children) {
          const found = findAsset(asset.children)
          if (found) return found
        }
      }
      return undefined
    }
    return findAsset(get().assets)
  },

  getAssetsByType: (type) => {
    const findAssets = (assets: Asset[]): Asset[] => {
      const result: Asset[] = []
      for (const asset of assets) {
        if (asset.type === type) {
          result.push(asset)
        }
        if (asset.children) {
          result.push(...findAssets(asset.children))
        }
      }
      return result
    }
    return findAssets(get().assets)
  },

  getConnections: () => {
    return get().getAssetsByType('connection')
  },

  getFilteredAssets: () => {
    const { assets, activeFilter, searchQuery, selectedTypeFilter, selectedOwnerFilter, selectedTagsFilter } = get()
    
    // Flatten assets (include children)
    const flattenAssets = (assetList: Asset[]): Asset[] => {
      const result: Asset[] = []
      for (const asset of assetList) {
        result.push(asset)
        if (asset.children) {
          result.push(...flattenAssets(asset.children))
        }
      }
      return result
    }

    let filtered = flattenAssets(assets)

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter((asset) =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    if (selectedTypeFilter) {
      filtered = filtered.filter((asset) => asset.type === selectedTypeFilter)
    }

    // Apply owner filter
    if (selectedOwnerFilter) {
      filtered = filtered.filter((asset) => asset.owner === selectedOwnerFilter)
    }

    // Apply tags filter
    if (selectedTagsFilter && selectedTagsFilter.length > 0) {
      filtered = filtered.filter((asset) =>
        asset.tags?.some((tag) => selectedTagsFilter.includes(tag))
      )
    }

    // Apply active filter (all/recent/favorites)
    if (activeFilter === 'recent') {
      filtered = filtered
        .filter((asset) => asset.modified)
        .sort((a, b) => {
          const dateA = a.modified?.getTime() ?? 0
          const dateB = b.modified?.getTime() ?? 0
          return dateB - dateA
        })
        .slice(0, 20) // Top 20 most recent
    } else if (activeFilter === 'favorites') {
      // For now, we'll use isPinned as favorites indicator
      // In a real app, there would be a separate favorites system
      filtered = filtered.filter((asset) => asset.isPinned)
    }

    return filtered
  },

  getHierarchicalAssets: () => {
    const { assets, activeFilter, searchQuery, selectedTypeFilter, selectedOwnerFilter, selectedTagsFilter } = get()
    
    // Start with workspaces (top-level)
    let hierarchical = assets.filter((asset) => asset.type === 'workspace')

    // Apply search query
    if (searchQuery) {
      const filterHierarchy = (assetList: Asset[]): Asset[] => {
        const result: Asset[] = []
        for (const asset of assetList) {
          const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase())
          
          // Check if any children match
          let filteredChildren: Asset[] = []
          if (asset.children) {
            filteredChildren = filterHierarchy(asset.children)
          }
          
          // Include asset if it matches or has matching children
          if (matchesSearch || filteredChildren.length > 0) {
            result.push({
              ...asset,
              children: filteredChildren.length > 0 ? filteredChildren : asset.children,
            })
          }
        }
        return result
      }
      hierarchical = filterHierarchy(hierarchical)
    }

    // Apply type filter
    if (selectedTypeFilter) {
      const filterByType = (assetList: Asset[]): Asset[] => {
        const result: Asset[] = []
        for (const asset of assetList) {
          const matchesType = asset.type === selectedTypeFilter
          let filteredChildren: Asset[] = []
          if (asset.children) {
            filteredChildren = filterByType(asset.children)
          }
          
          if (matchesType || filteredChildren.length > 0) {
            result.push({
              ...asset,
              children: filteredChildren.length > 0 ? filteredChildren : asset.children,
            })
          }
        }
        return result
      }
      hierarchical = filterByType(hierarchical)
    }

    // Apply owner filter
    if (selectedOwnerFilter) {
      const filterByOwner = (assetList: Asset[]): Asset[] => {
        const result: Asset[] = []
        for (const asset of assetList) {
          const matchesOwner = asset.owner === selectedOwnerFilter
          let filteredChildren: Asset[] = []
          if (asset.children) {
            filteredChildren = filterByOwner(asset.children)
          }
          
          if (matchesOwner || filteredChildren.length > 0) {
            result.push({
              ...asset,
              children: filteredChildren.length > 0 ? filteredChildren : asset.children,
            })
          }
        }
        return result
      }
      hierarchical = filterByOwner(hierarchical)
    }

    // Apply tags filter
    if (selectedTagsFilter && selectedTagsFilter.length > 0) {
      const filterByTags = (assetList: Asset[]): Asset[] => {
        const result: Asset[] = []
        for (const asset of assetList) {
          const matchesTags = asset.tags?.some((tag) => selectedTagsFilter.includes(tag))
          let filteredChildren: Asset[] = []
          if (asset.children) {
            filteredChildren = filterByTags(asset.children)
          }
          
          if (matchesTags || filteredChildren.length > 0) {
            result.push({
              ...asset,
              children: filteredChildren.length > 0 ? filteredChildren : asset.children,
            })
          }
        }
        return result
      }
      hierarchical = filterByTags(hierarchical)
    }

    // Apply active filter (all/recent/favorites)
    if (activeFilter === 'recent') {
      // For recent, we still want to show hierarchy but sort by date
      const sortByDate = (assetList: Asset[]): Asset[] => {
        return assetList
          .map((asset) => ({
            ...asset,
            children: asset.children ? sortByDate(asset.children) : undefined,
          }))
          .sort((a, b) => {
            const dateA = a.modified?.getTime() ?? 0
            const dateB = b.modified?.getTime() ?? 0
            return dateB - dateA
          })
      }
      hierarchical = sortByDate(hierarchical)
    } else if (activeFilter === 'favorites') {
      // For favorites, filter to only show pinned items
      const filterFavorites = (assetList: Asset[]): Asset[] => {
        const result: Asset[] = []
        for (const asset of assetList) {
          const isFavorite = asset.isPinned
          let filteredChildren: Asset[] = []
          if (asset.children) {
            filteredChildren = filterFavorites(asset.children)
          }
          
          if (isFavorite || filteredChildren.length > 0) {
            result.push({
              ...asset,
              children: filteredChildren.length > 0 ? filteredChildren : asset.children,
            })
          }
        }
        return result
      }
      hierarchical = filterFavorites(hierarchical)
    }

    return hierarchical
  },
}))
