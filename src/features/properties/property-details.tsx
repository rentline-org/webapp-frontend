import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  Archive,
  ChevronLeft,
  Copy,
  Edit3,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  PencilLine,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Main } from '@/components/layout/main'
import ModulePlaceholder from './components/module-placeholder'
import PropertyOverviewTab from './components/property-overview-tab'
// import PropertyGallery from './components/property-gallery'
import UnitsTab from './components/units-tab'
import { useGetPropertyBySlug } from './query'
import type { IProperty, TabKey } from './types'
import { statusBadgeVariant, typeBadgeVariant } from './utils'

const routeApi = getRouteApi('/_authenticated/properties/$propertySlug')

function PropertyEditDialog({
  open,
  onOpenChange,
  property,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: IProperty
}) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.success('Edit form ready for API integration.')
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction='left'>
      <DrawerContent className='min-w-160'>
        <DrawerHeader>
          <DrawerTitle>Edit property</DrawerTitle>
          <DrawerDescription>
            Update the core details for {property.title}.
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className='grid gap-4 px-6'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='grid gap-2 sm:col-span-2'>
              <Label htmlFor='title'>Title</Label>
              <Input id='title' defaultValue={property.title} />
            </div>

            <div className='grid gap-2 sm:col-span-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                defaultValue={property.description ?? ''}
              />
            </div>

            <div className='grid gap-2 sm:col-span-2'>
              <Label htmlFor='address'>Address</Label>
              <Input id='address' defaultValue={property.address} />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='city'>City</Label>
              <Input id='city' defaultValue={property.city} />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='state'>State</Label>
              <Input id='state' defaultValue={property.state ?? ''} />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='postal_code'>Postal code</Label>
              <Input id='postal_code' defaultValue={property.postal_code} />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='country'>Country</Label>
              <Input id='country' defaultValue={property.country} />
            </div>
          </div>

          <DrawerFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit'>Save changes</Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

function PropertyImagesDialog({
  open,
  onOpenChange,
  property,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: IProperty
}) {
  const [files, setFiles] = useState<File[]>([])

  const handleOpenChange = (value: boolean) => {
    if (!value) setFiles([])
    onOpenChange(value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.success(`${files.length} image(s) prepared for upload.`)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Upload images</DialogTitle>
          <DialogDescription>
            Add property images for {property.title}. The API hook can be wired
            in later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='property-images'>Choose images</Label>
            <Input
              id='property-images'
              type='file'
              accept='image/*'
              multiple
              onChange={(event) =>
                setFiles(Array.from(event.target.files ?? []))
              }
            />
          </div>

          <div className='rounded-2xl border bg-muted/20 p-4'>
            <p className='text-sm font-medium'>Selected files</p>
            <div className='mt-3 space-y-2 text-sm text-muted-foreground'>
              {files.length ? (
                files.map((file) => <p key={file.name}>{file.name}</p>)
              ) : (
                <p>No files selected.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={!files.length}>
              Upload images
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PropertyActionsMenu({
  property,
  onEdit,
  onUploadImages,
}: {
  property: IProperty
  onEdit: () => void
  onUploadImages: () => void
  onGoToTab: (tab: TabKey) => void
}) {
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Property link copied.')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon' className='shrink-0'>
          <MoreHorizontal className='size-4' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuItem onSelect={onEdit}>
          <Edit3 className='mr-2 size-4' />
          Edit property
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={onUploadImages}>
          <Upload className='mr-2 size-4' />
          Upload images
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={copyLink}>
          <Copy className='mr-2 size-4' />
          Copy property link
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            void navigator.clipboard.writeText(property.slug)
            toast.success('Property slug copied.')
          }}
        >
          <Archive className='mr-2 size-4' />
          Copy slug
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const PropertyDetails = () => {
  const { propertySlug } = routeApi.useParams()
  const navigate = routeApi.useNavigate()

  const { data: property, isLoading } = useGetPropertyBySlug(propertySlug)

  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [editOpen, setEditOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  const handleBackRouting = () => {
    navigate({
      to: '/properties',
    })
  }

  useEffect(() => {
    if (!isLoading && !property) {
      navigate({
        to: '/not-found',
        search: {
          redirect: '/properties',
        },
      })
    }
  }, [isLoading, navigate, property])

  if (isLoading) {
    return (
      <Main fixed>
        <div className='flex h-[50vh] w-full items-center justify-center'>
          <Loader2 className='size-6 animate-spin' />
        </div>
      </Main>
    )
  }

  if (!property) return null

  return (
    <Main>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-4'>
            <Button
              variant='ghost'
              size='sm'
              className='w-fit px-0'
              onClick={handleBackRouting}
            >
              <ChevronLeft className='size-5' />
              Back to properties
            </Button>

            <div className='flex items-start gap-4'>
              <div className='relative aspect-4/3 w-28 overflow-hidden rounded-2xl bg-secondary'>
                <Skeleton className='h-full w-full rounded-none bg-secondary' />
                <ImageIcon className='absolute inset-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground' />
              </div>

              <div className='space-y-3'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                    {property.title}
                  </h1>

                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-8 shrink-0'
                    onClick={() => setEditOpen(true)}
                  >
                    <PencilLine className='size-4' />
                  </Button>
                </div>

                <p className='max-w-4xl text-sm text-muted-foreground'>
                  {property.description ?? 'No description added yet.'}
                </p>

                <div className='flex flex-wrap items-center gap-2'>
                  <Badge
                    variant={typeBadgeVariant(property.property_type)}
                    className='rounded-full capitalize'
                  >
                    {property.property_type}
                  </Badge>

                  <Badge
                    variant={statusBadgeVariant(property.is_available)}
                    className='rounded-full'
                  >
                    {property.is_available ? 'Vacant' : 'Occupied'}
                  </Badge>

                  <Badge variant='outline' className='rounded-full'>
                    {property.is_furnished ? 'Furnished' : 'Unfurnished'}
                  </Badge>

                  <Badge variant='outline' className='rounded-full'>
                    {property.is_pet_friendly ? 'Pet friendly' : 'No pets'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <PropertyActionsMenu
            property={property}
            onEdit={() => setEditOpen(true)}
            onUploadImages={() => setUploadOpen(true)}
            onGoToTab={setActiveTab}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabKey)}
          className=''
        >
          <TabsList className='inline-flex h-auto gap-2 overflow-x-auto p-1'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            {property.property_type === 'apartment' && (
              <TabsTrigger value='units'>Units</TabsTrigger>
            )}
            <TabsTrigger value='leases'>Leases</TabsTrigger>
            <TabsTrigger value='contacts'>Contacts</TabsTrigger>
            <TabsTrigger value='accounting'>Accounting</TabsTrigger>
          </TabsList>

          <TabsContent
            value='overview'
            className='mt-6 space-y-6 focus-visible:outline-none'
          >
            <PropertyOverviewTab
              property={property}
              setActiveTab={setActiveTab}
              setUploadOpen={setUploadOpen}
            />
          </TabsContent>

          <TabsContent
            value='units'
            className='mt-6 focus-visible:outline-none'
          >
            <UnitsTab property={property} />
          </TabsContent>

          <TabsContent
            value='leases'
            className='mt-6 focus-visible:outline-none'
          >
            <ModulePlaceholder
              title='Leases'
              description='Lease records will be connected here later.'
              items={[
                { label: 'Active leases', value: '—' },
                { label: 'Expiring soon', value: '—' },
                { label: 'Rent roll', value: '—' },
              ]}
            />
          </TabsContent>

          <TabsContent
            value='contacts'
            className='mt-6 focus-visible:outline-none'
          >
            <ModulePlaceholder
              title='Contacts'
              description='Owners, vendors, brokers, and other related contacts can live here.'
              items={[
                { label: 'Primary contact', value: '—' },
                { label: 'Vendor count', value: '—' },
                { label: 'Last updated', value: '—' },
              ]}
            />
          </TabsContent>

          {/* <TabsContent
            value='tenants'
            className='mt-6 focus-visible:outline-none'
          >
            <ModulePlaceholder
              title='Tenants'
              description='Tenant profiles and occupancy details will be added here.'
              items={[
                { label: 'Current tenants', value: '—' },
                { label: 'Occupied units', value: '—' },
                { label: 'Move-ins', value: '—' },
              ]}
            />
          </TabsContent> */}

          <TabsContent
            value='accounting'
            className='mt-6 focus-visible:outline-none'
          >
            <ModulePlaceholder
              title='Accounting'
              description='Basic accounting widgets can be added here later.'
              items={[
                { label: 'Monthly income', value: '—' },
                { label: 'Outstanding balance', value: '—' },
                { label: 'Payments due', value: '—' },
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>

      <PropertyEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        property={property}
      />

      <PropertyImagesDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        property={property}
      />
    </Main>
  )
}

export default PropertyDetails
