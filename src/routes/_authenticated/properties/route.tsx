import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Building2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/properties')({
  loader: () => ({ crumb: 'Properties', icon: Building2 }),
  component: () => <Outlet />,
})
