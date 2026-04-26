export type PropertyType =
  | 'all'
  | 'houses'
  | 'apartments'
  | 'commercial'
  | 'land'
export type PropertyStatus = 'vacant' | 'occupied' | 'maintenance'
export type PropertyOccupancy = 'low' | 'medium' | 'high'
export type PropertySort = 'newly_added' | 'name_asc' | 'name_desc'

export type Property = {
  id: string
  name: string
  address: string
  type: Exclude<PropertyType, 'all'>
  status: PropertyStatus
  occupancy: PropertyOccupancy
  units: number
  monthlyRent: number
  image: string
}
