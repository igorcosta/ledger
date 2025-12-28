/**
 * App-level types for the Ledger UI
 * These are internal types used by the React components
 */

import type {
  Branch,
  Worktree,
  PullRequest,
  Commit,
  WorkingStatus,
  StashEntry,
} from './electron'

// View modes for the app layout
export type ViewMode = 'radar' | 'focus'
export type MainPanelView = 'history' | 'settings'

// Status messages shown as toasts
export interface StatusMessage {
  type: 'success' | 'error' | 'info'
  message: string
  stashed?: string
}

// Context menu types
export type ContextMenuType = 'pr' | 'worktree' | 'local-branch' | 'remote-branch' | 'commit' | 'uncommitted'

export interface ContextMenu {
  type: ContextMenuType
  x: number
  y: number
  data: PullRequest | Worktree | Branch | Commit | WorkingStatus
}

export interface MenuItem {
  label: string
  action: () => void
  disabled?: boolean
}

// Sidebar focus state (what's selected in Focus mode)
export type SidebarFocusType = 'pr' | 'branch' | 'remote' | 'worktree' | 'stash' | 'uncommitted' | 'create-worktree'

export interface SidebarFocus {
  type: SidebarFocusType
  data: PullRequest | Branch | Worktree | StashEntry | WorkingStatus | null
}
