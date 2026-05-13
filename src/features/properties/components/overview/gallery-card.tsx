import { Camera, Images, Upload } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  ExpandableScreen,
  ExpandableScreenTrigger,
  ExpandableScreenContent,
} from '@/components/ui/expandable-screen'
import { Lens } from '@/components/ui/lens'
import MinimalCard, {
  MinimalCardImage,
  MinimalCardTitle,
} from '@/components/ui/minimal-card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Carousel from '@/components/Carousel'

/*
example of how it looks like:

export interface IMediaData {
  id: string
  url: string
}
*/

type Props = {
  title: string
}

function GalleryCard({ title }: Props) {
  return (
    <ExpandableScreen layoutId='cta-card' contentRadius='24px'>
      <Card>
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
        </CardHeader>
        <CardContent className='w-full space-y-4'>
          <Carousel loop autoplay />
          <ExpandableScreenTrigger
            fullWidth
            variant='outline'
            className='w-full'
          >
            <Camera />
            Upload Images
          </ExpandableScreenTrigger>
          <ExpandableScreenContent className='h-4/5 w-4/5'>
            <div className='flex h-full w-full flex-col gap-8 p-8'>
              <div className='space-y-2'>
                <h1 className='text-xl tracking-wide'>{title}</h1>
                <Separator />
              </div>

              <Tabs defaultValue='gallery' className='space-y-2'>
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

                <TabsContent value='gallery'>
                  <div className='grid grid-cols-3 gap-4'>
                    <MinimalCard>
                      <Lens>
                        <MinimalCardImage
                          src={
                            'https:\/\/pub-e4672db008e24dd5b0161728339b3dd6.r2.dev\/43\/pexels-john-cheathem-413494-30652918.jpg'
                          }
                          alt='title'
                        />
                      </Lens>
                      <MinimalCardTitle>Image title</MinimalCardTitle>
                    </MinimalCard>
                    <MinimalCard>
                      <Lens>
                        <MinimalCardImage
                          src={
                            'https:\/\/pub-e4672db008e24dd5b0161728339b3dd6.r2.dev\/43\/pexels-john-cheathem-413494-30652918.jpg'
                          }
                          alt='title'
                        />
                      </Lens>
                      <MinimalCardTitle>Image title</MinimalCardTitle>
                    </MinimalCard>
                    <MinimalCard>
                      <Lens>
                        <MinimalCardImage
                          src={
                            'https:\/\/pub-e4672db008e24dd5b0161728339b3dd6.r2.dev\/43\/pexels-john-cheathem-413494-30652918.jpg'
                          }
                          alt='title'
                        />
                      </Lens>
                      <MinimalCardTitle>Image title</MinimalCardTitle>
                    </MinimalCard>
                  </div>
                </TabsContent>
                <TabsContent value='upload'>
                  <div className='flex w-full items-center'>
                    Uploading gallery images, separate component...
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

export default GalleryCard
