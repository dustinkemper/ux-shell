import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Save, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTabStore } from '@/stores/tabStore'
import { useCatalogStore } from '@/stores/catalogStore'
import type { ConnectionMetadata } from '@/types'

export default function CreateConnectionPage() {
  const { closeTab, activeTabId } = useTabStore()
  const { addAsset } = useCatalogStore()
  const [isTesting, setIsTesting] = useState(false)
  const [showTestToast, setShowTestToast] = useState(false)
  const testTimerRef = useRef<number | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const [formData, setFormData] = useState({
    workspace: '',
    name: '',
    type: 'database' as ConnectionMetadata['connectionType'],
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.host.trim()) {
      newErrors.host = 'Host is required'
    }
    if (!formData.port.trim()) {
      newErrors.port = 'Port is required'
    } else if (isNaN(Number(formData.port))) {
      newErrors.port = 'Port must be a number'
    }
    if (!formData.database.trim()) {
      newErrors.database = 'Database is required'
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      return
    }

    const newConnection = {
      id: `conn-${Date.now()}`,
      name: formData.name,
      type: 'connection' as const,
      connectionMetadata: {
        connectionType: formData.type,
        host: formData.host,
        port: Number(formData.port),
        database: formData.database,
        username: formData.username,
      },
      owner: 'Ron Swanson',
      modified: new Date(),
      quality: 82,
    }

    addAsset(newConnection)
    
    // Close the tab after saving
    if (activeTabId) {
      closeTab(activeTabId)
    }
  }

  const handleBack = () => {
    // Just close the tab - user can navigate back via tabs
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
    <div className="flex h-full flex-col bg-white relative">
      {showTestToast && (
        <div className="absolute right-6 top-6 z-50 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Connection test successful
          </div>
        </div>
      )}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Create Connection</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl">
          <div className="space-y-6">
            {/* Workspace */}
            <div>
              <label className="mb-2 block text-sm font-medium">Workspace</label>
              <select
                value={formData.workspace}
                onChange={(e) => handleChange('workspace', e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select workspace</option>
                <option value="workspace1">Workspace 1</option>
                <option value="workspace2">Workspace 2</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`h-10 w-full rounded-md border px-3 text-sm ${
                  errors.name ? 'border-red-500' : 'border-input'
                } bg-background`}
                placeholder="Enter connection name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="database">Database</option>
                <option value="data-warehouse">Data Warehouse</option>
                <option value="lakehouse">Lakehouse</option>
                <option value="api">API</option>
                <option value="file">File</option>
              </select>
            </div>

            {/* Host */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Host <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => handleChange('host', e.target.value)}
                className={`h-10 w-full rounded-md border px-3 text-sm ${
                  errors.host ? 'border-red-500' : 'border-input'
                } bg-background`}
                placeholder="e.g., localhost or 192.168.1.1"
              />
              {errors.host && <p className="mt-1 text-sm text-red-500">{errors.host}</p>}
            </div>

            {/* Port */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Port <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.port}
                onChange={(e) => handleChange('port', e.target.value)}
                className={`h-10 w-full rounded-md border px-3 text-sm ${
                  errors.port ? 'border-red-500' : 'border-input'
                } bg-background`}
                placeholder="e.g., 5432"
              />
              {errors.port && <p className="mt-1 text-sm text-red-500">{errors.port}</p>}
            </div>

            {/* Database */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Database <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.database}
                onChange={(e) => handleChange('database', e.target.value)}
                className={`h-10 w-full rounded-md border px-3 text-sm ${
                  errors.database ? 'border-red-500' : 'border-input'
                } bg-background`}
                placeholder="Database name"
              />
              {errors.database && <p className="mt-1 text-sm text-red-500">{errors.database}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className={`h-10 w-full rounded-md border px-3 text-sm ${
                  errors.username ? 'border-red-500' : 'border-input'
                } bg-background`}
                placeholder="Database username"
              />
              {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`h-10 w-full rounded-md border px-3 text-sm ${
                  errors.password ? 'border-red-500' : 'border-input'
                } bg-background`}
                placeholder="Database password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test connection'
              )}
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="mr-2 h-4 w-4" />
              Save Connection
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
