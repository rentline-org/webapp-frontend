import { useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  EyeOff,
  Globe2,
  Link2,
  Mail,
  MapPin,
  PencilLine,
  Plus,
  Power,
  Settings2,
  Sparkles,
  TriangleAlert,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  Expandable,
  ExpandableCard,
  ExpandableCardContent,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableContent,
  ExpandableTrigger,
} from '@/components/ui/expandable'

import { useGetWebsiteIntegration } from '@/features/custom-listing/query'
import WebsiteIntegrationDrawer from '@/features/custom-listing/components/website-integration-drawer.tsx'
import PropertyThumbnailList from '@/features/custom-listing/components/property-thumbnail-list.tsx'
import { formatDate } from '@/features/properties/utils'

type Props = {
  customListingId: number | null
}

function WebsiteIntegrationCard({ customListingId }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create')

  const {
    data: customListing,
    isLoading,
    isError,
    error,
  } = useGetWebsiteIntegration(customListingId)

  const propertyCount = useMemo(() => {
    if (!customListing) return 0

    if (typeof customListing.properties_count === 'number') {
      return customListing.properties_count
    }

    return customListing.properties?.length ?? 0
  }, [customListing])

  const languagesLabel = useMemo(() => {
    if (!customListing?.languages) return '—'

    if (typeof customListing.languages === 'string') {
      try {
        const parsed = JSON.parse(customListing.languages)
        return Array.isArray(parsed) && parsed.length ? parsed.join(', ') : '—'
      } catch {
        return '—'
      }
    }

    return  '—'
  }, [customListing])

  const contactStatus = useMemo(() => {
    if (!customListing) return 'Inactive'

    const items: string[] = []

    if (customListing.show_contact_form) items.push('Contact form')
    if (customListing.show_phone) items.push('Phone')
    if (customListing.show_email) items.push('Email')

    return items.length ? items.join(' · ') : 'No contact methods enabled'
  }, [customListing])

  const openCreateDrawer = () => {
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const openEditDrawer = () => {
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const handlePublish = () => {
    //console.log('Publish custom listing')
  }

  const handleUnpublish = () => {
    //console.log('Unpublish custom listing')
  }

  return (
    <>
      <Expandable
        expandDirection='both'
        expandBehavior='replace'
        initialDelay={0.15}
      >
        {({ isExpanded }) => (
          <ExpandableTrigger>
            <ExpandableCard
              className='w-full'
              collapsedSize={{ width: 400, height: 210 }}
              expandedSize={{ width: 460, height: 600 }}
              hoverToExpand={false}
              expandDelay={180}
              collapseDelay={300}
            >
              <ExpandableCardHeader>
                {isLoading ? (
                  <div className='flex w-full items-start justify-between gap-4'>
                    <div className='space-y-3'>
                      <Skeleton className='h-5 w-24' />
                      <Skeleton className='h-7 w-48' />
                      <Skeleton className='h-4 w-36' />
                    </div>
                    <Skeleton className='h-9 w-9 rounded-md' />
                  </div>
                ) : isError ? (
                  <div className='flex w-full items-start justify-between gap-4'>
                    <div className='space-y-2'>
                      <Badge variant='destructive' className='gap-1'>
                        <TriangleAlert className='h-3.5 w-3.5' />
                        Failed to load
                      </Badge>
                      <h3 className='text-lg font-semibold text-foreground'>
                        Website integration
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        {error instanceof Error
                          ? error.message
                          : 'Something went wrong'}
                      </p>
                    </div>
                    <Button size='icon' variant='outline' className='h-9 w-9'>
                      <Settings2 className='h-4 w-4' />
                    </Button>
                  </div>
                ) : !customListing ? (
                  <div className='flex w-full items-start justify-between gap-4'>
                    <div className='space-y-2'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge variant='destructive' className='gap-1'>
                          <EyeOff className='h-3.5 w-3.5' />
                          Inactive
                        </Badge>
                        <Badge variant='outline' className='gap-1'>
                          <Sparkles className='h-3.5 w-3.5' />
                          Website
                        </Badge>
                      </div>
                      {/*<h3 className='text-xl leading-tight font-semibold text-foreground'>*/}
                      {/*  Create your website integration*/}
                      {/*</h3>*/}
                      {/*<p className='text-sm text-muted-foreground'>*/}
                      {/*  Publish a custom listing website for this organization.*/}
                      {/*</p>*/}
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='icon'
                            variant='outline'
                            className='h-9 w-9 shrink-0'
                          >
                            <Settings2 className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Website settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <div className='flex w-full items-start justify-between gap-4'>
                    <div className='min-w-0 flex-1 space-y-2'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge
                          variant={
                            customListing.is_published ? 'default' : 'secondary'
                          }
                          className='gap-1'
                        >
                          {customListing.is_published ? (
                            <CheckCircle2 className='h-3.5 w-3.5' />
                          ) : (
                            <EyeOff className='h-3.5 w-3.5' />
                          )}
                          {customListing.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant='outline' className='gap-1'>
                          <Sparkles className='h-3.5 w-3.5' />
                          Website
                        </Badge>
                      </div>

                      <div className='min-w-0'>
                        <h3 className='truncate text-xl leading-tight font-semibold text-foreground'>
                          {customListing.headline?.trim() ||
                            'Your website integration'}
                        </h3>
                        <p className='mt-1 truncate text-sm text-muted-foreground'>
                          {customListing.domain ||
                            'No custom domain configured yet'}
                        </p>
                      </div>

                      <div className='flex flex-wrap gap-2 text-xs text-muted-foreground'>
                        <span className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1'>
                          <Users className='h-3.5 w-3.5' />
                          {propertyCount} properties
                        </span>
                        <span className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1'>
                          <Globe2 className='h-3.5 w-3.5' />
                          {languagesLabel}
                        </span>
                      </div>
                    </div>

                    {customListing && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='icon'
                            variant='outline'
                            className='h-9 w-9 shrink-0'
                          >
                            <Settings2 className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Integration settings</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                )}
              </ExpandableCardHeader>

              <ExpandableCardContent>
                {isLoading ? (
                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-3'>
                      <Skeleton className='h-20 rounded-xl' />
                      <Skeleton className='h-20 rounded-xl' />
                    </div>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-5/6' />
                    <Skeleton className='h-10 w-full rounded-lg' />
                  </div>
                ) : isError ? (
                  <div className='rounded-xl border border-dashed p-4 text-sm text-muted-foreground'>
                    Try again after fixing the API response or endpoint.
                  </div>
                ) : !customListing ? (
                  <div className='space-y-4'>
                    <div className='rounded-xl border border-dashed p-4 text-center'>
                      <div className='mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                        <Globe2 className='h-5 w-5 text-muted-foreground' />
                      </div>
                      <h4 className='text-sm font-medium text-foreground'>
                        No website integration yet
                      </h4>
                      <p className='mt-1 text-sm text-muted-foreground'>
                        Create the custom listing to start publishing your
                        website.
                      </p>
                    </div>

                    <ExpandableContent preset='blur-md'>
                      {/*<div className='grid grid-cols-2 gap-3 text-sm'>*/}
                      {/*  <div className='rounded-xl border bg-muted/20 p-3'>*/}
                      {/*    <p className='text-xs text-muted-foreground'>*/}
                      {/*      Status*/}
                      {/*    </p>*/}
                      {/*    <p className='mt-1 font-medium'>Inactive</p>*/}
                      {/*  </div>*/}
                      {/*  <div className='rounded-xl border bg-muted/20 p-3'>*/}
                      {/*    <p className='text-xs text-muted-foreground'>*/}
                      {/*      Properties*/}
                      {/*    </p>*/}
                      {/*    <p className='mt-1 font-medium'>0</p>*/}
                      {/*  </div>*/}
                      {/*</div>*/}

                      <Button
                        className='mt-4 w-full gap-2'
                        onClick={openCreateDrawer}
                      >
                        <Plus className='h-4 w-4' />
                        Create website integration
                      </Button>
                    </ExpandableContent>
                  </div>
                ) : isExpanded ? (
                  <div className='space-y-5'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='rounded-xl border bg-muted/20 p-3'>
                        <p className='text-xs text-muted-foreground'>Contact</p>
                        <p className='mt-1 text-sm font-medium'>
                          {contactStatus}
                        </p>
                      </div>
                      <div className='rounded-xl border bg-muted/20 p-3'>
                        <p className='text-xs text-muted-foreground'>
                          Fallbacks
                        </p>
                        <p className='mt-1 text-sm font-medium'>
                          {customListing.use_organization_defaults
                            ? 'Enabled'
                            : 'Custom values'}
                        </p>
                      </div>
                    </div>

                    <ExpandableContent preset='blur-md'>
                      <div className='space-y-2 rounded-xl border p-3'>
                        <div className='flex items-center gap-2 text-sm font-medium'>
                          <MapPin className='h-4 w-4 text-muted-foreground' />
                          Domain
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {customListing.domain || 'No custom domain yet'}
                        </p>
                      </div>
                    </ExpandableContent>

                    <ExpandableContent preset='blur-md'>
                      <div>
                        <div className='mb-2 flex items-center gap-2 text-sm font-medium'>
                          <Users className='h-4 w-4 text-muted-foreground' />
                          Properties
                        </div>
                        <PropertyThumbnailList
                          properties={customListing.properties}
                        />
                      </div>
                    </ExpandableContent>

                    <ExpandableContent preset='blur-md'>
                      <div className='grid gap-2'>
                        <div className='flex items-center justify-between rounded-lg border px-3 py-2 text-sm'>
                          <span className='text-muted-foreground'>
                            Property count
                          </span>
                          <span className='font-medium'>{propertyCount}</span>
                        </div>
                        <div className='flex items-center justify-between rounded-lg border px-3 py-2 text-sm'>
                          <span className='text-muted-foreground'>
                            Published
                          </span>
                          <span className='font-medium'>
                            {customListing.is_published ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className='flex items-center justify-between rounded-lg border px-3 py-2 text-sm'>
                          <span className='text-muted-foreground'>Updated</span>
                          <span className='font-medium'>
                            {formatDate(customListing.updated_at)}
                          </span>
                        </div>
                      </div>
                    </ExpandableContent>

                    <ExpandableContent preset='blur-md'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-sm font-medium'>
                          <Mail className='h-4 w-4 text-muted-foreground' />
                          Contact details
                        </div>
                        <div className='space-y-2 rounded-xl border bg-muted/20 p-3 text-sm'>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='text-muted-foreground'>Email</span>
                            <span className='truncate font-medium'>
                              {customListing.contact_email || '—'}
                            </span>
                          </div>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='text-muted-foreground'>Phone</span>
                            <span className='truncate font-medium'>
                              {customListing.contact_phone || '—'}
                            </span>
                          </div>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='text-muted-foreground'>
                              Languages
                            </span>
                            <span className='truncate font-medium'>
                              {languagesLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </ExpandableContent>

                    <div className='grid grid-cols-2 gap-2'>
                      {!customListing.is_published ? (
                        <Button className='gap-2' onClick={handlePublish}>
                          <Power className='h-4 w-4' />
                          Publish
                        </Button>
                      ) : (
                        <Button
                          variant='outline'
                          className='gap-2'
                          onClick={handleUnpublish}
                        >
                          <EyeOff className='h-4 w-4' />
                          Unpublish
                        </Button>
                      )}

                      <Button
                        variant='outline'
                        className='gap-2'
                        onClick={openEditDrawer}
                      >
                        <PencilLine className='h-4 w-4' />
                        Edit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='flex items-start justify-between gap-3 rounded-xl border bg-muted/20 p-3'>
                      <div>
                        <div className='flex items-center gap-2 text-sm font-medium'>
                          <Users className='h-4 w-4 text-muted-foreground' />
                          Properties
                        </div>
                        <p className='mt-1 text-sm text-muted-foreground'>
                          {propertyCount} connected properties.
                        </p>
                      </div>
                      <div className='rounded-full border bg-background px-3 py-1 text-xs font-medium'>
                        {customListing.is_published ? 'Live' : 'Draft'}
                      </div>
                    </div>

                    <PropertyThumbnailList
                      properties={customListing.properties}
                    />

                    <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                      <span className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1'>
                        <Globe2 className='h-3.5 w-3.5' />
                        {languagesLabel}
                      </span>
                      <span className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1'>
                        <CalendarDays className='h-3.5 w-3.5' />
                        Updated {formatDate(customListing.updated_at)}
                      </span>
                    </div>
                  </div>
                )}
              </ExpandableCardContent>

              <ExpandableContent preset='slide-up'>
                <ExpandableCardFooter>
                  <div className='flex w-full items-center justify-between gap-3 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-2'>
                      <Link2 className='h-4 w-4' />
                      <span>
                        {customListing?.domain || 'Website integration'}
                      </span>
                    </div>
                  </div>
                </ExpandableCardFooter>
              </ExpandableContent>
            </ExpandableCard>
          </ExpandableTrigger>
        )}
      </Expandable>

      <WebsiteIntegrationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
      />
    </>
  )
}

export default WebsiteIntegrationCard
