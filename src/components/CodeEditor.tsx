import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function CodeEditor({ value, onChange }: CodeEditorProps) {
  const handleChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue)
    }
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="markdown"
      value={value}
      onChange={handleChange}
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
