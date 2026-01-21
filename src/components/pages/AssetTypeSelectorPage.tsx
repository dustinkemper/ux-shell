import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useTabStore } from '@/stores/tabStore'
import { Button } from '@/components/ui/button'
import type { AssetType } from '@/types'
import { getAssetIcon } from '@/lib/iconUtils'

type CreateStep = 'asset-type' | 'not-implemented'

interface AssetTypeOption {
  id: string
  name: string
  type: AssetType
  description: string
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

export default function AssetTypeSelectorPage() {
  const { activeTabId, renameTab, setTabIcon, setTabPage } = useTabStore()
  const [step, setStep] = useState<CreateStep>('asset-type')
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null)

  useEffect(() => {
    if (!activeTabId) return
    renameTab(activeTabId, 'Create New')
  }, [activeTabId, renameTab])

  const handleSelectAssetType = (type: AssetType) => {
    setSelectedAssetType(type)
    if (activeTabId) {
      setTabIcon(activeTabId, type)
    }
    if (type === 'connection') {
      if (activeTabId) {
        setTabPage(activeTabId, 'create-connection', 'Create Connection', 'connection')
      }
    } else if (type === 'pipeline') {
      if (activeTabId) {
        setTabPage(activeTabId, 'create-pipeline', 'Create Pipeline', 'pipeline')
      }
    } else {
      setStep('not-implemented')
    }
  }

  const handleBack = () => {
    if (step === 'not-implemented') {
      setStep('asset-type')
    }
  }

  const renderHeader = (title: string, subtitle?: string) => (
    <div className="border-b border-border px-6 py-4">
      <div className="flex items-center gap-3">
        {step !== 'asset-type' && (
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

  return (
    <div className="flex h-full flex-col bg-white">
      {step === 'asset-type' &&
        renderHeader('Create New', 'Select the type of asset you want to create')}
      {step === 'not-implemented' &&
        renderHeader('Coming Soon', 'This asset type flow is not yet implemented')}

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
