import z from 'zod'
import type { IUnitData } from '../../types'

// export const
export const unitThumbnailSchema = z.object({
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
export type TUnitThumbnailSchema = z.infer<typeof unitThumbnailSchema>

export const unitGallerySchema = z.object({
  images: z.array(
    z
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
      })
  ),
  names: z.array(z.string()),
})

export type TUnitGallerySchema = z.infer<typeof unitGallerySchema>

export interface IUnitThumbnailEndpointParams {
  propertyId: number
  unitId: number
}

export interface IUnitGalleryEndpointParams {
  propertyId: number
  unitId: number
  mediaId: string
}

export type TUnitThumbnailRequest = TUnitThumbnailSchema &
  IUnitThumbnailEndpointParams

export type TUnitGalleryRequest = IUnitThumbnailEndpointParams & {
  payload: FormData
}

export interface IUnitThumbnailData {
  message: string
  unit: IUnitData
}
