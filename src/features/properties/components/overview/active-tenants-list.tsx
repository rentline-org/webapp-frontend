import { Link } from '@tanstack/react-router'
import { CalendarRange, FileText, Loader2, UserRound } from 'lucide-react'
import { useAppFormatters } from '@/i18n/use-formatters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useGetLeases } from '@/features/leases/query'
import { getPrimaryTenantParty } from '@/features/leases/utils'

const ActiveTenantsList = ({
  propertyId,
  unitId,
}: {
  propertyId: number
  unitId?: number
}) => {
  const { formatDateShort } = useAppFormatters()
  const currentLeases = useGetLeases({
    property_id: propertyId,
    ...(unitId ? { unit_id: unitId } : {}),
    workflow_status: 'active',
    per_page: 20,
  })
  const leases = currentLeases.data?.items ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy</CardTitle>
        <CardDescription>
          Current and upcoming tenants from active lease records.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        {currentLeases.isLoading ? (
          <div className='flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground'>
            <Loader2 className='size-4 animate-spin' />
            Loading occupancy…
          </div>
        ) : leases.length === 0 ? (
          <div className='rounded-lg border border-dashed px-4 py-8 text-center'>
            <p className='font-medium'>Vacant</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              There is no active or upcoming lease for this scope.
            </p>
          </div>
        ) : (
          leases.map((lease) => {
            const tenant = getPrimaryTenantParty(lease)
            return (
              <div key={lease.id} className='space-y-3 rounded-lg border p-3'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='flex items-center gap-2 truncate font-medium'>
                      <UserRound className='size-4 shrink-0 text-muted-foreground' />
                      {tenant?.contact?.name ??
                        tenant?.name_snapshot ??
                        lease.primary_tenant?.name ??
                        'Tenant'}
                    </p>
                    <p className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
                      <CalendarRange className='size-3.5' />
                      {formatDateShort(lease.starts_on)} –{' '}
                      {formatDateShort(lease.ends_on)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      lease.temporal_status === 'current' ? 'success' : 'info'
                    }
                    className='capitalize'
                  >
                    {lease.temporal_status}
                  </Badge>
                </div>
                <Button asChild variant='outline' size='sm' className='w-full'>
                  <Link
                    to='/leases/$leaseId'
                    params={{ leaseId: String(lease.id) }}
                  >
                    <FileText />
                    View lease
                  </Link>
                </Button>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

export default ActiveTenantsList
