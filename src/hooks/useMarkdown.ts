import { useState, useCallback, useEffect } from 'react'

const DEFAULT_MARKDOWN = `# Welcome to Markdown Editor

A beautiful **Progressive Web App** for viewing and editing Markdown files.

## Features

- **View Mode**: See your Markdown rendered beautifully
- **Edit Mode**: Split pane with rich text and code editor
- **File System Access**: Open and save files directly
- **Offline Support**: Works without internet once installed
- **Installable**: Add to your desktop or home screen

## Getting Started

1. Click **Edit** to switch to edit mode
2. Use the **rich text editor** on the left for WYSIWYG editing
3. Use the **code editor** on the right for direct Markdown editing
4. Changes sync automatically between both editors

## Markdown Support

### Text Formatting

*Italic*, **bold**, and ~~strikethrough~~ text.

### Code

Inline \`code\` and code blocks:

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

### Lists

- Item one
- Item two
  - Nested item
- Item three

### Task Lists

- [x] Create Markdown editor
- [x] Add split pane editing
- [ ] Take over the world

### Blockquotes

> Code is truth. Rendering is how we perceive.

### Tables

| Feature | Status |
|---------|--------|
| View Mode | ✅ |
| Edit Mode | ✅ |
| File Handling | ✅ |
| PWA | ✅ |

---

**Tip**: Install this app for the best experience! Look for the install button in your browser's address bar.
`

export type AppMode = 'view' | 'edit'

export function useMarkdown() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN)
  const [mode, setMode] = useState<AppMode>('view')
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const updateMarkdown = useCallback((newContent: string) => {
    setMarkdown(newContent)
    setIsDirty(true)
  }, [])

  const loadContent = useCallback((content: string, name?: string) => {
    setMarkdown(content)
    setFileName(name || null)
    setIsDirty(false)
  }, [])

  const markSaved = useCallback(() => {
    setIsDirty(false)
  }, [])

  const newDocument = useCallback(() => {
    setMarkdown('')
    setFileName(null)
    setIsDirty(false)
    setMode('edit')
  }, [])

  // Handle file opened via PWA file handler
  useEffect(() => {
    if (window.launchQueue) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (launchParams.files && launchParams.files.length > 0) {
          const fileHandle = launchParams.files[0]
          const file = await fileHandle.getFile()
          const content = await file.text()
          loadContent(content, file.name)
        }
      })
    }
  }, [loadContent])

  return {
    markdown,
    setMarkdown: updateMarkdown,
    mode,
    setMode,
    fileName,
    setFileName,
    isDirty,
    loadContent,
    markSaved,
    newDocument
  }
}
