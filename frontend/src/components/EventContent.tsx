import DOMPurify from 'dompurify'
import { useMemo } from 'react'

function EventContent({ html, className }: { html: string; className?: string }) {
  const safeHtml = useMemo(() => DOMPurify.sanitize(html), [html])

  return (
    <div
      className={`event-content ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}

export default EventContent
