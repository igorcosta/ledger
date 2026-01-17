import { handle } from '@/lib/main/shared'
import {
  getMailmap,
  getAuthorIdentities,
  suggestMailmapEntries,
  addMailmapEntries,
  removeMailmapEntry,
  MailmapEntry,
} from '@/lib/main/git-service'
import { serializeError } from '@/lib/utils/error-helpers'

export const registerMailmapHandlers = () => {
  handle('get-mailmap', async () => {
    try {
      return await getMailmap()
    } catch (_error) {
      return []
    }
  })

  handle('get-author-identities', async () => {
    try {
      return await getAuthorIdentities()
    } catch (_error) {
      return []
    }
  })

  handle('suggest-mailmap-entries', async () => {
    try {
      return await suggestMailmapEntries()
    } catch (_error) {
      return []
    }
  })

  handle('add-mailmap-entries', async (entries: MailmapEntry[]) => {
    try {
      return await addMailmapEntries(entries)
    } catch (error) {
      return { success: false, message: serializeError(error) }
    }
  })

  handle('remove-mailmap-entry', async (entry: MailmapEntry) => {
    try {
      return await removeMailmapEntry(entry)
    } catch (error) {
      return { success: false, message: serializeError(error) }
    }
  })
}
