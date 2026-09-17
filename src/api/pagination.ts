export interface IPaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  path?: string
  per_page: number
  to: number | null
  total: number
}

export interface IPaginationLinks {
  first?: string | null
  last?: string | null
  prev?: string | null
  next?: string | null
}

export interface IPaginatedData<TItem> {
  items: TItem[]
  meta: IPaginationMeta
  links?: IPaginationLinks
  summary?: Record<string, number>
}

type LaravelPaginator<TItem> = {
  data: TItem[]
  current_page?: number
  from?: number | null
  last_page?: number
  per_page?: number
  to?: number | null
  total?: number
  path?: string
  links?: IPaginationLinks | unknown[]
  meta?: Partial<IPaginationMeta> & { summary?: Record<string, number> }
  summary?: Record<string, number>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export function normalizePaginatedResponse<TItem>(
  raw: unknown,
  requestedPage = 1,
  requestedPerPage = 20
): IPaginatedData<TItem> {
  const outer = isRecord(raw) ? raw : {}
  const candidate = isRecord(outer.data) && Array.isArray(outer.data.data)
    ? (outer.data as LaravelPaginator<TItem>)
    : (outer as LaravelPaginator<TItem>)
  const items = Array.isArray(candidate.data) ? candidate.data : []
  const metaSource = candidate.meta ?? candidate
  const currentPage = Number(metaSource.current_page ?? requestedPage)
  const perPage = Number(metaSource.per_page ?? requestedPerPage)
  const total = Number(metaSource.total ?? items.length)
  const lastPage = Number(
    metaSource.last_page ?? Math.max(1, Math.ceil(total / perPage))
  )

  return {
    items,
    meta: {
      current_page: currentPage,
      from:
        metaSource.from === null
          ? null
          : Number(metaSource.from ?? (items.length ? (currentPage - 1) * perPage + 1 : 0)),
      last_page: lastPage,
      path: typeof metaSource.path === 'string' ? metaSource.path : undefined,
      per_page: perPage,
      to:
        metaSource.to === null
          ? null
          : Number(metaSource.to ?? (items.length ? (currentPage - 1) * perPage + items.length : 0)),
      total,
    },
    links:
      candidate.links && !Array.isArray(candidate.links)
        ? candidate.links
        : undefined,
    summary: candidate.summary ?? candidate.meta?.summary,
  }
}
