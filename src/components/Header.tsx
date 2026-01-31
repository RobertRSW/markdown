import { Eye, Edit3, FileText, FolderOpen, Save, Download, FilePlus } from 'lucide-react'
import { AppMode } from '../hooks/useMarkdown'

interface HeaderProps {
  mode: AppMode
  onModeChange: (mode: AppMode) => void
  fileName: string | null
  isDirty: boolean
  onNew: () => void
  onOpen: () => void
  onSave: () => void
  onSaveAs: () => void
}

export default function Header({
  mode,
  onModeChange,
  fileName,
  isDirty,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-slate-800 text-white">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" />
          <span className="font-semibold text-lg">MD Editor</span>
        </div>

        <div className="h-6 w-px bg-slate-600" />

        <div className="flex items-center gap-1">
          <button
            onClick={onNew}
            className="p-2 rounded hover:bg-slate-700 transition-colors"
            title="New (Ctrl+N)"
          >
            <FilePlus className="w-5 h-5" />
          </button>
          <button
            onClick={onOpen}
            className="p-2 rounded hover:bg-slate-700 transition-colors"
            title="Open (Ctrl+O)"
          >
            <FolderOpen className="w-5 h-5" />
          </button>
          <button
            onClick={onSave}
            className="p-2 rounded hover:bg-slate-700 transition-colors"
            title="Save (Ctrl+S)"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            onClick={onSaveAs}
            className="p-2 rounded hover:bg-slate-700 transition-colors"
            title="Save As (Ctrl+Shift+S)"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {fileName && (
          <span className="text-sm text-slate-300">
            {fileName}
            {isDirty && <span className="text-amber-400 ml-1">*</span>}
          </span>
        )}
        {!fileName && isDirty && (
          <span className="text-sm text-slate-300">
            Untitled
            <span className="text-amber-400 ml-1">*</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
        <button
          onClick={() => onModeChange('view')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'view'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-600'
          }`}
          title="View Mode (Ctrl+E)"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={() => onModeChange('edit')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === 'edit'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-600'
          }`}
          title="Edit Mode (Ctrl+E)"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
      </div>
    </header>
  )
}
