import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import DetailsHeader from './components/details-header'
import PropertyImagesDialog from './components/images-dialog'
import ModulePlaceholder from './components/module-placeholder'
import PropertyOverviewTab from './components/property-overview-tab'
import UnitsTab from './components/units-tab'
import { useSingleUnit } from './hooks/use-single-unit'
import { useGetPropertyBySlug } from './query'
import type { TabKey } from './types'

const routeApi = getRouteApi('/_authenticated/properties/$propertySlug')

const PropertyDetails = () => {
  const { propertySlug } = routeApi.useParams()
  const navigate = routeApi.useNavigate()

  const { data: property, isLoading } = useGetPropertyBySlug(propertySlug)

  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [uploadOpen, setUploadOpen] = useState(false)

  const { isReady } = useSingleUnit(property)

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

  if (isLoading || !isReady) {
    return (
      <Main fixed>
        <div className='flex h-[50vh] w-full items-center justify-center'>
          <Loader2 className='size-6 animate-spin' />
        </div>
      </Main>
    )
  }

  if (!property) return null

  return (
    <Main>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-6'>
        <DetailsHeader property={property} />

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabKey)}
          className=''
        >
          <TabsList className='inline-flex h-auto gap-2 overflow-x-auto p-1'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            {property.property_type === 'multi_unit' && (
              <TabsTrigger value='units'>Units</TabsTrigger>
            )}
            <TabsTrigger value='leases'>Leases</TabsTrigger>
            <TabsTrigger value='contacts'>Contacts</TabsTrigger>
            <TabsTrigger value='accounting'>Accounting</TabsTrigger>
          </TabsList>

          <TabsContent
            value='overview'
            className='mt-6 space-y-6 focus-visible:outline-none'
          >
            <PropertyOverviewTab
              property={property}
              setActiveTab={setActiveTab}
              setUploadOpen={setUploadOpen}
            />
          </TabsContent>

          <TabsContent
            value='units'
            className='mt-6 focus-visible:outline-none'
          >
            <UnitsTab property={property} />
            {/* coming soon */}
          </TabsContent>

          <TabsContent
            value='leases'
            className='mt-6 focus-visible:outline-none'
          >
            <ModulePlaceholder
              title='Leases'
              description='Lease records will be connected here later.'
              items={[
                { label: 'Active leases', value: '—' },
                { label: 'Expiring soon', value: '—' },
                { label: 'Rent roll', value: '—' },
              ]}
            />
          </TabsContent>

          <TabsContent
            value='contacts'
            className='mt-6 focus-visible:outline-none'
          >
            <ModulePlaceholder
              title='Contacts'
              description='Owners, vendors, brokers, and other related contacts can live here.'
              items={[
                { label: 'Primary contact', value: '—' },
                { label: 'Vendor count', value: '—' },
                { label: 'Last updated', value: '—' },
              ]}
            />
          </TabsContent>

          <TabsContent
            value='accounting'
            className='mt-6 focus-visible:outline-none'
          >
            <ModulePlaceholder
              title='Accounting'
              description='Basic accounting widgets can be added here later.'
              items={[
                { label: 'Monthly income', value: '—' },
                { label: 'Outstanding balance', value: '—' },
                { label: 'Payments due', value: '—' },
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>

      <PropertyImagesDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        property={property}
      />
    </Main>
  )
}

export default PropertyDetails
