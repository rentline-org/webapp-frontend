import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import InputWithEndButtons from '@/components/ui/input-number'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TableRow, TableCell } from '@/components/ui/table'
import type { TCreateUnitSchema } from '../types'
import { getUnitTypes } from '../types/constants'

type Props = {
  onSave: (payload: TCreateUnitSchema) => void
  onCancel: () => void
  isSaving?: boolean
}

export default function UnitEditRow({ onSave, onCancel, isSaving }: Props) {
  const [name, setName] = useState('')
  const [unitType, setUnitType] = useState('residential')
  const [rentPrice, setRentPrice] = useState<number | null>(null)
  const [bedrooms, setBedrooms] = useState<number | null>(1)
  const [bathrooms, setBathrooms] = useState<number | null>(1)

  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    if (rentPrice == null) {
      setError('Provide a rent price.')
      return
    }

    setError(null)

    const payload: TCreateUnitSchema = {
      name: name.trim(),
      description: null,
      unit_type: unitType,
      rent_price: rentPrice == null ? null : rentPrice,
      bedrooms: bedrooms ?? null,
      bathrooms: bathrooms ?? null,
      is_available: true,
      is_furnished: false,
      is_pet_friendly: false,
    } as TCreateUnitSchema

    onSave(payload)
  }

  return (
    <TableRow>
      <TableCell>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Name'
        />
      </TableCell>

      <TableCell>
        <Select value={unitType} onValueChange={(v) => setUnitType(v)}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Type' />
          </SelectTrigger>
          <SelectContent>
            {getUnitTypes().map((u) => (
              <SelectItem key={u.value} value={u.value} className='capitalize'>
                {u.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell>
        <InputWithEndButtons
          value={rentPrice ?? 0}
          onChange={(v) => setRentPrice(v === 0 ? null : v)}
          autoFormat
          currency='BRL'
        />
      </TableCell>

      <TableCell>
        <InputWithEndButtons
          value={bedrooms ?? 0}
          onChange={(v) => setBedrooms(v === 0 ? null : v)}
        />
      </TableCell>

      <TableCell>
        <InputWithEndButtons
          value={bathrooms ?? 0}
          onChange={(v) => setBathrooms(v === 0 ? null : v)}
        />
      </TableCell>

      <TableCell className='flex gap-2'>
        <div className='flex flex-col'>
          <div className='flex gap-2'>
            <Button size='sm' onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              size='sm'
              variant='ghost'
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
          {error && (
            <span className='mt-1 text-sm text-destructive'>{error}</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
