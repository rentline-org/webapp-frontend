import { useMemo } from 'react'
import { Camera, ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Overview } from '@/features/dashboard/components/overview'
import type { IProperty, TabKey } from '../types'
import ActiveTenantsList from './overview/active-tenants-list'
import GeneralDetails from './overview/general-details'

type Props = {
  property: IProperty
  setActiveTab: (tab: TabKey) => void
  setUploadOpen: (open: boolean) => void
}

const PropertyOverviewTab = ({ property, setUploadOpen }: Props) => {
  const amenityList = useMemo(() => {
    if (!property?.amenities?.length) return []
    return property.amenities
  }, [property?.amenities])

  return (
    <div className='grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.4fr)]'>
      <div className='space-y-6'>
        <GeneralDetails property={property} />

        {/* <RecentSales />
         */}
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent className='ps-2'>
            <Overview />
          </CardContent>
        </Card>
      </div>

      <div className='space-y-6'>
        <ActiveTenantsList />
        <OverviewGalleryCard onUploadImages={() => setUploadOpen(true)} />
        <Card className='overflow-hidden rounded-3xl border bg-card shadow-sm'>
          <CardContent className='space-y-4 p-6'>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>Amenities</h2>
              <p className='text-sm text-muted-foreground'>
                Features and highlights attached to this property.
              </p>
            </div>

            <div className='flex flex-wrap gap-2'>
              {amenityList.length ? (
                amenityList.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant='outline'
                    className='rounded-full'
                  >
                    {amenity}
                  </Badge>
                ))
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No amenities listed yet.
                </p>
              )}
            </div>

            {property.sale_types?.length ? (
              <>
                <Separator />
                <div className='space-y-3'>
                  <h3 className='text-sm font-semibold'>Sale types</h3>
                  <div className='flex flex-wrap gap-2'>
                    {property.sale_types.map((saleType) => (
                      <Badge
                        key={saleType}
                        variant='outline'
                        className='rounded-full'
                      >
                        {saleType}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function OverviewGalleryCard({
  onUploadImages,
}: {
  onUploadImages: () => void
}) {
  return (
    <Card className='h-95'>
      <CardContent className='space-y-4'>
        <div className='flex flex-col items-start justify-between gap-3'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>Images</h2>
            {/* <p className='text-sm text-muted-foreground'>
              Quick preview of property visuals.
            </p> */}
          </div>

          {/* <Button variant='outline' size='sm' onClick={onUploadImages}>
            <Upload className='mr-2 size-4' />
            Upload
          </Button> */}
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
