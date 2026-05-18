import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  Loader2,
  LucideBadgeDollarSign,
  LucideChartColumn,
  LucideFilePen,
  LucideUsers,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import ModulePlaceholder from '@/features/properties/components/module-placeholder'
import { useGetPropertyBySlug } from '@/features/properties/query'
import type { IProperty } from '@/features/properties/types'
import UnitDetailsHeader from './components/unit-details-header'
import UnitOverviewTab from './components/unit-overview-tab'
import { useUnitFieldUpdate } from './hooks/use-unit-field-update'
import { useGetUnitBySlug } from './query'
import type { IUnitData, UnitTabKey } from './types'

const routeApi = getRouteApi(
  '/_authenticated/properties/$propertySlug/units/$unitSlug'
)

const UnitDetails = () => {
  const { propertySlug } = routeApi.useParams()
  const { id } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()

  const { data: property, isLoading: isPropertyLoading } =
    useGetPropertyBySlug(propertySlug)

  const { data: unit, isLoading: isUnitLoading } = useGetUnitBySlug(
    property?.id ?? 0,
    id
  )

  useEffect(() => {
    if (!isPropertyLoading && !isUnitLoading && (!property || !unit)) {
      navigate({
        to: '/properties/$propertySlug',
        params: { propertySlug },
      })
    }
  }, [isPropertyLoading, isUnitLoading, property, unit, navigate, propertySlug])

  const isLoading = isPropertyLoading || isUnitLoading

  if (isLoading) {
    return (
      <Main fixed>
        <div className='flex h-[50vh] w-full items-center justify-center'>
          <Loader2 className='size-6 animate-spin' />
        </div>
      </Main>
    )
  }

  if (!property || !unit) return null

  return (
    <UnitDetailsContent
      property={property}
      unit={unit}
      propertySlug={propertySlug}
    />
  )
}

/** Inner component rendered only when property & unit are available */
function UnitDetailsContent({
  property,
  unit,
  propertySlug,
}: {
  property: IProperty
  unit: IUnitData
  propertySlug: string
}) {
  const navigate = routeApi.useNavigate()
  const [activeTab, setActiveTab] = useState<UnitTabKey>('overview')

  const { updateField } = useUnitFieldUpdate(property, unit)

  const handleNavigateBack = () => {
    navigate({
      to: '/properties/$propertySlug',
      params: { propertySlug },
      search: { tab: 'units' },
    })
  }

  return (
    <Main>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-6'>
        <UnitDetailsHeader
          property={property}
          unit={unit}
          onFieldUpdate={updateField}
          onNavigateBack={handleNavigateBack}
        />

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as UnitTabKey)}
        >
          <TabsList className='inline-flex h-auto gap-2 overflow-x-auto p-1'>
            <TabsTrigger value='overview'>
              <LucideChartColumn />
              Overview
            </TabsTrigger>
            <TabsTrigger value='leases'>
              <LucideFilePen />
              Leases
            </TabsTrigger>
            <TabsTrigger value='contacts'>
              <LucideUsers />
              Contacts
            </TabsTrigger>
            <TabsTrigger value='accounting'>
              <LucideBadgeDollarSign />
              Accounting
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value='overview'
            className='mt-6 space-y-6 focus-visible:outline-none'
          >
            <UnitOverviewTab
              property={property}
              unit={unit}
              onFieldUpdate={updateField}
            />
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
    </Main>
  )
}

export default UnitDetails
