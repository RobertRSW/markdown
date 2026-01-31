import { useState, useCallback, useRef } from 'react'

const FILE_PICKER_OPTIONS = {
  types: [
    {
      description: 'Markdown files',
      accept: {
        'text/markdown': ['.md', '.markdown'],
      },
    },
  ],
}

export function useFileSystem() {
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Check if File System Access API is supported
  const isFileSystemAccessSupported = 'showOpenFilePicker' in window

  const openFile = useCallback(async (): Promise<{ content: string; name: string } | null> => {
    if (isFileSystemAccessSupported && window.showOpenFilePicker) {
      try {
        const [handle] = await window.showOpenFilePicker(FILE_PICKER_OPTIONS)
        setFileHandle(handle)
        const file = await handle.getFile()
        const content = await file.text()
        return { content, name: file.name }
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          console.error('Error opening file:', err)
        }
        return null
      }
    } else {
      // Fallback: use file input
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.md,.markdown,text/markdown'
        input.onchange = async () => {
          const file = input.files?.[0]
          if (file) {
            const content = await file.text()
            resolve({ content, name: file.name })
          } else {
            resolve(null)
          }
        }
        input.click()
        fileInputRef.current = input
      })
    }
  }, [isFileSystemAccessSupported])

  const saveFile = useCallback(async (content: string, suggestedName?: string): Promise<string | null> => {
    if (isFileSystemAccessSupported && fileHandle) {
      // Save to existing file
      try {
        const writable = await fileHandle.createWritable()
        await writable.write(content)
        await writable.close()
        const file = await fileHandle.getFile()
        return file.name
      } catch (err) {
        console.error('Error saving file:', err)
        return null
      }
    } else {
      // Save As (or fallback download)
      return saveFileAs(content, suggestedName)
    }
  }, [isFileSystemAccessSupported, fileHandle])

  const saveFileAs = useCallback(async (content: string, suggestedName?: string): Promise<string | null> => {
    if (isFileSystemAccessSupported && window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: suggestedName || 'document.md',
          types: FILE_PICKER_OPTIONS.types,
        })
        setFileHandle(handle)
        const writable = await handle.createWritable()
        await writable.write(content)
        await writable.close()
        const file = await handle.getFile()
        return file.name
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error saving file:', err)
        }
        return null
      }
    } else {
      // Fallback: download
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = suggestedName || 'document.md'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return suggestedName || 'document.md'
    }
  }, [isFileSystemAccessSupported])

  const clearFileHandle = useCallback(() => {
    setFileHandle(null)
  }, [])

  return {
    openFile,
    saveFile,
    saveFileAs,
    clearFileHandle,
    hasFileHandle: !!fileHandle,
    isFileSystemAccessSupported
  }
}
