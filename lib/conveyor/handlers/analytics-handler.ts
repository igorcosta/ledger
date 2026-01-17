import { handle } from '@/lib/main/shared'
import {
  getContributorStats,
  getMergedBranchTree,
  getSiblingRepos,
} from '@/lib/main/git-service'

export const registerAnalyticsHandlers = () => {
  handle('get-contributor-stats', async (topN?: number, bucketSize?: 'day' | 'week' | 'month') => {
    try {
      return await getContributorStats(topN, bucketSize)
    } catch (_error) {
      return {
        contributors: [],
        startDate: '',
        endDate: '',
        bucketSize: bucketSize || 'week',
      }
    }
  })

  handle('get-merged-branch-tree', async (limit?: number) => {
    try {
      return await getMergedBranchTree(limit)
    } catch (_error) {
      return {
        masterBranch: 'main',
        nodes: [],
        stats: { minLoc: 0, maxLoc: 1, minFiles: 0, maxFiles: 1, minAge: 0, maxAge: 1 },
      }
    }
  })

  handle('get-sibling-repos', async () => {
    try {
      return await getSiblingRepos()
    } catch (_error) {
      return []
    }
  })
}
