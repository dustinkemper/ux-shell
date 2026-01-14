import { useTabStore } from '@/stores/tabStore'
import type { AssetType } from '@/types'
import {
  Database,
  Workflow,
  BarChart3,
  Table2,
  Code,
  Package,
  BookOpen,
  Eye,
  Brain,
  BookMarked,
  Sparkles,
} from 'lucide-react'

interface AssetTypeOption {
  id: string
  name: string
  type: AssetType
  icon: React.ReactNode
  description: string
}

const assetTypes: AssetTypeOption[] = [
  {
    id: 'connection',
    name: 'Connection',
    type: 'connection',
    icon: <Database className="h-6 w-6" />,
    description: 'Connect to external data sources like databases, APIs, and file systems',
  },
  {
    id: 'pipeline',
    name: 'Data Pipeline',
    type: 'pipeline',
    icon: <Workflow className="h-6 w-6" />,
    description: 'Create data pipelines to move and transform data between connections',
  },
  {
    id: 'analytics-app',
    name: 'Analytics App',
    type: 'analytics-app',
    icon: <BarChart3 className="h-6 w-6" />,
    description: 'Build interactive analytics applications and dashboards',
  },
  {
    id: 'dataflow',
    name: 'Data Flow',
    type: 'dataflow',
    icon: <Workflow className="h-6 w-6" />,
    description: 'Design data transformation workflows and ETL processes',
  },
  {
    id: 'table-recipe',
    name: 'Table Recipe',
    type: 'table-recipe',
    icon: <Table2 className="h-6 w-6" />,
    description: 'Create reusable table transformation recipes',
  },
  {
    id: 'script',
    name: 'Script',
    type: 'script',
    icon: <Code className="h-6 w-6" />,
    description: 'Write and execute custom scripts for data processing',
  },
  {
    id: 'data-product',
    name: 'Data Product',
    type: 'data-product',
    icon: <Package className="h-6 w-6" />,
    description: 'Package and publish data products for consumption',
  },
  {
    id: 'monitor-view',
    name: 'Monitor View',
    type: 'monitor-view',
    icon: <Eye className="h-6 w-6" />,
    description: 'Monitor data quality, performance, and system health',
  },
  {
    id: 'glossary',
    name: 'Glossary',
    type: 'glossary',
    icon: <BookOpen className="h-6 w-6" />,
    description: 'Define and manage business terms and data definitions',
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    type: 'knowledge-base',
    icon: <BookMarked className="h-6 w-6" />,
    description: 'Create and organize knowledge articles and documentation',
  },
  {
    id: 'predict',
    name: 'Predict',
    type: 'predict',
    icon: <Brain className="h-6 w-6" />,
    description: 'Build and deploy machine learning models for predictions',
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    type: 'ai-assistant',
    icon: <Sparkles className="h-6 w-6" />,
    description: 'Interact with AI-powered assistants for data insights',
  },
]

export default function AssetTypeSelectorPage() {
  const { openPageTab } = useTabStore()

  const handleSelectType = (option: AssetTypeOption) => {
    if (option.type === 'connection') {
      openPageTab('create-connection', 'Create Connection', 'Database')
    } else if (option.type === 'pipeline') {
      openPageTab('create-pipeline', 'Create Pipeline', 'Workflow')
    } else {
      // For other asset types, we could create a generic creation page
      // For now, just show a placeholder
      console.log('Creating', option.type)
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-semibold">Create New</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the type of asset you want to create
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assetTypes.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectType(option)}
                className="group flex flex-col items-start gap-3 rounded-lg border border-border bg-white p-4 text-left transition-all hover:border-blue-500 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold">{option.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
