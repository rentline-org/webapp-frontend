import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/leases/$leaseId')({
  component: () => <Outlet />,
})
