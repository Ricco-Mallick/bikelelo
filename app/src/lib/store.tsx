import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Build, BuildItem } from './types'

const KEY = 'bikelelo.store.v1'

interface PersistedState {
  garage: string[]
  wishlist: string[]
  compare: string[]
  builds: Build[]
  recentlyViewed: string[]
}

const EMPTY: PersistedState = { garage: [], wishlist: [], compare: [], builds: [], recentlyViewed: [] }

interface StoreValue extends PersistedState {
  toggleGarage: (variantSlug: string) => void
  toggleWishlist: (variantSlug: string) => void
  toggleCompare: (variantSlug: string) => void
  clearCompare: () => void
  saveBuild: (build: Omit<Build, 'updated_at'>) => void
  deleteBuild: (slug: string) => void
  addBuildItem: (buildSlug: string, partSlug: string) => void
  removeBuildItem: (buildSlug: string, partSlug: string) => void
  isSaved: (variantSlug: string) => boolean
  recordView: (modelSlug: string) => void
  clearRecentlyViewed: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

function read(): PersistedState {
  if (typeof localStorage === 'undefined') return EMPTY
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<PersistedState>) }
  } catch {
    return EMPTY
  }
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

/** Garage / wishlist / compare / builds. Local-first; syncs to Supabase when signed in. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable (private mode) — keep in memory */
    }
  }, [state])

  const toggleGarage = useCallback((s: string) => setState((p) => ({ ...p, garage: toggle(p.garage, s) })), [])
  const toggleWishlist = useCallback((s: string) => setState((p) => ({ ...p, wishlist: toggle(p.wishlist, s) })), [])
  const toggleCompare = useCallback(
    (s: string) =>
      setState((p) => {
        if (p.compare.includes(s)) return { ...p, compare: p.compare.filter((v) => v !== s) }
        if (p.compare.length >= 4) return p
        return { ...p, compare: [...p.compare, s] }
      }),
    [],
  )
  const clearCompare = useCallback(() => setState((p) => ({ ...p, compare: [] })), [])

  const saveBuild = useCallback(
    (build: Omit<Build, 'updated_at'>) =>
      setState((p) => {
        const next: Build = { ...build, updated_at: new Date().toISOString() }
        const others = p.builds.filter((b) => b.slug !== build.slug)
        return { ...p, builds: [next, ...others] }
      }),
    [],
  )
  const deleteBuild = useCallback(
    (slug: string) => setState((p) => ({ ...p, builds: p.builds.filter((b) => b.slug !== slug) })),
    [],
  )
  const recordView = useCallback(
    (modelSlug: string) =>
      setState((p) => ({
        ...p,
        recentlyViewed: [modelSlug, ...p.recentlyViewed.filter((s) => s !== modelSlug)].slice(0, 8),
      })),
    [],
  )
  const clearRecentlyViewed = useCallback(() => setState((p) => ({ ...p, recentlyViewed: [] })), [])
  const mutateItems = useCallback(
    (buildSlug: string, fn: (items: BuildItem[]) => BuildItem[]) =>
      setState((p) => ({
        ...p,
        builds: p.builds.map((b) =>
          b.slug === buildSlug ? { ...b, items: fn(b.items), updated_at: new Date().toISOString() } : b,
        ),
      })),
    [],
  )
  const addBuildItem = useCallback(
    (buildSlug: string, partSlug: string) =>
      mutateItems(buildSlug, (items) => {
        const found = items.find((i) => i.part_slug === partSlug)
        return found
          ? items.map((i) => (i.part_slug === partSlug ? { ...i, qty: i.qty + 1 } : i))
          : [...items, { part_slug: partSlug, qty: 1 }]
      }),
    [mutateItems],
  )
  const removeBuildItem = useCallback(
    (buildSlug: string, partSlug: string) =>
      mutateItems(buildSlug, (items) => items.filter((i) => i.part_slug !== partSlug)),
    [mutateItems],
  )

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      toggleGarage,
      toggleWishlist,
      toggleCompare,
      clearCompare,
      saveBuild,
      deleteBuild,
      addBuildItem,
      removeBuildItem,
      recordView,
      clearRecentlyViewed,
      isSaved: (s) => state.garage.includes(s) || state.wishlist.includes(s),
    }),
    [
      state,
      toggleGarage,
      toggleWishlist,
      toggleCompare,
      clearCompare,
      saveBuild,
      deleteBuild,
      addBuildItem,
      removeBuildItem,
      recordView,
      clearRecentlyViewed,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
