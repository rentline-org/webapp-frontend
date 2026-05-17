import { useCallback, useMemo, useState } from 'react';
import { ResetIcon, StackIcon } from '@radix-ui/react-icons';
import { Images, ImageUp, Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ExpandableScreen, ExpandableScreenTrigger, ExpandableScreenContent } from '@/components/ui/expandable-screen';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Carousel from '@/components/Carousel';
import GalleryCard from '@/components/gallery-card';
import { useSingleUnit } from '@/features/properties/hooks/use-single-unit.ts';
import { useGetPropertyBySlug } from '@/features/properties/query';
import type { IProperty } from '@/features/properties/types';
import PropertyGalleryUploadForm from '@/features/property-gallery/components/PropertyGalleryUploadForm.tsx';
import usePropertyGalleryHandlers from '@/features/property-gallery/hooks/use-property-gallery-handlers.ts';


type Props = {
  property: IProperty
  title: string
}

function PropertyGallery({ title, property }: Props) {
  const [search, setSearch] = useState('')
  const { isSingleUnit } = useSingleUnit(property)

  const {
    data: propertyData,
    isLoading: isLoadingProperty,
    refetch,
  } = useGetPropertyBySlug(property.slug, !isSingleUnit)

  const {
    handleUpload,
    handleDelete,
    isDeleting,
    deletedItemId,
    isUploadingGallery,
    updateImageName,
    isUpdatingImageName,
    editingItemId,
  } = usePropertyGalleryHandlers({
    propertyId: property.id,
  })

  const hasGalleryImages = useMemo(
    () =>
      !!propertyData &&
      !!propertyData?.gallery_urls &&
      propertyData.gallery_urls?.length > 0,
    [propertyData]
  )

  const filteredImages = useMemo(() => {
    const images = propertyData?.gallery_urls ?? []

    if (!hasGalleryImages) return []
    if (!search.trim()) return images

    const query = search.trim().toLowerCase()

    return images.filter((item) => item.name?.toLowerCase().includes(query))
  }, [hasGalleryImages, search, propertyData?.gallery_urls])

  const checkIsMutating = useCallback(
    (valueId: string) => {
      return (
        (valueId === deletedItemId || valueId === editingItemId) &&
        (isDeleting || isUpdatingImageName)
      )
    },
    [deletedItemId, editingItemId, isDeleting, isUpdatingImageName]
  )

  const carouselItems = useMemo(() => {
    if (!propertyData || !propertyData?.gallery_urls) return []

    return propertyData?.gallery_urls.map(({ url, ...g }) => ({
      ...g,
      image: url,
    }))
  }, [propertyData])

  return (
    <ExpandableScreen layoutId='unit-gallery'>
      <Card>
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
        </CardHeader>
        <CardContent className='w-full space-y-4'>
          <Carousel loop autoplay autoplayDelay={5000} items={carouselItems} />
          <ExpandableScreenTrigger
            fullWidth
            variant='outline'
            className='w-full rounded-md'
          >
            {/* <Camera /> */}
            <StackIcon />
            View all
          </ExpandableScreenTrigger>
          <ExpandableScreenContent className='h-full w-full md:h-[90%] md:w-5/6'>
            <div className='flex h-full w-full flex-col gap-8 p-8'>
              <div className='space-y-2'>
                <h1 className='text-xl tracking-wide'>{title}</h1>
                {/* <Separator /> */}
              </div>

              <Tabs defaultValue='gallery' className='bg space-y-2'>
                <TabsList>
                  <TabsTrigger value='gallery' className='space-x-2'>
                    <Images />
                    Gallery
                  </TabsTrigger>
                  <TabsTrigger value='upload' className='space-x-2'>
                    <Upload />
                    Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='gallery' className='w-full'>
                  {isLoadingProperty ? (
                    <Loader2 className='mx-auto size-8 animate-spin' />
                  ) : (
                    <div className='mt-4 flex w-full flex-col gap-4'>
                      <div className='flex w-full items-center justify-between'>
                        <Input
                          placeholder='Search...'
                          className='w-full max-w-60 md:max-w-80'
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size='icon' variant='destructive'>
                              <ResetIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Clear all images</TooltipContent>
                        </Tooltip>
                      </div>
                      <div
                        className={cn(
                          isLoadingProperty || !hasGalleryImages
                            ? 'mx-auto flex w-full flex-col'
                            : 'grid gap-4 sm:grid-cols-3 xl:grid-cols-4'
                        )}
                      >
                        {hasGalleryImages ? (
                          <>
                            {filteredImages.map((g) => {
                              if (checkIsMutating(g.id)) {
                                return <Skeleton className='h-full w-full' />
                              }

                              return (
                                <GalleryCard
                                  key={g.id}
                                  title={g.name}
                                  onTitleSubmit={(newTitle) =>
                                    updateImageName(g.id, newTitle, refetch)
                                  }
                                  onDelete={() => handleDelete(g, refetch)}
                                  imgUrl={g.url}
                                />
                              )
                            })}
                          </>
                        ) : (
                          <div className='mt-12 flex w-full flex-col items-center justify-center space-y-4'>
                            <ImageUp className='size-20 text-muted-foreground' />
                            <p className='text-lg text-muted-foreground'>
                              No image found. Upload images
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value='upload'>
                  <div className='pb-4'>
                    <PropertyGalleryUploadForm
                      title='Upload images to gallery'
                      isLoading={isUploadingGallery}
                      onSave={(payload) => handleUpload(payload, refetch)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ExpandableScreenContent>
        </CardContent>
      </Card>
    </ExpandableScreen>
  )
}

export default PropertyGallery
