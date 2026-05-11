import { useMutation } from '@tanstack/react-query'
import { handleDelete, handlePost, type IResponse } from '@/api'
import type {
  IUnitThumbnailData,
  IUnitThumbnailEndpointParams,
  TUnitThumbnailRequest,
  //   TUnitThumbnailSchema,
} from '../types'

const getMediaEndpoint = (propertyId: number, unitId: number) =>
  `/properties/${propertyId.toString()}/units/${unitId.toString()}/media`

async function handleUploadUnitThumbnail({
  propertyId,
  unitId,
  thumbnail,
}: TUnitThumbnailRequest): Promise<IUnitThumbnailData> {
  const endpoint = getMediaEndpoint(propertyId, unitId).concat('/thumbnail')

  const formData = new FormData()
  formData.append('thumbnail', thumbnail)

  const response = await handlePost<IResponse<IUnitThumbnailData>, FormData>(
    endpoint,
    formData
  )

  return response.data
}

async function handleDeleteUnitThumbnail({
  propertyId,
  unitId,
}: IUnitThumbnailEndpointParams): Promise<IUnitThumbnailData> {
  const endpoint = getMediaEndpoint(propertyId, unitId).concat('/thumbnail')

  const response = await handleDelete<IResponse<IUnitThumbnailData>>(endpoint)
  return response.data
}

export function useUploadUnitThumbnail() {
  return useMutation({
    mutationKey: ['units', 'thumbnail', 'upload'],
    mutationFn: async (payload: TUnitThumbnailRequest) => {
      return await handleUploadUnitThumbnail(payload)
    },
  })
}

export function useDeleteUnitThumbnail() {
  return useMutation({
    mutationKey: ['units', 'thumbnail', 'delete'],
    mutationFn: async (payload: IUnitThumbnailEndpointParams) => {
      return await handleDeleteUnitThumbnail(payload)
    },
  })
}
