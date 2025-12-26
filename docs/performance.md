# Performance Documentation

This document tracks performance progress, regressions, and tradeoffs in Ledger.

## Current Status

**Date:** 2024-12-26  
**Status:** 🔴 Slow on large repos

### Known Issues

- [ ] Initial load time on large repositories is slow
- [ ] Branch list population takes noticeable time

---

## Performance Metrics

### Target Benchmarks

| Operation | Target | Current | Status |
|-----------|--------|---------|--------|
| Initial repo load | < 2s | TBD | ❓ |
| Branch list (< 50 branches) | < 500ms | TBD | ❓ |
| Branch list (50-200 branches) | < 1s | TBD | ❓ |
| Branch list (200+ branches) | < 2s | TBD | ❓ |
| PR list fetch | < 3s | TBD | ❓ |
| Branch checkout | < 1s | TBD | ❓ |
| Worktree list | < 500ms | TBD | ❓ |

### Test Repositories

| Repo | Branches | Size | Notes |
|------|----------|------|-------|
| Small test repo | ~10 | - | Baseline |
| Medium repo | ~50-100 | - | - |
| Large repo | 200+ | - | Performance issues observed |

---

## Performance Log

### 2024-12-27 - Two-Phase Loading Optimization

**Problem:** Initial load on large repos (200+ branches) took 30+ seconds due to:
- `getBranchesWithMetadata()` running 3 git commands per branch (600+ git processes)
- `getCommitGraphHistory()` running `git show --stat` per commit (100 git processes)

**Solution:** Implemented two-phase loading:
1. **Phase 1 (Fast):** Uses new `getBranchesBasic()` - only branch names + merged status (2 git commands total)
2. **Phase 1 (Fast):** `getCommitGraphHistory(limit, skipStats=true)` - skips per-commit stats
3. **Phase 2 (Deferred):** Full metadata loaded in background after initial render

**Result:** Initial render now ~1-2 seconds, metadata populates progressively

**Tradeoff:** 
- Branch commit counts/dates appear after initial render
- Commit graph stats (additions/deletions) not shown initially

### 2024-12-26 - Performance Regression Noted

**Observation:** App is slow on large repos again.

**Next Steps:**
- [x] Profile `getBranchesWithMetadata()` on large repo
- [x] Identify bottlenecks in git-service.ts
- [x] Consider pagination or lazy loading for branches

---

## Architecture Considerations

### Current Flow

1. User opens repo
2. `getBranchesWithMetadata()` fetches ALL branches with full metadata
3. Each branch requires additional git commands for:
   - Ahead/behind counts vs main
   - Last commit date
   - Remote tracking status
4. UI waits for complete data before rendering

### Potential Optimizations

| Optimization | Effort | Impact | Tradeoff |
|--------------|--------|--------|----------|
| **Pagination** | Medium | High | More complex UI state |
| **Lazy metadata loading** | Medium | High | Initial view shows partial data |
| **Caching** | Medium | Medium | Stale data concerns |
| **Background refresh** | Low | Low | Data may be outdated on first view |
| **Parallel git commands** | Low | Medium | May stress git lock |
| **Native git parsing** | High | High | Maintenance burden |

### Key Functions to Profile

```
lib/main/git-service.ts:
  - getBranchesWithMetadata()  # Main bottleneck suspect
  - getBranchMetadata()        # Called per branch
  - getAheadBehindCount()      # Expensive for many branches
```

---

## Historical Performance Work

### [Date] - [Title]

Template for logging performance changes:

```
**Problem:** [Description]
**Solution:** [What was done]
**Result:** [Measured improvement]
**Tradeoff:** [Any downsides]
```

---

## Profiling Guide

### How to Profile

1. **Add timing logs:**
```typescript
const start = performance.now();
// ... operation
console.log(`Operation took ${performance.now() - start}ms`);
```

2. **Use DevTools:**
   - Open with Cmd+Option+I in dev mode
   - Performance tab for CPU profiling
   - Console for timing logs

3. **Test with real data:**
   - Use repos with 100+ branches
   - Test with slow network (for PR fetching)

### Metrics to Capture

- Time to first meaningful paint
- Time to interactive (all data loaded)
- Memory usage
- Git subprocess count

---

## Notes

- `simple-git` library handles git operations
- Each git command spawns a subprocess
- GitHub CLI (`gh`) is used for PR data - network dependent
- Consider that users may have hundreds of branches

