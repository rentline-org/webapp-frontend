import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { House, Loader2, Users2 } from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
  const { mutate, isPending } = useHandleSelectOrganization()

  const isActiveOrg = useCallback(
    (id: number) => activeOrganization?.id === id,
    [activeOrganization]
  )

  const handleOrganizationSelection = useCallback(
    (id: number) => {
      setSelectedOrgId(id)

      if (isActiveOrg(id)) {
        navigate({
          to: '/',
        })
      }

      mutate(id, {
        async onSuccess() {
          await invalidateUserProfile(queryClient)

          navigate({ to: '/' })
        },
      })
    },
    [isActiveOrg, mutate, navigate, queryClient]
  )

  return (
    <ScrollArea className='h-[40vh] w-full rounded-2xl border border-border/50 md:h-105'>
      <ItemGroup className='w-full overflow-hidden'>
        {organizations.map((org) => {
          const active = isActiveOrg(org.id)
          const loading = isPending && selectedOrgId === org.id

          return (
            <Item
              key={org.id}
              variant={active ? 'muted' : 'outline'}
              className={cn(
                'flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center md:p-6',
                'rounded-none border-x-0 first:rounded-t-2xl first:border-t-0 last:rounded-b-2xl'
              )}
            >
              <ItemContent className='w-full'>
                <div className='flex items-center gap-2'>
                  <ItemTitle className='text-lg md:text-xl'>
                    {org.title}
                  </ItemTitle>
                  {active ? (
                    <Badge variant='secondary' className='whitespace-nowrap'>
                      Active
                    </Badge>
                  ) : null}
                </div>

                <div className='mt-2 flex flex-col gap-y-3 md:mt-4'>
                  <ItemDescription className='line-clamp-2 sm:line-clamp-none'>
                    {org.description}
                  </ItemDescription>

                  <div className='flex flex-wrap items-center gap-2'>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          variant='secondary'
                          className='whitespace-nowrap'
                        >
                          <House />
                          {org.properties_count}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side='bottom'>
                        Number of properties
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          variant='secondary'
                          className='whitespace-nowrap'
                        >
                          <Users2 />0
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side='bottom'>
                        Number of tenants
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </ItemContent>

              <ItemActions className='mt-2 w-full sm:mt-0 sm:w-auto'>
                <Button
                  size='sm'
                  variant={active ? 'outline' : 'default'}
                  className='w-full min-w-25 sm:w-auto'
                  onClick={() => handleOrganizationSelection(org.id)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : null}
                  {active ? 'View' : 'Select'}
                </Button>
              </ItemActions>
            </Item>
          )
        })}
      </ItemGroup>
    </ScrollArea>
  )
}

export default OnboardingOrgList
