import { useMemo } from 'react'
import { markdownToHtmlSync } from '../lib/markdown'
import '../styles/markdown.css'

interface ViewModeProps {
  markdown: string
}

export default function ViewMode({ markdown }: ViewModeProps) {
  const html = useMemo(() => {
    return markdownToHtmlSync(markdown)
  }, [markdown])

  return (
    <div className="h-full overflow-auto bg-white">
      <article
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
