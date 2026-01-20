/**
 * Code Graph Handler
 *
 * IPC handlers for code dependency graph parsing.
 */

import { handle } from '@/lib/main/shared'
import { getRepositoryManager } from '@/lib/repositories'
import { parseCodeGraph, detectLanguage, type CodeGraphParseOptions } from '@/lib/services/codegraph'

export const registerCodeGraphHandlers = () => {
  /**
   * Get code graph schema for the current repository
   */
  handle('get-codegraph-schema', async (repoPath?: string, options?: CodeGraphParseOptions) => {
    try {
      // Use provided path or current repo path
      const path = repoPath || getRepositoryManager().requireActive().path
      const schema = await parseCodeGraph(path, options || {})
      return { success: true, data: schema }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to parse code graph',
      }
    }
  })

  /**
   * Detect primary language for a repository
   */
  handle('detect-codegraph-language', async (repoPath?: string) => {
    try {
      const path = repoPath || getRepositoryManager().requireActive().path
      const language = await detectLanguage(path)
      return { success: true, data: language }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to detect language',
      }
    }
  })
}
