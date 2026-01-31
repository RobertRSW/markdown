import { useRef, useEffect, useCallback } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  isMaster: boolean
}

export default function CodeEditor({ value, onChange, isMaster }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const lastValueRef = useRef(value)

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const handleChange = useCallback((newValue: string | undefined) => {
    if (newValue === undefined) return

    // Only emit changes if we're the master (have focus)
    if (!isMaster) return

    lastValueRef.current = newValue
    onChange(newValue)
  }, [onChange, isMaster])

  // Sync external changes (from Milkdown) to Monaco - only when not master
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    // Only accept external updates when we're NOT the master
    if (isMaster) return

    // Get current Monaco content
    const currentContent = editor.getValue()

    // Only update if content actually differs
    if (currentContent !== value) {
      lastValueRef.current = value

      // Save cursor and scroll position
      const position = editor.getPosition()
      const scrollTop = editor.getScrollTop()
      const scrollLeft = editor.getScrollLeft()

      // Push edit as an undo-able operation
      editor.executeEdits('external-sync', [{
        range: editor.getModel()!.getFullModelRange(),
        text: value,
        forceMoveMarkers: true
      }])

      // Restore cursor (clamped to valid position)
      if (position) {
        const model = editor.getModel()
        if (model) {
          const maxLine = model.getLineCount()
          const line = Math.min(position.lineNumber, maxLine)
          const maxCol = model.getLineMaxColumn(line)
          const col = Math.min(position.column, maxCol)
          editor.setPosition({ lineNumber: line, column: col })
        }
      }

      // Restore scroll
      editor.setScrollTop(scrollTop)
      editor.setScrollLeft(scrollLeft)
    }
  }, [value, isMaster])

  return (
    <Editor
      height="100%"
      defaultLanguage="markdown"
      defaultValue={value}
      onChange={handleChange}
      onMount={handleEditorDidMount}
      theme="vs-light"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        wordWrap: 'on',
        wrappingIndent: 'indent',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
        tabSize: 2,
        insertSpaces: true,
        renderWhitespace: 'selection',
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true },
        suggest: { showWords: false },
        quickSuggestions: false,
      }}
    />
  )
}
