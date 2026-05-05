import { Camera, ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Overview } from '@/features/dashboard/components/overview'
import { useSingleUnit } from '../hooks/use-single-unit'
import type { IProperty, TabKey } from '../types'
import ActiveTenantsList from './overview/active-tenants-list'
import GeneralDetails from './overview/general-details'

type Props = {
  property: IProperty
  setActiveTab: (tab: TabKey) => void
  setUploadOpen: (open: boolean) => void
}

const PropertyOverviewTab = ({ property, setUploadOpen }: Props) => {
  const { isSingleUnit, unit } = useSingleUnit(property)

  return (
    <div className='grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.4fr)]'>
      <div className='space-y-6'>
        <GeneralDetails property={property} />

        <Card>
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
        {/* Tenants ONLY for single unit */}
        {isSingleUnit && <ActiveTenantsList />}

        <OverviewGalleryCard onUploadImages={() => setUploadOpen(true)} />

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

/**
 * GALLERY (unchanged except minor cleanup)
 */
function OverviewGalleryCard({
  onUploadImages,
}: {
  onUploadImages: () => void
}) {
  return (
    <Card className='h-95'>
      <CardContent className='space-y-4'>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold'>Images</h2>
        </div>

        <div className='space-y-3'>
          <div className='relative overflow-hidden rounded-2xl border bg-muted/20'>
            <div className='aspect-video'>
              <Skeleton className='h-full w-full rounded-none' />
            </div>
            <ImageIcon className='pointer-events-none absolute inset-1/2 size-9 -translate-x-1/2 -translate-y-1/2 text-muted-foreground' />
          </div>

          <div className='grid grid-cols-3 gap-3'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className='relative overflow-hidden rounded-2xl border bg-muted/20'
              >
                <div className='aspect-4/3'>
                  <Skeleton className='h-full w-full rounded-none' />
                </div>
                <ImageIcon className='pointer-events-none absolute inset-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-muted-foreground' />
              </div>
            ))}
          </div>
        </div>

        <Button
          variant='outline'
          size='sm'
          className='w-full'
          onClick={onUploadImages}
        >
          <Camera />
          Upload image
        </Button>
      </CardContent>
    </Card>
  )
}

export default PropertyOverviewTab
