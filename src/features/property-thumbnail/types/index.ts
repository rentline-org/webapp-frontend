import z from 'zod'
import { type IProperty } from '@/features/properties/types'

export const propertyThumbnailSchema = z.object({
  thumbnail: z
    .instanceof(File, {
      message: 'Please select an image.',
    })
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      {
        message: 'Only JPG, PNG and WebP images are allowed.',
      }
    )
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: 'Image must be less than 2MB.',
    }),
})
export type TPropertyThumbnailSchema = z.infer<typeof propertyThumbnailSchema>

export interface IPropertyThumbnailEndpointParams {
  propertyId: number
}

// export interface IPropertyGalleryEndpointParams extends IPropertyThumbnailEndpointParams {
//   mediaId: string
// }

export type TPropertyThumbnailRequest = TPropertyThumbnailSchema &
  IPropertyThumbnailEndpointParams

export interface IPropertyMediaResponse {
  message: string
  property: IProperty
}
