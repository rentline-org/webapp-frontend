import { createFileRoute } from '@tanstack/react-router'
import { NotFoundError } from '@/features/errors/not-found-error'

type TSearchSchema = {
  redirect?: string
}

export const Route = createFileRoute('/(errors)/not-found')({
  component: NotFoundError,
  validateSearch: (search: TSearchSchema): TSearchSchema => ({
    redirect: search.redirect,
  }),
})
