import { useMemo, useState } from 'react'
import {
  ArrowUpRightFromCircle,
  Building,
  CheckCircle2,
  Copy,
  Edit,
  ExternalLink,
  EyeOff,
  Globe2,
  Link2,
  Plus,
  Settings2,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Expandable,
  ExpandableCard,
  ExpandableCardContent,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableContent,
  ExpandableTrigger,
} from '@/components/ui/expandable'

import {
  invalidateWebsiteIntegration,
  useDeleteWebsiteIntegration,
  useGetWebsiteIntegration,
  useUpdatePublishedStatus,
} from '@/features/custom-listing/query'
import WebsiteIntegrationDrawer from '@/features/custom-listing/components/website-integration-drawer.tsx'
import PropertyThumbnailList from '@/features/custom-listing/components/property-thumbnail-list.tsx'
import { formatDate } from '@/features/properties/utils'
import WebsiteErrorContent from './website-error-content'
import WebsiteIntegrationDropdownActions from './website-integration-dropdown-actions'
import { toast } from 'sonner'
import { invalidateListing } from '@/features/listing/query'
import { useQueryClient } from '@tanstack/react-query'
import { useIsMobile } from '@/hooks/use-mobile'

type Props = {
  customListingId: number | null
  listingId: number
}

function WebsiteIntegrationCard({ customListingId, listingId }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create')
  const [expanded, setExpanded] = useState(false)

  const isMobile = useIsMobile()

  const queryClient = useQueryClient()

  const {
    data: customListing,
    isLoading: isLoadingListing,
    isError,
    error,
    refetch,
  } = useGetWebsiteIntegration(customListingId)
  const { mutateAsync: deleteWebsiteAsync, isPending } =
    useDeleteWebsiteIntegration()

  const { mutate: updatePublishedStatus, isPending: isPendingPublished } =
    useUpdatePublishedStatus()

  const isLoading = useMemo(
    () => isLoadingListing || isPending || isPendingPublished,
    [isLoadingListing, isPending, isPendingPublished]
  )

  const propertyCount = useMemo(() => {
    if (!customListing) return 0
    if (typeof customListing.properties_count === 'number') {
      return customListing.properties_count
    }
    return customListing.properties?.length ?? 0
  }, [customListing])

  const languagesLabel = useMemo(() => {
    if (!customListing?.languages) return 'English'
    if (typeof customListing.languages === 'string') {
      try {
        const parsed = JSON.parse(customListing.languages)
        return Array.isArray(parsed) && parsed.length
          ? parsed.join(', ')
          : 'English'
      } catch {
        return 'English'
      }
    }

    return 'English'
  }, [customListing])

  const contactSummary = useMemo(() => {
    if (!customListing) return 'Not configured'
    const items: string[] = []

    if (customListing.show_contact_form) items.push('Form')
    if (customListing.show_phone) items.push('Phone')
    if (customListing.show_email) items.push('Email')
    return items.length ? items.join(' · ') : 'None'
  }, [customListing])

  const openCreateDrawer = () => {
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const openEditDrawer = () => {
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const handlePublishToggle = () => {
    if (!customListing || !customListing.id) return

    updatePublishedStatus(
      {
        customListingId: customListing.id,
        status: !customListing.is_published,
      },
      {
        async onSuccess() {
          toast.success(
            !customListing.is_published
              ? 'Website published successfully'
              : 'Your link is now no longer accessible'
          )

          await invalidateWebsiteIntegration(customListing.id, queryClient)
          setExpanded(true)
        },
      }
    )
  }

  const handleViewLive = () => {
    if (customListing?.subdomain) {
      window.open(`https://${customListing.subdomain}.rentline.io`, '_blank')
    }
  }

  const handleCopyLink = async () => {
    if (customListing?.subdomain) {
      await navigator.clipboard
        .writeText(`https://${customListing.subdomain}.rentline.io`)
        .then(() => {
          toast.success('Website link copied successfully!')
          setExpanded(true)
        })
    }
  }

  const handleDelete = () => {
    if (!customListingId) return
    toast.promise(
      deleteWebsiteAsync(customListingId, {
        async onSuccess() {
          await invalidateListing(queryClient)
        },
      }),
      {
        success: 'Website deleted successfully',
        loading: 'Deleting website...',
      }
    )
  }

  const hasIntegration = !!customListing
  const isPublished = customListing?.is_published ?? false
  const cardSize = useMemo<{
    collapsed: { width?: number; height?: number }
    expanded: { width?: number; height?: number }
  }>(() => {
    if (isMobile) {
      return {
        collapsed: { height: 240 },
        expanded: { height: hasIntegration ? 600 : 420 },
      }
    }

    return {
      collapsed: { width: 450, height: 240 },
      expanded: { width: 720, height: 380 },
    }
  }, [hasIntegration, isMobile])

  return (
    <>
      <Expandable
        className='w-full max-w-full'
        expandDirection={isMobile ? 'vertical' : 'horizontal'}
        expandBehavior='replace'
        initialDelay={0.1}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      >
        {({ isExpanded }) => (
          <ExpandableTrigger className='w-full max-w-full'>
            <ExpandableCard
              className='w-full max-w-full'
              collapsedSize={cardSize.collapsed}
              expandedSize={cardSize.expanded}
              hoverToExpand={false}
              expandDelay={150}
              collapseDelay={200}
            >
              <ExpandableCardHeader className='p-4 sm:p-6'>
                {isLoading ? (
                  <div className='flex w-full flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4'>
                    <div className='w-full space-y-3 sm:w-auto'>
                      <Skeleton className='h-5 w-24' />
                      <Skeleton className='h-7 w-full max-w-48' />
                      <Skeleton className='h-4 w-36' />
                    </div>
                    <Skeleton className='h-9 w-9 rounded-md' />
                  </div>
                ) : isError ? (
                  <WebsiteErrorContent error={error} />
                ) : !hasIntegration ? (
                  <div className='flex w-full items-start justify-between gap-3 sm:items-center sm:gap-4'>
                    <div className='min-w-0 space-y-2'>
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
                      <h3 className='truncate text-lg font-semibold text-foreground'>
                        No website integration
                      </h3>
                      <p className='truncate text-sm text-muted-foreground'>
                        Create a custom listing to publish your website.
                      </p>
                    </div>
                    {/* <WebsiteIntegrationDropdownActions
                      isPublished={false}
                      hasIntegration={false}
                      onEdit={openCreateDrawer}
                      onPublishToggle={handlePublishToggle}
                      onView={handleViewLive}
                      onCopyLink={handleCopyLink}
                      onDelete={handleDelete}
                    /> */}
                  </div>
                ) : (
                  // ── Active State (Collapsed) ─────────────────
                  <div className='flex w-full items-start justify-between gap-3 sm:items-center sm:gap-4'>
                    <div className='min-w-0 flex-1 space-y-2'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge variant='default' className='gap-1'>
                          <Globe2 className='size-5' />
                          Website
                        </Badge>
                        <Badge
                          variant={isPublished ? 'success' : 'secondary'}
                          className='gap-1'
                        >
                          {isPublished ? (
                            <CheckCircle2 className='h-3.5 w-3.5' />
                          ) : (
                            <EyeOff className='h-3.5 w-3.5' />
                          )}
                          {isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>

                      <div className='min-w-0'>
                        <h3 className='truncate text-lg font-semibold text-foreground'>
                          {customListing.headline?.trim() ||
                            'Website Integration'}
                        </h3>
                      </div>
                    </div>

                    <div onClick={(event) => event.stopPropagation()}>
                      <WebsiteIntegrationDropdownActions
                        isPublished={isPublished}
                        hasIntegration={true}
                        onEdit={openEditDrawer}
                        onPublishToggle={handlePublishToggle}
                        onView={handleViewLive}
                        onCopyLink={handleCopyLink}
                        onDelete={handleDelete}
                      />
                    </div>
                  </div>
                )}
              </ExpandableCardHeader>

              <ExpandableCardContent className='px-4 pt-0 pb-4 sm:pb-6'>
                {isLoading ? (
                  <div className='flex flex-col gap-3 sm:flex-row sm:gap-4'>
                    <Skeleton className='h-28 w-full rounded-xl sm:w-40' />
                    <Skeleton className='h-28 w-full rounded-xl sm:w-40' />
                  </div>
                ) : isError ? (
                  <div className='rounded-xl border border-dashed p-4 text-sm text-muted-foreground'>
                    Try again after fixing the API response or endpoint.
                  </div>
                ) : !hasIntegration ? (
                  <ExpandableContent preset='blur-md'>
                    <div className='rounded-xl border border-dashed p-4 text-center sm:p-6'>
                      <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                        <Globe2 className='h-6 w-6 text-muted-foreground' />
                      </div>
                      <h4 className='text-sm font-medium text-foreground'>
                        Ready to launch your website?
                      </h4>
                      <p className='mt-1 text-sm text-muted-foreground'>
                        Set up your custom subdomain, contact methods, and
                        properties.
                      </p>
                      <Button
                        className='mt-4 w-full gap-2 sm:w-auto'
                        onClick={(event) => {
                          event.stopPropagation()
                          openCreateDrawer()
                        }}
                      >
                        <Plus className='h-4 w-4' />
                        Create Integration
                      </Button>
                    </div>
                  </ExpandableContent>
                ) : isExpanded ? (
                  <ExpandableContent preset='blur-md'>
                    <div className='flex h-full min-w-0 flex-col gap-3 md:flex-row md:gap-4'>
                      {/* Left: Domain + Properties */}
                      <div className='min-w-0 flex-1 space-y-3'>
                        <div className='rounded-md border bg-muted/20 p-3'>
                          <div className='mb-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between'>
                            <div className='flex items-center gap-2 text-sm font-medium'>
                              <Globe2 className='h-4 w-4 text-muted-foreground' />
                              Website URL
                            </div>
                            {customListing.subdomain && (
                              <div
                                className='flex flex-wrap items-center gap-1'
                                onClick={(event) => event.stopPropagation()}
                              >
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-7 gap-1 text-xs'
                                  onClick={handleCopyLink}
                                >
                                  <Copy className='h-3 w-3' />
                                  Copy
                                </Button>
                                {customListing.is_published && (
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={handleViewLive}
                                    className='h-7 gap-1 text-xs'
                                  >
                                    <ExternalLink className='size-4' />
                                    Open Link
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {customListing.subdomain ? (
                              <a
                                href={`https://${customListing.subdomain}.rentline.io`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex min-w-0 items-center gap-1 text-primary hover:underline'
                                onClick={(event) => event.stopPropagation()}
                              >
                                <Link2 className='h-3.5 w-3.5 shrink-0' />
                                <span className='min-w-0 break-all'>
                                  {customListing.subdomain}.rentline.io
                                </span>
                              </a>
                            ) : (
                              'No custom subdomain configured'
                            )}
                          </p>
                        </div>

                        <div className='rounded-md border bg-muted/20 p-3'>
                          <div className='mb-2 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                            <div className='flex min-w-0 flex-wrap items-center gap-2'>
                              <div className='mb-0 flex items-center gap-2 text-sm font-medium'>
                                <Building className='h-4 w-4 text-muted-foreground' />
                                Properties
                              </div>
                              <Badge variant='secondary'>
                                {propertyCount} Available
                              </Badge>
                            </div>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-7 w-full gap-1 text-xs sm:w-auto'
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Edit className='size-4' />
                              Edit
                            </Button>
                          </div>
                          <PropertyThumbnailList
                            properties={customListing.properties}
                          />
                        </div>
                      </div>

                      {/* Right: Config + Actions */}
                      <div className='w-full space-y-3 md:h-49 md:w-48'>
                        <div className='h-full space-y-2 rounded-md border bg-muted/20 p-3'>
                          <h4 className='flex items-center gap-2 text-sm font-medium'>
                            <Settings2 className='h-4 w-4 text-muted-foreground' />
                            Config
                          </h4>
                          <div className='space-y-1.5 text-xs'>
                            <div className='flex items-start justify-between gap-3'>
                              <span className='text-muted-foreground'>
                                Contact
                              </span>
                              <span className='text-right font-medium break-words'>
                                {contactSummary}
                              </span>
                            </div>
                            <div className='flex items-start justify-between gap-3'>
                              <span className='text-muted-foreground'>
                                Contact form
                              </span>
                              <span className='text-right'>
                                {customListing.show_contact_form
                                  ? 'Enabled'
                                  : 'Disabled'}
                              </span>
                            </div>
                            <div className='flex items-start justify-between gap-3'>
                              <span className='text-muted-foreground'>
                                Langs
                              </span>
                              <span className='text-right font-medium break-words'>
                                {languagesLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* <div className='grid grid-cols-2 gap-2'>
                          <Button
                            variant={isPublished ? 'outline' : 'default'}
                            size='sm'
                            className='gap-1'
                            onClick={handlePublishToggle}
                          >
                            {isPublished ? (
                              <EyeOff className='h-3.5 w-3.5' />
                            ) : (
                              <Power className='h-3.5 w-3.5' />
                            )}
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='gap-1'
                            onClick={openEditDrawer}
                          >
                            <PencilLine className='h-3.5 w-3.5' />
                          </Button>
                        </div>

                        {isPublished && (
                          <Button
                            variant='secondary'
                            size='sm'
                            className='w-full gap-1'
                            onClick={handleViewLive}
                          >
                            <Eye className='h-3.5 w-3.5' />
                            View
                          </Button>
                        )} */}
                      </div>
                    </div>
                  </ExpandableContent>
                ) : null}
              </ExpandableCardContent>

              <ExpandableCardFooter className='px-4 pt-0 pb-4'>
                <div className='flex flex-col gap-1 text-xs text-muted-foreground sm:px-2'>
                  {!isExpanded && (
                    <div className='flex flex-wrap items-center gap-1 text-xs text-muted-foreground'>
                      <span>Click to expand details</span>{' '}
                      <ArrowUpRightFromCircle className='size-3' />
                    </div>
                  )}
                  {customListing && (
                    <span>Updated: {formatDate(customListing.updated_at)}</span>
                  )}
                </div>
              </ExpandableCardFooter>
            </ExpandableCard>
          </ExpandableTrigger>
        )}
      </Expandable>

      <WebsiteIntegrationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={drawerMode}
        initialValues={{
          headline: customListing?.headline ?? '',
          subdomain: customListing?.subdomain,
          is_published: customListing?.is_published,
          contact_email: customListing?.contact_email ?? '',
          contact_phone: customListing?.contact_phone ?? '',
          property_ids: customListing?.properties?.flatMap((p) => p.id),
        }}
        listingId={listingId}
        onSubmit={() => {
          refetch()
        }}
      />
    </>
  )
}

export default WebsiteIntegrationCard
