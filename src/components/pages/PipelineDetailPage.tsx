import { GitBranch, Database, Table2, Folder } from 'lucide-react'
import { useCatalogStore } from '@/stores/catalogStore'
import type { Asset } from '@/types'

interface PipelineDetailPageProps {
  pipelineId?: string
  pipeline?: Asset
}

const getTableLabel = (tableId: string) => {
  const match = tableId.split('-table-')[1]
  if (!match) return tableId
  return `Table ${match}`
}

export default function PipelineDetailPage({
  pipelineId,
  pipeline: pipelineProp,
}: PipelineDetailPageProps) {
  const { getAsset } = useCatalogStore()
  const pipeline = pipelineProp || (pipelineId ? getAsset(pipelineId) : undefined)

  if (!pipeline || pipeline.type !== 'pipeline') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="text-muted-foreground">Pipeline not found</div>
      </div>
    )
  }

  const meta = pipeline.pipelineMetadata
  const sourceConnection = meta?.sourceConnectionId
    ? getAsset(meta.sourceConnectionId)
    : undefined
  const destinationConnection = meta?.destinationConnectionId
    ? getAsset(meta.destinationConnectionId)
    : undefined
  const workspaceId = meta?.workspace || pipeline.parentId
  const workspace = workspaceId ? getAsset(workspaceId) : undefined
  const selectedTables = (meta?.selectedTableIds || []).map(getTableLabel)

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{pipeline.name}</h1>
            {pipeline.description && (
              <p className="text-sm text-muted-foreground">{pipeline.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 text-lg font-semibold">Connections</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Workspace</span>
                  <span>{workspace?.name || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Database className="h-4 w-4" />
                    Source
                  </span>
                  <span>{sourceConnection?.name || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Database className="h-4 w-4" />
                    Destination
                  </span>
                  <span>{destinationConnection?.name || '—'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 text-lg font-semibold">Metadata</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span>{pipeline.owner || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last updated</span>
                  <span>{pipeline.modified?.toLocaleDateString() || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Quality</span>
                  <span>{pipeline.quality ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span>{pipeline.location || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-6">
            <div className="flex items-center gap-2">
              <Table2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Selected Tables</h2>
            </div>
            {selectedTables.length > 0 ? (
              <ul className="mt-4 grid gap-2 text-sm md:grid-cols-2">
                {selectedTables.map((table) => (
                  <li key={table} className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    {table}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No tables selected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
