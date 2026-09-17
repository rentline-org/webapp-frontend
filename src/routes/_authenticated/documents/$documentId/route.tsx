import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/documents/$documentId')({
  component: () => <Outlet />,
})
