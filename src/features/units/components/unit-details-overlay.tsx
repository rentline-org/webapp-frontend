import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import type { IUnitData } from '../types'

type UnitDetailsOverlayProps = {
  unit: IUnitData | null
  onClose: () => void
}

export function UnitDetailsOverlay({ unit, onClose }: UnitDetailsOverlayProps) {
  return (
    <AnimatePresence initial={false}>
      {unit && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            layoutId={`unit-card-${unit.id}`}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className='relative h-[90vh] w-[min(85vw,95vw)] overflow-hidden rounded-3xl bg-background'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='border-b p-6'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h2 className='text-2xl font-semibold'>{unit.name}</h2>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {unit.description ?? 'No description'}
                  </p>
                </div>

                <Button variant='ghost' size='icon' onClick={onClose}>
                  <X className='size-4' />
                </Button>
              </div>
            </div>

            <div className='p-6'>
              <pre className='text-sm'>{JSON.stringify(unit, null, 2)}</pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
