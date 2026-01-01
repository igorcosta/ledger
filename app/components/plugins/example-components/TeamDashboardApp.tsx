/**
 * Team Dashboard App Component
 *
 * Full-screen app for team oversight and analytics.
 * Uses Ledger design system for consistent look and feel.
 */

import { useState, useMemo, useEffect } from 'react'
import {
  Users,
  GitPullRequest,
  GitBranch,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import type { PluginAppProps } from '@/lib/plugins/plugin-types'
import './example-plugin-styles.css'

interface ContributorStats {
  name: string
  avatar?: string
  commits: number
  additions: number
  deletions: number
  prsOpen: number
  prsMerged: number
  lastActive: string
}

interface TeamMetrics {
  totalCommits: number
  totalPRs: number
  openPRs: number
  mergedPRs: number
  avgReviewTime: number
  staleBranches: number
  activeContributors: number
}

// Mock data for demonstration
const mockContributors: ContributorStats[] = [
  { name: 'Alice Chen', commits: 47, additions: 2340, deletions: 890, prsOpen: 2, prsMerged: 12, lastActive: '2 hours ago' },
  { name: 'Bob Smith', commits: 35, additions: 1560, deletions: 430, prsOpen: 1, prsMerged: 8, lastActive: '4 hours ago' },
  { name: 'Carol Davis', commits: 28, additions: 980, deletions: 210, prsOpen: 3, prsMerged: 6, lastActive: '1 day ago' },
  { name: 'Dan Wilson', commits: 22, additions: 750, deletions: 180, prsOpen: 0, prsMerged: 5, lastActive: '3 days ago' },
  { name: 'Eve Johnson', commits: 18, additions: 620, deletions: 140, prsOpen: 1, prsMerged: 4, lastActive: '1 week ago' },
]

const mockMetrics: TeamMetrics = {
  totalCommits: 150,
  totalPRs: 35,
  openPRs: 7,
  mergedPRs: 28,
  avgReviewTime: 4.2,
  staleBranches: 12,
  activeContributors: 5,
}

export function TeamDashboardApp({ context, activeNavItem }: PluginAppProps) {
  const [metrics, setMetrics] = useState<TeamMetrics>(mockMetrics)
  const [contributors, setContributors] = useState<ContributorStats[]>(mockContributors)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week')

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000))
    setIsRefreshing(false)
  }

  // Render based on active nav item
  const renderContent = () => {
    switch (activeNavItem) {
      case 'activity':
        return <ActivityView contributors={contributors} />
      case 'reviews':
        return <ReviewsView metrics={metrics} />
      case 'contributors':
        return <ContributorsView contributors={contributors} />
      case 'branches':
        return <BranchesView staleBranches={metrics.staleBranches} />
      default:
        return <OverviewView metrics={metrics} contributors={contributors} />
    }
  }

  return (
    <div className="team-dashboard">
      {/* Header */}
      <div className="team-dashboard-header">
        <div className="team-dashboard-header-left">
          <h1 className="team-dashboard-title">Team Dashboard</h1>
          <div className="team-dashboard-time-range">
            {(['week', 'month', 'quarter'] as const).map((range) => (
              <button
                key={range}
                className={`time-range-button ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'This Quarter'}
              </button>
            ))}
          </div>
        </div>
        <button
          className="team-dashboard-refresh"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="team-dashboard-content">
        {renderContent()}
      </div>
    </div>
  )
}

/**
 * Overview section with key metrics
 */
function OverviewView({
  metrics,
  contributors,
}: {
  metrics: TeamMetrics
  contributors: ContributorStats[]
}) {
  return (
    <div className="dashboard-overview">
      {/* Metric Cards */}
      <div className="metrics-grid">
        <MetricCard
          icon={<Activity size={20} />}
          label="Commits"
          value={metrics.totalCommits}
          trend={+12}
          color="blue"
        />
        <MetricCard
          icon={<GitPullRequest size={20} />}
          label="Open PRs"
          value={metrics.openPRs}
          trend={-2}
          color="purple"
        />
        <MetricCard
          icon={<Clock size={20} />}
          label="Avg Review Time"
          value={`${metrics.avgReviewTime}h`}
          trend={-0.5}
          color="green"
        />
        <MetricCard
          icon={<Users size={20} />}
          label="Active Contributors"
          value={metrics.activeContributors}
          trend={+1}
          color="orange"
        />
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-columns">
        {/* Top Contributors */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>Top Contributors</h3>
            <span className="dashboard-card-subtitle">By commits this period</span>
          </div>
          <div className="contributor-list">
            {contributors.slice(0, 5).map((contributor, index) => (
              <div key={contributor.name} className="contributor-row">
                <span className="contributor-rank">#{index + 1}</span>
                <div className="contributor-avatar">
                  {contributor.name.charAt(0)}
                </div>
                <div className="contributor-info">
                  <span className="contributor-name">{contributor.name}</span>
                  <span className="contributor-activity">{contributor.lastActive}</span>
                </div>
                <div className="contributor-stats">
                  <span className="stat-commits">{contributor.commits} commits</span>
                  <span className="stat-diff">
                    <span className="diff-add">+{contributor.additions}</span>
                    <span className="diff-del">-{contributor.deletions}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PR Status */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>Pull Request Status</h3>
            <span className="dashboard-card-subtitle">Current state</span>
          </div>
          <div className="pr-status-chart">
            <div className="pr-status-bar">
              <div
                className="pr-bar-segment merged"
                style={{ width: `${(metrics.mergedPRs / metrics.totalPRs) * 100}%` }}
              />
              <div
                className="pr-bar-segment open"
                style={{ width: `${(metrics.openPRs / metrics.totalPRs) * 100}%` }}
              />
            </div>
            <div className="pr-status-legend">
              <div className="legend-item">
                <span className="legend-dot merged" />
                <span>Merged ({metrics.mergedPRs})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot open" />
                <span>Open ({metrics.openPRs})</span>
              </div>
            </div>
          </div>

          {/* Attention Items */}
          <div className="attention-section">
            <h4>Needs Attention</h4>
            <div className="attention-item warning">
              <AlertCircle size={14} />
              <span>{metrics.staleBranches} stale branches need cleanup</span>
            </div>
            <div className="attention-item info">
              <Clock size={14} />
              <span>3 PRs waiting &gt; 24 hours for review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Metric card component
 */
function MetricCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  trend: number
  color: 'blue' | 'purple' | 'green' | 'orange'
}) {
  const isPositiveTrend = trend > 0
  const colorVar = `var(--color-${color})`

  return (
    <div className="metric-card">
      <div className="metric-icon" style={{ color: colorVar }}>
        {icon}
      </div>
      <div className="metric-content">
        <span className="metric-value">{value}</span>
        <span className="metric-label">{label}</span>
      </div>
      <div className={`metric-trend ${isPositiveTrend ? 'up' : 'down'}`}>
        {isPositiveTrend ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{Math.abs(trend)}</span>
      </div>
    </div>
  )
}

/**
 * Activity view placeholder
 */
function ActivityView({ contributors }: { contributors: ContributorStats[] }) {
  return (
    <div className="dashboard-section">
      <h2>Recent Activity</h2>
      <div className="activity-timeline">
        {contributors.map((c) => (
          <div key={c.name} className="activity-item">
            <div className="activity-avatar">{c.name.charAt(0)}</div>
            <div className="activity-content">
              <strong>{c.name}</strong> made {c.commits} commits
              <span className="activity-time">{c.lastActive}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Reviews view placeholder
 */
function ReviewsView({ metrics }: { metrics: TeamMetrics }) {
  return (
    <div className="dashboard-section">
      <h2>Review Queue</h2>
      <p className="section-subtitle">
        {metrics.openPRs} PRs need review • Avg review time: {metrics.avgReviewTime}h
      </p>
    </div>
  )
}

/**
 * Contributors view placeholder
 */
function ContributorsView({ contributors }: { contributors: ContributorStats[] }) {
  return (
    <div className="dashboard-section">
      <h2>Contributors</h2>
      <p className="section-subtitle">{contributors.length} active contributors this period</p>
    </div>
  )
}

/**
 * Branches view placeholder
 */
function BranchesView({ staleBranches }: { staleBranches: number }) {
  return (
    <div className="dashboard-section">
      <h2>Branch Health</h2>
      <p className="section-subtitle">{staleBranches} stale branches need attention</p>
    </div>
  )
}

export default TeamDashboardApp
