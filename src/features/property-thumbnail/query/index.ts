import { useMutation } from '@tanstack/react-query'
import { handleDelete, handlePost, type IResponse } from '@/api'
import type {
  IPropertyMediaResponse,
  IPropertyThumbnailEndpointParams,
  TPropertyThumbnailRequest,
} from '../types'

const getMediaEndpoint = (propertyId: number) =>
  `/properties/${propertyId.toString()}/media`

async function handleUploadPropertyThumbnail({
  propertyId,
  thumbnail,
}: TPropertyThumbnailRequest): Promise<IPropertyMediaResponse> {
  const endpoint = getMediaEndpoint(propertyId).concat('/thumbnail')

  const formData = new FormData()
  formData.append('thumbnail', thumbnail)

  const response = await handlePost<
    IResponse<IPropertyMediaResponse>,
    FormData
  >(endpoint, formData)

  return response.data
}

async function handleDeletePropertyThumbnail({
  propertyId,
}: IPropertyThumbnailEndpointParams): Promise<IPropertyMediaResponse> {
  const endpoint = getMediaEndpoint(propertyId).concat('/thumbnail')

  const response =
    await handleDelete<IResponse<IPropertyMediaResponse>>(endpoint)
  return response.data
}

export function useUploadPropertyThumbnail() {
  return useMutation({
    mutationKey: ['property', 'thumbnail', 'upload'],
    mutationFn: async (payload: TPropertyThumbnailRequest) => {
      return await handleUploadPropertyThumbnail(payload)
    },
  })
}

export function useDeletePropretyThumbnail() {
  return useMutation({
    mutationKey: ['property', 'thumbnail', 'delete'],
    mutationFn: async (payload: IPropertyThumbnailEndpointParams) => {
      return await handleDeletePropertyThumbnail(payload)
    },
  })
}
