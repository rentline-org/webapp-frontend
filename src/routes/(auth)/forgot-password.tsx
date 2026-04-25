import { createFileRoute } from '@tanstack/react-router'
import { handleAuthProtection } from '@/lib/route-utils'
import { ForgotPassword } from '@/features/auth/forgot-password'

export const Route = createFileRoute('/(auth)/forgot-password')({
  beforeLoad: async ({ context }) => {
    return await handleAuthProtection('guest', context)
  },
  component: ForgotPassword,
})
