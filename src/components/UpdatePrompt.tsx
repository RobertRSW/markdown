import { RefreshCw, X, Wifi } from 'lucide-react'

interface UpdatePromptProps {
  needRefresh: boolean
  offlineReady: boolean
  onUpdate: () => void
  onDismissUpdate: () => void
  onDismissOfflineReady: () => void
}

export default function UpdatePrompt({
  needRefresh,
  offlineReady,
  onUpdate,
  onDismissUpdate,
  onDismissOfflineReady
}: UpdatePromptProps) {
  if (!needRefresh && !offlineReady) {
    return null
  }

  if (needRefresh) {
    return (
      <div className="fixed bottom-4 right-4 bg-slate-800 text-white rounded-lg shadow-lg p-4 flex items-center gap-3 z-50">
        <RefreshCw className="w-5 h-5 text-blue-400" />
        <div>
          <p className="font-medium">Update available</p>
          <p className="text-sm text-slate-300">Refresh to get the latest version</p>
        </div>
        <div className="flex gap-2 ml-2">
          <button
            onClick={onUpdate}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
          >
            Update
          </button>
          <button
            onClick={onDismissUpdate}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (offlineReady) {
    return (
      <div className="fixed bottom-4 right-4 bg-slate-800 text-white rounded-lg shadow-lg p-4 flex items-center gap-3 z-50">
        <Wifi className="w-5 h-5 text-green-400" />
        <div>
          <p className="font-medium">Ready for offline use</p>
          <p className="text-sm text-slate-300">App has been cached for offline access</p>
        </div>
        <button
          onClick={onDismissOfflineReady}
          className="p-1.5 hover:bg-slate-700 rounded transition-colors ml-2"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return null
}
