import { ipcMain } from 'electron'
import {
  getBranches,
  getBranchesBasic,
  getBranchesWithMetadata,
  checkoutBranch,
  createBranch,
  pushBranch,
  checkoutRemoteBranch,
  pullBranch,
} from '@/lib/main/git-service'

export const registerBranchHandlers = () => {
  ipcMain.handle('get-branches', async () => {
    try {
      return await getBranches()
    } catch (error) {
      return { error: (error as Error).message }
    }
  })

  ipcMain.handle('get-branches-basic', async () => {
    try {
      return await getBranchesBasic()
    } catch (error) {
      return { error: (error as Error).message }
    }
  })

  ipcMain.handle('get-branches-with-metadata', async () => {
    try {
      return await getBranchesWithMetadata()
    } catch (error) {
      return { error: (error as Error).message }
    }
  })

  ipcMain.handle('checkout-branch', async (_, branchName: string) => {
    try {
      return await checkoutBranch(branchName)
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  })

  ipcMain.handle('create-branch', async (_, branchName: string, checkout: boolean = true) => {
    try {
      return await createBranch(branchName, checkout)
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  })

  ipcMain.handle('push-branch', async (_, branchName?: string, setUpstream: boolean = true) => {
    try {
      return await pushBranch(branchName, setUpstream)
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  })

  ipcMain.handle('checkout-remote-branch', async (_, remoteBranch: string) => {
    try {
      return await checkoutRemoteBranch(remoteBranch)
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  })

  ipcMain.handle('pull-branch', async (_, remoteBranch: string) => {
    try {
      return await pullBranch(remoteBranch)
    } catch (error) {
      return { success: false, message: (error as Error).message }
    }
  })
}
