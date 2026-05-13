import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Overview } from '@/features/dashboard/components/overview'
import ActiveTenantsList from '@/features/properties/components/overview/active-tenants-list'
import type { IProperty } from '@/features/properties/types'
import type { IUnitData, IUpdateUnitInput } from '../types'
import UnitGalleryCard from '../unit-gallery/components/unit-gallery-card'
import UnitInfoCard from './unit-info-card'

type UnitOverviewTabProps = {
  property: IProperty
  unit: IUnitData
  onFieldUpdate: (
    field: keyof IUpdateUnitInput,
    value: string | number | boolean | Date | null
  ) => void
}

const UnitOverviewTab = ({
  property,
  unit,
  onFieldUpdate,
}: UnitOverviewTabProps) => {
  return (
    <div className='grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.4fr)]'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Unit details</CardTitle>
          </CardHeader>

          <CardContent className='space-y-4'>
            <UnitInfoCard unit={unit} onFieldUpdate={onFieldUpdate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent className='ps-2'>
            <Overview />
          </CardContent>
        </Card>
      </div>

      <div className='space-y-6'>
        <UnitGalleryCard
          title={`Image gallery for ${unit.name}`}
          propertyId={property.id}
          unitId={unit.id}
        />
        <ActiveTenantsList />

        <Card>
          <CardContent className='space-y-4'>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>Unit info</h2>
              <p className='text-sm text-muted-foreground'>
                Core metadata attached to this unit.
              </p>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline' className='rounded-full capitalize'>
                {unit.unit_type}
              </Badge>

              {unit.is_furnished && (
                <Badge variant='outline' className='rounded-full'>
                  furnished
                </Badge>
              )}

              {unit.is_pet_friendly && (
                <Badge variant='outline' className='rounded-full'>
                  pet friendly
                </Badge>
              )}

              <Badge variant='outline' className='rounded-full'>
                {property.title}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UnitOverviewTab
