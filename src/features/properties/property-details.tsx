import { useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { properties } from './data/properties'

// type Props = {}

const routeApi = getRouteApi('/_authenticated/properties/$propertyId')

const PropertyDetails = () => {
  const { propertyId } = routeApi.useParams()
  const navigate = routeApi.useNavigate()

  const property = useMemo(
    () => properties.find((p) => p.id === propertyId),
    [propertyId]
  )

  if (!property) {
    //   navigate
    return navigate({
      to: '/properties',
    })
  }

  const handleBackRouting = () => {
    navigate({
      to: '/properties',
    })
  }

  return (
    <Main fixed>
      <div className='flex flex-col gap-4'>
        <div className=''>
          <Button variant='ghost' size='sm' onClick={handleBackRouting}>
            <ChevronLeft className='size-5' />
            Back to properties
          </Button>
        </div>
        <span>Viewing {property.name}</span>
      </div>
    </Main>
  )
}

export default PropertyDetails
