import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTerminateLease } from '../query'
import type { IOperationalLease } from '../types'

export function LeaseTerminationDialog({
  lease,
  open,
  onOpenChange,
}: {
  lease: IOperationalLease | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('leases')
  const [terminatedOn, setTerminatedOn] = useState('')
  const [reason, setReason] = useState('')
  const mutation = useTerminateLease()

  useEffect(() => {
    if (open) {
      setTerminatedOn('')
      setReason('')
    }
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!mutation.isPending) onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader className='text-left'>
          <DialogTitle>{t('actions.terminationTitle')}</DialogTitle>
          <DialogDescription>
            {t('actions.terminationDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='lease-termination-date'>
              {t('actions.terminationDate')}
            </Label>
            <Input
              id='lease-termination-date'
              type='date'
              value={terminatedOn}
              max={lease?.ends_on}
              onChange={(event) => setTerminatedOn(event.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='lease-termination-reason'>
              {t('actions.terminationReason')}
            </Label>
            <Textarea
              id='lease-termination-reason'
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button
            type='button'
            variant='destructive'
            disabled={!lease || !reason.trim() || mutation.isPending}
            onClick={() => {
              if (!lease) return
              mutation.mutate(
                {
                  lease,
                  payload: {
                    ...(terminatedOn ? { terminated_on: terminatedOn } : {}),
                    reason: reason.trim(),
                  },
                },
                {
                  onSuccess: () => {
                    toast.success(t('actions.terminated'))
                    onOpenChange(false)
                  },
                }
              )
            }}
          >
            {mutation.isPending ? <Loader2 className='animate-spin' /> : null}
            {t('actions.terminate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
