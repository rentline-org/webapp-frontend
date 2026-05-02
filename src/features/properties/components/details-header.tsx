import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ChevronLeft, ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import InlineText from '@/components/inline-text'
import { useUpdateProperty } from '../query'
import type { IProperty } from '../types'
import { statusBadgeVariant, typeBadgeVariant } from '../utils'
import DetailsActionsMenu from './details-actions-menu'

type TDetailsHeaderProps = {
  property: IProperty
}

const routeApi = getRouteApi('/_authenticated/properties/$propertySlug')

const DetailsHeader = ({ property }: TDetailsHeaderProps) => {
  const queryClient = useQueryClient()
  const { mutate } = useUpdateProperty(queryClient)

  const navigate = routeApi.useNavigate()
  const handleBackRouting = () => {
    navigate({
      to: '/properties',
    })
  }

  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
      <div className='space-y-4'>
        <Button
          variant='ghost'
          size='sm'
          className='w-fit px-0'
          onClick={handleBackRouting}
        >
          <ChevronLeft className='size-5' />
          Back to properties
        </Button>

        <div className='flex items-start gap-4'>
          <div className='relative aspect-4/3 w-28 overflow-hidden rounded-2xl bg-secondary'>
            <Skeleton className='h-full w-full rounded-none bg-secondary' />
            <ImageIcon className='absolute inset-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground' />
          </div>

          <div className='max-w-4xl space-y-4'>
            <div className='w-full space-y-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <InlineText
                  className='text-2xl font-semibold tracking-tight sm:text-3xl'
                  value={property.title}
                  onSubmit={(value) => {
                    mutate(
                      {
                        payload: {
                          title: value,
                        },
                        property,
                      },
                      {
                        onSuccess: (result) => {
                          navigate({
                            to: '/properties/$propertySlug',
                            params: {
                              propertySlug: result.slug,
                            },
                          })
                        },
                      }
                    )
                  }}
                  inputClassName='text-2xl! sm:text-3xl!'
                  editable
                />
              </div>

              <div className='w-full text-sm text-muted-foreground'>
                <InlineText
                  value={property.description ?? ''}
                  editable
                  multiline
                  className='w-full'
                  textClassName='w-full text-sm text-muted-foreground'
                  inputClassName='w-full text-sm leading-6'
                  placeholder='Add a description'
                  onSubmit={(value) => {
                    mutate({
                      payload: { description: value },
                      property,
                    })
                  }}
                />
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <Badge
                variant={typeBadgeVariant(property.property_type)}
                className='rounded-full capitalize'
              >
                {property.property_type}
              </Badge>

              <Badge
                variant={statusBadgeVariant(property.is_available)}
                className='rounded-full'
              >
                {property.is_available ? 'Vacant' : 'Occupied'}
              </Badge>

              <Badge variant='outline' className='rounded-full'>
                {property.is_furnished ? 'Furnished' : 'Unfurnished'}
              </Badge>

              <Badge variant='outline' className='rounded-full'>
                {property.is_pet_friendly ? 'Pet friendly' : 'No pets'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <DetailsActionsMenu
        property={property}
        //   onUploadImages={() => setUploadOpen(true)}
        //   onGoToTab={setActiveTab}
      />
    </div>
  )
}

export default DetailsHeader
