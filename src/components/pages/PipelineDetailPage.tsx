import { useEffect, useMemo, useRef, useState } from 'react'
import {
  GitBranch,
  Database,
  Table2,
  Folder,
  Play,
  Pin,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCatalogStore } from '@/stores/catalogStore'
import { useSidebarStore } from '@/stores/sidebarStore'
import type { Asset } from '@/types'
import { cn } from '@/lib/utils'

interface PipelineDetailPageProps {
  pipelineId?: string
  pipeline?: Asset
}

const formatConnectionType = (type?: string) => {
  if (!type) return 'Connection'
  const mapping: Record<string, string> = {
    'data-warehouse': 'Data warehouse',
    lakehouse: 'Lakehouse',
    database: 'Database',
    api: 'API',
    file: 'File',
  }
  return mapping[type] || 'Connection'
}

export default function PipelineDetailPage({
  pipelineId,
  pipeline: pipelineProp,
}: PipelineDetailPageProps) {
  const { getAsset } = useCatalogStore()
  const { pinnedItems, pinItem, unpinItem } = useSidebarStore()
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
  const selectedTables = meta?.selectedTableNames?.length
    ? meta.selectedTableNames
    : (meta?.selectedTableIds || [])
  const isPinned = pinnedItems.some((item) => item.id === pipeline.id)

  const [runHistory, setRunHistory] = useState<
    {
      id: string
      status: 'queued' | 'running' | 'success' | 'failed'
      startedAt: Date
      finishedAt?: Date
      triggeredBy: string
    }[]
  >([])
  const [currentRunId, setCurrentRunId] = useState<string | null>(null)
  const runTimerRef = useRef<number | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const [showRunToast, setShowRunToast] = useState(false)

  useEffect(() => {
    return () => {
      if (runTimerRef.current) {
        window.clearTimeout(runTimerRef.current)
      }
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const handleRunPipeline = () => {
    if (currentRunId) return
    const id = `run-${Date.now()}`
    const startedAt = new Date()
    setCurrentRunId(id)
    setRunHistory((prev) => [
      ...prev,
      {
        id,
        status: 'running',
        startedAt,
        triggeredBy: 'You',
      },
    ])

    if (runTimerRef.current) {
      window.clearTimeout(runTimerRef.current)
    }

    runTimerRef.current = window.setTimeout(() => {
      setRunHistory((prev) =>
        prev.map((run) =>
          run.id === id
            ? { ...run, status: 'success', finishedAt: new Date() }
            : run
        )
      )
      setCurrentRunId((prev) => (prev === id ? null : prev))
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
      setShowRunToast(true)
      toastTimerRef.current = window.setTimeout(() => {
        setShowRunToast(false)
      }, 2400)
    }, 1600)
  }

  const handlePin = () => {
    if (isPinned) {
      unpinItem(pipeline.id)
    } else {
      pinItem(pipeline)
    }
  }

  const formatDateTime = (value?: Date) => {
    if (!value) return '—'
    return `${value.toLocaleDateString()} ${value.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }

  const formatDuration = (startedAt: Date, finishedAt?: Date) => {
    if (!finishedAt) return '—'
    const durationSeconds = Math.max(0, Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000))
    if (durationSeconds < 60) return `${durationSeconds}s`
    const minutes = Math.floor(durationSeconds / 60)
    const seconds = durationSeconds % 60
    return `${minutes}m ${seconds}s`
  }

  const canvasData = useMemo(() => {
    const tableCount = selectedTables.length
    const replicationLabel =
      tableCount > 0
        ? `Tables (${tableCount} table${tableCount === 1 ? '' : 's'})`
        : 'Tables'

    const nodes = [
      {
        id: 'source',
        label: sourceConnection?.name || 'Source',
        type: 'source' as const,
        badge: formatConnectionType(sourceConnection?.connectionMetadata?.connectionType),
        x: 120,
        y: 180,
      },
      {
        id: 'replication',
        label: replicationLabel,
        type: 'replication' as const,
        badge: 'Replication',
        x: 420,
        y: 180,
      },
      {
        id: 'destination',
        label: destinationConnection?.name || 'Destination',
        type: 'destination' as const,
        badge: 'Warehouse',
        x: 720,
        y: 180,
      },
    ]

    const edges = [
      { from: 'source', to: 'replication' },
      { from: 'replication', to: 'destination' },
    ]

    const nodeHeight = 72
    const nodeWidth = 220
    const maxY = Math.max(...nodes.map((node) => node.y)) + nodeHeight + 80
    const canvasHeight = Math.max(420, maxY)
    const canvasWidth = 960

    return { nodes, edges, nodeHeight, nodeWidth, canvasHeight, canvasWidth }
  }, [selectedTables.length, sourceConnection?.name, destinationConnection?.name])

  return (
    <div className="relative flex h-full flex-col bg-white">
      {showRunToast && (
        <div className="absolute left-1/2 top-6 z-50 -translate-x-1/2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Pipeline run completed
          </div>
        </div>
      )}
      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePin}
              aria-pressed={isPinned}
              className={cn(isPinned && 'border-blue-300 text-blue-700')}
            >
              <Pin className={cn('mr-2 h-4 w-4', isPinned && 'fill-current')} />
              {isPinned ? 'Pinned' : 'Pin to sidebar'}
            </Button>
            <Button
              size="sm"
              onClick={handleRunPipeline}
              disabled={!!currentRunId}
            >
              <Play className="mr-2 h-4 w-4" />
              {currentRunId ? 'Running...' : 'Run pipeline'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <>
            <div className="rounded-lg border border-border bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Pipeline flow</h2>
                    <p className="text-sm text-muted-foreground">
                      Source, task, and destination nodes reflect the current pipeline configuration.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Source
                    </span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="flex items-center gap-2">
                      <Table2 className="h-4 w-4" />
                      Replication
                    </span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Destination
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-dashed border-border bg-slate-50/80 p-4">
                  <div
                    className="relative overflow-auto rounded-md bg-white/70"
                    style={{ minHeight: canvasData.canvasHeight }}
                  >
                    <svg
                      className="absolute inset-0 h-full w-full"
                      width={canvasData.canvasWidth}
                      height={canvasData.canvasHeight}
                    >
                      <defs>
                        <marker
                          id="arrow"
                          markerWidth="12"
                          markerHeight="12"
                          refX="10"
                          refY="6"
                          orient="auto"
                        >
                          <path d="M0,0 L12,6 L0,12 Z" fill="#94a3b8" />
                        </marker>
                      </defs>
                      {canvasData.edges.map((edge) => {
                        const from = canvasData.nodes.find((node) => node.id === edge.from)
                        const to = canvasData.nodes.find((node) => node.id === edge.to)
                        if (!from || !to) return null
                        const startX = from.x + canvasData.nodeWidth
                        const startY = from.y + canvasData.nodeHeight / 2
                        const endX = to.x
                        const endY = to.y + canvasData.nodeHeight / 2
                        return (
                          <path
                            key={`${edge.from}-${edge.to}`}
                            d={`M ${startX} ${startY} C ${startX + 60} ${startY}, ${endX - 60} ${endY}, ${endX} ${endY}`}
                            stroke="#94a3b8"
                            strokeWidth="2"
                            fill="none"
                            markerEnd="url(#arrow)"
                          />
                        )
                      })}
                    </svg>

                    {canvasData.nodes.map((node) => {
                      const isSource = node.type === 'source'
                      const isDestination = node.type === 'destination'
                      const isReplication = node.type === 'replication'
                      return (
                        <div
                          key={node.id}
                          className={cn(
                            'absolute flex w-[220px] flex-col gap-2 rounded-xl border px-4 py-3 shadow-sm',
                            isSource && 'border-blue-200 bg-blue-50',
                            isDestination && 'border-emerald-200 bg-emerald-50',
                            isReplication && 'border-slate-200 bg-white'
                          )}
                          style={{ left: node.x, top: node.y }}
                        >
                          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {isSource ? 'Source' : isDestination ? 'Destination' : 'Task'}
                            <Badge
                              variant={isSource || isDestination ? 'secondary' : 'outline'}
                              className="text-[10px]"
                            >
                              {node.badge}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            {isSource || isDestination ? (
                              <Database className="h-4 w-4 text-slate-600" />
                            ) : (
                              <Table2 className="h-4 w-4 text-slate-600" />
                            )}
                            <span className="line-clamp-2">{node.label}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

            <div className="rounded-lg border border-border bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Monitoring</h2>
                  <p className="text-sm text-muted-foreground">
                    Track current pipeline runs in one view.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Current status:</span>
                  <Badge
                    variant={
                      runHistory[runHistory.length - 1]?.status === 'success'
                        ? 'secondary'
                        : runHistory[runHistory.length - 1]?.status === 'failed'
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    {runHistory[runHistory.length - 1]?.status ?? 'idle'}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-medium">Run</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Started</th>
                      <th className="px-4 py-3 font-medium">Finished</th>
                      <th className="px-4 py-3 font-medium">Duration</th>
                      <th className="px-4 py-3 font-medium">Triggered by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runHistory.length === 0 ? (
                      <tr className="border-t border-border">
                        <td
                          className="px-4 py-6 text-center text-sm text-muted-foreground"
                          colSpan={6}
                        >
                          This pipeline has no runs.
                        </td>
                      </tr>
                    ) : (
                      runHistory.map((run, index) => (
                        <tr
                          key={run.id}
                          className={cn(
                            'border-t border-border',
                            run.id === currentRunId && run.status === 'running' && 'bg-blue-50/60'
                          )}
                        >
                          <td className="px-4 py-3 font-medium text-slate-900">#{index + 1}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                run.status === 'success'
                                  ? 'secondary'
                                  : run.status === 'failed'
                                  ? 'destructive'
                                  : 'outline'
                              }
                            >
                              {run.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDateTime(run.startedAt)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDateTime(run.finishedAt)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDuration(run.startedAt, run.finishedAt)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{run.triggeredBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 text-lg font-semibold">Pipeline Overview</h2>
              <div className="grid gap-6 text-sm lg:grid-cols-2">
                <div className="space-y-3">
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Owner</span>
                    <span>{pipeline.owner || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created at</span>
                    <span>{pipeline.createdAt?.toLocaleDateString() || '—'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <Table2 className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-base font-semibold">Selected tables</h3>
                </div>
                {selectedTables.length > 0 ? (
                  <ul className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    {selectedTables.map((table) => (
                      <li key={table} className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        {table}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No tables selected.</p>
                )}
              </div>
            </div>
          </>
        </div>
      </div>
    </div>
  )
}
