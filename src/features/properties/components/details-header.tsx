import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { cleanSnakecase } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import InlineText from '@/components/inline-text'
import PropertyThumbnail from '@/features/property-thumbnail'
import UnitThumbnail from '@/features/unit-gallery/unit-thumbnail'
import { useSingleUnit } from '../hooks/use-single-unit'
import { useUpdateProperty } from '../query'
import type { IProperty } from '../types'
import { typeBadgeVariant } from '../utils'
import DetailsActionsMenu from './details-actions-menu'

type TDetailsHeaderProps = {
  property: IProperty
}

const routeApi = getRouteApi('/_authenticated/properties/$propertySlug')

const DetailsHeader = ({ property }: TDetailsHeaderProps) => {
  const queryClient = useQueryClient()
  const { mutate } = useUpdateProperty(queryClient, property.slug)
  const { isSingleUnit, unit, isReady } = useSingleUnit(property)

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
          <div className='relative aspect-5/5 w-28 overflow-hidden rounded-2xl bg-secondary'>
            {isSingleUnit && unit ? (
              <UnitThumbnail
                thumbnail={unit.thumbnail ?? null}
                unitId={unit.id}
                propertyId={property.id}
              />
            ) : (
              <PropertyThumbnail
                property={property}
                thumbnail={property.thumbnail ?? null}
              />
            )}
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
                  inputClassName='w-full md:min-w-60 text-sm leading-6'
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
                className='capitalize'
              >
                {cleanSnakecase(property.property_type)}
              </Badge>

              {isSingleUnit && isReady && (
                <>
                  {/* <Badge
                    variant={statusBadgeVariant(unit!.is_available ?? true)}
                  >
                    {unit?.is_available ? 'Vacant' : 'Occupied'}
                  </Badge> */}

                  <Badge variant='outline'>
                    {unit?.is_furnished ? 'Furnished' : 'Unfurnished'}
                  </Badge>

                  <Badge variant='outline'>
                    {unit?.is_pet_friendly ? 'Pet friendly' : 'No pets'}
                  </Badge>
                </>
              )}
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
