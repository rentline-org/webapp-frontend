import z from 'zod'
import type { ICustomListing } from '@/features/custom-listing/types'

export type ListingType = 'website' | 'airbnb' | 'facebook';

export const createListingSchema = z.object({
  type: z.enum(['website'])
});

export type TCreateListingSchema = z.infer<typeof createListingSchema>

export interface IListing {
  id: number;
  organization_id: number;
  type: ListingType;
  custom_listing: ICustomListing;
  created_at: string;
  updated_at: string;
}

export interface IListingResponse {
  listing: IListing;
  message: string;
}