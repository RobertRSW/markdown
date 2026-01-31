import { useCallback, useEffect } from 'react'
import { useMarkdown } from '../hooks/useMarkdown'
import { useFileSystem } from '../hooks/useFileSystem'
import { usePWAUpdate } from '../hooks/usePWAUpdate'
import Header from './Header'
import ViewMode from './ViewMode'
import EditMode from './EditMode'
import UpdatePrompt from './UpdatePrompt'

export default function App() {
  const {
    markdown,
    setMarkdown,
    mode,
    setMode,
    fileName,
    setFileName,
    isDirty,
    loadContent,
    markSaved,
    newDocument
  } = useMarkdown()

  const {
    openFile,
    saveFile,
    saveFileAs,
    clearFileHandle,
  } = useFileSystem()

  const {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    dismissUpdate,
    dismissOfflineReady
  } = usePWAUpdate()

  const handleOpen = useCallback(async () => {
    const result = await openFile()
    if (result) {
      loadContent(result.content, result.name)
    }
  }, [openFile, loadContent])

  const handleSave = useCallback(async () => {
    const name = await saveFile(markdown, fileName || 'document.md')
    if (name) {
      setFileName(name)
      markSaved()
    }
  }, [saveFile, markdown, fileName, setFileName, markSaved])

  const handleSaveAs = useCallback(async () => {
    const name = await saveFileAs(markdown, fileName || 'document.md')
    if (name) {
      setFileName(name)
      markSaved()
    }
  }, [saveFileAs, markdown, fileName, setFileName, markSaved])

  const handleNew = useCallback(() => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Create a new document anyway?')) {
        return
      }
    }
    clearFileHandle()
    newDocument()
  }, [isDirty, clearFileHandle, newDocument])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault()
            if (e.shiftKey) {
              handleSaveAs()
            } else {
              handleSave()
            }
            break
          case 'o':
            e.preventDefault()
            handleOpen()
            break
          case 'n':
            e.preventDefault()
            handleNew()
            break
          case 'e':
            e.preventDefault()
            setMode(mode === 'view' ? 'edit' : 'view')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, handleSaveAs, handleOpen, handleNew, mode, setMode])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header
        mode={mode}
        onModeChange={setMode}
        fileName={fileName}
        isDirty={isDirty}
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
      />

      <main className="flex-1 overflow-hidden">
        {mode === 'view' ? (
          <ViewMode markdown={markdown} />
        ) : (
          <EditMode
            markdown={markdown}
            onChange={setMarkdown}
          />
        )}
      </main>

      <UpdatePrompt
        needRefresh={needRefresh}
        offlineReady={offlineReady}
        onUpdate={updateServiceWorker}
        onDismissUpdate={dismissUpdate}
        onDismissOfflineReady={dismissOfflineReady}
      />
    </div>
  )
}
