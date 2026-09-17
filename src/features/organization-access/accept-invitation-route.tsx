import { getRouteApi } from '@tanstack/react-router'
import { AcceptInvitation } from './accept-invitation'

const route = getRouteApi('/(auth)/accept-invitation')

export function AcceptInvitationRoute() {
  const { token } = route.useSearch()

  return <AcceptInvitation token={token} />
}
