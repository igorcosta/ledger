# Canvas Architecture

This document describes the modular canvas system that enables N user-generated canvases with N custom panel types.

## Current State ✓

The canvas system is **fully integrated**. All view modes (Radar, Focus, Graph) now render through the unified `CanvasRenderer`.

### Architecture Overview

```
app.tsx
  └─ <CanvasRenderer>          # Single entry point for all canvases
       └─ <Canvas>             # Renders columns based on canvas config
            └─ <Column>        # Handles sizing, resize, drag-and-drop
                 └─ renderListSlot()    → PRList, BranchList, etc.
                 └─ renderVizSlot()     → GitGraph
                 └─ renderEditorSlot()  → EditorSlot with back/forward
```

### Data Flow

```
CanvasData (all available data)
    ↓
CanvasRenderer (dispatches to panels)
    ↓
Canvas (renders columns)
    ↓
Column (sizing, resize, drag)
    ↓
Panel (PRList, BranchList, GitGraph, etc.)
```

## Components

### Core Canvas Components (`app/components/canvas/`)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `CanvasRenderer.tsx` | ~350 | **Main entry point** - takes data/handlers, renders any canvas |
| `CanvasContext.tsx` | ~300 | Global state, reducer, actions, presets |
| `Canvas.tsx` | ~90 | Column layout, visibility filtering, drag state |
| `Column.tsx` | ~130 | Width handling, resize, drag-and-drop |
| `EditorSlot.tsx` | ~60 | Editor panel with back/forward navigation |
| `PanelRenderer.tsx` | ~230 | Lower-level panel dispatch (for custom use) |

### List Panels (`app/components/panels/list/`)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `PRList.tsx` | ~225 | Pull requests with search, filter, sort |
| `BranchList.tsx` | ~220 | Local/remote branches with filter, sort |
| `WorktreeList.tsx` | ~255 | Worktrees with parent filtering |
| `StashList.tsx` | ~120 | Stash entries with search |
| `UnifiedList.tsx` | ~320 | All items in collapsible sections (Focus sidebar) |
| `ListPanelHeader.tsx` | ~40 | Shared header with icon, label, count, toggle |

### Viz Panels (`app/components/panels/viz/`)

| Component | Purpose |
|-----------|---------|
| `GitGraph.tsx` | Git commit graph with lane visualization |

## Canvas Presets

```typescript
// RADAR_CANVAS - 5-column overview
columns: [
  { id: 'radar-stashes',   panel: 'stash-list',    width: 'flex' },
  { id: 'radar-prs',       panel: 'pr-list',       width: 'flex' },
  { id: 'radar-worktrees', panel: 'worktree-list', width: 'flex' },
  { id: 'radar-branches',  panel: 'branch-list',   width: 'flex' },
  { id: 'radar-remotes',   panel: 'remote-list',   width: 'flex' },
  { id: 'radar-editor',    panel: 'empty',         width: 400, visible: false },
]

// FOCUS_CANVAS - Sidebar + Graph + Editor
columns: [
  { id: 'focus-list',   panel: 'unified-list', width: 220 },
  { id: 'focus-viz',    panel: 'git-graph',    width: 'flex' },
  { id: 'focus-editor', panel: 'empty',        width: 400 },
]

// GRAPH_CANVAS - Full-screen git graph
columns: [
  { id: 'graph-viz', panel: 'git-graph', width: 'flex' },
]
```

## Types

### Column Properties

```typescript
interface Column {
  id: string              // Unique identifier
  slotType: SlotType      // 'list' | 'editor' | 'viz'
  panel: PanelType        // What to render (e.g., 'pr-list')
  width: number | 'flex'  // Fixed pixels or flex grow
  minWidth?: number       // Minimum width for resize
  label?: string          // Display label
  icon?: string           // Display icon
  visible?: boolean       // Can be hidden (default: true)
  collapsible?: boolean   // Can be toggled by user
  config?: Record<string, unknown>  // Panel-specific config
}
```

### Canvas Properties

```typescript
interface Canvas {
  id: string
  name: string
  columns: Column[]
  isPreset?: boolean      // Built-in, can't delete
  icon?: string           // Tab icon
  allowReorder?: boolean  // Can drag columns
}
```

### Panel Types

```typescript
type ListPanelType = 
  | 'pr-list' 
  | 'branch-list' 
  | 'remote-list' 
  | 'worktree-list'
  | 'stash-list'
  | 'commit-list'
  | 'unified-list'

type VizPanelType = 
  | 'git-graph' 
  | 'timeline'

type EditorPanelType = 
  | 'pr-detail' 
  | 'branch-detail'
  | 'staging'
  | 'settings'
  | 'empty'
  // ... more
```

## How to Add a New Canvas

1. **Create the canvas preset** in `CanvasContext.tsx`:

```typescript
export const MY_CANVAS: Canvas = {
  id: 'my-canvas',
  name: 'My Canvas',
  icon: '🔮',
  isPreset: true,
  columns: [
    { id: 'col-1', slotType: 'list', panel: 'pr-list', width: 'flex' },
    { id: 'col-2', slotType: 'viz', panel: 'git-graph', width: 'flex' },
  ],
}
```

2. **Add to PRESET_CANVASES**:

```typescript
export const PRESET_CANVASES = [RADAR_CANVAS, FOCUS_CANVAS, GRAPH_CANVAS, MY_CANVAS]
```

3. **Add tab in header** (app.tsx):

```tsx
<button onClick={() => setActiveCanvas('my-canvas')}>
  <span className="view-icon">🔮</span>
  <span className="view-label">My Canvas</span>
</button>
```

That's it! The CanvasRenderer will automatically render your canvas.

## How to Add a New Panel Type

1. **Create the panel component** in `app/components/panels/list/` or `viz/`:

```typescript
export function MyPanel({ column, data, onSelect, ... }: MyPanelProps) {
  return (
    <div className="my-panel">
      {/* Panel content */}
    </div>
  )
}
```

2. **Add to CanvasRenderer's dispatch**:

```typescript
case 'my-panel':
  return <MyPanel column={column} data={data.myData} ... />
```

3. **Add the panel type** to `app-types.ts`:

```typescript
type ListPanelType = 'pr-list' | ... | 'my-panel'
```

## State Management

The canvas system uses React Context + useReducer:

```typescript
// Actions
SET_ACTIVE_CANVAS        // Switch canvases
UPDATE_COLUMN           // Update column properties
REORDER_COLUMNS         // Drag to reorder
RESIZE_COLUMN           // Drag to resize
TOGGLE_COLUMN_VISIBILITY // Show/hide column
NAVIGATE_TO_EDITOR      // Open item in editor
EDITOR_GO_BACK/FORWARD  // Editor history

// State
{
  canvases: Canvas[]
  activeCanvasId: string
  editorState: { history, historyIndex }
  startingCanvasId: string
  editorHomeCanvasId: string
}
```

## CSS Strategy

Each component type has dedicated CSS:

- `.canvas-layout` - Main flex container
- `.canvas-column` - Individual column wrapper
- `.list-panel` - List panel wrapper
- `.unified-list-*` - Unified list specific styles
- `.column-header`, `.column-controls` - Shared list UI

CSS variables for theming: `--bg-primary`, `--border`, `--accent`, etc.

## Migration Status

| Mode | Status | Notes |
|------|--------|-------|
| Radar | ✓ Migrated | Uses CanvasRenderer with 5 list panels |
| Focus | ✓ Migrated | Uses CanvasRenderer with UnifiedList + GitGraph |
| Graph | ✓ New | Uses CanvasRenderer with GitGraph only |

The old inline JSX for Radar and Focus modes is disabled with `{false &&` and kept as reference. Can be safely deleted once migration is verified complete.

## What's Next

### Short-term
- [ ] Migrate editor panels (PRReviewPanel, StagingPanel, etc.)
- [ ] Delete old Radar/Focus inline JSX (~1400 lines)
- [ ] Wire up canvas persistence
- [ ] Add keyboard shortcuts for canvas switching

### Medium-term
- [ ] User-created canvases (UI for creating/editing)
- [ ] Canvas import/export
- [ ] Column drag-and-drop between canvases
- [ ] More panel types (timeline viz, file tree, etc.)

### Long-term
- [ ] Plugin system for custom panels
- [ ] Canvas templates marketplace
- [ ] Multi-window with different canvases
