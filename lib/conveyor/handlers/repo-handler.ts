import { ipcMain, dialog } from 'electron'
import { setRepoPath, getRepoPath } from '@/lib/main/git-service'
import { getLastRepoPath, saveLastRepoPath } from '@/lib/main/settings-service'

// Check for --repo command line argument (for testing)
const repoArgIndex = process.argv.findIndex((arg) => arg.startsWith('--repo='))
const testRepoPath = repoArgIndex !== -1 ? process.argv[repoArgIndex].split('=')[1] : null

export const registerRepoHandlers = () => {
  ipcMain.handle('select-repo', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Git Repository',
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const path = result.filePaths[0]
    setRepoPath(path)
    saveLastRepoPath(path)
    return path
  })

  ipcMain.handle('get-repo-path', () => {
    return getRepoPath()
  })

  ipcMain.handle('get-saved-repo-path', () => {
    return getLastRepoPath()
  })

  ipcMain.handle('load-saved-repo', () => {
    if (testRepoPath) {
      setRepoPath(testRepoPath)
      return testRepoPath
    }
    const savedPath = getLastRepoPath()
    if (savedPath) {
      setRepoPath(savedPath)
      return savedPath
    }
    return null
  })
}
