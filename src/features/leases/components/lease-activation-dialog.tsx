import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useActivateLease } from '../query'
import type { IOperationalLease } from '../types'

export function LeaseActivationDialog({
  lease,
  open,
  onOpenChange,
}: {
  lease: IOperationalLease | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation('leases')
  const mutation = useActivateLease()

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!mutation.isPending) onOpenChange(next)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('actions.activationTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('actions.activationDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            {t('common:actions.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!lease || mutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              if (!lease) return
              mutation.mutate(lease, {
                onSuccess: () => {
                  toast.success(t('actions.activated'))
                  onOpenChange(false)
                },
              })
            }}
          >
            {mutation.isPending ? <Loader2 className='animate-spin' /> : null}
            {t('actions.activate')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
