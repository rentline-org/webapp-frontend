import { useMutation } from '@tanstack/react-query'
import { handleDelete, handlePatch, handlePost, type IResponse } from '@/api'
import type {
  IUnitGalleryEndpointParams,
  IUnitThumbnailData,
  IUnitThumbnailEndpointParams,
  TUnitGalleryRequest,
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

async function handleUploadUnitGalleryImage({
  payload,
  propertyId,
  unitId,
}: TUnitGalleryRequest): Promise<IUnitThumbnailData> {
  const endpoint = getMediaEndpoint(propertyId, unitId).concat('/gallery')
  const response = await handlePost<IResponse<IUnitThumbnailData>, FormData>(
    endpoint,
    payload
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

async function handleDeleteUnitGalleryImage({
  propertyId,
  unitId,
  mediaId,
}: IUnitGalleryEndpointParams) {
  const endpoint = getMediaEndpoint(propertyId, unitId).concat(
    `/gallery/${mediaId}`
  )

  const response = await handleDelete<IResponse<IUnitThumbnailData>>(endpoint)
  return response.data
}

async function handleUpdateUnitGalleryImageName({
  unitId,
  mediaId,
  propertyId,
  ...payload
}: IUnitGalleryEndpointParams & { name: string }) {
  const endpoint = getMediaEndpoint(propertyId, unitId).concat(
    `/gallery/${mediaId}`
  )

  const response = await handlePatch<
    IResponse<IUnitThumbnailData>,
    { name: string }
  >(endpoint, payload)
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

export function useUploadGallery() {
  return useMutation({
    mutationKey: ['units', 'gallery', 'upload'],
    mutationFn: async (payload: TUnitGalleryRequest) => {
      return await handleUploadUnitGalleryImage(payload)
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

export function useDeleteUnitGalleryImage() {
  return useMutation({
    mutationKey: ['units', 'gallery', 'delete'],
    mutationFn: async (payload: IUnitGalleryEndpointParams) => {
      return await handleDeleteUnitGalleryImage(payload)
    },
  })
}

export function useUpdateUnitGalleryImageName() {
  return useMutation({
    mutationKey: ['units', 'gallery', 'update', 'name'],
    mutationFn: async (
      payload: IUnitGalleryEndpointParams & { name: string }
    ) => {
      return await handleUpdateUnitGalleryImageName(payload)
    },
  })
}
