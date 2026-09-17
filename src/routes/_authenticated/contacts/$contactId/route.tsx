import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/contacts/$contactId')({
  component: () => <Outlet />,
})
