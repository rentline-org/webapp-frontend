import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import type { IProperty } from '@/features/properties/types'
import { useCreateUnit, useDeleteUnit, useUpdateUnit } from '../query'
import type { IUnitData, IUpdateUnitInput, TCreateUnitSchema } from '../types'
import UnitDetailsDrawer from './unit-details-drawer'
import UnitEditRow from './unit-edit-row'
import UnitTableRow from './unit-table-row'

type Props = {
  property: IProperty
}

const toCreatePayload = (payload: TCreateUnitSchema): TCreateUnitSchema => ({
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

const makeOptimisticUnit = (
  propertyId: number,
  payload: TCreateUnitSchema,
  tempId: number
): IUnitData => ({
  id: tempId,
  property_id: propertyId,
  name: payload.name,
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

const normalizeFieldValue = (
  field: keyof IUpdateUnitInput,
  value: string | number | boolean | null
) => {
  if (
    field === 'rent_price' ||
    field === 'sale_price' ||
    field === 'bedrooms' ||
    field === 'bathrooms' ||
    field === 'square_feet'
  ) {
    return value == null || value === '' ? null : Number(value)
  }

  if (
    field === 'is_available' ||
    field === 'is_furnished' ||
    field === 'is_pet_friendly'
  ) {
    return Boolean(value)
  }

  return value
}

const buildUpdatePayload = (
  field: keyof IUpdateUnitInput,
  value: string | number | boolean | null
): IUpdateUnitInput => {
  const payload: IUpdateUnitInput = {}
  const normalized = normalizeFieldValue(field, value)

  switch (field) {
    case 'name':
      if (typeof normalized === 'string') payload.name = normalized
      break
    case 'description':
      payload.description = normalized == null ? null : String(normalized)
      break
    case 'unit_type':
      if (typeof normalized === 'string') {
        payload.unit_type = normalized as IUpdateUnitInput['unit_type']
      }
      break
    case 'rent_price':
      payload.rent_price = normalized as number | null
      break
    case 'sale_price':
      payload.sale_price = normalized as number | null
      break
    case 'bedrooms':
      payload.bedrooms = normalized as number | null
      break
    case 'bathrooms':
      payload.bathrooms = normalized as number | null
      break
    case 'square_feet':
      payload.square_feet = normalized as number | null
      break
    case 'is_available':
    case 'is_furnished':
    case 'is_pet_friendly':
      payload[field] = Boolean(normalized) as never
      break
    case 'amenities':
      payload.amenities = normalized as IUpdateUnitInput['amenities']
      break
  }

  return payload
}

export default function UnitsTable({ property }: Props) {
  const [units, setUnits] = useState<IUnitData[]>(property.units ?? [])
  const [creating, setCreating] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<IUnitData | null>(null)

  const { mutate: createUnit, isPending: isCreating } = useCreateUnit(property)
  const { mutate: updateUnit } = useUpdateUnit(property)
  const { mutate: deleteUnit } = useDeleteUnit(property)

  // useEffect(() => {
  //   setUnits(property.units ?? [])
  // }, [property.id, property.units])

  const replaceUnitById = (unitId: number, nextUnit: IUnitData) => {
    setUnits((current) => current.map((u) => (u.id === unitId ? nextUnit : u)))
    setSelectedUnit((current) => (current?.id === unitId ? nextUnit : current))
  }

  const removeUnit = (unitId: number) => {
    setUnits((current) => current.filter((u) => u.id !== unitId))
    setSelectedUnit((current) => (current?.id === unitId ? null : current))
  }

  const handleSave = (payload: TCreateUnitSchema) => {
    const apiPayload = toCreatePayload(payload)
    const tempId = -Date.now()
    const optimisticUnit = makeOptimisticUnit(property.id, apiPayload, tempId)

    setUnits((current) => [optimisticUnit, ...current])
    setCreating(false)

    createUnit(apiPayload, {
      onSuccess(result) {
        replaceUnitById(tempId, result)
        toast.success(`Unit ${result.name} created`)
      },
      onError() {
        removeUnit(tempId)
        toast.error('Error creating unit')
      },
    })
  }

  const handleDelete = (unitId: number) => {
    if (!window.confirm('Delete this unit?')) return

    const previous = units
    removeUnit(unitId)

    if (unitId < 0) return

    deleteUnit(unitId, {
      onSuccess() {
        toast.success('Unit deleted')
        if (selectedUnit?.id === unitId) {
          setDrawerOpen(false)
          setSelectedUnit(null)
        }
      },
      onError() {
        setUnits(previous)
        if (selectedUnit?.id === unitId) {
          setSelectedUnit(previous.find((u) => u.id === unitId) ?? null)
        }
        toast.error('Error deleting unit')
      },
    })
  }

  const handleFieldUpdate = (
    field: keyof IUpdateUnitInput,
    value: string | number | boolean | null
  ) => {
    if (!selectedUnit) return

    const unitId = selectedUnit.id
    const previous = units
    const payload = buildUpdatePayload(field, value)

    const optimisticUnit: IUnitData = {
      ...selectedUnit,
      [field]: normalizeFieldValue(field, value),
      updated_at: new Date().toISOString(),
    } as IUnitData

    replaceUnitById(unitId, optimisticUnit)

    updateUnit(
      { unitId, payload },
      {
        onSuccess(result) {
          replaceUnitById(unitId, result)
          toast.success('Unit updated')
        },
        onError() {
          setUnits(previous)
          setSelectedUnit(previous.find((u) => u.id === unitId) ?? null)
          toast.error('Error updating unit')
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader className='flex items-center justify-between gap-3'>
        <CardTitle>Property Units</CardTitle>

        <Button size='sm' onClick={() => setCreating(true)}>
          Add unit
        </Button>
      </CardHeader>

      <CardContent>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Bedrooms</TableHead>
                <TableHead>Bathrooms</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {creating && (
                <UnitEditRow
                  onSave={handleSave}
                  onCancel={() => setCreating(false)}
                  isSaving={isCreating}
                />
              )}

              {units.length === 0 && !creating ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center'>
                    No units yet.
                  </TableCell>
                </TableRow>
              ) : (
                units.map((u) => (
                  <UnitTableRow
                    key={u.id}
                    unit={u}
                    onDelete={() => handleDelete(u.id)}
                    propertySlug={property.slug}
                    // onOpen={() => {
                    //   setSelectedUnit(u)
                    //   setDrawerOpen(true)
                    // }}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <UnitDetailsDrawer
        unit={selectedUnit}
        open={drawerOpen}
        // isSaving={isUpdating || isDeleting}

        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (!open) setSelectedUnit(null)
        }}
        onFieldUpdate={handleFieldUpdate}
        onDelete={() => {
          if (!selectedUnit) return
          handleDelete(selectedUnit.id)
          setDrawerOpen(false)
        }}
      />
    </Card>
  )
}
