import { createFileRoute } from '@tanstack/react-router'
import { Otp } from '@/features/auth/otp'

type TSearchSchema = {
  email: string
}

export const Route = createFileRoute('/(auth)/otp')({
  component: Otp,
  validateSearch: (search: TSearchSchema): TSearchSchema => ({
    email: search.email,
  }),
})
