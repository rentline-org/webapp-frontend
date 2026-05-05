// cache.ts
import { type QueryClient, type QueryKey } from '@tanstack/react-query'

type IListData<TItem> =
  | TItem[]
  | { items?: TItem[]; [key: string]: unknown }
  | Record<string, unknown>

export type CacheConfig<TItem, TData = unknown> = {
  key: QueryKey
  select: (data: TData) => TItem[]
  set: (data: TData, items: TItem[]) => TData
}

export type OptimisticCacheConfig<
  TItem extends { [K in IdKey]: unknown },
  IdKey extends keyof TItem,
> = {
  caches: Record<string, CacheConfig<TItem, unknown>>
  matchBy?: IdKey | ((target: TItem) => (item: TItem) => boolean)
}

export function createOptimisticCache<
  TItem extends { [K in IdKey]: unknown },
  IdKey extends keyof TItem,
>(config: OptimisticCacheConfig<TItem, IdKey>) {
  type SnapshotType = { [K in string]?: IListData<TItem> | undefined }

  const getMatcher = (target: TItem): ((item: TItem) => boolean) => {
    if (typeof config.matchBy === 'function') return config.matchBy(target)
    const key = (config.matchBy ?? 'id') as IdKey
    const targetId = target[key]
    return (item) => item[key] === targetId
  }

  function snapshot(queryClient: QueryClient): SnapshotType {
    const result = {} as SnapshotType
    for (const [name, cache] of Object.entries(config.caches)) {
      const data = queryClient.getQueryData(cache.key)
      if (data !== undefined) {
        result[name] = data as IListData<TItem>
      }
    }
    return result
  }

  function restore(queryClient: QueryClient, snapshot: SnapshotType) {
    for (const [name, cache] of Object.entries(config.caches)) {
      const previous = snapshot[name]
      if (previous !== undefined) {
        queryClient.setQueryData(cache.key, previous)
      }
    }
  }

  // cache.ts
  function patch(
    queryClient: QueryClient,
    target: TItem,
    updater: (current: TItem) => TItem
  ) {
    const matcher = getMatcher(target)

    for (const cache of Object.values(config.caches)) {
      queryClient.setQueryData(cache.key, (old: unknown) => {
        let list: TItem[]

        if (old == null) {
          list = []
        } else {
          try {
            list = cache.select(old as IListData<TItem>)
          } catch {
            return old
          }

          if (!Array.isArray(list)) return old
        }

        const updatedList = list.map((item) =>
          matcher(item) ? updater(item) : item
        )

        return cache.set(old ?? [], updatedList)
      })
    }
  }

  function add(
    queryClient: QueryClient,
    newItem: TItem,
    position: 'start' | 'end' = 'end'
  ) {
    for (const cache of Object.values(config.caches)) {
      queryClient.setQueryData(cache.key, (old: unknown) => {
        if (!old) return old

        let list: TItem[]
        try {
          list = cache.select(old as IListData<TItem>)
        } catch {
          return old
        }

        if (!Array.isArray(list)) return old

        const newList =
          position === 'start' ? [newItem, ...list] : [...list, newItem]

        return cache.set(old, newList)
      })
    }
  }

  function remove(queryClient: QueryClient, target: TItem) {
    const matcher = getMatcher(target)

    for (const cache of Object.values(config.caches)) {
      queryClient.setQueryData(cache.key, (old: unknown) => {
        if (!old) return old

        let list: TItem[]
        try {
          list = cache.select(old as IListData<TItem>)
        } catch {
          return old
        }

        if (!Array.isArray(list)) return old

        const newList = list.filter((item) => !matcher(item))
        return cache.set(old, newList)
      })
    }
  }

  return {
    snapshot,
    restore,
    patch,
    add,
    remove,
    update: patch,
  } as const
}

// cache.ts (fix only the helpers)

export function listCache<TItem>(key: QueryKey): CacheConfig<TItem> {
  return {
    key,
    select: (data: unknown): TItem[] => {
      if (Array.isArray(data)) return data
      if (data && typeof data === 'object' && 'items' in data) {
        const items = (data as { items?: TItem[] }).items
        return Array.isArray(items) ? items : []
      }
      return []
    },
    set: (data: unknown, items: TItem[]): unknown => {
      if (Array.isArray(data)) return items
      if (data && typeof data === 'object') {
        return { ...data, items }
      }
      return items
    },
  }
}

export function itemCache<TItem>(key: QueryKey): CacheConfig<TItem> {
  return {
    key,
    select: (data: unknown): TItem[] => {
      if (data && typeof data === 'object') {
        // treat single object as a list of 1
        return Array.isArray(data) ? data : [data as TItem]
      }
      return []
    },
    set: (data: unknown, items: TItem[]): unknown => {
      if (items.length === 0) {
        return undefined
      }
      const item = items[0]
      if (Array.isArray(data)) {
        return [item]
      }
      if (data && typeof data === 'object') {
        return { ...data, ...item }
      }
      return item
    },
  }
}
