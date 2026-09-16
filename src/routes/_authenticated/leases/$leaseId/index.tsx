import { createFileRoute } from '@tanstack/react-router'
import { LeaseDetails } from '@/features/leases/lease-details'

export const Route = createFileRoute('/_authenticated/leases/$leaseId/')({
  component: LeaseDetails,
})
