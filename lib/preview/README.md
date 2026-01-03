# Preview System

Extensible preview system for viewing branches, PRs, and worktrees in the browser.

## Provider Priority

```
1. Laravel  → Herd (.test) or artisan serve (ports)
2. Rails    → puma-dev (.test) or bin/dev (ports)
3. npm-dev  → npm run dev (ports) - LAST, catches pure JS apps
```

**Why npm-dev is last:** Laravel/Rails apps have `package.json` too, but we want the proper PHP/Ruby server, not `npm run dev`.

## Smart Asset Handling

The key insight: **symlinked `public/build/` breaks if the branch has frontend changes**.

```
Branch has changes in:
├── app/Controllers/        → Just serve, symlink assets ✓
├── resources/js/           → Must npm run build! ⚠️
└── app/javascript/         → Must build! ⚠️
```

**Detection:** We check `git diff` for frontend file patterns:
- Laravel: `resources/js/`, `resources/css/`, `vite.config.js`
- Rails: `app/javascript/`, `app/assets/`, `config/importmap.rb`

**Behavior:**
- No frontend changes → Symlink `public/build/` (instant)
- Has frontend changes → Run `npm run build` (correct but slower)

## Quick Start

The `npm-dev` provider works out of the box for any JS/TS project:

```
Click "Preview" on any branch/PR/worktree
  → Creates worktree (if needed)
  → Symlinks node_modules from main repo
  → Runs `npm run dev`
  → Opens http://localhost:3001 (or detected URL)
```

## Architecture

```
lib/preview/
├── index.ts              # Exports, provider initialization
├── preview-types.ts      # TypeScript interfaces
├── preview-registry.ts   # Provider registry singleton
├── preview-handlers.ts   # IPC handlers for main process
└── providers/
    ├── npm-dev-provider.ts   # Universal JS/TS (npm run dev)
    └── herd-provider.ts      # Laravel Herd (to be migrated)
```

## Built-in Providers

### npm-dev (Default)

Works with **any** project that has `npm run dev`:

| Framework | Detection | How It Works |
|-----------|-----------|--------------|
| Vite | `vite` in deps | Sets `VITE_PORT`, parses "Local:" output |
| Next.js | `next` in deps | Sets `PORT`, parses "- Local:" output |
| Nuxt | `nuxt` in deps | Sets `PORT`, parses "Listening on" output |
| Create React App | `react-scripts` in deps | Sets `PORT`, `BROWSER=none` |
| Astro | `astro` in deps | Parses "Local" output |
| SvelteKit | `@sveltejs/kit` in deps | Sets `PORT` |
| Any JS project | `package.json` with `dev` script | Generic URL detection |

**Features:**
- Symlinks `node_modules` from main repo (fast startup)
- Auto-detects URL from server output
- Tracks running processes for cleanup
- Port allocation (3001+) avoids conflicts

### herd (Laravel)

For Laravel projects with [Laravel Herd](https://herd.laravel.com/):

| Step | What Happens |
|------|--------------|
| 1 | Copies `.env` from main repo, sets `APP_URL` |
| 2 | Symlinks `vendor/`, `node_modules/`, `public/build/` |
| 3 | Runs `herd link` |
| 4 | Opens `http://<folder>.test` |

## Adding a Provider (Plugin)

```typescript
import type { PreviewProvider } from '@ledger/preview'

const myProvider: PreviewProvider = {
  id: 'my-provider',
  name: 'My Preview Tool',
  description: 'Custom preview environment',
  icon: 'server',
  type: 'local',
  
  async checkAvailability(repoPath, targetPath) {
    // Check if tool is installed and project is compatible
    return {
      available: true,
      compatible: fs.existsSync(`${targetPath}/my-config.json`),
      reason: 'No my-config.json found',
    }
  },
  
  async previewWorktree(worktreePath, mainRepoPath, createWorktree) {
    // Setup and start preview
    await exec('my-tool serve', { cwd: worktreePath })
    return {
      success: true,
      message: 'Preview started',
      url: 'http://localhost:8080',
    }
  },
  
  async previewBranch(branchName, mainRepoPath, createWorktree) {
    // Create worktree if needed, then preview
    const worktreePath = `~/.ledger/previews/${branchName}`
    if (!fs.existsSync(worktreePath)) {
      await createWorktree({ branchName, folderPath: worktreePath, isNewBranch: false })
    }
    return this.previewWorktree(worktreePath, mainRepoPath, createWorktree)
  },
  
  // ... previewPR similar
}

// Register in plugin activate()
context.api.registerPreviewProvider(myProvider)
```

## IPC API

### From Renderer

```typescript
// Get available providers
const providers = await window.electronAPI.getPreviewProviders(repoPath, targetPath?)

// Preview with specific provider
const result = await window.electronAPI.previewWithProvider('npm-dev', 'branch', {
  branchName: 'feature-x',
  mainRepoPath: '/path/to/repo',
})

// Auto-preview (picks best provider)
const result = await window.electronAPI.autoPreview('worktree', {
  worktreePath: '/path/to/worktree',
  mainRepoPath: '/path/to/repo',
})

// Stop preview
await window.electronAPI.stopPreview('npm-dev', worktreePath)
```

### IPC Channels

| Channel | Args | Returns |
|---------|------|---------|
| `preview:get-providers` | `(repoPath, targetPath?)` | `Provider[]` |
| `preview:worktree` | `(providerId, worktreePath, mainRepoPath)` | `PreviewResult` |
| `preview:branch` | `(providerId, branchName, mainRepoPath)` | `PreviewResult` |
| `preview:pr` | `(providerId, prNumber, prBranchName, mainRepoPath)` | `PreviewResult` |
| `preview:auto-worktree` | `(worktreePath, mainRepoPath)` | `PreviewResult` |
| `preview:stop` | `(providerId, worktreePath)` | `{success, message}` |
| `preview:stop-all` | `()` | `{success, message}` |
| `preview:is-running` | `(providerId, worktreePath)` | `boolean` |
| `preview:get-url` | `(providerId, worktreePath)` | `string \| null` |

## Integration in main.ts

```typescript
import { registerPreviewHandlers, cleanupPreviewHandlers } from '@/lib/preview/preview-handlers'
import { createWorktree } from './git-service'

// In app.whenReady()
registerPreviewHandlers(createWorktree)

// In app.on('before-quit')
cleanupPreviewHandlers()
```

## Future Providers

| Provider | Type | Status |
|----------|------|--------|
| npm-dev | Local | ✅ Implemented |
| herd | Local | 🔄 To migrate from herd-service.ts |
| valet | Local | 📋 Planned |
| docker-compose | Local | 📋 Planned |
| vercel | Cloud | 📋 Planned |
| netlify | Cloud | 📋 Planned |
| railway | Cloud | 📋 Planned |
