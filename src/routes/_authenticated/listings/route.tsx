import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/listings')({
  loader: () => ({ crumb: 'Listings' }),
  component: () => <Outlet />,
})


