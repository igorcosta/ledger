/**
 * PanelRenderer - Maps panel types to actual components
 * 
 * This is the bridge between canvas configuration and React components.
 * Each panel type maps to a specific component with its required props.
 */

import type { ReactNode } from 'react'
import type { Column, ListPanelType, EditorPanelType, VizPanelType } from '../../types/app-types'
import type {
  PullRequest,
  Branch,
  Worktree,
  StashEntry,
  GraphCommit,
} from '../../types/electron'

// Import list panels
import { PRList, BranchList, WorktreeList, StashList } from '../panels/list'

// ========================================
// Panel Data Props
// ========================================

export interface ListPanelData {
  // PR data
  prs?: PullRequest[]
  prError?: string | null
  
  // Branch data
  branches?: Branch[]
  
  // Worktree data
  worktrees?: Worktree[]
  currentBranch?: string | null
  repoPath?: string | null
  
  // Stash data
  stashes?: StashEntry[]
  
  // Common
  selectedItem?: PullRequest | Branch | Worktree | StashEntry | null
  selectedItemType?: 'pr' | 'branch' | 'worktree' | 'stash' | null
  switching?: boolean
  formatRelativeTime: (date: string) => string
  formatDate?: (date: string) => string
  
  // Handlers
  onSelectPR?: (pr: PullRequest) => void
  onDoubleClickPR?: (pr: PullRequest) => void
  onContextMenuPR?: (e: React.MouseEvent, pr: PullRequest) => void
  
  onSelectBranch?: (branch: Branch) => void
  onDoubleClickBranch?: (branch: Branch) => void
  onContextMenuBranch?: (e: React.MouseEvent, branch: Branch) => void
  onCreateBranch?: () => void
  
  onSelectWorktree?: (worktree: Worktree) => void
  onDoubleClickWorktree?: (worktree: Worktree) => void
  onContextMenuWorktree?: (e: React.MouseEvent, worktree: Worktree) => void
  onCreateWorktree?: () => void
  
  onSelectStash?: (stash: StashEntry) => void
  onDoubleClickStash?: (stash: StashEntry) => void
  onContextMenuStash?: (e: React.MouseEvent, stash: StashEntry) => void
}

export interface VizPanelData {
  commits?: GraphCommit[]
  selectedCommit?: GraphCommit | null
  onSelectCommit?: (commit: GraphCommit) => void
  // Git graph specific props would go here
}

export interface EditorPanelData {
  // Editor panel data varies by type - handled separately
}

// ========================================
// List Panel Renderer
// ========================================

export function renderListPanel(
  column: Column,
  data: ListPanelData
): ReactNode {
  const panel = column.panel as ListPanelType
  
  switch (panel) {
    case 'pr-list':
      return (
        <PRList
          column={column}
          prs={data.prs || []}
          selectedPR={data.selectedItemType === 'pr' ? data.selectedItem as PullRequest : null}
          error={data.prError}
          formatRelativeTime={data.formatRelativeTime}
          onSelect={data.onSelectPR}
          onDoubleClick={data.onDoubleClickPR}
          onContextMenu={data.onContextMenuPR}
        />
      )
    
    case 'branch-list':
      return (
        <BranchList
          column={column}
          branches={(data.branches || []).filter(b => !b.isRemote)}
          isRemote={false}
          selectedBranch={data.selectedItemType === 'branch' ? data.selectedItem as Branch : null}
          switching={data.switching}
          formatDate={data.formatDate}
          onSelect={data.onSelectBranch}
          onDoubleClick={data.onDoubleClickBranch}
          onContextMenu={data.onContextMenuBranch}
          onCreateBranch={data.onCreateBranch}
        />
      )
    
    case 'remote-list':
      return (
        <BranchList
          column={column}
          branches={(data.branches || []).filter(b => b.isRemote)}
          isRemote={true}
          selectedBranch={data.selectedItemType === 'branch' ? data.selectedItem as Branch : null}
          switching={data.switching}
          formatDate={data.formatDate}
          onSelect={data.onSelectBranch}
          onDoubleClick={data.onDoubleClickBranch}
          onContextMenu={data.onContextMenuBranch}
        />
      )
    
    case 'worktree-list':
      return (
        <WorktreeList
          column={column}
          worktrees={data.worktrees || []}
          currentBranch={data.currentBranch}
          repoPath={data.repoPath}
          selectedWorktree={data.selectedItemType === 'worktree' ? data.selectedItem as Worktree : null}
          onSelect={data.onSelectWorktree}
          onDoubleClick={data.onDoubleClickWorktree}
          onContextMenu={data.onContextMenuWorktree}
          onCreateWorktree={data.onCreateWorktree}
        />
      )
    
    case 'stash-list':
      return (
        <StashList
          column={column}
          stashes={data.stashes || []}
          selectedStash={data.selectedItemType === 'stash' ? data.selectedItem as StashEntry : null}
          formatRelativeTime={data.formatRelativeTime}
          onSelect={data.onSelectStash}
          onDoubleClick={data.onDoubleClickStash}
          onContextMenu={data.onContextMenuStash}
        />
      )
    
    case 'commit-list':
      // TODO: Extract CommitList component
      return <div className="empty-column">Commit list (TODO)</div>
    
    case 'unified-list':
      // TODO: This is the Focus sidebar - needs special handling
      return <div className="empty-column">Unified list (TODO)</div>
    
    default:
      return <div className="empty-column">Unknown panel: {panel}</div>
  }
}

// ========================================
// Viz Panel Renderer
// ========================================

export function renderVizPanel(
  column: Column,
  _data: VizPanelData
): ReactNode {
  const panel = column.panel as VizPanelType
  
  switch (panel) {
    case 'git-graph':
      // GitGraph is rendered directly in app.tsx for now due to complex integration
      return null
    
    case 'timeline':
      return <div className="empty-column">Timeline (TODO)</div>
    
    default:
      return <div className="empty-column">Unknown viz panel: {panel}</div>
  }
}

// ========================================
// Editor Panel Renderer
// ========================================

export function renderEditorPanel(
  column: Column,
  _data: EditorPanelData
): ReactNode {
  const panel = column.panel as EditorPanelType
  
  switch (panel) {
    case 'empty':
      return (
        <div className="editor-slot-empty">
          <div className="editor-slot-empty-icon">◇</div>
          <p>Select an item to view details</p>
          <p className="editor-slot-empty-hint">
            Click on a PR, branch, or worktree
          </p>
        </div>
      )
    
    // Other editor panels are rendered via EditorSlot with currentEditorEntry
    default:
      return null
  }
}

