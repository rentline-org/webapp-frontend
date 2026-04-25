/* eslint-disable no-console */
import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useHandleSelectOrganization } from '@/features/organizations/org-switcher/query'
import type {
  IActiveOrganization,
  IOrganizationData,
} from '@/features/organizations/types'
import { invalidateUserProfile } from '@/features/settings/profile/query'

const routeApi = getRouteApi('/(auth)/onboarding')

type Props = {
  activeOrganization: IActiveOrganization | null
  organizations: IOrganizationData[]
}

const OnboardingOrgList = ({ organizations, activeOrganization }: Props) => {
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const navigate = routeApi.useNavigate()

  const checkIsActive = useCallback(
    (id: number) => {
      console.log(activeOrganization)
      return activeOrganization && activeOrganization.id === id
    },
    [activeOrganization]
  )

  const { mutate, isPending } = useHandleSelectOrganization()

  const handleOrganizationSelection = useCallback(
    (id: number) => {
      if (checkIsActive(id)) {
        navigate({
          to: '/',
        })
      }

      setSelectedOrgId(id)

      mutate(id, {
        async onSuccess() {
          await invalidateUserProfile(queryClient)

          navigate({
            to: '/',
          })
        },
      })
    },
    [checkIsActive, mutate, navigate, queryClient]
  )

  return (
    <ScrollArea className='h-112 w-full rounded-2xl'>
      <ItemGroup className='w-full overflow-hidden pr-4'>
        {organizations.map((org) => (
          <Item
            key={org.id}
            variant={checkIsActive(org.id) ? 'muted' : 'outline'}
            className={cn(
              'rounded-none first:rounded-t-2xl last:rounded-b-2xl'
            )}
          >
            <ItemContent>
              <ItemTitle>{org.title}</ItemTitle>
              <div className='mt-4 flex flex-col gap-y-2'>
                <ItemDescription>{org.description}</ItemDescription>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary'>
                    {org.number_of_properties} Properties
                  </Badge>
                  <Badge variant='secondary'>0 Tenants</Badge>
                </div>
              </div>
            </ItemContent>

            <ItemActions>
              <Button
                size='sm'
                variant='secondary'
                onClick={() => handleOrganizationSelection(org.id)}
                disabled={isPending && selectedOrgId === org.id}
              >
                {isPending && selectedOrgId === org.id && (
                  <Loader2 className='animate-spin' />
                )}
                Select
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </ScrollArea>
  )
}

export default OnboardingOrgList
