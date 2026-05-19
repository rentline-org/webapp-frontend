import { handleDelete, handleGet, handlePost, type IResponse } from '@/api'
import type {
  ICustomListing,
  TWebsiteIntegrationSchema,
} from '@/features/custom-listing/types'
import { useMutation, useQuery } from '@tanstack/react-query'

const CUSTOM_LISTING_ENDPOINT = 'custom-listing'
const getCustomListingMutationEndpoint = (listingId: number) => {
  return `/listing/${listingId.toString()}/${CUSTOM_LISTING_ENDPOINT}`
}

async function getWebsiteIntegration(
  customListingId: number | null
): Promise<ICustomListing | null> {
  if (!customListingId) return null
  const response = await handleGet<IResponse<ICustomListing>>(
    CUSTOM_LISTING_ENDPOINT.concat(`/${customListingId.toString()}`)
  )
  return response.data
}

async function handleCreateWebsiteIntegration(
  listingId: number,
  payload: TWebsiteIntegrationSchema
): Promise<ICustomListing> {
  const endpoint = getCustomListingMutationEndpoint(listingId)
  const response = await handlePost<
    IResponse<ICustomListing>,
    TWebsiteIntegrationSchema
  >(endpoint, payload)

  return response.data
}

async function handleEditWebsiteIntegration(
  customListingId: number,
  payload: Partial<TWebsiteIntegrationSchema>
) {
  const endpoint = CUSTOM_LISTING_ENDPOINT.concat(
    `/${customListingId.toString()}`
  )

  const response = await handlePost<
    IResponse<ICustomListing>,
    Partial<TWebsiteIntegrationSchema>
  >(endpoint, payload)
  return response.data
}

async function handleDeleteWebsiteIntegration(customListingId: number) {
  const endpoint = CUSTOM_LISTING_ENDPOINT.concat(
    `/${customListingId.toString()}`
  )

  const response = await handleDelete<IResponse<null>>(endpoint)
  return response.data
}

export function useGetWebsiteIntegration(customListingId: number | null) {
  return useQuery({
    queryKey: [CUSTOM_LISTING_ENDPOINT, customListingId],
    queryFn: async () => getWebsiteIntegration(customListingId),
    enabled: !!customListingId,
  })
}

export function useCreateWebsiteIntegration() {
  return useMutation({
    mutationKey: [CUSTOM_LISTING_ENDPOINT, 'create'],
    mutationFn: async ({
      listingId,
      payload,
    }: {
      listingId: number
      payload: TWebsiteIntegrationSchema
    }) => {
      return await handleCreateWebsiteIntegration(listingId, payload)
    },
  })
}

export function useUpdateWebsiteIntegration() {
  return useMutation({
    mutationKey: [CUSTOM_LISTING_ENDPOINT, 'edit'],
    mutationFn: async ({
      customListingId,
      payload,
    }: {
      customListingId: number
      payload: Partial<TWebsiteIntegrationSchema>
    }) => {
      return await handleEditWebsiteIntegration(customListingId, payload)
    },
  })
}

export function useDeleteWebsiteIntegration() {
  return useMutation({
    mutationKey: [CUSTOM_LISTING_ENDPOINT, 'delete'],
    mutationFn: async (customListingId: number) => {
      return await handleDeleteWebsiteIntegration(customListingId)
    },
  })
}
