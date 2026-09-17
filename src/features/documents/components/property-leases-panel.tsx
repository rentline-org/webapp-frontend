import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FilePenLine, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LeaseActivationDialog } from '@/features/leases/components/lease-activation-dialog'
import { LeaseFormDrawer } from '@/features/leases/components/lease-form-drawer'
import { LeaseTerminationDialog } from '@/features/leases/components/lease-termination-dialog'
import { LeasesTable } from '@/features/leases/components/leases-table'
import { useGetLeases } from '@/features/leases/query'
import type { ILeaseFilters, IOperationalLease } from '@/features/leases/types'
import type { IProperty } from '@/features/properties/types'
import type { IUnitData } from '@/features/units/types'

export function PropertyLeasesPanel({
  property,
  unit,
}: {
  property: IProperty
  unit?: IUnitData
}) {
  const { t } = useTranslation('leases')
  const filters = useMemo<ILeaseFilters>(
    () => ({
      property_id: property.id,
      ...(unit ? { unit_id: unit.id } : {}),
      per_page: 100,
    }),
    [property.id, unit]
  )
  const leasesQuery = useGetLeases(filters)
  const [formOpen, setFormOpen] = useState(false)
  const [activateLease, setActivateLease] = useState<IOperationalLease | null>(
    null
  )
  const [terminateLease, setTerminateLease] =
    useState<IOperationalLease | null>(null)
  const [renewLease, setRenewLease] = useState<IOperationalLease | null>(null)
  const initialUnitId =
    unit?.id ??
    (property.property_type === 'single_unit'
      ? property.units?.[0]?.id
      : undefined)

  return (
    <>
      <Card>
        <CardHeader className='gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1.5'>
            <CardTitle className='flex items-center gap-2'>
              <FilePenLine className='size-5 text-muted-foreground' />
              {unit ? 'Unit leases' : 'Property leases'}
            </CardTitle>
            <CardDescription>
              {unit
                ? `Operational lease terms and occupancy for ${unit.name}.`
                : `Current, upcoming, and historical leases across ${property.title}.`}
            </CardDescription>
          </div>
          <Button
            size='sm'
            className='min-h-11 w-full sm:min-h-8 sm:w-auto'
            onClick={() => setFormOpen(true)}
          >
            <Plus />
            {t('page.add')}
          </Button>
        </CardHeader>
        <CardContent>
          {leasesQuery.isError ? (
            <div className='flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center'>
              <p className='text-sm text-muted-foreground'>
                {t('page.loadErrorDescription')}
              </p>
              <Button
                size='sm'
                variant='outline'
                disabled={leasesQuery.isFetching}
                onClick={() => void leasesQuery.refetch()}
              >
                <RefreshCw
                  className={
                    leasesQuery.isFetching ? 'animate-spin' : undefined
                  }
                />
                {t('common:actions.retry')}
              </Button>
            </div>
          ) : (
            <LeasesTable
              leases={leasesQuery.data?.items ?? []}
              isLoading={leasesQuery.isLoading}
              onActivate={setActivateLease}
              onTerminate={setTerminateLease}
              onRenew={setRenewLease}
              emptyTitle={
                unit ? 'No leases for this unit' : t('page.emptyTitle')
              }
              emptyDescription={
                unit
                  ? 'Create a draft lease to begin managing this unit occupancy.'
                  : t('page.emptyDescription')
              }
            />
          )}
        </CardContent>
      </Card>

      <LeaseFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        initialPropertyId={property.id}
        initialUnitId={initialUnitId}
      />
      <LeaseActivationDialog
        lease={activateLease}
        open={Boolean(activateLease)}
        onOpenChange={(open) => !open && setActivateLease(null)}
      />
      <LeaseTerminationDialog
        lease={terminateLease}
        open={Boolean(terminateLease)}
        onOpenChange={(open) => !open && setTerminateLease(null)}
      />
      <LeaseFormDrawer
        open={Boolean(renewLease)}
        onOpenChange={(open) => !open && setRenewLease(null)}
        renewalOf={renewLease}
      />
    </>
  )
}
