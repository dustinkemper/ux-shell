import { create } from 'zustand'
import type { Asset, AssetType, ConnectionMetadata } from '@/types'
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient'

interface CatalogStore {
  assets: Asset[]
  viewMode: 'grid' | 'list'
  activeFilter: 'all' | 'recent' | 'favorites'
  searchQuery: string
  selectedTypeFilter?: string[]
  selectedOwnerFilter?: string
  selectedTagsFilter?: string[]
  isLoading: boolean
  isUsingFallback: boolean
  lastError?: string | null
  
  // Actions
  setViewMode: (mode: 'grid' | 'list') => void
  setActiveFilter: (filter: 'all' | 'recent' | 'favorites') => void
  setSearchQuery: (query: string) => void
  setTypeFilter: (types?: string[]) => void
  setOwnerFilter: (owner?: string) => void
  setTagsFilter: (tags?: string[]) => void
  loadAssets: () => Promise<void>
  
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

type PendingOp =
  | { type: 'add'; asset: Asset }
  | { type: 'update'; asset: Asset }
  | { type: 'delete'; assetId: string }

const LOCAL_ASSETS_KEY = 'ux-shell.catalog.assets'
const LOCAL_PENDING_KEY = 'ux-shell.catalog.pendingOps'

const toSerializableAsset = (asset: Asset): Asset => ({
  ...asset,
  modified: asset.modified ? new Date(asset.modified).toISOString() as unknown as Date : undefined,
  children: asset.children ? asset.children.map(toSerializableAsset) : undefined,
})

const fromSerializableAsset = (asset: Asset): Asset => ({
  ...asset,
  modified: asset.modified ? new Date(asset.modified) : undefined,
  children: asset.children ? asset.children.map(fromSerializableAsset) : undefined,
})

const loadLocalAssets = (): Asset[] | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(LOCAL_ASSETS_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Asset[]
    return parsed.map(fromSerializableAsset)
  } catch {
    return null
  }
}

const saveLocalAssets = (assets: Asset[]) => {
  if (typeof window === 'undefined') return
  const serializable = assets.map(toSerializableAsset)
  window.localStorage.setItem(LOCAL_ASSETS_KEY, JSON.stringify(serializable))
}

const loadPendingOps = (): PendingOp[] => {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(LOCAL_PENDING_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as PendingOp[]
  } catch {
    return []
  }
}

const savePendingOps = (ops: PendingOp[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCAL_PENDING_KEY, JSON.stringify(ops))
}

const queuePendingOp = (op: PendingOp) => {
  const ops = loadPendingOps()
  ops.push(op)
  savePendingOps(ops)
}

const buildHierarchy = (flatAssets: Asset[]): Asset[] => {
  const assetMap = new Map<string, Asset>()
  const roots: Asset[] = []
  flatAssets.forEach((asset) => {
    assetMap.set(asset.id, { ...asset, children: asset.children ?? [] })
  })
  assetMap.forEach((asset) => {
    if (asset.parentId && assetMap.has(asset.parentId)) {
      assetMap.get(asset.parentId)!.children!.push(asset)
    } else {
      roots.push(asset)
    }
  })
  return roots
}

const collectFavoriteIds = (assets: Asset[]): Set<string> => {
  const favorites = new Set<string>()
  const walk = (items: Asset[]) => {
    for (const item of items) {
      if (item.tags?.includes('favorite')) {
        favorites.add(item.id)
      }
      if (item.children) {
        walk(item.children)
      }
    }
  }
  walk(assets)
  return favorites
}

const mergeFavoriteTags = (assets: Asset[], favorites: Set<string>): Asset[] => {
  return assets.map((asset) => {
    const hasFavorite = favorites.has(asset.id)
    const nextTags = hasFavorite
      ? Array.from(new Set([...(asset.tags ?? []), 'favorite']))
      : asset.tags
    return {
      ...asset,
      tags: nextTags,
      children: asset.children ? mergeFavoriteTags(asset.children, favorites) : asset.children,
    }
  })
}

const tagIdForName = (name: string) =>
  `tag_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`

const collectionIdForName = (name: string) =>
  `col_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`

const assetToRecord = (asset: Asset) => ({
  id: asset.id,
  name: asset.name,
  type: asset.type,
  description: asset.description ?? null,
  parent_id: asset.parentId ?? null,
  owner: asset.owner ?? null,
  quality: asset.quality ?? null,
  modified_at: asset.modified ? asset.modified.toISOString() : new Date().toISOString(),
  location: asset.location ?? null,
  is_pinned: asset.isPinned ?? false,
  icon: asset.icon ?? null,
})

const fetchAssetsFromSupabase = async (): Promise<Asset[]> => {
  if (!supabase) return []

  const assetsResponse = await supabase.from('assets').select('*')
  if (assetsResponse.error) throw assetsResponse.error

  const assets = (assetsResponse.data ?? []).map((record) => ({
    id: record.id,
    name: record.name,
    type: record.type as AssetType,
    description: record.description ?? undefined,
    parentId: record.parent_id ?? undefined,
    owner: record.owner ?? undefined,
    quality: record.quality ?? undefined,
    modified: record.modified_at ? new Date(record.modified_at) : undefined,
    location: record.location ?? undefined,
    isPinned: record.is_pinned ?? undefined,
    icon: record.icon ?? undefined,
  })) as Asset[]

  const [tagsRes, collectionsRes, connectionsRes] = await Promise.all([
    supabase.from('asset_tags').select('asset_id, tag_id, tags(name)'),
    supabase.from('asset_collections').select('asset_id, collection_id, collections(name)'),
    supabase.from('connection_metadata').select('*'),
  ])

  if (tagsRes.error) throw tagsRes.error
  if (collectionsRes.error) throw collectionsRes.error
  if (connectionsRes.error) throw connectionsRes.error

  const tagsByAsset = new Map<string, string[]>()
  for (const row of tagsRes.data ?? []) {
    const tagName = row.tags?.[0]?.name
    if (!tagName) continue
    const list = tagsByAsset.get(row.asset_id) ?? []
    list.push(tagName)
    tagsByAsset.set(row.asset_id, list)
  }

  const collectionsByAsset = new Map<string, string[]>()
  for (const row of collectionsRes.data ?? []) {
    const collectionName = row.collections?.[0]?.name
    if (!collectionName) continue
    const list = collectionsByAsset.get(row.asset_id) ?? []
    list.push(collectionName)
    collectionsByAsset.set(row.asset_id, list)
  }

  const connectionByAsset = new Map<string, ConnectionMetadata>()
  for (const row of connectionsRes.data ?? []) {
    connectionByAsset.set(row.asset_id, {
      connectionType: row.connection_type,
      host: row.host ?? undefined,
      port: row.port ?? undefined,
      database: row.database ?? undefined,
      username: row.username ?? undefined,
      schema: row.schema ?? undefined,
      account: row.account ?? undefined,
      warehouse: row.warehouse ?? undefined,
      role: row.role ?? undefined,
      apiKey: row.api_key ?? undefined,
      clientId: row.client_id ?? undefined,
      clientSecret: row.client_secret ?? undefined,
      accountId: row.account_id ?? undefined,
    })
  }

  const enriched = assets.map((asset) => ({
    ...asset,
    tags: tagsByAsset.get(asset.id),
    collections: collectionsByAsset.get(asset.id),
    connectionMetadata: connectionByAsset.get(asset.id),
  }))

  return buildHierarchy(enriched)
}

const upsertAssetToSupabase = async (asset: Asset) => {
  if (!supabase) return
  const { error: assetError } = await supabase.from('assets').upsert(assetToRecord(asset))
  if (assetError) throw assetError

  if (asset.connectionMetadata) {
    const { error: connectionError } = await supabase.from('connection_metadata').upsert({
      asset_id: asset.id,
      connection_type: asset.connectionMetadata.connectionType,
      host: asset.connectionMetadata.host ?? null,
      port: asset.connectionMetadata.port ?? null,
      database: asset.connectionMetadata.database ?? null,
      username: asset.connectionMetadata.username ?? null,
      schema: asset.connectionMetadata.schema ?? null,
      account: asset.connectionMetadata.account ?? null,
      warehouse: asset.connectionMetadata.warehouse ?? null,
      role: asset.connectionMetadata.role ?? null,
      api_key: asset.connectionMetadata.apiKey ?? null,
      client_id: asset.connectionMetadata.clientId ?? null,
      client_secret: asset.connectionMetadata.clientSecret ?? null,
      account_id: asset.connectionMetadata.accountId ?? null,
    })
    if (connectionError) throw connectionError
  }

  if (asset.tags && asset.tags.length > 0) {
    const tagRows = asset.tags.map((tag) => ({
      id: tagIdForName(tag),
      name: tag,
    }))
    const { error: tagError } = await supabase.from('tags').upsert(tagRows)
    if (tagError) throw tagError
    await supabase.from('asset_tags').delete().eq('asset_id', asset.id)
    const { error: tagLinkError } = await supabase.from('asset_tags').insert(
      asset.tags.map((tag) => ({
        asset_id: asset.id,
        tag_id: tagIdForName(tag),
      }))
    )
    if (tagLinkError) throw tagLinkError
  }

  if (asset.collections && asset.collections.length > 0) {
    const collectionRows = asset.collections.map((collection) => ({
      id: collectionIdForName(collection),
      name: collection,
    }))
    const { error: collectionError } = await supabase.from('collections').upsert(collectionRows)
    if (collectionError) throw collectionError
    await supabase.from('asset_collections').delete().eq('asset_id', asset.id)
    const { error: collectionLinkError } = await supabase.from('asset_collections').insert(
      asset.collections.map((collection) => ({
        asset_id: asset.id,
        collection_id: collectionIdForName(collection),
      }))
    )
    if (collectionLinkError) throw collectionLinkError
  }
}

const deleteAssetInSupabase = async (assetId: string) => {
  if (!supabase) return
  const { error } = await supabase.from('assets').delete().eq('id', assetId)
  if (error) throw error
}

const syncPendingOps = async () => {
  if (!supabase) return
  const pending = loadPendingOps()
  if (pending.length === 0) return
  const remaining: PendingOp[] = []
  for (const op of pending) {
    try {
      if (op.type === 'delete') {
        await deleteAssetInSupabase(op.assetId)
      } else {
        await upsertAssetToSupabase(op.asset)
      }
    } catch {
      remaining.push(op)
    }
  }
  savePendingOps(remaining)
}

// Mock initial data - used for fallback
const initialAssets: Asset[] = [
  {
    id: 'ws_analytics',
    name: 'Analytics Studio',
    type: 'workspace',
    owner: 'Avery Chen',
    modified: new Date('2025-11-17'),
    location: 'Data Platform',
    quality: 92,
    isPinned: true,
    children: [
      {
        id: 'fd_exec_reporting',
        name: 'Executive Reporting',
        type: 'folder',
        parentId: 'ws_analytics',
        owner: 'Avery Chen',
        modified: new Date('2025-11-15'),
        location: 'Data Platform',
        quality: 86,
        children: [
          {
            id: 'app_exec_dashboard',
            name: 'Executive Metrics Dashboard',
            type: 'analytics-app',
            parentId: 'fd_exec_reporting',
            owner: 'Avery Chen',
            modified: new Date('2025-11-14'),
            location: 'Data Platform',
            quality: 91,
          },
          {
            id: 'pipe_kpi_rollup',
            name: 'Daily KPI Rollup',
            type: 'pipeline',
            parentId: 'fd_exec_reporting',
            owner: 'Avery Chen',
            modified: new Date('2025-11-13'),
            location: 'Data Platform',
            quality: 88,
          },
        ],
      },
      {
        id: 'conn_snowflake_analytics',
        name: 'Snowflake - Analytics',
        type: 'connection',
        parentId: 'ws_analytics',
        owner: 'Avery Chen',
        modified: new Date('2025-11-16'),
        location: 'Data Platform',
        quality: 93,
        connectionMetadata: {
          connectionType: 'data-warehouse',
          account: 'acme',
          warehouse: 'WH_XS',
          database: 'ANALYTICS',
          role: 'ANALYST',
          username: 'svc_analytics',
          schema: 'PUBLIC',
        },
      },
      {
        id: 'app_operations_overview',
        name: 'Operations Overview',
        type: 'analytics-app',
        parentId: 'ws_analytics',
        owner: 'Avery Chen',
        modified: new Date('2025-11-12'),
        location: 'Data Platform',
        quality: 86,
      },
    ],
  },
  {
    id: 'ws_marketing',
    name: 'Marketing',
    type: 'workspace',
    owner: 'Jordan Lee',
    modified: new Date('2025-11-16'),
    location: 'GTM',
    quality: 88,
    children: [
      {
        id: 'fd_campaign_perf',
        name: 'Campaign Performance',
        type: 'folder',
        parentId: 'ws_marketing',
        owner: 'Jordan Lee',
        modified: new Date('2025-11-15'),
        location: 'GTM',
        quality: 84,
        children: [
          {
            id: 'app_campaign_perf',
            name: 'Campaign Performance Dashboard',
            type: 'analytics-app',
            parentId: 'fd_campaign_perf',
            owner: 'Jordan Lee',
            modified: new Date('2025-11-12'),
            location: 'GTM',
            quality: 87,
          },
          {
            id: 'pipe_ad_spend',
            name: 'Ad Spend Attribution',
            type: 'pipeline',
            parentId: 'fd_campaign_perf',
            owner: 'Jordan Lee',
            modified: new Date('2025-11-13'),
            location: 'GTM',
            quality: 87,
          },
        ],
      },
      {
        id: 'conn_hubspot',
        name: 'HubSpot - Marketing',
        type: 'connection',
        parentId: 'ws_marketing',
        owner: 'Jordan Lee',
        modified: new Date('2025-11-14'),
        location: 'GTM',
        quality: 85,
        connectionMetadata: {
          connectionType: 'api',
          apiKey: 'hubspot_api_key',
          clientId: 'hubspot_client_id',
          clientSecret: 'hubspot_client_secret',
          accountId: 'hubspot_account_id',
        },
      },
      {
        id: 'conn_google_ads',
        name: 'Google Ads',
        type: 'connection',
        parentId: 'ws_marketing',
        owner: 'Jordan Lee',
        modified: new Date('2025-11-13'),
        location: 'GTM',
        quality: 84,
        connectionMetadata: {
          connectionType: 'api',
          apiKey: 'google_ads_key',
          clientId: 'google_ads_client_id',
          clientSecret: 'google_ads_client_secret',
          accountId: 'google_ads_account_id',
        },
      },
    ],
  },
  {
    id: 'ws_platform',
    name: 'Data Platform',
    type: 'workspace',
    owner: 'Priya Patel',
    modified: new Date('2025-11-18'),
    location: 'Core Systems',
    quality: 95,
    isPinned: true,
    children: [
      {
        id: 'fd_core_data',
        name: 'Core Data',
        type: 'folder',
        parentId: 'ws_platform',
        owner: 'Priya Patel',
        modified: new Date('2025-11-17'),
        location: 'Core Systems',
        quality: 90,
        children: [
          {
            id: 'pipe_customer_360',
            name: 'Customer 360 Pipeline',
            type: 'pipeline',
            parentId: 'fd_core_data',
            owner: 'Priya Patel',
            modified: new Date('2025-11-15'),
            location: 'Core Systems',
            quality: 91,
          },
          {
            id: 'pipe_revenue_facts',
            name: 'Revenue Facts Pipeline',
            type: 'pipeline',
            parentId: 'fd_core_data',
            owner: 'Priya Patel',
            modified: new Date('2025-11-14'),
            location: 'Core Systems',
            quality: 90,
          },
        ],
      },
      {
        id: 'conn_mysql_billing',
        name: 'MySQL - Billing',
        type: 'connection',
        parentId: 'ws_platform',
        owner: 'Priya Patel',
        modified: new Date('2025-11-16'),
        location: 'Core Systems',
        quality: 89,
        connectionMetadata: {
          connectionType: 'database',
          host: 'billing-db.internal',
          port: 3306,
          database: 'billing',
          username: 'svc_billing',
        },
      },
      {
        id: 'conn_snowflake_prod',
        name: 'Snowflake - Prod',
        type: 'connection',
        parentId: 'ws_platform',
        owner: 'Priya Patel',
        modified: new Date('2025-11-18'),
        location: 'Core Systems',
        quality: 93,
        connectionMetadata: {
          connectionType: 'data-warehouse',
          account: 'acme',
          warehouse: 'WH_SM',
          database: 'PROD',
          role: 'ANALYST',
          username: 'svc_warehouse',
          schema: 'PUBLIC',
        },
      },
    ],
  },
]

const insertChild = (assets: Asset[], parentId: string, newAsset: Asset): Asset[] => {
  return assets.map((item) => {
    if (item.id === parentId) {
      const children = item.children ? [...item.children, newAsset] : [newAsset]
      return { ...item, children }
    }
    if (item.children) {
      return { ...item, children: insertChild(item.children, parentId, newAsset) }
    }
    return item
  })
}

const updateChild = (assets: Asset[], assetId: string, updates: Partial<Asset>): Asset[] => {
  return assets.map((item) => {
    if (item.id === assetId) {
      return { ...item, ...updates, modified: new Date() }
    }
    if (item.children) {
      return { ...item, children: updateChild(item.children, assetId, updates) }
    }
    return item
  })
}

const deleteChild = (assets: Asset[], assetId: string): Asset[] => {
  return assets
    .filter((item) => item.id !== assetId)
    .map((item) =>
      item.children ? { ...item, children: deleteChild(item.children, assetId) } : item
    )
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  assets: initialAssets,
  viewMode: 'list',
  activeFilter: 'all',
  searchQuery: '',
  selectedTypeFilter: undefined,
  selectedOwnerFilter: undefined,
  selectedTagsFilter: undefined,
  isLoading: false,
  isUsingFallback: false,
  lastError: null,

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTypeFilter: (types) => set({ selectedTypeFilter: types }),
  setOwnerFilter: (owner) => set({ selectedOwnerFilter: owner }),
  setTagsFilter: (tags) => set({ selectedTagsFilter: tags }),
  loadAssets: async () => {
    set({ isLoading: true })
    const localAssets = loadLocalAssets()
    if (!isSupabaseConfigured || !supabase) {
      const fallbackAssets = localAssets ?? initialAssets
      set({
        assets: fallbackAssets,
        isLoading: false,
        isUsingFallback: true,
        lastError: 'Supabase is not configured.',
      })
      saveLocalAssets(fallbackAssets)
      return
    }
    try {
      const supabaseAssets = await fetchAssetsFromSupabase()
      const nextAssetsRaw = supabaseAssets.length > 0 ? supabaseAssets : localAssets ?? initialAssets
      const favoriteIds = localAssets ? collectFavoriteIds(localAssets) : new Set<string>()
      const nextAssets = favoriteIds.size > 0 ? mergeFavoriteTags(nextAssetsRaw, favoriteIds) : nextAssetsRaw
      set({ assets: nextAssets, isLoading: false, isUsingFallback: false, lastError: null })
      saveLocalAssets(nextAssets)
      await syncPendingOps()
    } catch (error) {
      const fallbackAssets = localAssets ?? initialAssets
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({
        assets: fallbackAssets,
        isLoading: false,
        isUsingFallback: true,
        lastError: message,
      })
      saveLocalAssets(fallbackAssets)
      console.warn('Supabase unavailable, using local fallback.', error)
    }
  },

  addAsset: (asset) => {
    const newAsset = {
      ...asset,
      modified: new Date(),
      owner: asset.owner ?? 'Avery Chen', // Default owner for new assets
      quality: asset.quality ?? 82, // Default quality
    }
    const nextAssets = newAsset.parentId
      ? insertChild(get().assets, newAsset.parentId, newAsset)
      : [...get().assets, newAsset]

    set({ assets: nextAssets })
    saveLocalAssets(nextAssets)

    if (!isSupabaseConfigured || !supabase) {
      queuePendingOp({ type: 'add', asset: newAsset })
      return
    }

    upsertAssetToSupabase(newAsset).catch(() => {
      queuePendingOp({ type: 'add', asset: newAsset })
    })
  },

  updateAsset: (id, updates) => {
    const nextAssets = updateChild(get().assets, id, updates)
    set({ assets: nextAssets })
    saveLocalAssets(nextAssets)

    const updatedAsset = get().getAsset(id)
    if (!updatedAsset) return
    if (!isSupabaseConfigured || !supabase) {
      queuePendingOp({ type: 'update', asset: updatedAsset })
      return
    }
    upsertAssetToSupabase(updatedAsset).catch(() => {
      queuePendingOp({ type: 'update', asset: updatedAsset })
    })
  },

  deleteAsset: (id) => {
    const nextAssets = deleteChild(get().assets, id)
    set({ assets: nextAssets })
    saveLocalAssets(nextAssets)

    if (!isSupabaseConfigured || !supabase) {
      queuePendingOp({ type: 'delete', assetId: id })
      return
    }
    deleteAssetInSupabase(id).catch(() => {
      queuePendingOp({ type: 'delete', assetId: id })
    })
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
    if (selectedTypeFilter && selectedTypeFilter.length > 0) {
      filtered = filtered.filter((asset) => selectedTypeFilter.includes(asset.type))
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
      filtered = filtered.filter((asset) => asset.tags?.includes('favorite'))
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
    if (selectedTypeFilter && selectedTypeFilter.length > 0) {
      const filterByType = (assetList: Asset[]): Asset[] => {
        const result: Asset[] = []
        for (const asset of assetList) {
          const matchesType = selectedTypeFilter.includes(asset.type)
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
      const filterFavorites = (assetList: Asset[]): Asset[] => {
        const result: Asset[] = []
        for (const asset of assetList) {
          const isFavorite = asset.tags?.includes('favorite')
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
