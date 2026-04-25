import { createFileRoute } from '@tanstack/react-router'
import { handleAuthProtection } from '@/lib/route-utils'
import { Otp } from '@/features/auth/otp'

type TSearchSchema = {
  email: string
}

export const Route = createFileRoute('/(auth)/otp')({
  beforeLoad: async ({ context }) => {
    return await handleAuthProtection('guest', context)
  },
  component: Otp,
  validateSearch: (search: TSearchSchema): TSearchSchema => ({
    email: search.email,
  }),
})
