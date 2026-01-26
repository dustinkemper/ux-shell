import { Database, ShieldCheck, Table, Users, FolderTree } from 'lucide-react'
import { useCatalogStore } from '@/stores/catalogStore'
import type { Asset } from '@/types'

interface ConnectionDetailPageProps {
  connectionId?: string
  connection?: Asset
}

const getMockStats = (connection: Asset) => {
  const type = connection.connectionMetadata?.connectionType
  switch (type) {
    case 'data-warehouse':
    case 'lakehouse':
      return {
        schemas: 12,
        tables: 248,
        rows: '4.2M',
        users: 18,
      }
    case 'database':
      return {
        schemas: 6,
        tables: 124,
        rows: '1.1M',
        users: 8,
      }
    default:
      return {
        schemas: 2,
        tables: 24,
        rows: '120K',
        users: 4,
      }
  }
}

export default function ConnectionDetailPage({
  connectionId,
  connection: connectionProp,
}: ConnectionDetailPageProps) {
  const { getAsset } = useCatalogStore()
  const connection = connectionProp || (connectionId ? getAsset(connectionId) : undefined)

  if (!connection) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="text-muted-foreground">Connection not found</div>
      </div>
    )
  }

  const stats = getMockStats(connection)
  const meta = connection.connectionMetadata

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{connection.name}</h1>
            {connection.description && (
              <p className="text-sm text-muted-foreground">{connection.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FolderTree className="h-4 w-4" />
                Schemas
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats.schemas}</div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Table className="h-4 w-4" />
                Tables
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats.tables}</div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Rows
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats.rows}</div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Users
              </div>
              <div className="mt-2 text-2xl font-semibold">{stats.users}</div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 text-lg font-semibold">Connection Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize">{meta?.connectionType || 'Unknown'}</span>
                </div>
                {meta?.host && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Host</span>
                    <span>{meta.host}</span>
                  </div>
                )}
                {meta?.port !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Port</span>
                    <span>{meta.port}</span>
                  </div>
                )}
                {meta?.database && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Database</span>
                    <span>{meta.database}</span>
                  </div>
                )}
                {meta?.schema && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Schema</span>
                    <span>{meta.schema}</span>
                  </div>
                )}
                {meta?.warehouse && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Warehouse</span>
                    <span>{meta.warehouse}</span>
                  </div>
                )}
                {meta?.account && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account</span>
                    <span>{meta.account}</span>
                  </div>
                )}
                {meta?.accountId && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account ID</span>
                    <span>{meta.accountId}</span>
                  </div>
                )}
                {meta?.username && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Username</span>
                    <span>{meta.username}</span>
                  </div>
                )}
                {meta?.clientId && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Client ID</span>
                    <span>{meta.clientId}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 text-lg font-semibold">Metadata</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span>{connection.owner || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last updated</span>
                  <span>{connection.modified?.toLocaleDateString() || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
