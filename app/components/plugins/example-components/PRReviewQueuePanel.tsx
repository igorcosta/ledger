/**
 * PR Review Queue Panel Component
 *
 * Floating panel showing PRs needing review with urgency indicators.
 */

import { useState, useMemo } from 'react'
import {
  Clock,
  GitPullRequest,
  User,
  MessageSquare,
  ExternalLink,
  Check,
  X,
  Filter,
} from 'lucide-react'
import type { PluginPanelProps } from '@/lib/plugins/plugin-types'
import './example-plugin-styles.css'

interface ReviewQueueItem {
  id: number
  title: string
  author: string
  branch: string
  baseBranch: string
  waitingHours: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  additions: number
  deletions: number
  comments: number
  reviewers: string[]
}

// Mock data
const mockQueue: ReviewQueueItem[] = [
  {
    id: 142,
    title: 'feat: Add user authentication flow',
    author: 'alice',
    branch: 'feature/auth',
    baseBranch: 'main',
    waitingHours: 48,
    urgency: 'critical',
    additions: 450,
    deletions: 23,
    comments: 3,
    reviewers: ['bob'],
  },
  {
    id: 141,
    title: 'fix: Resolve memory leak in event handler',
    author: 'bob',
    branch: 'fix/memory-leak',
    baseBranch: 'main',
    waitingHours: 26,
    urgency: 'high',
    additions: 12,
    deletions: 45,
    comments: 1,
    reviewers: [],
  },
  {
    id: 140,
    title: 'refactor: Extract validation utilities',
    author: 'carol',
    branch: 'refactor/validation',
    baseBranch: 'main',
    waitingHours: 8,
    urgency: 'medium',
    additions: 180,
    deletions: 95,
    comments: 0,
    reviewers: ['alice'],
  },
  {
    id: 139,
    title: 'docs: Update API documentation',
    author: 'dan',
    branch: 'docs/api',
    baseBranch: 'main',
    waitingHours: 2,
    urgency: 'low',
    additions: 85,
    deletions: 12,
    comments: 0,
    reviewers: [],
  },
]

export function PRReviewQueuePanel({ context, data, onClose }: PluginPanelProps) {
  const [queue] = useState<ReviewQueueItem[]>(mockQueue)
  const [filter, setFilter] = useState<'all' | 'mine' | 'unassigned'>('all')

  const filteredQueue = useMemo(() => {
    switch (filter) {
      case 'mine':
        // Would filter by current user
        return queue.filter((pr) => pr.reviewers.length > 0)
      case 'unassigned':
        return queue.filter((pr) => pr.reviewers.length === 0)
      default:
        return queue
    }
  }, [queue, filter])

  const urgentCount = queue.filter((pr) => pr.urgency === 'critical' || pr.urgency === 'high').length

  return (
    <div className="pr-queue-panel">
      {/* Header */}
      <div className="pr-queue-header">
        <div className="pr-queue-count">
          {filteredQueue.length} PRs
          {urgentCount > 0 && (
            <span style={{ color: 'var(--error)', marginLeft: 8 }}>
              ({urgentCount} urgent)
            </span>
          )}
        </div>
        <div className="pr-queue-filters">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 12,
            }}
          >
            <option value="all">All PRs</option>
            <option value="mine">Assigned to me</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      </div>

      {/* Queue List */}
      <div className="pr-queue-list">
        {filteredQueue.map((pr) => (
          <PRQueueItem key={pr.id} pr={pr} />
        ))}

        {filteredQueue.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--text-tertiary)',
            }}
          >
            <GitPullRequest size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
            <p style={{ margin: 0 }}>No PRs match this filter</p>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--text-tertiary)',
        }}
      >
        <span>Avg wait: 21h</span>
        <span>Oldest: 48h</span>
        <span>Your reviews: 2</span>
      </div>
    </div>
  )
}

function PRQueueItem({ pr }: { pr: ReviewQueueItem }) {
  return (
    <div className="pr-queue-item">
      <div className={`pr-queue-urgency ${pr.urgency}`} />
      <div className="pr-queue-content">
        <h4 className="pr-queue-title">
          #{pr.id} {pr.title}
        </h4>
        <div className="pr-queue-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <User size={10} />
            {pr.author}
          </span>
          <span>→ {pr.baseBranch}</span>
          <span
            className={`pr-queue-waiting ${pr.urgency === 'critical' ? 'critical' : pr.urgency === 'high' ? 'warning' : ''}`}
          >
            <Clock size={10} />
            {formatWaitTime(pr.waitingHours)}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
            }}
          >
            <span style={{ color: 'var(--success)' }}>+{pr.additions}</span>
            {' / '}
            <span style={{ color: 'var(--error)' }}>-{pr.deletions}</span>
          </span>
          {pr.comments > 0 && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                color: 'var(--text-secondary)',
              }}
            >
              <MessageSquare size={10} />
              {pr.comments}
            </span>
          )}
          {pr.reviewers.length > 0 && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-tertiary)',
              }}
            >
              Reviewers: {pr.reviewers.join(', ')}
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <button
          className="plugin-button primary"
          style={{ padding: '4px 8px', fontSize: 11 }}
          title="Open in browser"
        >
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  )
}

function formatWaitTime(hours: number): string {
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
}

export default PRReviewQueuePanel
