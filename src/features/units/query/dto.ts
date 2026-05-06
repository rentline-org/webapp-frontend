import type { IUnitData, TCreateUnitSchema } from '../types'

export const toCreatePayload = (
  payload: TCreateUnitSchema
): TCreateUnitSchema => ({
  name: payload.name,
  description: payload.description ?? null,
  unit_type: payload.unit_type ?? 'residential',
  is_available: payload.is_available ?? true,
  is_furnished: payload.is_furnished ?? false,
  is_pet_friendly: payload.is_pet_friendly ?? false,
  rent_price: payload.rent_price == null ? null : Number(payload.rent_price),
  bedrooms: payload.bedrooms == null ? null : Number(payload.bedrooms),
  bathrooms: payload.bathrooms == null ? null : Number(payload.bathrooms),
  square_feet: payload.square_feet == null ? null : Number(payload.square_feet),
  amenities: payload.amenities ?? undefined,
})

export const makeOptimisticUnit = (
  propertyId: number,
  payload: TCreateUnitSchema,
  tempId: number
): IUnitData => ({
  id: tempId,
  property_id: propertyId,
  name: payload.name,
  slug: payload.name.split(' ').join('-'),
  description: payload.description,
  unit_type: payload.unit_type,
  is_available: payload.is_available,
  is_furnished: payload.is_furnished,
  is_pet_friendly: payload.is_pet_friendly,
  rent_price: payload.rent_price,
  sale_price: null,
  bedrooms: payload.bedrooms,
  bathrooms: payload.bathrooms,
  square_feet: payload.square_feet,
  amenities: payload.amenities ?? null,
  available_from: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})
