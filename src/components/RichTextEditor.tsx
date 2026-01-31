import { useEffect, useRef, useCallback, useState } from 'react'
import { Editor, rootCtx, defaultValueCtx, editorViewCtx } from '@milkdown/core'
import { commonmark, toggleStrongCommand, toggleEmphasisCommand, wrapInHeadingCommand, wrapInBlockquoteCommand, wrapInBulletListCommand, wrapInOrderedListCommand, toggleInlineCodeCommand, insertHrCommand } from '@milkdown/preset-commonmark'
import { gfm, toggleStrikethroughCommand, insertTableCommand } from '@milkdown/preset-gfm'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { replaceAll, callCommand } from '@milkdown/utils'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Code,
  Table,
  Minus,
  Link,
  CheckSquare
} from 'lucide-react'

interface RichTextEditorProps {
  markdown: string
  onChange: (value: string) => void
  isMaster: boolean
}

interface ToolbarButtonProps {
  icon: React.ReactNode
  title: string
  onClick: () => void
  disabled?: boolean
}

function ToolbarButton({ icon, title, onClick, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {icon}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-slate-300 mx-1" />
}

export default function RichTextEditor({ markdown, onChange, isMaster }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<Editor | null>(null)
  const isMasterRef = useRef(isMaster)
  const lastMarkdownRef = useRef(markdown)
  const [editorReady, setEditorReady] = useState(false)

  // Keep isMaster ref in sync
  useEffect(() => {
    isMasterRef.current = isMaster
  }, [isMaster])

  // Callback for Milkdown's markdown updates
  const handleMarkdownChange = useCallback((md: string) => {
    // Only emit changes if we're the master (have focus)
    if (!isMasterRef.current) return

    lastMarkdownRef.current = md
    onChange(md)
  }, [onChange])

  // Initialize Milkdown editor
  useEffect(() => {
    if (!editorRef.current) return

    // Abort flag for this specific effect instance
    let aborted = false

    // Clear any existing content in the container
    editorRef.current.innerHTML = ''

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

      // Check if this effect was cleaned up while we were awaiting
      if (aborted) {
        editor.destroy()
        return
      }

      editorInstanceRef.current = editor
      lastMarkdownRef.current = markdown
      setEditorReady(true)
    }

    initEditor()

    return () => {
      aborted = true
      setEditorReady(false)
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy()
        editorInstanceRef.current = null
      }
    }
  }, []) // Only run once on mount

  // Update editor when markdown changes externally (from Monaco) - only when not master
  useEffect(() => {
    const editor = editorInstanceRef.current
    if (!editor) return

    // Only accept external updates when we're NOT the master
    if (isMaster) return

    // Only update if the markdown actually changed
    if (markdown !== lastMarkdownRef.current) {
      lastMarkdownRef.current = markdown
      editor.action(replaceAll(markdown))
    }
  }, [markdown, isMaster])

  // Command execution helper
  const runCommand = useCallback((command: Parameters<typeof callCommand>[0], payload?: unknown) => {
    const editor = editorInstanceRef.current
    if (!editor) return
    editor.action(callCommand(command, payload))
    // Refocus the editor after toolbar click
    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      view.focus()
    })
  }, [])

  // Insert link at cursor
  const insertLink = useCallback(() => {
    const editor = editorInstanceRef.current
    if (!editor) return

    const url = prompt('Enter URL:')
    if (!url) return

    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const { state, dispatch } = view
      const { selection } = state
      const selectedText = state.doc.textBetween(selection.from, selection.to) || 'link'
      const linkMarkdown = `[${selectedText}](${url})`

      dispatch(state.tr.replaceSelectionWith(
        state.schema.text(linkMarkdown)
      ))
      view.focus()
    })
  }, [])

  // Insert task list
  const insertTaskList = useCallback(() => {
    const editor = editorInstanceRef.current
    if (!editor) return

    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const { state, dispatch } = view
      const { selection } = state

      // Insert task list item at cursor
      const taskItem = '- [ ] '
      dispatch(state.tr.insertText(taskItem, selection.from, selection.to))
      view.focus()
    })
  }, [])

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50 flex-shrink-0 flex-wrap">
        {/* Text formatting */}
        <ToolbarButton
          icon={<Bold size={16} />}
          title="Bold (Ctrl+B)"
          onClick={() => runCommand(toggleStrongCommand.key)}
          disabled={!editorReady}
        />
        <ToolbarButton
          icon={<Italic size={16} />}
          title="Italic (Ctrl+I)"
          onClick={() => runCommand(toggleEmphasisCommand.key)}
          disabled={!editorReady}
        />
        <ToolbarButton
          icon={<Strikethrough size={16} />}
          title="Strikethrough"
          onClick={() => runCommand(toggleStrikethroughCommand.key)}
          disabled={!editorReady}
        />
        <ToolbarButton
          icon={<Code size={16} />}
          title="Inline Code"
          onClick={() => runCommand(toggleInlineCodeCommand.key)}
          disabled={!editorReady}
        />

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          icon={<Heading1 size={16} />}
          title="Heading 1"
          onClick={() => runCommand(wrapInHeadingCommand.key, 1)}
          disabled={!editorReady}
        />
        <ToolbarButton
          icon={<Heading2 size={16} />}
          title="Heading 2"
          onClick={() => runCommand(wrapInHeadingCommand.key, 2)}
          disabled={!editorReady}
        />
        <ToolbarButton
          icon={<Heading3 size={16} />}
          title="Heading 3"
          onClick={() => runCommand(wrapInHeadingCommand.key, 3)}
          disabled={!editorReady}
        />

        <ToolbarDivider />

        {/* Blocks */}
        <ToolbarButton
          icon={<Quote size={16} />}
          title="Blockquote"
          onClick={() => runCommand(wrapInBlockquoteCommand.key)}
          disabled={!editorReady}
        />
        <ToolbarButton
          icon={<List size={16} />}
          title="Bullet List"
          onClick={() => runCommand(wrapInBulletListCommand.key)}
          disabled={!editorReady}
        />
        <ToolbarButton
          icon={<ListOrdered size={16} />}
          title="Numbered List"
          onClick={() => runCommand(wrapInOrderedListCommand.key)}
          disabled={!editorReady}
        />
        <ToolbarButton
          icon={<CheckSquare size={16} />}
          title="Task List"
          onClick={insertTaskList}
          disabled={!editorReady}
        />

        <ToolbarDivider />

        {/* Insert elements */}
        <ToolbarButton
          icon={<Link size={16} />}
          title="Insert Link"
          onClick={insertLink}
          disabled={!editorReady}
        />
        <ToolbarButton
          icon={<Table size={16} />}
          title="Insert Table"
          onClick={() => runCommand(insertTableCommand.key)}
          disabled={!editorReady}
        />
        <ToolbarButton
          icon={<Minus size={16} />}
          title="Horizontal Rule"
          onClick={() => runCommand(insertHrCommand.key)}
          disabled={!editorReady}
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="milkdown-editor flex-1 overflow-auto"
      />
    </div>
  )
}
