import { useDeferredValue, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getRouteApi } from '@tanstack/react-router'
import { FileKey2, Plus, RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Main } from '@/components/layout/main'
import { ServerPagination } from '@/components/data-table'
import { LeaseActivationDialog } from './components/lease-activation-dialog'
import { LeaseFormDrawer } from './components/lease-form-drawer'
import { LeaseTerminationDialog } from './components/lease-termination-dialog'
import { LeasesTable } from './components/leases-table'
import { useGetLeases } from './query'
import type {
  IOperationalLease,
  LeaseTemporalStatus,
  LeaseWorkflowStatus,
} from './types'

const route = getRouteApi('/_authenticated/leases/')

export function Leases() {
  const { t } = useTranslation('leases')
  const {
    filter = '',
    status,
    timing,
    page = 1,
    perPage = 20,
  } = route.useSearch()
  const navigate = route.useNavigate()
  const deferredFilter = useDeferredValue(filter)
  const filters = useMemo(
    () => ({
      search: deferredFilter.trim() || undefined,
      workflow_status: status,
      temporal_status: timing,
      page,
      per_page: perPage,
    }),
    [deferredFilter, page, perPage, status, timing]
  )
  const query = useGetLeases(filters)
  const leases = query.data?.items ?? []
  const [formOpen, setFormOpen] = useState(false)
  const [renewalOf, setRenewalOf] = useState<IOperationalLease | null>(null)
  const [activatingLease, setActivatingLease] =
    useState<IOperationalLease | null>(null)
  const [terminatingLease, setTerminatingLease] =
    useState<IOperationalLease | null>(null)
  const hasFilters = Boolean(filter.trim() || status || timing)

  return (
    <Main className='px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
      <div className='flex flex-col gap-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
              {t('page.title')}
            </h1>
            <p className='max-w-2xl text-sm text-muted-foreground'>
              {t('page.description')}
            </p>
          </div>
          <Button
            type='button'
            size='sm'
            className='min-h-11 w-full sm:min-h-8 sm:w-auto'
            onClick={() => {
              setRenewalOf(null)
              setFormOpen(true)
            }}
          >
            <Plus />
            {t('page.add')}
          </Button>
        </header>

        <Card>
          <CardContent className='space-y-4 pt-6'>
            <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
              <div className='relative flex-1 lg:max-w-md'>
                <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  value={filter}
                  placeholder={t('page.searchPlaceholder')}
                  className='pl-9'
                  onChange={(event) =>
                    navigate({
                      replace: true,
                      search: (previous) => ({
                        ...previous,
                        filter: event.target.value || undefined,
                        page: 1,
                      }),
                    })
                  }
                />
              </div>

              <div className='grid gap-3 sm:grid-cols-2 lg:flex'>
                <Select
                  value={status ?? 'all'}
                  onValueChange={(value: LeaseWorkflowStatus | 'all') =>
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
                  <SelectTrigger className='w-full lg:w-44'>
                    <SelectValue placeholder={t('page.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>{t('page.allStatuses')}</SelectItem>
                    {(['draft', 'active', 'terminated', 'cancelled'] as const).map(
                      (value) => (
                        <SelectItem key={value} value={value}>
                          {t(`workflow.${value}`)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <Select
                  value={timing ?? 'all'}
                  onValueChange={(value: LeaseTemporalStatus | 'all') =>
                    navigate({
                      replace: true,
                      search: (previous) => ({
                        ...previous,
                        timing: value === 'all' ? undefined : value,
                        page: 1,
                      }),
                    })
                  }
                >
                  <SelectTrigger className='w-full lg:w-40'>
                    <SelectValue placeholder={t('page.allTiming')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>{t('page.allTiming')}</SelectItem>
                    {(['upcoming', 'current', 'expired'] as const).map(
                      (value) => (
                        <SelectItem key={value} value={value}>
                          {t(`timing.${value}`)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {hasFilters ? (
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() =>
                    navigate({
                      replace: true,
                      search: {
                        filter: undefined,
                        status: undefined,
                        timing: undefined,
                        page: 1,
                        perPage,
                      },
                    })
                  }
                >
                  {t('common:actions.reset')}
                </Button>
              ) : null}
            </div>

            {query.isError ? (
              <div className='flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed text-center'>
                <span className='rounded-2xl bg-muted p-3'>
                  <FileKey2 className='size-5 text-muted-foreground' />
                </span>
                <div className='space-y-1'>
                  <p className='font-medium'>{t('page.loadErrorTitle')}</p>
                  <p className='text-sm text-muted-foreground'>
                    {t('page.loadErrorDescription')}
                  </p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => void query.refetch()}
                >
                  <RefreshCw />
                  {t('common:actions.retry')}
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                <LeasesTable
                  leases={leases}
                  isLoading={query.isLoading}
                  onActivate={setActivatingLease}
                  onTerminate={setTerminatingLease}
                  onRenew={(lease) => {
                    setRenewalOf(lease)
                    setFormOpen(true)
                  }}
                  emptyTitle={
                    hasFilters ? t('page.noMatchesTitle') : t('page.emptyTitle')
                  }
                  emptyDescription={
                    hasFilters
                      ? t('page.noMatchesDescription')
                      : t('page.emptyDescription')
                  }
                />
                {query.data ? (
                  <ServerPagination
                    meta={query.data.meta}
                    disabled={query.isFetching}
                    onPageChange={(nextPage) =>
                      navigate({
                        replace: true,
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <LeaseFormDrawer
        open={formOpen}
        renewalOf={renewalOf}
        onOpenChange={(nextOpen) => {
          setFormOpen(nextOpen)
          if (!nextOpen) setRenewalOf(null)
        }}
      />
      <LeaseActivationDialog
        lease={activatingLease}
        open={Boolean(activatingLease)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setActivatingLease(null)
        }}
      />
      <LeaseTerminationDialog
        lease={terminatingLease}
        open={Boolean(terminatingLease)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setTerminatingLease(null)
        }}
      />
    </Main>
  )
}
