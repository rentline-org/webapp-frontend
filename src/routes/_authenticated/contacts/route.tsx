import { createFileRoute, Outlet } from '@tanstack/react-router'
import { UsersRound } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/contacts')({
  loader: () => ({ crumb: 'Contacts', icon: UsersRound }),
  component: () => <Outlet />,
})
