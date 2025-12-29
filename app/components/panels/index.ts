/**
 * Panel components index
 *
 * Re-exports all panel components for convenient importing.
 * For panel types, see app/types/app-types.ts
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
