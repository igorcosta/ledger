/**
 * Preview System - Extensible Branch/PR/Worktree Preview
 *
 * Provides a unified interface for previewing code in the browser.
 * Built-in providers:
 *   - npm-dev: Universal JS/TS projects (npm run dev)
 *   - herd: Laravel projects via Laravel Herd
 *
 * Plugins can register additional providers for:
 *   - Vercel (cloud preview deployments)
 *   - Docker Compose
 *   - Rails
 *   - Custom environments
 *
 * @example
 * ```typescript
 * import { previewRegistry, npmDevProvider } from '@/lib/preview'
 *
 * // Get available providers for a project
 * const providers = await previewRegistry.getAvailableProviders('/path/to/repo')
 *
 * // Preview with specific provider
 * const result = await providers[0].provider.previewBranch('feature-x', '/path/to/repo', createWorktree)
 * ```
 */

// Types
export type {
  PreviewType,
  ProviderAvailability,
  PreviewResult,
  CreateWorktreeFn,
  PreviewProvider,
} from './preview-types'

// Registry
export { previewRegistry, type ProviderWithAvailability } from './preview-registry'

// Built-in Providers
import * as npmDevProvider from './providers/npm-dev-provider'
import { railsProvider } from './providers/rails-provider'
import { laravelProvider } from './providers/laravel-provider'

// Provider wrapper for npm-dev (conforms to PreviewProvider interface)
import type { PreviewProvider, CreateWorktreeFn } from './preview-types'

export const npmDevPreviewProvider: PreviewProvider = {
  id: 'npm-dev',
  name: 'Dev Server',
  description: 'Run npm run dev (Vite, Next.js, etc.)',
  icon: 'play',
  type: 'local',

  checkAvailability: npmDevProvider.checkAvailability,

  async previewWorktree(worktreePath, mainRepoPath, _createWorktree) {
    return npmDevProvider.previewWorktree(worktreePath, mainRepoPath)
  },

  async previewBranch(branchName, mainRepoPath, createWorktree) {
    return npmDevProvider.previewBranch(branchName, mainRepoPath, createWorktree)
  },

  async previewPR(prNumber, prBranchName, mainRepoPath, createWorktree) {
    return npmDevProvider.previewPR(prNumber, prBranchName, mainRepoPath, createWorktree)
  },

  stop: npmDevProvider.stopServer,
  stopAll: npmDevProvider.stopAllServers,
  isRunning: npmDevProvider.isServerRunning,
  getUrl: npmDevProvider.getServerUrl,
}

// Re-export npm-dev utilities for direct use
export {
  getRunningServers as getNpmDevRunningServers,
  stopServer as stopNpmDevServer,
  stopAllServers as stopAllNpmDevServers,
} from './providers/npm-dev-provider'

/**
 * Initialize the preview system with built-in providers
 *
 * Provider priority (first compatible wins):
 * 1. Laravel (Herd → artisan serve)
 * 2. Rails (puma-dev → bin/dev)
 * 3. npm-dev (universal JS/TS fallback)
 *
 * Note: npm-dev is LAST because Laravel/Rails apps also have package.json
 * but we want to use the proper server (PHP/Ruby), not npm run dev.
 */
export function initializePreviewProviders(): void {
  // Import here to avoid circular dependencies
  const { previewRegistry } = require('./preview-registry')

  // Register built-in providers in priority order
  
  // 1. Laravel (Herd for .test domains, artisan serve fallback)
  previewRegistry.register(laravelProvider)

  // 2. Rails (puma-dev for .test domains, bin/dev fallback)
  previewRegistry.register(railsProvider)

  // 3. npm-dev - LAST because it matches anything with package.json
  //    Only use for pure JS apps (React, Vue, Next.js, etc.)
  previewRegistry.register(npmDevPreviewProvider)

  console.info('[Preview] Initialized with built-in providers:', previewRegistry.getIds())
}

// Re-export providers for direct use
export { railsProvider }
export { laravelProvider }
