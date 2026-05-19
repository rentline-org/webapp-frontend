import { type QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { handleGet, handlePost, type IResponse } from '@/api'
import type { IListing } from '@/features/listing/types'

const LISTING_ENDPOINT = '/listing'

async function handleGetListing() {
  const response = await handleGet<IResponse<IListing>>(LISTING_ENDPOINT)
  return response.data
}

async function handleCreateListing() {
  const response = await handlePost<IResponse<IListing>, unknown>(
    LISTING_ENDPOINT
  )
  return response.data
}

export function useGetListing() {
  return useQuery({
    queryKey: [LISTING_ENDPOINT],
    queryFn: handleGetListing,
  })
}

export function useCreateListing() {
  return useMutation({
    mutationKey: [LISTING_ENDPOINT, 'create'],
    mutationFn: handleCreateListing,
  })
}

export async function invalidateListing(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    queryKey: [LISTING_ENDPOINT],
  })
}
