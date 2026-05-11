import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { removeCookie } from '@/lib/cookies'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useHandleLogout } from '@/features/auth/query'
import { USER_PROFILE_ENDPOINT } from '@/features/settings/profile/query'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const { mutate, isPending } = useHandleLogout()

  const handleSignOut = () => {
    onOpenChange(false)

    mutate(undefined, {
      onSuccess: async () => {
        auth.reset()
        removeCookie('active_org')

        await queryClient.cancelQueries({ queryKey: [USER_PROFILE_ENDPOINT] })
        queryClient.removeQueries({
          queryKey: [USER_PROFILE_ENDPOINT],
          exact: true,
        })

        navigate({
          to: '/sign-in',
          search: { redirect: '/' },
          replace: true,
        })
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      isLoading={isPending}
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
