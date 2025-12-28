/**
 * DiffPanel - Displays commit diffs with expandable file sections
 *
 * Shows commit metadata (message, author, date) and file-by-file diffs
 * with syntax highlighting for additions/deletions.
 */

import { useState, useEffect } from 'react'
import type { CommitDiff } from '../../../types/electron'

export interface DiffPanelProps {
  diff: CommitDiff
  formatRelativeTime: (date: string) => string
}

export function DiffPanel({ diff, formatRelativeTime }: DiffPanelProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())

  const toggleFile = (path: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  // Expand all files by default on mount or diff change
  useEffect(() => {
    setExpandedFiles(new Set(diff.files.map((f) => f.file.path)))
  }, [diff])

  return (
    <div className="diff-panel">
      {/* Commit header */}
      <div className="diff-commit-header">
        <div className="diff-commit-message">{diff.message}</div>
        <div className="diff-commit-meta">
          <code className="commit-hash">{diff.hash.slice(0, 7)}</code>
          <span>{diff.author}</span>
          <span>{formatRelativeTime(diff.date)}</span>
        </div>
        <div className="diff-commit-stats">
          <span className="diff-stat-files">
            {diff.files.length} {diff.files.length === 1 ? 'file' : 'files'}
          </span>
          <span className="diff-stat-additions">+{diff.totalAdditions}</span>
          <span className="diff-stat-deletions">-{diff.totalDeletions}</span>
        </div>
      </div>

      {/* File list with diffs */}
      <div className="diff-files">
        {diff.files.map((fileDiff) => (
          <div key={fileDiff.file.path} className="diff-file">
            <div className="diff-file-header" onClick={() => toggleFile(fileDiff.file.path)}>
              <span className={`diff-file-chevron ${expandedFiles.has(fileDiff.file.path) ? 'open' : ''}`}>▸</span>
              <span className={`diff-file-status diff-status-${fileDiff.file.status}`}>
                {fileDiff.file.status === 'added'
                  ? 'A'
                  : fileDiff.file.status === 'deleted'
                    ? 'D'
                    : fileDiff.file.status === 'renamed'
                      ? 'R'
                      : 'M'}
              </span>
              <span className="diff-file-path">
                {fileDiff.file.oldPath ? `${fileDiff.file.oldPath} → ` : ''}
                {fileDiff.file.path}
              </span>
              <span className="diff-file-stats">
                {fileDiff.file.additions > 0 && <span className="diff-additions">+{fileDiff.file.additions}</span>}
                {fileDiff.file.deletions > 0 && <span className="diff-deletions">-{fileDiff.file.deletions}</span>}
              </span>
            </div>

            {expandedFiles.has(fileDiff.file.path) && (
              <div className="diff-file-content">
                {fileDiff.isBinary ? (
                  <div className="diff-binary">Binary file</div>
                ) : fileDiff.hunks.length === 0 ? (
                  <div className="diff-empty">No changes</div>
                ) : (
                  fileDiff.hunks.map((hunk, hunkIdx) => (
                    <div key={hunkIdx} className="diff-hunk">
                      <div className="diff-hunk-header">
                        @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                      </div>
                      <div className="diff-hunk-lines">
                        {hunk.lines.map((line, lineIdx) => (
                          <div key={lineIdx} className={`diff-line diff-line-${line.type}`}>
                            <span className="diff-line-number old">{line.oldLineNumber || ''}</span>
                            <span className="diff-line-number new">{line.newLineNumber || ''}</span>
                            <span className="diff-line-prefix">
                              {line.type === 'add' ? '+' : line.type === 'delete' ? '-' : ' '}
                            </span>
                            <span className="diff-line-content">{line.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
