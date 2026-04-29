import { useEffect, useMemo, useState } from 'react'
import { Cross2Icon, DotsVerticalIcon } from '@radix-ui/react-icons'
import { getRouteApi } from '@tanstack/react-router'
import {
  Download,
  FileInput,
  FileJson,
  FileSpreadsheet,
  Import,
  LayoutGrid,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  Table2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FacetedFilter } from '@/components/filter'
import { Main } from '@/components/layout/main'
import PropertiesTable from './components/properties-table'
import PropertyItem from './components/property-item'
import { useGetProperties } from './query'
import type {
  IProperty,
  PropertySort,
  PropertyStatus,
  TPropertyTypeFilter,
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

  const [viewMode, setViewMode] = useState<'table' | 'large_cards'>(() => {
    // if (typeof window === 'undefined') return 'table'
    return localStorage.getItem('properties_view_mode') === 'large_cards'
      ? 'large_cards'
      : 'table'
  })

  const [searchTerm, setSearchTerm] = useState(filter)
  const [propertyType, setPropertyType] = useState<TPropertyTypeFilter>(type)
  const [sort, setSort] = useState<PropertySort>(initialSort)
  const [statusFilter, setStatusFilter] = useState<PropertyStatus[]>([])

  const cardFilteredProperties = useMemo(() => {
    if (!properties) return []

    return [...properties]
      .filter((property) => {
        const matchesType =
          propertyType === 'all' || property.property_type === propertyType

        const matchesStatus =
          statusFilter.length === 0 ||
          statusFilter.includes(property.is_available ? 'vacant' : 'occupied')

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

  const isCardsFiltered =
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

  useEffect(() => {
    localStorage.setItem('properties_view_mode', viewMode)
  }, [viewMode])

  return (
    <Main>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold tracking-tight sm:text-3xl'>
              Properties
            </h1>
            <p className='text-sm text-muted-foreground'>
              Browse and manage your property inventory.
            </p>
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Button
                className='w-full sm:w-auto'
                size='sm'
                onClick={() => {
                  navigate({
                    to: '/properties/new',
                  })
                }}
              >
                <Plus className='size-4' />
                Add Property
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='secondary' size='sm'>
                    <DotsVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>
                    <Import />
                    Import properties
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Download />
                      Export properties
                      {/* <DropdownMenuSub */}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>
                          <FileInput />
                          CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileSpreadsheet />
                          Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileJson />
                          JSON
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Separator orientation='vertical' className='h-6' />
            <ToggleGroup
              type='single'
              defaultValue='table'
              size='sm'
              variant='outline'
              value={viewMode}
              onValueChange={(value) =>
                setViewMode(value as 'table' | 'large_cards')
              }
            >
              <ToggleGroupItem value='table'>
                <Table2 className='size-4' />
                Table
              </ToggleGroupItem>
              <ToggleGroupItem value='large_cards'>
                <LayoutGrid className='size-4' />
                List
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {viewMode === 'large_cards' && (
          <div className='flex flex-col gap-4'>
            <Tabs
              value={propertyType}
              onValueChange={(value) =>
                handleTypeChange(value as TPropertyTypeFilter)
              }
              className='w-full'
            >
              <TabsList className='flex h-auto w-full flex-wrap items-center justify-start gap-2 rounded-2xl border bg-muted/30 p-1'>
                {propertyTypes.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className='h-9 rounded-xl px-4 text-sm'
                  >
                    <item.icon />
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
              <div className='flex flex-col gap-3 md:flex-row md:items-center'>
                <div className='relative w-full md:w-70'>
                  <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search properties...'
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className='pl-9'
                  />
                </div>

                <FacetedFilter
                  title='Status'
                  options={statusOptions}
                  selectedValues={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>

              <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                <Select
                  value={sort}
                  onValueChange={(v) => handleSortChange(v as PropertySort)}
                >
                  <SelectTrigger className='w-full sm:w-55'>
                    <SlidersHorizontal className='mr-2 size-4 text-muted-foreground' />
                    <SelectValue placeholder='Sort by' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='newly_added'>Newest</SelectItem>
                    <SelectItem value='name_asc'>Name ascending</SelectItem>
                    <SelectItem value='name_desc'>Name descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isCardsFiltered && (
              <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
                <Button
                  variant='ghost'
                  onClick={resetFilters}
                  className='px-3 text-muted-foreground'
                >
                  Clear filters
                  <Cross2Icon className='ms-2 h-4 w-4' />
                </Button>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className='flex items-center justify-center py-16'>
            <Loader2 className='size-5 animate-spin' />
          </div>
        ) : viewMode === 'large_cards' ? (
          cardFilteredProperties.length ? (
            <div className='grid grid-cols-1 gap-4 pb-10 xl:grid-cols-2 2xl:grid-cols-3'>
              {cardFilteredProperties.map((property) => (
                <PropertyItem key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Card className='rounded-3xl border-dashed bg-card/70 shadow-none'>
              <CardContent className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
                <p className='text-base font-medium'>No properties found</p>
                <p className='text-sm text-muted-foreground'>
                  Try adjusting the search or filters.
                </p>
                {isCardsFiltered && (
                  <Button variant='outline' onClick={resetFilters}>
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        ) : (
          <PropertiesTable data={properties ?? []} onRowClick={openProperty} />
        )}
      </div>
    </Main>
  )
}
