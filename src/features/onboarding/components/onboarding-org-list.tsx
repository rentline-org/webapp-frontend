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
      return activeOrganization && activeOrganization.id === id
    },
    [activeOrganization]
  )

  const { mutate, isPending } = useHandleSelectOrganization()

  const handleOrganizationSelection = useCallback(
    (id: number) => {
      if (checkIsActive(id)) {
        navigate({ to: '/' })
        return
      }

      setSelectedOrgId(id)

      mutate(id, {
        async onSuccess() {
          await invalidateUserProfile(queryClient)
          navigate({ to: '/' })
        },
      })
    },
    [checkIsActive, mutate, navigate, queryClient]
  )

  return (
    <ScrollArea className='h-[70vh] w-full rounded-2xl border border-border/50 md:h-112'>
      <ItemGroup className='w-full overflow-hidden'>
        {organizations.map((org) => (
          <Item
            key={org.id}
            variant={checkIsActive(org.id) ? 'muted' : 'outline'}
            className={cn(
              'flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center md:p-6',
              'rounded-none border-x-0 first:rounded-t-2xl first:border-t-0 last:rounded-b-2xl'
            )}
          >
            <ItemContent className='w-full'>
              <ItemTitle className='text-lg md:text-xl'>{org.title}</ItemTitle>
              <div className='mt-2 flex flex-col gap-y-3 md:mt-4'>
                <ItemDescription className='line-clamp-2 sm:line-clamp-none'>
                  {org.description}
                </ItemDescription>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge variant='secondary' className='whitespace-nowrap'>
                    {org.number_of_properties} Properties
                  </Badge>
                  <Badge variant='secondary' className='whitespace-nowrap'>
                    0 Tenants
                  </Badge>
                </div>
              </div>
            </ItemContent>

            <ItemActions className='mt-2 w-full sm:mt-0 sm:w-auto'>
              <Button
                size='lg'
                variant={checkIsActive(org.id) ? 'ghost' : 'secondary'}
                className='w-full min-w-25 sm:w-auto'
                onClick={() => handleOrganizationSelection(org.id)}
                disabled={isPending && selectedOrgId === org.id}
              >
                {isPending && selectedOrgId === org.id ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                {checkIsActive(org.id) ? 'Active' : 'Select'}
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </ScrollArea>
  )
}

export default OnboardingOrgList
