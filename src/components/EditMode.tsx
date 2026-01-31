import { useState, useCallback, useRef } from 'react'
import RichTextEditor from './RichTextEditor'
import CodeEditor from './CodeEditor'

interface EditModeProps {
  markdown: string
  onChange: (value: string) => void
}

export default function EditMode({ markdown, onChange }: EditModeProps) {
  const [splitPosition, setSplitPosition] = useState(50)
  const [activeEditor, setActiveEditor] = useState<'monaco' | 'milkdown' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMouseDown = useCallback(() => {
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100

    // Clamp between 20% and 80%
    setSplitPosition(Math.min(80, Math.max(20, percentage)))
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  // Attach global mouse events for dragging
  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    handleMouseDown()

    const onMouseMove = (e: MouseEvent) => handleMouseMove(e)
    const onMouseUp = () => {
      handleMouseUp()
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [handleMouseDown, handleMouseMove, handleMouseUp])

  // Focus handlers
  const handleMonacoFocus = useCallback(() => {
    setActiveEditor('monaco')
  }, [])

  const handleMilkdownFocus = useCallback(() => {
    setActiveEditor('milkdown')
  }, [])

  return (
    <div ref={containerRef} className="flex h-full overflow-hidden">
      {/* Rich Text Editor (Left Pane) */}
      <div
        className="overflow-hidden border-r border-gray-200"
        style={{ width: `${splitPosition}%` }}
        onFocus={handleMilkdownFocus}
      >
        <div className="h-8 px-3 flex items-center bg-gray-50 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Rich Text
          </span>
          {activeEditor === 'milkdown' && (
            <span className="ml-2 text-xs text-blue-500">(active)</span>
          )}
        </div>
        <div className="h-[calc(100%-2rem)] overflow-hidden">
          <RichTextEditor
            markdown={markdown}
            onChange={onChange}
            isMaster={activeEditor === 'milkdown'}
          />
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors flex-shrink-0"
        onMouseDown={handleDividerMouseDown}
      />

      {/* Code Editor (Right Pane) */}
      <div
        className="overflow-hidden"
        style={{ width: `${100 - splitPosition}%` }}
        onFocus={handleMonacoFocus}
      >
        <div className="h-8 px-3 flex items-center bg-gray-50 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Markdown
          </span>
          {activeEditor === 'monaco' && (
            <span className="ml-2 text-xs text-blue-500">(active)</span>
          )}
        </div>
        <div className="h-[calc(100%-2rem)]">
          <CodeEditor
            value={markdown}
            onChange={onChange}
            isMaster={activeEditor === 'monaco'}
          />
        </div>
      </div>
    </div>
  )
}
