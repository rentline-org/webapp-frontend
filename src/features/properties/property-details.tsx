import { useEffect } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { useGetPropertyBySlug } from './query'

const routeApi = getRouteApi('/_authenticated/properties/$propertySlug')

const PropertyDetails = () => {
  const propertySlug = routeApi.useParams()
  const navigate = routeApi.useNavigate()

  const { data: property, isLoading } = useGetPropertyBySlug(
    propertySlug.propertySlug
  )

  const handleBackRouting = () => {
    navigate({
      to: '/properties',
    })
  }

  useEffect(() => {
    if (!isLoading && !property) {
      navigate({
        to: '/not-found',
        search: {
          redirect: '/properties',
        },
      })
    }
  }, [isLoading, navigate, property])

  return (
    <Main fixed>
      <div className='flex flex-col gap-4'>
        <div className=''>
          <Button variant='ghost' size='sm' onClick={handleBackRouting}>
            <ChevronLeft className='size-5' />
            Back to properties
          </Button>
        </div>
        {isLoading ? (
          <div className='flex h-full w-full items-center justify-center'>
            <Loader2 className='animate-spin' />
          </div>
        ) : (
          <span>Viewing {property?.title}</span>
        )}
      </div>
    </Main>
  )
}

export default PropertyDetails
