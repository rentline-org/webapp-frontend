import { Loader2, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Main } from '@/components/layout/main.tsx'
import { useCreateListing, useGetListing } from '@/features/listing/query'
import WebsiteIntegrationCard from '@/features/custom-listing/components/website-integration-card.tsx'

function ListingPage() {
  const { data, isLoading, refetch, isFetching } = useGetListing()
  const { mutate, isPending } = useCreateListing()

  const handleInitListing = () => {
    mutate(undefined, {
      onSuccess: async () => {
        await refetch()
      },
    })
  }

  if (isLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <Loader2 className='mx-auto size-6 animate-spin' />
      </div>
    )
  }

  return (
    <Main className='h-full w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
      {data === null ? (
        <div className='flex h-full w-full flex-col items-center justify-center'>
          <h2 className='text-3xl'>No listings initialized!</h2>
          <p className='text-base tracking-wide'>Create your first listing</p>

          {/* CTA */}
          <Button
            size='lg'
            className='mt-6'
            onClick={handleInitListing}
            disabled={isPending || isFetching}
          >
            {isPending || isFetching ? (
              <>
                <Loader2 className='animate-spin' />
                Initializing...
              </>
            ) : (
              <>
                <PlusIcon />
                Start posting!
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className='flex w-full flex-col gap-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div className='space-y-1'>
              <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
                Listings
              </h1>
              <p className='text-sm text-muted-foreground'>
                View your active listings and integrations.
              </p>
            </div>

            {/* <Button>
              <PlusIcon />
              New publication
            </Button> */}
          </div>

          <div className='flex w-full items-center gap-4'>
            <WebsiteIntegrationCard
              customListingId={data?.custom_listing?.id ?? null}
              listingId={data!.id}
            />
          </div>
        </div>
      )}
    </Main>
  )
}

export default ListingPage
