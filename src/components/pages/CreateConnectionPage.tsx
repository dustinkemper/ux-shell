import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTabStore } from '@/stores/tabStore'
import { useCatalogStore } from '@/stores/catalogStore'
import type { Asset, ConnectionMetadata } from '@/types'
import { cn } from '@/lib/utils'

type Step = 'type' | 'credentials'

interface ConnectionTypeOption {
  id: string
  name: string
  category: 'Databases' | 'Business Platforms' | 'Data Warehouses'
  logo: string
  connectionType: ConnectionMetadata['connectionType']
}

interface FieldDefinition {
  id: keyof ConnectionForm
  label: string
  type: 'text' | 'password' | 'number'
  placeholder?: string
  required?: boolean
}

interface ConnectionForm {
  workspace: string
  name: string
  description: string
  host: string
  port: string
  database: string
  username: string
  password: string
  schema: string
  account: string
  warehouse: string
  role: string
  apiKey: string
  clientId: string
  clientSecret: string
  accountId: string
}

const logos = {
  postgresql: new URL('../../img/connections/postgresql.svg', import.meta.url).href,
  mysql: new URL('../../img/connections/mysql.svg', import.meta.url).href,
  mongodb: new URL('../../img/connections/mongodb.svg', import.meta.url).href,
  microsoftsqlserver: new URL('../../img/connections/microsoftsqlserver.svg', import.meta.url).href,
  oracle: new URL('../../img/connections/oracle.svg', import.meta.url).href,
  sqlite: new URL('../../img/connections/sqlite.svg', import.meta.url).href,
  mariadb: new URL('../../img/connections/mariadb.svg', import.meta.url).href,
  redis: new URL('../../img/connections/redis.svg', import.meta.url).href,
  elasticsearch: new URL('../../img/connections/elasticsearch.svg', import.meta.url).href,
  hubspot: new URL('../../img/connections/hubspot.svg', import.meta.url).href,
  salesforce: new URL('../../img/connections/salesforce.svg', import.meta.url).href,
  facebook: new URL('../../img/connections/facebook.svg', import.meta.url).href,
  googleads: new URL('../../img/connections/googleads.svg', import.meta.url).href,
  stripe: new URL('../../img/connections/stripe.svg', import.meta.url).href,
  shopify: new URL('../../img/connections/shopify.svg', import.meta.url).href,
  zendesk: new URL('../../img/connections/zendesk.svg', import.meta.url).href,
  mailchimp: new URL('../../img/connections/mailchimp.svg', import.meta.url).href,
  quickbooks: new URL('../../img/connections/quickbooks.svg', import.meta.url).href,
  jira: new URL('../../img/connections/jira.svg', import.meta.url).href,
  snowflake: new URL('../../img/connections/snowflake.svg', import.meta.url).href,
  databricks: new URL('../../img/connections/databricks.svg', import.meta.url).href,
  googlebigquery: new URL('../../img/connections/googlebigquery.svg', import.meta.url).href,
  amazonredshift: new URL('../../img/connections/amazonredshift.svg', import.meta.url).href,
  azuresynapseanalytics: new URL('../../img/connections/azuresynapseanalytics.svg', import.meta.url).href,
}

const connectionTypes: ConnectionTypeOption[] = [
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases', logo: logos.postgresql, connectionType: 'database' },
  { id: 'mysql', name: 'MySQL', category: 'Databases', logo: logos.mysql, connectionType: 'database' },
  { id: 'mongodb', name: 'MongoDB', category: 'Databases', logo: logos.mongodb, connectionType: 'database' },
  { id: 'microsoftsqlserver', name: 'Microsoft SQL Server', category: 'Databases', logo: logos.microsoftsqlserver, connectionType: 'database' },
  { id: 'oracle', name: 'Oracle', category: 'Databases', logo: logos.oracle, connectionType: 'database' },
  { id: 'sqlite', name: 'SQLite', category: 'Databases', logo: logos.sqlite, connectionType: 'database' },
  { id: 'mariadb', name: 'MariaDB', category: 'Databases', logo: logos.mariadb, connectionType: 'database' },
  { id: 'redis', name: 'Redis', category: 'Databases', logo: logos.redis, connectionType: 'database' },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'Databases', logo: logos.elasticsearch, connectionType: 'database' },
  { id: 'hubspot', name: 'HubSpot', category: 'Business Platforms', logo: logos.hubspot, connectionType: 'api' },
  { id: 'salesforce', name: 'Salesforce', category: 'Business Platforms', logo: logos.salesforce, connectionType: 'api' },
  { id: 'facebook', name: 'Facebook Ads', category: 'Business Platforms', logo: logos.facebook, connectionType: 'api' },
  { id: 'googleads', name: 'Google Ads', category: 'Business Platforms', logo: logos.googleads, connectionType: 'api' },
  { id: 'stripe', name: 'Stripe', category: 'Business Platforms', logo: logos.stripe, connectionType: 'api' },
  { id: 'shopify', name: 'Shopify', category: 'Business Platforms', logo: logos.shopify, connectionType: 'api' },
  { id: 'zendesk', name: 'Zendesk', category: 'Business Platforms', logo: logos.zendesk, connectionType: 'api' },
  { id: 'mailchimp', name: 'Mailchimp', category: 'Business Platforms', logo: logos.mailchimp, connectionType: 'api' },
  { id: 'quickbooks', name: 'QuickBooks', category: 'Business Platforms', logo: logos.quickbooks, connectionType: 'api' },
  { id: 'jira', name: 'Jira', category: 'Business Platforms', logo: logos.jira, connectionType: 'api' },
  { id: 'snowflake', name: 'Snowflake', category: 'Data Warehouses', logo: logos.snowflake, connectionType: 'data-warehouse' },
  { id: 'databricks', name: 'Databricks', category: 'Data Warehouses', logo: logos.databricks, connectionType: 'lakehouse' },
  { id: 'googlebigquery', name: 'BigQuery', category: 'Data Warehouses', logo: logos.googlebigquery, connectionType: 'data-warehouse' },
  { id: 'amazonredshift', name: 'Amazon Redshift', category: 'Data Warehouses', logo: logos.amazonredshift, connectionType: 'data-warehouse' },
  { id: 'azuresynapseanalytics', name: 'Azure Synapse', category: 'Data Warehouses', logo: logos.azuresynapseanalytics, connectionType: 'data-warehouse' },
]

const databaseFields: FieldDefinition[] = [
  { id: 'host', label: 'Host', type: 'text', placeholder: 'e.g., db.company.com', required: true },
  { id: 'port', label: 'Port', type: 'number', placeholder: 'e.g., 5432', required: true },
  { id: 'database', label: 'Database Name', type: 'text', placeholder: 'Database', required: true },
  { id: 'schema', label: 'Schema', type: 'text', placeholder: 'public', required: false },
  { id: 'username', label: 'Username', type: 'text', placeholder: 'db_user', required: true },
  { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
]

const platformFields: FieldDefinition[] = [
  { id: 'accountId', label: 'Account ID', type: 'text', placeholder: 'Account ID', required: true },
  { id: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Client ID', required: true },
  { id: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: '••••••••', required: true },
  { id: 'apiKey', label: 'API Key', type: 'password', placeholder: '••••••••', required: false },
]

const warehouseFields: FieldDefinition[] = [
  { id: 'account', label: 'Account', type: 'text', placeholder: 'Account', required: true },
  { id: 'warehouse', label: 'Warehouse', type: 'text', placeholder: 'Warehouse', required: true },
  { id: 'database', label: 'Database Name', type: 'text', placeholder: 'Database', required: true },
  { id: 'role', label: 'Role', type: 'text', placeholder: 'Role', required: false },
  { id: 'username', label: 'Username', type: 'text', placeholder: 'User', required: true },
  { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
]

export default function CreateConnectionPage() {
  const { closeTab, activeTabId, setTabAsset, setTabPage } = useTabStore()
  const { addAsset, getAssetsByType, loadAssets } = useCatalogStore()
  const [step, setStep] = useState<Step>('type')
  const [selectedConnectionType, setSelectedConnectionType] = useState<ConnectionTypeOption | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [showTestToast, setShowTestToast] = useState(false)
  const testTimerRef = useRef<number | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [connectionForm, setConnectionForm] = useState<ConnectionForm>({
    workspace: '',
    name: '',
    description: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    schema: '',
    account: '',
    warehouse: '',
    role: '',
    apiKey: '',
    clientId: '',
    clientSecret: '',
    accountId: '',
  })

  const formFields = useMemo(() => {
    if (!selectedConnectionType) return []
    if (selectedConnectionType.category === 'Databases') return databaseFields
    if (selectedConnectionType.category === 'Business Platforms') return platformFields
    return warehouseFields
  }, [selectedConnectionType])

  useEffect(() => {
    void loadAssets()
  }, [loadAssets])

  const workspaces = useMemo(() => getAssetsByType('workspace'), [getAssetsByType])

  useEffect(() => {
    return () => {
      if (testTimerRef.current) {
        window.clearTimeout(testTimerRef.current)
      }
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const handleSelectConnectionType = (connectionType: ConnectionTypeOption) => {
    setSelectedConnectionType(connectionType)
    if (!connectionForm.name) {
      setConnectionForm((prev) => ({
        ...prev,
        name: `${connectionType.name} Connection`,
      }))
    }
    setStep('credentials')
  }

  const handleFieldChange = (fieldId: keyof ConnectionForm, value: string) => {
    setConnectionForm((prev) => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldId]
        return next
      })
    }
  }

  const validateCredentials = () => {
    const newErrors: Record<string, string> = {}
    if (!connectionForm.workspace) newErrors.workspace = 'Workspace is required'
    if (!connectionForm.name) newErrors.name = 'Name is required'
    for (const field of formFields) {
      if (field.required && !connectionForm[field.id]) {
        newErrors[field.id] = `${field.label} is required`
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const canTestConnection = () => {
    if (!connectionForm.workspace || !connectionForm.name) return false
    for (const field of formFields) {
      if (field.required && !connectionForm[field.id]) {
        return false
      }
    }
    return true
  }

  const handleCreateConnection = () => {
    if (!selectedConnectionType) return
    if (!validateCredentials()) return

    const connection: Asset = {
      id: `connection-${Date.now()}`,
      name: connectionForm.name,
      description: connectionForm.description,
      type: 'connection',
      parentId: connectionForm.workspace || 'ws1',
      owner: 'Ron Swanson',
      modified: new Date(),
      connectionMetadata: {
        connectionType: selectedConnectionType.connectionType,
        host: connectionForm.host || undefined,
        port: connectionForm.port ? Number(connectionForm.port) : undefined,
        database: connectionForm.database || undefined,
        username: connectionForm.username || undefined,
        schema: connectionForm.schema || undefined,
        account: connectionForm.account || undefined,
        warehouse: connectionForm.warehouse || undefined,
        role: connectionForm.role || undefined,
        apiKey: connectionForm.apiKey || undefined,
        clientId: connectionForm.clientId || undefined,
        clientSecret: connectionForm.clientSecret || undefined,
        accountId: connectionForm.accountId || undefined,
      },
    }

    addAsset(connection)
    if (activeTabId) {
      setTabAsset(activeTabId, connection)
    }
  }

  const handleBack = () => {
    if (!activeTabId) return
    setTabPage(activeTabId, 'asset-type-selector', 'Create New')
  }

  const handleStepBack = () => {
    if (step === 'credentials') {
      setStep('type')
    }
  }

  const handleCancel = () => {
    if (activeTabId) {
      closeTab(activeTabId)
    }
  }

  const handleTestConnection = () => {
    if (isTesting) return
    setIsTesting(true)
    if (testTimerRef.current) {
      window.clearTimeout(testTimerRef.current)
    }
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }
    testTimerRef.current = window.setTimeout(() => {
      setIsTesting(false)
      setShowTestToast(true)
      toastTimerRef.current = window.setTimeout(() => {
        setShowTestToast(false)
      }, 2400)
    }, 900)
  }

  return (
    <div className="relative flex h-full flex-col bg-white">
      {showTestToast && (
        <div className="absolute left-1/2 top-6 z-50 -translate-x-1/2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Connection test successful
          </div>
        </div>
      )}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          {step === 'type' && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <h1 className="text-2xl font-semibold">Create Connection</h1>
        </div>
      </div>

      {step === 'type' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-6xl space-y-8">
            {(['Databases', 'Business Platforms', 'Data Warehouses'] as const).map(
              (category) => (
                <div key={category}>
                  <h2 className="mb-4 text-lg font-semibold">{category}</h2>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {connectionTypes
                      .filter((item) => item.category === category)
                      .map((connection) => (
                        <button
                          key={connection.id}
                          onClick={() => handleSelectConnectionType(connection)}
                          className="group flex flex-col items-start gap-3 rounded-lg border border-border bg-white p-4 text-left transition-all hover:border-blue-500 hover:shadow-md"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50">
                            <img
                              src={connection.logo}
                              alt={`${connection.name} logo`}
                              className="h-8 w-8 object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold">{connection.name}</h3>
                            <p className="text-xs text-muted-foreground">{connection.category}</p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {step === 'credentials' && selectedConnectionType && (
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="flex items-center gap-4 rounded-lg border border-border bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50">
                <img
                  src={selectedConnectionType.logo}
                  alt={`${selectedConnectionType.name} logo`}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connection type</p>
                <h2 className="text-lg font-semibold">{selectedConnectionType.name}</h2>
              </div>
              <div className="ml-auto">
                <span className="rounded-full border border-border bg-gray-50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  {selectedConnectionType.category === 'Databases'
                    ? 'Database'
                    : selectedConnectionType.category === 'Business Platforms'
                      ? 'Platform'
                      : 'Warehouse'}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold">Workspace</h2>
              <div className="mt-3">
                <select
                  value={connectionForm.workspace}
                  onChange={(e) => handleFieldChange('workspace', e.target.value)}
                  className={cn(
                    'h-10 w-full rounded-md border bg-background px-3 text-sm',
                    errors.workspace ? 'border-red-500' : 'border-input'
                  )}
                >
                  <option value="">Select workspace</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
                {errors.workspace && (
                  <p className="mt-1 text-sm text-red-500">{errors.workspace}</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold">Name & Description</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={connectionForm.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className={cn(
                      'h-10 w-full rounded-md border bg-background px-3 text-sm',
                      errors.name ? 'border-red-500' : 'border-input'
                    )}
                    placeholder="Connection name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Description</label>
                  <textarea
                    value={connectionForm.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Optional description"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold">Credentials</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {formFields.map((field) => (
                  <div key={field.id} className="flex flex-col">
                    <label className="mb-2 block text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500"> *</span>}
                    </label>
                    <input
                      type={field.type}
                      value={connectionForm[field.id] as string}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className={cn(
                        'h-10 w-full rounded-md border bg-background px-3 text-sm',
                        errors[field.id] ? 'border-red-500' : 'border-input'
                      )}
                      placeholder={field.placeholder}
                    />
                    {errors[field.id] && (
                      <p className="mt-1 text-sm text-red-500">{errors[field.id]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {step === 'credentials' && (
        <div className="border-t border-border px-6 py-4">
          <div className="mx-auto flex max-w-3xl justify-between">
            <Button variant="outline" onClick={handleStepBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || !canTestConnection()}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test connection'
                )}
              </Button>
              <Button onClick={handleCreateConnection} className="bg-green-600 hover:bg-green-700">
                Create Connection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
