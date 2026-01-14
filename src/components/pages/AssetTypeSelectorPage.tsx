import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCatalogStore } from '@/stores/catalogStore'
import { useTabStore } from '@/stores/tabStore'
import ConnectionDetailPage from './ConnectionDetailPage'
import { Button } from '@/components/ui/button'
import type { Asset, AssetType, ConnectionMetadata } from '@/types'
import { cn } from '@/lib/utils'
import { getAssetIcon } from '@/lib/iconUtils'

type CreateStep =
  | 'asset-type'
  | 'connection-type'
  | 'connection-credentials'
  | 'connection-detail'
  | 'not-implemented'

interface AssetTypeOption {
  id: string
  name: string
  type: AssetType
  description: string
}

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

const assetTypes: AssetTypeOption[] = [
  {
    id: 'connection',
    name: 'Connection',
    type: 'connection',
    description: 'Connect to external data sources like databases, APIs, and file systems',
  },
  {
    id: 'pipeline',
    name: 'Data Pipeline',
    type: 'pipeline',
    description: 'Create data pipelines to move and transform data between connections',
  },
  {
    id: 'analytics-app',
    name: 'Analytics App',
    type: 'analytics-app',
    description: 'Build interactive analytics applications and dashboards',
  },
  {
    id: 'dataflow',
    name: 'Data Flow',
    type: 'dataflow',
    description: 'Design data transformation workflows and ETL processes',
  },
  {
    id: 'table-recipe',
    name: 'Table Recipe',
    type: 'table-recipe',
    description: 'Create reusable table transformation recipes',
  },
  {
    id: 'script',
    name: 'Script',
    type: 'script',
    description: 'Write and execute custom scripts for data processing',
  },
  {
    id: 'data-product',
    name: 'Data Product',
    type: 'data-product',
    description: 'Package and publish data products for consumption',
  },
  {
    id: 'monitor-view',
    name: 'Monitor View',
    type: 'monitor-view',
    description: 'Monitor data quality, performance, and system health',
  },
  {
    id: 'glossary',
    name: 'Glossary',
    type: 'glossary',
    description: 'Define and manage business terms and data definitions',
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    type: 'knowledge-base',
    description: 'Create and organize knowledge articles and documentation',
  },
  {
    id: 'predict',
    name: 'Predict',
    type: 'predict',
    description: 'Build and deploy machine learning models for predictions',
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    type: 'ai-assistant',
    description: 'Interact with AI-powered assistants for data insights',
  },
]

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
  // Databases
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases', logo: logos.postgresql, connectionType: 'database' },
  { id: 'mysql', name: 'MySQL', category: 'Databases', logo: logos.mysql, connectionType: 'database' },
  { id: 'mongodb', name: 'MongoDB', category: 'Databases', logo: logos.mongodb, connectionType: 'database' },
  { id: 'microsoftsqlserver', name: 'Microsoft SQL Server', category: 'Databases', logo: logos.microsoftsqlserver, connectionType: 'database' },
  { id: 'oracle', name: 'Oracle', category: 'Databases', logo: logos.oracle, connectionType: 'database' },
  { id: 'sqlite', name: 'SQLite', category: 'Databases', logo: logos.sqlite, connectionType: 'database' },
  { id: 'mariadb', name: 'MariaDB', category: 'Databases', logo: logos.mariadb, connectionType: 'database' },
  { id: 'redis', name: 'Redis', category: 'Databases', logo: logos.redis, connectionType: 'database' },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'Databases', logo: logos.elasticsearch, connectionType: 'database' },
  // Business Platforms
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
  // Data Warehouses
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

export default function AssetTypeSelectorPage() {
  const { addAsset } = useCatalogStore()
  const { activeTabId, renameTab, setTabIcon, setTabAsset, setTabPage } = useTabStore()

  const [step, setStep] = useState<CreateStep>('asset-type')
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null)
  const [selectedConnectionType, setSelectedConnectionType] = useState<ConnectionTypeOption | null>(null)
  const [createdConnectionId, setCreatedConnectionId] = useState<string | null>(null)
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
    if (!activeTabId) return
    if (step === 'asset-type') {
      renameTab(activeTabId, 'Create New')
    } else if (step === 'connection-type' || step === 'connection-credentials') {
      renameTab(activeTabId, 'Create Connection')
    } else if (step === 'connection-detail') {
      renameTab(activeTabId, connectionForm.name || 'Connection')
    }
  }, [step, activeTabId, renameTab, connectionForm.name])

  const handleSelectAssetType = (type: AssetType) => {
    setSelectedAssetType(type)
    if (activeTabId) {
      setTabIcon(activeTabId, type)
    }
    if (type === 'connection') {
      setStep('connection-type')
    } else if (type === 'pipeline') {
      if (activeTabId) {
        setTabPage(activeTabId, 'create-pipeline', 'Create Pipeline', 'pipeline')
      }
    } else {
      setStep('not-implemented')
    }
  }

  const handleSelectConnectionType = (connectionType: ConnectionTypeOption) => {
    setSelectedConnectionType(connectionType)
    if (!connectionForm.name) {
      setConnectionForm((prev) => ({
        ...prev,
        name: `${connectionType.name} Connection`,
      }))
    }
    setStep('connection-credentials')
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
      quality: 82,
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
    setCreatedConnectionId(connection.id)
    if (activeTabId) {
      // Convert the current Create New tab into the connection asset tab
      setTabAsset(activeTabId, connection)
    }
    setStep('connection-detail')
  }

  const handleBack = () => {
    if (step === 'connection-credentials') {
      setStep('connection-type')
    } else if (step === 'connection-type') {
      setStep('asset-type')
    } else if (step === 'not-implemented') {
      setStep('asset-type')
    }
  }

  const renderHeader = (title: string, subtitle?: string) => (
    <div className="border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        {step !== 'asset-type' && step !== 'connection-detail' && (
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  if (step === 'connection-detail' && createdConnectionId) {
    return <ConnectionDetailPage connectionId={createdConnectionId} />
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {step === 'asset-type' &&
        renderHeader('Create New', 'Select the type of asset you want to create')}
      {step === 'connection-type' &&
        renderHeader('Create Connection', 'Select a connection type to get started')}
      {step === 'connection-credentials' &&
        renderHeader('Create Connection', 'Enter credentials for your connection')}
      {step === 'not-implemented' &&
        renderHeader('Coming Soon', 'This asset type flow is not yet implemented')}

      {/* Step 1: Asset type selection */}
      {step === 'asset-type' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assetTypes.map((option) => {
                const Icon = getAssetIcon(option.type)
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectAssetType(option.type)}
                    className="group flex flex-col items-start gap-3 rounded-lg border border-border bg-white p-4 text-left transition-all hover:border-blue-500 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold">{option.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {option.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Connection type gallery */}
      {step === 'connection-type' && (
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

      {/* Step 3: Credentials form */}
      {step === 'connection-credentials' && selectedConnectionType && (
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
                  <option value="ws1">Workspace 1</option>
                  <option value="ws2">Workspace 2</option>
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

            <div className="flex justify-end">
              <Button onClick={handleCreateConnection} className="bg-green-600 hover:bg-green-700">
                Create Connection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Not implemented */}
      {step === 'not-implemented' && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {selectedAssetType} creation is not yet implemented.
            </p>
            <Button variant="outline" className="mt-4" onClick={handleBack}>
              Back to Create New
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
