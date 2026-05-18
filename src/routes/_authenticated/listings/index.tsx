import { createFileRoute } from '@tanstack/react-router';
import ListingPage from '@/features/listing'

export const Route = createFileRoute('/_authenticated/listings/')({
  component: ListingPage,
})
