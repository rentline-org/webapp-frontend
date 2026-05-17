import type { IPropertyThumbnailEndpointParams } from '@/features/property-thumbnail/types';
import type { IProperty } from '@/features/properties/types'

export type GalleryDraftItem = {
  id: string
  file: File
  previewUrl: string
  title: string
}

export type TPropertyGalleryRequest = IPropertyThumbnailEndpointParams & {
  payload: FormData
}

export interface IPropertyGalleryData {
  message: string
  property: IProperty
}