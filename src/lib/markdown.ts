import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'

const processor = remark()
  .use(remarkGfm)
  .use(remarkHtml, { sanitize: false })

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await processor.process(markdown)
  return result.toString()
}

// Synchronous version for cases where we need immediate rendering
let cachedProcessor: typeof processor | null = null

export function markdownToHtmlSync(markdown: string): string {
  if (!cachedProcessor) {
    cachedProcessor = remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
  }

  const result = cachedProcessor.processSync(markdown)
  return result.toString()
}
