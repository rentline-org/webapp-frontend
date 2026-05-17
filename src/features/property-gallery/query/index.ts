import { useMutation } from '@tanstack/react-query';
import { handleDelete, handlePatch, handlePost, type IResponse } from '@/api';
import type { IPropertyGalleryData, TPropertyGalleryRequest } from '@/features/property-gallery/types';
import type { IPropertyGalleryEndpointParams } from '@/features/property-thumbnail/types';

const getMediaEndpoint = (propertyId: number) =>
  `/properties/${propertyId.toString()}/media`

async function handleUploadPropertyGalleryImage({
  payload,
  propertyId,
}: TPropertyGalleryRequest): Promise<IPropertyGalleryData> {
  const endpoint = getMediaEndpoint(propertyId).concat('/gallery')
  const response = await handlePost<IResponse<IPropertyGalleryData>, FormData>(
    endpoint,
    payload
  )

  return response.data
}

async function handleDeletePropertyGalleryImage({
  propertyId,
  mediaId,
}: IPropertyGalleryEndpointParams) {
  const endpoint = getMediaEndpoint(propertyId).concat(`/gallery/${mediaId}`)

  const response = await handleDelete<IResponse<IPropertyGalleryData>>(endpoint)
  return response.data
}

async function handleUpdatePropertyGalleryImageName({
  mediaId,
  propertyId,
  ...payload
}: IPropertyGalleryEndpointParams & { name: string }) {
  const endpoint = getMediaEndpoint(propertyId).concat(`/gallery/${mediaId}`)

  const response = await handlePatch<
    IResponse<IPropertyGalleryData>,
    { name: string }
  >(endpoint, payload)
  return response.data
}


export function useUploadPropertyGallery() {
  return useMutation({
    mutationKey: ['property', 'gallery', 'upload'],
    mutationFn: async (payload: TPropertyGalleryRequest) => {
      return await handleUploadPropertyGalleryImage(payload)
    },
  })
}

export function useDeletePropertyGalleryImage() {
  return useMutation({
    mutationKey: ['property', 'gallery', 'delete'],
    mutationFn: async (payload: IPropertyGalleryEndpointParams) => {
      return await handleDeletePropertyGalleryImage(payload)
    },
  })
}

export function useUpdatePropertyGalleryImageName() {
  return useMutation({
    mutationKey: ['property', 'gallery', 'update', 'name'],
    mutationFn: async (
      payload: IPropertyGalleryEndpointParams & { name: string }
    ) => {
      return await handleUpdatePropertyGalleryImageName(payload)
    },
  })
}
