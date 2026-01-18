/**
 * JsonRenderer - ERD visualization as expandable JSON tree
 *
 * Displays the raw ERDSchema data in a collapsible tree view.
 * Useful for debugging, inspection, and data export.
 */

import { useCallback, useMemo } from 'react'
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import type { ERDSchema } from '@/lib/services/erd/erd-types'

interface JsonRendererProps {
  schema: ERDSchema | null
}

/**
 * Custom styles that blend with our app theme
 */
const customDarkStyles = {
  ...darkStyles,
  container: 'erd-json-container erd-json-dark',
}

const customLightStyles = {
  ...defaultStyles,
  container: 'erd-json-container erd-json-light',
}

export function JsonRenderer({ schema }: JsonRendererProps) {
  // Detect dark mode from media query
  const isDarkMode = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }, [])

  // Control which nodes are expanded by default
  const shouldExpandNode = useCallback((level: number, _value: unknown, _field?: string) => {
    // Expand first two levels by default
    return level < 2
  }, [])

  // Copy schema to clipboard
  const handleCopy = useCallback(() => {
    if (schema) {
      navigator.clipboard.writeText(JSON.stringify(schema, null, 2))
    }
  }, [schema])

  if (!schema) {
    return (
      <div className="erd-renderer erd-json-renderer erd-empty">
        <p>No schema data to display</p>
      </div>
    )
  }

  return (
    <div className="erd-renderer erd-json-renderer">
      <div className="erd-json-header">
        <span className="erd-json-stats">
          {schema.entities.length} entities, {schema.relationships.length} relationships
        </span>
        <button className="erd-json-copy-btn" onClick={handleCopy} title="Copy JSON to clipboard">
          📋 Copy
        </button>
      </div>
      <div className="erd-json-content">
        <JsonView
          data={schema}
          shouldExpandNode={shouldExpandNode}
          style={isDarkMode ? customDarkStyles : customLightStyles}
        />
      </div>
    </div>
  )
}

export default JsonRenderer
