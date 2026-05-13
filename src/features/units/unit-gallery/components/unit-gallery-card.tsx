import { useCallback, useMemo, useState } from 'react'
import { ResetIcon, StackIcon } from '@radix-ui/react-icons'
import { Images, ImageUp, Loader2, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  ExpandableScreen,
  ExpandableScreenTrigger,
  ExpandableScreenContent,
} from '@/components/ui/expandable-screen'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Carousel from '@/components/Carousel'
import GalleryCard from '@/components/gallery-card'
import { useGetUnitBySlug } from '../../query'
import useGalleryHandlers from '../hooks/use-gallery-handlers'
import UnitGalleryUploadForm from './unit-gallery-upload-form'

type Props = {
  propertyId: number
  unitId: number
  title: string
}

function UnitGalleryCard({ title, propertyId, unitId }: Props) {
  const [search, setSearch] = useState('')
  // const [expandableOpen, setExpandableOpen] = useState(false)

  const {
    data: unit,
    isLoading: isLoadingUnit,
    refetch,
  } = useGetUnitBySlug(propertyId, unitId)

  const {
    handleUpload,
    handleDelete,
    isDeleting,
    deletedItemId,
    isUploadingGallery,
    updateImageName,
    isUpdatingImageName,
    editingItemId,
  } = useGalleryHandlers({
    propertyId,
    unitId,
  })

  const hasGalleryImages = useMemo(
    () => !!unit && !!unit.gallery_urls && unit.gallery_urls?.length > 0,
    [unit]
  )

  const filteredImages = useMemo(() => {
    const images = unit?.gallery_urls ?? []

    if (!hasGalleryImages) return []
    if (!search.trim()) return images

    const query = search.trim().toLowerCase()

    return images.filter((item) => item.name?.toLowerCase().includes(query))
  }, [hasGalleryImages, search, unit?.gallery_urls])

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
    if (!unit || !unit?.gallery_urls) return []

    return unit.gallery_urls.map(({ url, ...g }) => ({
      ...g,
      image: url,
    }))
  }, [unit])

  return (
    <ExpandableScreen
      layoutId='unit-gallery'
      // onExpandChange={(expanded) => setExpandableOpen(expanded)}
    >
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
                  {isLoadingUnit ? (
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
                          isLoadingUnit || !hasGalleryImages
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
                    <UnitGalleryUploadForm
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

export default UnitGalleryCard
