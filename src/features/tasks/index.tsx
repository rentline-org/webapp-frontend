import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, getRouteApi } from '@tanstack/react-router'
import {
  Check,
  CircleAlert,
  ExternalLink,
  ListTodo,
  Loader2,
  RefreshCw,
  RotateCcw,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useAppFormatters } from '@/i18n/use-formatters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Main } from '@/components/layout/main'
import { ServerPagination } from '@/components/data-table'
import {
  useGetActionItems,
  useUpdateActionItem,
} from '@/features/operations/query'
import type { ActionItemType, IActionItem } from '@/features/operations/types'

const route = getRouteApi('/_authenticated/tasks/')

const actionItemTypes: ActionItemType[] = [
  'lease_expiry',
  'document_expiry',
  'pending_signature',
  'missing_move_in_inspection',
  'expired_insurance',
  'expired_compliance',
]

export function Tasks() {
  const { t } = useTranslation(['dashboard', 'common'])
  const { formatDate } = useAppFormatters()
  const { status = 'open', type, page = 1, perPage = 20 } = route.useSearch()
  const navigate = route.useNavigate()
  const query = useGetActionItems({
    status,
    type,
    page,
    per_page: perPage,
  })
  const update = useUpdateActionItem()
  const items = query.data?.items ?? []

  const changeStatus = (item: IActionItem, nextStatus: IActionItem['status']) =>
    update.mutate({ item, status: nextStatus })

  return (
    <Main className='px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='flex flex-col gap-6'>
        <header className='space-y-1'>
          <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
            {t('dashboard:actionItems.title')}
          </h1>
          <p className='max-w-2xl text-sm text-muted-foreground'>
            {t('dashboard:actionItems.description')}
          </p>
        </header>

        <Card>
          <CardContent className='space-y-4 pt-6'>
            <div className='grid gap-3 sm:grid-cols-2 sm:justify-start lg:flex'>
              <Select
                value={status ?? 'all'}
                onValueChange={(value: IActionItem['status'] | 'all') =>
                  navigate({
                    replace: true,
                    search: (previous) => ({
                      ...previous,
                      status: value === 'all' ? undefined : value,
                      page: 1,
                    }),
                  })
                }
              >
                <SelectTrigger className='w-full lg:w-48'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>
                    {t('dashboard:actionItems.allStatuses')}
                  </SelectItem>
                  {(['open', 'completed', 'dismissed'] as const).map(
                    (value) => (
                      <SelectItem key={value} value={value}>
                        {t(`dashboard:actionItems.status.${value}`)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <Select
                value={type ?? 'all'}
                onValueChange={(value: ActionItemType | 'all') =>
                  navigate({
                    replace: true,
                    search: (previous) => ({
                      ...previous,
                      type: value === 'all' ? undefined : value,
                      page: 1,
                    }),
                  })
                }
              >
                <SelectTrigger className='w-full lg:w-64'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>
                    {t('dashboard:actionItems.allTypes')}
                  </SelectItem>
                  {actionItemTypes.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`dashboard:actionItems.type.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type='button'
                variant='outline'
                className='sm:col-span-2 lg:ml-auto'
                disabled={query.isFetching}
                onClick={() => void query.refetch()}
              >
                <RefreshCw className={query.isFetching ? 'animate-spin' : ''} />
                {t('common:actions.refresh')}
              </Button>
            </div>

            {query.isError ? (
              <EmptyState
                icon={CircleAlert}
                title={t('dashboard:actionItems.loadError')}
                description={t('dashboard:actionItems.loadErrorDescription')}
                action={
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => void query.refetch()}
                  >
                    <RefreshCw />
                    {t('common:actions.retry')}
                  </Button>
                }
              />
            ) : query.isLoading ? (
              <div className='flex min-h-64 items-center justify-center'>
                <Loader2 className='size-6 animate-spin text-muted-foreground' />
                <span className='sr-only'>
                  {t('dashboard:actionItems.loading')}
                </span>
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={ListTodo}
                title={t('dashboard:actionItems.empty')}
                description={t('dashboard:actionItems.emptyDescription')}
              />
            ) : (
              <>
                <div className='grid gap-3 md:hidden'>
                  {items.map((item) => (
                    <ActionItemCard
                      key={item.id}
                      item={item}
                      dueDate={formatDate(item.due_on)}
                      isUpdating={
                        update.isPending &&
                        update.variables?.item.id === item.id
                      }
                      onStatusChange={changeStatus}
                    />
                  ))}
                </div>

                <div className='hidden overflow-hidden rounded-lg border md:block'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('dashboard:actionItems.item')}</TableHead>
                        <TableHead>
                          {t('dashboard:actionItems.typeLabel')}
                        </TableHead>
                        <TableHead>{t('dashboard:actionItems.due')}</TableHead>
                        <TableHead>
                          {t('dashboard:actionItems.statusLabel')}
                        </TableHead>
                        <TableHead className='text-end'>
                          {t('dashboard:actionItems.actions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className='max-w-md whitespace-normal'>
                            <p className='font-medium'>{item.title}</p>
                            {item.description ? (
                              <p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>
                                {item.description}
                              </p>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            {t(`dashboard:actionItems.type.${item.type}`)}
                          </TableCell>
                          <TableCell>{formatDate(item.due_on)}</TableCell>
                          <TableCell>
                            <ActionStatus item={item} />
                          </TableCell>
                          <TableCell>
                            <div className='flex justify-end gap-1'>
                              <ActionTarget item={item} />
                              <ActionButtons
                                item={item}
                                isUpdating={
                                  update.isPending &&
                                  update.variables?.item.id === item.id
                                }
                                onStatusChange={changeStatus}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            {query.data ? (
              <ServerPagination
                meta={query.data.meta}
                disabled={query.isFetching}
                onPageChange={(nextPage) =>
                  navigate({
                    search: (previous) => ({
                      ...previous,
                      page: nextPage,
                    }),
                  })
                }
                onPerPageChange={(nextPerPage) =>
                  navigate({
                    replace: true,
                    search: (previous) => ({
                      ...previous,
                      page: 1,
                      perPage: nextPerPage,
                    }),
                  })
                }
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}

function ActionItemCard({
  item,
  dueDate,
  isUpdating,
  onStatusChange,
}: {
  item: IActionItem
  dueDate: string
  isUpdating: boolean
  onStatusChange: (item: IActionItem, status: IActionItem['status']) => void
}) {
  const { t } = useTranslation('dashboard')

  return (
    <article className='space-y-4 rounded-lg border p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='font-medium'>{item.title}</p>
          {item.description ? (
            <p className='mt-1 text-sm text-muted-foreground'>
              {item.description}
            </p>
          ) : null}
        </div>
        <ActionStatus item={item} />
      </div>
      <dl className='grid grid-cols-2 gap-3 text-sm'>
        <div>
          <dt className='text-xs text-muted-foreground'>
            {t('actionItems.typeLabel')}
          </dt>
          <dd>{t(`actionItems.type.${item.type}`)}</dd>
        </div>
        <div>
          <dt className='text-xs text-muted-foreground'>
            {t('actionItems.due')}
          </dt>
          <dd>{dueDate}</dd>
        </div>
      </dl>
      <div className='flex items-center justify-between gap-2 border-t pt-3'>
        <ActionTarget item={item} showLabel />
        <ActionButtons
          item={item}
          isUpdating={isUpdating}
          onStatusChange={onStatusChange}
        />
      </div>
    </article>
  )
}

function ActionStatus({ item }: { item: IActionItem }) {
  const { t } = useTranslation('dashboard')
  const variant =
    item.status === 'completed'
      ? 'success'
      : item.status === 'dismissed'
        ? 'outline'
        : item.priority === 'high'
          ? 'destructive'
          : 'warning'

  return (
    <Badge variant={variant}>{t(`actionItems.status.${item.status}`)}</Badge>
  )
}

function ActionTarget({
  item,
  showLabel = false,
}: {
  item: IActionItem
  showLabel?: boolean
}) {
  const { t } = useTranslation('dashboard')
  const content = (
    <>
      <ExternalLink />
      {showLabel ? t('actionItems.openRecord') : null}
      <span className='sr-only'>
        {!showLabel ? t('actionItems.openRecord') : null}
      </span>
    </>
  )

  if (item.document_id) {
    return (
      <Button
        asChild
        type='button'
        variant='ghost'
        size={showLabel ? 'sm' : 'icon'}
      >
        <Link
          to='/documents/$documentId'
          params={{ documentId: String(item.document_id) }}
        >
          {content}
        </Link>
      </Button>
    )
  }

  if (item.lease_id) {
    return (
      <Button
        asChild
        type='button'
        variant='ghost'
        size={showLabel ? 'sm' : 'icon'}
      >
        <Link to='/leases/$leaseId' params={{ leaseId: String(item.lease_id) }}>
          {content}
        </Link>
      </Button>
    )
  }

  return null
}

function ActionButtons({
  item,
  isUpdating,
  onStatusChange,
}: {
  item: IActionItem
  isUpdating: boolean
  onStatusChange: (item: IActionItem, status: IActionItem['status']) => void
}) {
  const { t } = useTranslation('dashboard')

  if (isUpdating) {
    return (
      <span className='flex size-9 items-center justify-center'>
        <Loader2 className='size-4 animate-spin' />
        <span className='sr-only'>{t('actionItems.updating')}</span>
      </span>
    )
  }

  if (item.capabilities.can_reopen) {
    return (
      <Button
        type='button'
        variant='ghost'
        size='icon'
        aria-label={t('actionItems.reopen')}
        onClick={() => onStatusChange(item, 'open')}
      >
        <RotateCcw />
      </Button>
    )
  }

  return (
    <>
      {item.capabilities.can_dismiss ? (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label={t('actionItems.dismiss')}
          onClick={() => onStatusChange(item, 'dismissed')}
        >
          <X />
        </Button>
      ) : null}
      {item.capabilities.can_complete ? (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label={t('actionItems.complete')}
          onClick={() => onStatusChange(item, 'completed')}
        >
          <Check />
        </Button>
      ) : null}
    </>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className='flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 text-center'>
      <span className='rounded-2xl bg-muted p-3'>
        <Icon className='size-5 text-muted-foreground' />
      </span>
      <div className='space-y-1'>
        <p className='font-medium'>{title}</p>
        <p className='max-w-md text-sm text-muted-foreground'>{description}</p>
      </div>
      {action}
    </div>
  )
}
