import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Database, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTabStore } from '@/stores/tabStore'
import { useCatalogStore } from '@/stores/catalogStore'
import type { Asset, Table as TableType, PipelineMetadata } from '@/types'

type Step = 1 | 2 | 3

// Mock table data
const generateMockTables = (connectionId: string): TableType[] => {
  return [
    {
      id: `${connectionId}-table-1`,
      name: 'customers',
      datatype: 'PostgreSQL',
      primaryKeyColumns: ['id'],
      rowCount: 15420,
      schema: 'public',
    },
    {
      id: `${connectionId}-table-2`,
      name: 'orders',
      datatype: 'PostgreSQL',
      primaryKeyColumns: ['id'],
      foreignKeyColumns: ['user_id'],
      rowCount: 89340,
      schema: 'public',
    },
    {
      id: `${connectionId}-table-3`,
      name: 'products',
      datatype: 'PostgreSQL',
      rowCount: 2340,
      schema: 'public',
    },
    {
      id: `${connectionId}-table-4`,
      name: 'categories',
      datatype: 'PostgreSQL',
      rowCount: 45,
      schema: 'public',
    },
    {
      id: `${connectionId}-table-5`,
      name: 'payments',
      datatype: 'PostgreSQL',
      foreignKeyColumns: ['order_id', 'user_id'],
      rowCount: 125670,
      schema: 'public',
    },
  ]
}

export default function CreatePipelinePage() {
  const { closeTab, activeTabId, setTabAsset, setTabPage } = useTabStore()
  const { addAsset, getConnections, getAsset, getAssetsByType, loadAssets } = useCatalogStore()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  
  // Step 1 data
  const [sourceConnectionId, setSourceConnectionId] = useState<string>('')
  const [destinationConnectionId, setDestinationConnectionId] = useState<string>('')
  const [pipelineName, setPipelineName] = useState('')
  const [description, setDescription] = useState('')
  const [workspace, setWorkspace] = useState('')
  const [hasCustomName, setHasCustomName] = useState(false)
  
  // Step 2 data
  const [selectedTableIds, setSelectedTableIds] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    void loadAssets()
  }, [loadAssets])

  const connections = getConnections()
  const workspaces = useMemo(() => getAssetsByType('workspace'), [getAssetsByType])
  const workspaceNameById = useMemo(() => {
    const map = new Map<string, string>()
    workspaces.forEach((item) => map.set(item.id, item.name))
    return map
  }, [workspaces])
  const getWorkspaceIdForConnection = (connection: Asset): string | undefined => {
    let currentParentId = connection.parentId
    while (currentParentId) {
      const parent = getAsset(currentParentId)
      if (!parent) return undefined
      if (parent.type === 'workspace') return parent.id
      currentParentId = parent.parentId
    }
    return undefined
  }
  const destinationConnections = connections.filter(
    (conn) =>
      conn.id !== sourceConnectionId &&
      conn.connectionMetadata?.connectionType === 'data-warehouse'
  )

  const sourceConnection = connections.find((c) => c.id === sourceConnectionId)
  const destinationConnection = connections.find((c) => c.id === destinationConnectionId)
  const workspaceAsset = workspace ? getAsset(workspace) : undefined
  const tables = useMemo(() => {
    if (!sourceConnectionId) return []
    return generateMockTables(sourceConnectionId)
  }, [sourceConnectionId])

  // Auto-generate pipeline name when source and destination are selected
  useMemo(() => {
    if (sourceConnection && destinationConnection && !hasCustomName && !pipelineName) {
      const sourceName = sourceConnection.name || 'Source'
      const destName = destinationConnection.name || 'Destination'
      setPipelineName(`${sourceName} to ${destName} pipeline`)
    }
  }, [sourceConnection, destinationConnection, hasCustomName, pipelineName])

  const validateStep1 = (): boolean => {
    return !!(workspace && sourceConnectionId && destinationConnectionId && pipelineName.trim())
  }

  const validateStep2 = (): boolean => {
    return selectedTableIds.size > 0
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) {
        alert('Please fill in all required fields')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (!validateStep2()) {
        alert('Please select at least one table')
        return
      }
      setCurrentStep(3)
    }
  }

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const handleBackToSelector = () => {
    if (!activeTabId) return
    setTabPage(activeTabId, 'asset-type-selector', 'Create New')
  }

  const handleCancel = () => {
    if (activeTabId) {
      closeTab(activeTabId)
    }
  }

  const handleCreate = () => {
    if (!validateStep1() || !validateStep2()) {
      alert('Please complete all required fields')
      return
    }

    const pipelineMetadata: PipelineMetadata = {
      sourceConnectionId,
      destinationConnectionId,
      selectedTableIds: Array.from(selectedTableIds),
      description,
      workspace,
    }

    const newPipeline: Asset = {
      id: `pipeline-${Date.now()}`,
      name: pipelineName,
      type: 'pipeline',
      description,
      parentId: workspace || undefined,
      pipelineMetadata,
      owner: 'Avery Chen',
      modified: new Date(),
      quality: 82,
    }

    addAsset(newPipeline)

    if (activeTabId) {
      setTabAsset(activeTabId, newPipeline)
    }
  }

  const toggleTableSelection = (tableId: string) => {
    setSelectedTableIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(tableId)) {
        newSet.delete(tableId)
      } else {
        newSet.add(tableId)
      }
      return newSet
    })
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          {currentStep === 1 && (
            <Button variant="ghost" size="sm" onClick={handleBackToSelector}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <h1 className="text-2xl font-semibold">Create Data Pipeline</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <div className="sticky top-0 z-10 mb-6 flex items-center gap-2 bg-white py-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`h-1 w-16 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="w-full">
          {/* Step 1: Source & Destination Connections & Settings */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold">Workspace</h2>
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium">
                    Workspace <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={workspace}
                    onChange={(e) => {
                      setWorkspace(e.target.value)
                      setSourceConnectionId('')
                      setDestinationConnectionId('')
                      setSelectedTableIds(new Set())
                      setPipelineName('')
                      setHasCustomName(false)
                    }}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select workspace</option>
                    {workspaces.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold">Connections</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Source Connection <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={sourceConnectionId}
                      onChange={(e) => {
                        setSourceConnectionId(e.target.value)
                        setPipelineName('')
                        setSelectedTableIds(new Set())
                        setHasCustomName(false)
                      }}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      disabled={!workspace || connections.length === 0}
                    >
                      <option value="">Select source connection</option>
                      {connections.map((conn) => {
                        const connectionWorkspaceId = getWorkspaceIdForConnection(conn)
                        const connectionWorkspaceName = connectionWorkspaceId
                          ? workspaceNameById.get(connectionWorkspaceId)
                          : undefined
                        return (
                          <option key={conn.id} value={conn.id}>
                            {conn.name} — {connectionWorkspaceName || 'Unassigned'}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Destination Connection <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={destinationConnectionId}
                      onChange={(e) => {
                        setDestinationConnectionId(e.target.value)
                        setPipelineName('')
                        setHasCustomName(false)
                      }}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      disabled={!sourceConnectionId || connections.length === 0}
                    >
                      <option value="">Select destination connection</option>
                      {destinationConnections.map((conn) => {
                        const connectionWorkspaceId = getWorkspaceIdForConnection(conn)
                        const connectionWorkspaceName = connectionWorkspaceId
                          ? workspaceNameById.get(connectionWorkspaceId)
                          : undefined
                        return (
                          <option key={conn.id} value={conn.id}>
                            {conn.name} — {connectionWorkspaceName || 'Unassigned'}
                          </option>
                        )
                      })}
                    </select>
                    {sourceConnectionId && destinationConnections.length === 0 && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        No available destination connections.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold">Name & Description</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Pipeline Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pipelineName}
                      onChange={(e) => {
                        setPipelineName(e.target.value)
                        setHasCustomName(true)
                      }}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      placeholder="Pipeline name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Optional description"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Tables */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-semibold">Select Tables</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Select the tables you want to include in this pipeline from{' '}
                  <strong>{sourceConnection?.name}</strong>
                </p>

                {tables.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-12">
                            <input
                              type="checkbox"
                              checked={selectedTableIds.size === tables.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTableIds(new Set(tables.map((t) => t.id)))
                                } else {
                                  setSelectedTableIds(new Set())
                                }
                              }}
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                            Table Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                            Datatype
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                            Keys
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                            Row Count
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tables.map((table) => {
                          const keyColumns = [
                            ...(table.primaryKeyColumns ?? []).map((column) => `${column} (PK)`),
                            ...(table.foreignKeyColumns ?? []).map((column) => `${column} (FK)`),
                          ]
                          return (
                            <tr
                              key={table.id}
                              className="border-b border-border hover:bg-gray-50 cursor-pointer"
                              onClick={() => toggleTableSelection(table.id)}
                            >
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedTableIds.has(table.id)}
                                  onChange={() => toggleTableSelection(table.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Table2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{table.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm">{table.datatype || '-'}</span>
                              </td>
                              <td className="px-4 py-3">
                                {keyColumns.length > 0 ? (
                                  <span className="text-sm">{keyColumns.join(', ')}</span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm">
                                  {table.rowCount?.toLocaleString() || '-'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border p-8 text-center">
                    <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Please select a source connection first
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review and Create */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-semibold">Review Pipeline</h2>
                
                <div className="space-y-6 rounded-lg border border-border p-6">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Workspace</h3>
                    <p className="text-base">{workspaceAsset?.name || workspace || '-'}</p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Pipeline Name</h3>
                    <p className="text-base">{pipelineName}</p>
                  </div>

                  {description && (
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-muted-foreground">Description</h3>
                      <p className="text-base">{description}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Source Connection</h3>
                    <p className="text-base">{sourceConnection?.name || '-'}</p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Destination Connection</h3>
                    <p className="text-base">{destinationConnection?.name || '-'}</p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                      Selected Tables ({selectedTableIds.size})
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {Array.from(selectedTableIds).map((tableId) => {
                        const table = tables.find((t) => t.id === tableId)
                        return table ? <li key={tableId} className="text-sm">{table.name}</li> : null
                      })}
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="border-t border-border px-6 py-4">
        <div className="mx-auto flex max-w-3xl justify-between">
          <Button variant="outline" onClick={handleStepBack} disabled={currentStep === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
                Create Pipeline
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
