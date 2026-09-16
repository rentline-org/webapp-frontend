import { createFileRoute, Outlet } from '@tanstack/react-router'
import { FileKey2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/leases')({
  loader: () => ({ crumb: 'Leases', icon: FileKey2 }),
  component: () => <Outlet />,
})
