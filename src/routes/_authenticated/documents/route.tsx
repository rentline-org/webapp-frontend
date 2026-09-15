import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Files } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/documents')({
  loader: () => ({ crumb: 'Documents', icon: Files }),
  component: () => <Outlet />,
})
