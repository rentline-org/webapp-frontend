// Properties.tsx
import { useMemo, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FacetedFilter } from '@/components/filter'
import { Main } from '@/components/layout/main'
import PropertiesTable from './components/properties-table'
import PropertyItem from './components/property-item'
import { useGetProperties } from './query'
import type {
  PropertySort,
  PropertyStatus,
  TPropertyTypeFilter,
  IProperty,
} from './types'
import { propertyTypes, statusOptions } from './utils/constants'

const route = getRouteApi('/_authenticated/properties/')

export function Properties() {
  const { data: properties, isLoading } = useGetProperties()
  const navigate = route.useNavigate()

  const {
    filter = '',
    type = 'all',
    sort: initialSort = 'newly_added',
  } = route.useSearch()

  const [viewMode, setViewMode] = useState<'table' | 'large_cards'>('table')
  const [searchTerm, setSearchTerm] = useState(filter)
  const [propertyType, setPropertyType] = useState<TPropertyTypeFilter>(type)
  const [sort, setSort] = useState<PropertySort>(initialSort)
  const [statusFilter, setStatusFilter] = useState<PropertyStatus[]>([])

  const filteredProperties = useMemo(() => {
    if (!properties) return []

    return [...properties]
      .filter((property) => {
        const matchesType =
          propertyType === 'all'
            ? true
            : property.property_type === propertyType

        const matchesStatus =
          statusFilter.length === 0
            ? true
            : statusFilter.includes(
                property.is_available ? 'vacant' : 'occupied'
              )

        const matchesSearch = [property.title, property.address]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

        return matchesType && matchesStatus && matchesSearch
      })
      .sort((a, b) => {
        if (sort === 'name_asc') return a.title.localeCompare(b.title)
        if (sort === 'name_desc') return b.title.localeCompare(a.title)
        return Number(b.id) - Number(a.id)
      })
  }, [properties, propertyType, searchTerm, sort, statusFilter])

  const isFiltered =
    searchTerm.length > 0 ||
    propertyType !== 'all' ||
    statusFilter.length > 0 ||
    sort !== 'newly_added'

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    navigate({
      search: (prev) => ({
        ...prev,
        filter: value || undefined,
      }),
    })
  }

  const handleTypeChange = (value: TPropertyTypeFilter) => {
    setPropertyType(value)
    navigate({
      search: (prev) => ({
        ...prev,
        type: value === 'all' ? undefined : value,
      }),
    })
  }

  const handleSortChange = (value: PropertySort) => {
    setSort(value)
    navigate({
      search: (prev) => ({
        ...prev,
        sort: value === 'newly_added' ? undefined : value,
      }),
    })
  }

  const resetFilters = () => {
    setSearchTerm('')
    setPropertyType('all')
    setSort('newly_added')
    setStatusFilter([])

    navigate({
      search: (prev) => ({
        ...prev,
        filter: undefined,
        type: undefined,
        sort: undefined,
      }),
    })
  }

  const openProperty = (property: IProperty) => {
    navigate({
      to: '/properties/$propertySlug',
      params: { propertySlug: property.slug },
    })
  }

  const renderViewMode = () => {
    if (isLoading) {
      return (
        <div className='flex w-full items-center justify-center py-16'>
          <Loader2 className='size-5 animate-spin' />
        </div>
      )
    }

    if (viewMode === 'large_cards') {
      return filteredProperties.length ? (
        <div className='grid grid-cols-1 gap-4 pb-10 lg:grid-cols-2 2xl:grid-cols-3'>
          {filteredProperties.map((property) => (
            <PropertyItem key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground shadow-sm'>
          No properties found.
        </div>
      )
    }

    return (
      <PropertiesTable data={filteredProperties} onRowClick={openProperty} />
    )
  }

  return (
    <Main>
      <div className='flex flex-col gap-6'>
        <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
              Properties
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Browse and manage your property inventory.
            </p>
          </div>

          <Button className='w-full sm:w-auto'>
            <Plus />
            Add Property
          </Button>
        </div>

        <div className='rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur'>
          <div className='flex flex-col gap-4'>
            <div className='w-full overflow-x-auto'>
              <Tabs
                value={propertyType}
                onValueChange={(value) =>
                  handleTypeChange(value as TPropertyTypeFilter)
                }
                className='min-w-max lg:min-w-full'
              >
                <TabsList className='h-11 w-max justify-start gap-1 rounded-2xl border bg-muted/20 p-1 lg:w-full'>
                  {propertyTypes.map((item) => (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      className='h-9 rounded-xl px-4 whitespace-nowrap data-[state=active]:shadow-sm'
                    >
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
              <div className='flex w-full flex-col gap-3 lg:flex-row lg:items-center'>
                <Input
                  placeholder='Search properties...'
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className='h-10 w-full lg:w-80'
                />

                <div className='flex flex-wrap gap-2'>
                  <FacetedFilter
                    title='Status'
                    options={statusOptions}
                    selectedValues={statusFilter}
                    onChange={setStatusFilter}
                  />
                </div>
              </div>

              <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
                <Select
                  value={sort}
                  onValueChange={(v) => handleSortChange(v as PropertySort)}
                >
                  <SelectTrigger className='h-10 w-full sm:w-52'>
                    <SelectValue placeholder='Sort by' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='newly_added'>Newest</SelectItem>
                    <SelectItem value='name_asc'>Name ascending</SelectItem>
                    <SelectItem value='name_desc'>Name descending</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={viewMode}
                  onValueChange={(v) =>
                    setViewMode(v as 'table' | 'large_cards')
                  }
                >
                  <SelectTrigger className='h-10 w-full sm:w-52'>
                    <SelectValue placeholder='Change view mode' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='table'>Table view</SelectItem>
                    <SelectItem value='large_cards'>Large cards</SelectItem>
                  </SelectContent>
                </Select>

                {isFiltered && (
                  <Button
                    variant='ghost'
                    onClick={resetFilters}
                    className='h-10 self-start px-3 sm:self-auto'
                  >
                    Reset
                    <Cross2Icon className='ms-2 h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <span>{filteredProperties.length} properties</span>
              <Badge variant='outline' className='rounded-full px-2 py-0'>
                {viewMode === 'table' ? 'Table' : 'Cards'}
              </Badge>
            </div>
          </div>
        </div>

        {renderViewMode()}
      </div>
    </Main>
  )
}
