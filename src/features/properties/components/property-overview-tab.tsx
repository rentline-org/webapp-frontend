import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Overview } from '@/features/dashboard/components/overview'
import UnitGalleryCard from '@/features/unit-gallery/components/unit-gallery-card'
import { useSingleUnit } from '../hooks/use-single-unit'
import type { IProperty, TabKey } from '../types'
import ActiveTenantsList from './overview/active-tenants-list'
import GalleryCard from './overview/gallery-card'
// import GalleryCard from './overview/gallery-card'
import GeneralDetails from './overview/general-details'

type Props = {
  property: IProperty
  setActiveTab: (tab: TabKey) => void
  setUploadOpen: (open: boolean) => void
}

const PropertyOverviewTab = ({ property }: Props) => {
  const { isSingleUnit, unit } = useSingleUnit(property)

  return (
    <div className='grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.4fr)]'>
      <div className='space-y-6'>
        <GeneralDetails property={property} />

        <Card className='hidden md:flex'>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent className='ps-2'>
            <Overview />
          </CardContent>
        </Card>
      </div>

      {/* RIGHT */}
      <div className='space-y-6'>
        {isSingleUnit ? (
          <UnitGalleryCard
            propertyId={property.id}
            unitId={unit!.id}
            title='Gallery'
          />
        ) : (
          <GalleryCard title='Property Gallery' />
        )}
        {isSingleUnit && <ActiveTenantsList />}

        <Card>
          <CardContent className='space-y-4'>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>Property info</h2>
              <p className='text-sm text-muted-foreground'>
                Core metadata attached to this property.
              </p>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline' className='rounded-full'>
                {property.property_type}
              </Badge>

              {unit?.is_furnished && (
                <Badge variant='outline' className='rounded-full'>
                  furnished
                </Badge>
              )}

              {unit?.is_pet_friendly && (
                <Badge variant='outline' className='rounded-full'>
                  pet friendly
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PropertyOverviewTab
