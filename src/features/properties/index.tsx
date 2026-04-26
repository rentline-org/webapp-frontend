import { useMemo, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
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
import PropertyItem from './components/property-item'
import { properties } from './data/properties'
import type {
  PropertyOccupancy,
  PropertySort,
  PropertyStatus,
  PropertyType,
} from './types'
import {
  occupancyOptions,
  propertyTypes,
  statusOptions,
} from './utils/constants'

const route = getRouteApi('/_authenticated/properties/')

export function Properties() {
  const {
    filter = '',
    type = 'all',
    sort: initialSort = 'newly_added',
  } = route.useSearch()
  const navigate = route.useNavigate()

  const [searchTerm, setSearchTerm] = useState(filter)
  const [propertyType, setPropertyType] = useState<PropertyType>(type)
  const [sort, setSort] = useState<PropertySort>(initialSort)
  const [statusFilter, setStatusFilter] = useState<PropertyStatus[]>([])
  const [occupancyFilter, setOccupancyFilter] = useState<PropertyOccupancy[]>(
    []
  )

  const isFiltered =
    searchTerm.length > 0 ||
    propertyType !== 'all' ||
    statusFilter.length > 0 ||
    occupancyFilter.length > 0 ||
    sort !== 'newly_added'

  const filteredProperties = useMemo(() => {
    return [...properties]
      .filter((property) => {
        const matchesType =
          propertyType === 'all' ? true : property.type === propertyType

        const matchesStatus =
          statusFilter.length === 0
            ? true
            : statusFilter.includes(property.status)

        const matchesOccupancy =
          occupancyFilter.length === 0
            ? true
            : occupancyFilter.includes(property.occupancy)

        const matchesSearch = [property.name, property.address]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

        return matchesType && matchesStatus && matchesOccupancy && matchesSearch
      })
      .sort((a, b) => {
        if (sort === 'name_asc') return a.name.localeCompare(b.name)
        if (sort === 'name_desc') return b.name.localeCompare(a.name)
        return Number(b.id) - Number(a.id)
      })
  }, [occupancyFilter, propertyType, searchTerm, sort, statusFilter])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    navigate({
      search: (prev) => ({
        ...prev,
        filter: value || undefined,
      }),
    })
  }

  const handleTypeChange = (value: PropertyType) => {
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
    setOccupancyFilter([])

    navigate({
      search: (prev) => ({
        ...prev,
        filter: undefined,
        type: undefined,
        sort: undefined,
      }),
    })
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

        <div className='w-full overflow-x-auto'>
          <Tabs
            value={propertyType}
            onValueChange={(value) => handleTypeChange(value as PropertyType)}
            className='min-w-max lg:min-w-full'
          >
            <TabsList className='h-10 w-max justify-start gap-1 rounded-2xl border bg-muted/20 p-1 lg:w-full'>
              {propertyTypes.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className='h-8 rounded-xl px-4 whitespace-nowrap data-[state=active]:shadow-sm'
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'>
          <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center'>
            <Input
              placeholder='Search properties...'
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className='h-9 w-full sm:w-60 lg:w-80'
            />

            <div className='flex flex-wrap gap-2'>
              <FacetedFilter
                title='Status'
                options={statusOptions}
                selectedValues={statusFilter}
                onChange={setStatusFilter}
              />

              <FacetedFilter
                title='Occupancy'
                options={occupancyOptions}
                selectedValues={occupancyFilter}
                onChange={setOccupancyFilter}
              />
            </div>
          </div>

          <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
            <Select
              value={sort}
              onValueChange={(v) => handleSortChange(v as PropertySort)}
            >
              <SelectTrigger className='w-full sm:w-45'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newly_added'>by: Newest</SelectItem>
                <SelectItem value='name_asc'>by: Name ascending</SelectItem>
                <SelectItem value='name_desc'>by: Name descending</SelectItem>
              </SelectContent>
            </Select>

            {isFiltered && (
              <Button
                variant='ghost'
                onClick={resetFilters}
                className='h-9 self-start px-3 sm:self-auto'
              >
                Reset
                <Cross2Icon className='ms-2 h-4 w-4' />
              </Button>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 pb-10 md:grid-cols-2 xl:grid-cols-2'>
          {filteredProperties.map((property) => (
            <PropertyItem key={property.id} property={property} />
          ))}
        </div>
      </div>
    </Main>
  )
}
