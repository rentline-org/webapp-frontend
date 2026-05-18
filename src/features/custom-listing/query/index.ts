import { handleGet, type IResponse } from '@/api'
import type { ICustomListing } from '@/features/custom-listing/types'
import { useQuery } from '@tanstack/react-query'

const CUSTOM_LISTING_ENDPOINT = 'custom-listing';
// const getCustomListingMutationEndpoint = (listingId: number) => {
//   return `/listing/${listingId}/${CUSTOM_LISTING_ENDPOINT}`;
// }

async function getWebsiteIntegration(customListingId: number|null): Promise<ICustomListing|null> {
  if (!customListingId) return null;
  const response = await handleGet<IResponse<ICustomListing>>(
    CUSTOM_LISTING_ENDPOINT.concat(`/${customListingId.toString()}`)
  )
  return response.data
}

export function useGetWebsiteIntegration(customListingId: number|null) {
  return useQuery({
    queryKey: [CUSTOM_LISTING_ENDPOINT, customListingId],
    queryFn: async () => getWebsiteIntegration(customListingId),
    enabled: !!customListingId
  })
}
