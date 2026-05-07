'use client'

import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { IProperty } from '@/features/properties/types'
import {
  invalidateUnitList,
  useCreateUnit,
  useDeleteUnit,
  useGetUnits,
} from '../query'
import { makeOptimisticUnit, toCreatePayload } from '../query/dto'
import type { IUnitData, TCreateUnitSchema } from '../types'
import UnitEditRow from './unit-edit-row'
import UnitTableRow from './unit-table-row'

type Props = {
  property: IProperty
}

export default function UnitsTable({ property }: Props) {
  const [creating, setCreating] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<IUnitData | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const queryClient = useQueryClient()

  const [optimisticUnits, setOptimisticUnits] = useState<IUnitData[]>([])
  const [deletedIds, setDeletedIds] = useState<number[]>([])

  const { data: queryUnits = [], isLoading } = useGetUnits(property.id)
  const { mutate: createUnit, isPending: isCreating } = useCreateUnit(property)
  const { mutate: deleteUnit } = useDeleteUnit(property)

  const units = useMemo(() => {
    const filtered = queryUnits.filter((u) => !deletedIds.includes(u.id))

    return [...optimisticUnits, ...filtered].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    )
  }, [queryUnits, optimisticUnits, deletedIds])

  const handleSave = (payload: TCreateUnitSchema) => {
    const apiPayload = toCreatePayload(payload)
    const tempId = -Date.now()

    const optimisticUnit = makeOptimisticUnit(property.id, apiPayload, tempId)

    setOptimisticUnits((prev) => [optimisticUnit, ...prev])
    setCreating(false)

    createUnit(apiPayload, {
      async onSuccess(result) {
        setOptimisticUnits((prev) => prev.filter((u) => u.id !== tempId))
        toast.success(`Unit ${result.name} created`)
      },
      onError() {
        setOptimisticUnits((prev) => prev.filter((u) => u.id !== tempId))
        toast.error('Error creating unit')
      },
    })
  }

  const handleDelete = (unitId: number) => {
    setConfirmDelete(false)

    // optimistic remove
    setDeletedIds((prev) => [...prev, unitId])
    setOptimisticUnits((prev) => prev.filter((u) => u.id !== unitId))

    if (unitId < 0) return

    deleteUnit(unitId, {
      async onSuccess() {
        toast.success('Unit deleted')
        await invalidateUnitList(property.id.toString(), queryClient)
      },
      onError() {
        // rollback
        setDeletedIds((prev) => prev.filter((id) => id !== unitId))
        toast.error('Error deleting unit')
      },
    })
  }

  const openDeleteDialog = (unit: IUnitData) => {
    setSelectedUnit(unit)
    setConfirmDelete(true)
  }

  return (
    <>
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

                {isLoading && units.length === 0 && !creating ? (
                  <TableRow className='w-full'>
                    <TableCell
                      colSpan={6}
                      className='flex h-24 w-full items-center justify-center text-center'
                    >
                      <Loader2 className='mx-auto size-6 animate-spin' />
                    </TableCell>
                  </TableRow>
                ) : units.length === 0 && !creating ? (
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
                      onDelete={() => openDeleteDialog(u)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        title='Delete Unit'
        desc='Are you sure you want to delete this unit?'
        open={confirmDelete}
        confirmText='Yes, Delete'
        destructive
        onOpenChange={setConfirmDelete}
        handleConfirm={() => {
          if (!selectedUnit) return
          handleDelete(selectedUnit.id)
        }}
      />
    </>
  )
}
