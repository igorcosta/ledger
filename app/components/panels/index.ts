/**
 * Panel Registry
 *
 * Central registration point for all panel types. This makes it easy to
 * add new panels and provides a single source of truth for panel types.
 */

// Re-export all editor panels
export {
  DiffPanel,
  StagingPanel,
  BranchDetailPanel,
  PRReviewPanel,
  WorktreeDetailPanel,
  StashDetailPanel,
  CreateWorktreePanel,
} from './editor'

export type {
  DiffPanelProps,
  StagingPanelProps,
  BranchDetailPanelProps,
  PRReviewPanelProps,
  WorktreeDetailPanelProps,
  StashDetailPanelProps,
  CreateWorktreePanelProps,
} from './editor'

// Re-export viz panels
export { GitGraph } from './viz'
export type { GitGraphProps } from './viz'

/**
 * Panel type definitions for the Canvas architecture
 *
 * These types define what panels can be rendered in each slot type.
 */

// Panel types grouped by their natural slot
export type ListPanelType =
  | 'pr-list'
  | 'branch-list'
  | 'remote-list'
  | 'worktree-list'
  | 'commit-list'
  | 'unified-list' // All work units in collapsible sections (Focus sidebar)

export type EditorPanelType =
  | 'pr-detail'
  | 'branch-detail'
  | 'remote-detail'
  | 'worktree-detail'
  | 'commit-detail'
  | 'stash-detail'
  | 'create-branch'
  | 'create-worktree'
  | 'staging'
  | 'settings'
  | 'empty'

export type VizPanelType = 'git-graph' | 'timeline'

export type PanelType = ListPanelType | EditorPanelType | VizPanelType

/**
 * Panel metadata for discovery and rendering
 */
export interface PanelMeta {
  type: PanelType
  displayName: string
  slotPreference: 'list' | 'editor' | 'viz'
  description?: string
}

/**
 * Registry of all available panels with their metadata
 */
export const PANEL_REGISTRY: Record<PanelType, PanelMeta> = {
  // List panels
  'pr-list': {
    type: 'pr-list',
    displayName: 'Pull Requests',
    slotPreference: 'list',
    description: 'List of pull requests',
  },
  'branch-list': {
    type: 'branch-list',
    displayName: 'Local Branches',
    slotPreference: 'list',
    description: 'List of local branches',
  },
  'remote-list': {
    type: 'remote-list',
    displayName: 'Remote Branches',
    slotPreference: 'list',
    description: 'List of remote branches',
  },
  'worktree-list': {
    type: 'worktree-list',
    displayName: 'Worktrees',
    slotPreference: 'list',
    description: 'List of worktrees',
  },
  'commit-list': {
    type: 'commit-list',
    displayName: 'Commits',
    slotPreference: 'list',
    description: 'List of commits',
  },
  'unified-list': {
    type: 'unified-list',
    displayName: 'All Items',
    slotPreference: 'list',
    description: 'All work units in collapsible sections',
  },

  // Editor panels
  'pr-detail': {
    type: 'pr-detail',
    displayName: 'PR Details',
    slotPreference: 'editor',
    description: 'Pull request details and review',
  },
  'branch-detail': {
    type: 'branch-detail',
    displayName: 'Branch Details',
    slotPreference: 'editor',
    description: 'Branch info and diff',
  },
  'remote-detail': {
    type: 'remote-detail',
    displayName: 'Remote Details',
    slotPreference: 'editor',
    description: 'Remote branch info',
  },
  'worktree-detail': {
    type: 'worktree-detail',
    displayName: 'Worktree Details',
    slotPreference: 'editor',
    description: 'Worktree info and actions',
  },
  'commit-detail': {
    type: 'commit-detail',
    displayName: 'Commit Details',
    slotPreference: 'editor',
    description: 'Commit diff viewer',
  },
  'stash-detail': {
    type: 'stash-detail',
    displayName: 'Stash Details',
    slotPreference: 'editor',
    description: 'Stash contents and actions',
  },
  'create-branch': {
    type: 'create-branch',
    displayName: 'Create Branch',
    slotPreference: 'editor',
    description: 'Branch creation form',
  },
  'create-worktree': {
    type: 'create-worktree',
    displayName: 'Create Worktree',
    slotPreference: 'editor',
    description: 'Worktree creation form',
  },
  staging: {
    type: 'staging',
    displayName: 'Staging',
    slotPreference: 'editor',
    description: 'Stage and commit changes',
  },
  settings: {
    type: 'settings',
    displayName: 'Settings',
    slotPreference: 'editor',
    description: 'Application settings',
  },
  empty: {
    type: 'empty',
    displayName: 'Empty',
    slotPreference: 'editor',
    description: 'Empty placeholder',
  },

  // Viz panels
  'git-graph': {
    type: 'git-graph',
    displayName: 'Git Graph',
    slotPreference: 'viz',
    description: 'Visual commit graph',
  },
  timeline: {
    type: 'timeline',
    displayName: 'Timeline',
    slotPreference: 'viz',
    description: 'Activity timeline',
  },
}

/**
 * Get panels by slot preference
 */
export function getPanelsBySlot(slot: 'list' | 'editor' | 'viz'): PanelMeta[] {
  return Object.values(PANEL_REGISTRY).filter((p) => p.slotPreference === slot)
}
