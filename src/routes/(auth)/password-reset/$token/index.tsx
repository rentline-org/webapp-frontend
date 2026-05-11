import { createFileRoute } from '@tanstack/react-router'
import ResetPassword from '@/features/auth/reset-password'

type TPasswordSearchParams = {
  email: string
}

export const Route = createFileRoute('/(auth)/password-reset/$token/')({
  component: ResetPassword,
  validateSearch: (search: TPasswordSearchParams): TPasswordSearchParams => ({
    email: search.email,
  }),
})
