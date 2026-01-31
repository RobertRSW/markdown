import { useEffect, useRef, useCallback } from 'react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { replaceAll } from '@milkdown/utils'

interface RichTextEditorProps {
  markdown: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ markdown, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<Editor | null>(null)
  const isInternalChange = useRef(false)
  const lastExternalMarkdown = useRef(markdown)

  // Track if change is from Milkdown
  const handleMarkdownChange = useCallback((md: string) => {
    isInternalChange.current = true
    onChange(md)
    // Reset flag after a small delay
    setTimeout(() => {
      isInternalChange.current = false
    }, 0)
  }, [onChange])

  // Initialize Milkdown editor
  useEffect(() => {
    if (!editorRef.current) return

    const initEditor = async () => {
      const editor = await Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, editorRef.current!)
          ctx.set(defaultValueCtx, markdown)
          ctx.get(listenerCtx).markdownUpdated((_, md) => {
            handleMarkdownChange(md)
          })
        })
        .use(commonmark)
        .use(gfm)
        .use(listener)
        .create()

      editorInstanceRef.current = editor
      lastExternalMarkdown.current = markdown
    }

    initEditor()

    return () => {
      editorInstanceRef.current?.destroy()
      editorInstanceRef.current = null
    }
  }, []) // Only run once on mount

  // Update editor when markdown changes externally (from Monaco)
  useEffect(() => {
    const editor = editorInstanceRef.current
    if (!editor) return

    // Skip if this is an internal change from Milkdown itself
    if (isInternalChange.current) return

    // Only update if the markdown actually changed from external source
    if (markdown !== lastExternalMarkdown.current) {
      lastExternalMarkdown.current = markdown
      editor.action(replaceAll(markdown))
    }
  }, [markdown])

  return (
    <div
      ref={editorRef}
      className="milkdown-editor h-full overflow-auto"
    />
  )
}
