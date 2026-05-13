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
import { Main } from '@/components/layout/main'
import PropertiesTable from './components/properties-table'
import PropertyItem from './components/property-item'
import { useGetProperties } from './query'
import type { IProperty, PropertySort, TPropertyTypeFilter } from './types'
import { propertyTypes } from './utils/constants'

const route = getRouteApi('/_authenticated/properties/')

export function Properties() {
  const {
    data: properties,
    isLoading: isLoadingProperties,
    isFetching: isFetchingProperties,
  } = useGetProperties()
  const navigate = route.useNavigate()

  const isLoading = useMemo(
    () => isLoadingProperties || isFetchingProperties,
    [isLoadingProperties, isFetchingProperties]
  )

  const {
    filter = '',
    type = 'all',
    sort: initialSort = 'newly_added',
  } = route.useSearch()

  const [viewMode, setViewMode] = useState<'table' | 'large_cards'>(() => {
    const saved = localStorage.getItem('properties_view_mode')

    if (saved === 'table' || saved === 'large_cards') {
      return saved
    }

    return window.matchMedia('(max-width: 640px)').matches
      ? 'large_cards'
      : 'table'
  })

  const [searchTerm, setSearchTerm] = useState(filter)
  const [propertyType, setPropertyType] = useState<TPropertyTypeFilter>(type)
  const [sort, setSort] = useState<PropertySort>(initialSort)

  const cardFilteredProperties = useMemo(() => {
    if (!properties) return []

    return [...properties]
      .filter((property) => {
        const matchesType =
          propertyType === 'all' || property.property_type === propertyType

        const matchesSearch = [property.title, property.address]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())

        return matchesType && matchesSearch
      })
      .sort((a, b) => {
        if (sort === 'name_asc') return a.title.localeCompare(b.title)
        if (sort === 'name_desc') return b.title.localeCompare(a.title)
        return Number(b.id) - Number(a.id)
      })
  }, [properties, propertyType, searchTerm, sort])

  const isCardsFiltered =
    searchTerm.length > 0 || propertyType !== 'all' || sort !== 'newly_added'

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
    <Main className='px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
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

          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2'>
            <Button
              size='sm'
              onClick={() => navigate({ to: '/properties/new' })}
              className='w-full sm:w-auto'
            >
              <Plus className='size-4' />
              Add Property
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='secondary'
                  size='sm'
                  className='w-full sm:w-auto'
                >
                  <DotsVerticalIcon />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuItem>
                  <Import />
                  Import properties
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Download />
                    Export properties
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

            <Separator orientation='vertical' className='hidden h-6 sm:block' />

            <ToggleGroup
              type='single'
              value={viewMode}
              variant='outline'
              onValueChange={(value) =>
                setViewMode(value as 'table' | 'large_cards')
              }
              className='grid w-full grid-cols-2 sm:flex sm:w-auto'
            >
              <ToggleGroupItem value='table' className='w-full sm:w-auto'>
                <Table2 className='size-4' />
                Table
              </ToggleGroupItem>

              <ToggleGroupItem value='large_cards' className='w-full sm:w-auto'>
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
              className='w-full md:w-max'
            >
              <TabsList className='flex w-full flex-nowrap gap-4 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible md:w-auto'>
                {propertyTypes.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className='shrink-0'
                  >
                    <item.icon />
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
              <div className='relative w-full lg:max-w-xs'>
                <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  className='pl-9'
                  placeholder='Search properties...'
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <Select
                value={sort}
                onValueChange={(v) => handleSortChange(v as PropertySort)}
              >
                <SelectTrigger className='w-full sm:w-55'>
                  <SlidersHorizontal className='mr-2 size-4' />
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='newly_added'>Newest</SelectItem>
                  <SelectItem value='name_asc'>Name A-Z</SelectItem>
                  <SelectItem value='name_desc'>Name Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {isCardsFiltered && (
          <Button
            variant='ghost'
            onClick={resetFilters}
            className='w-full justify-center sm:w-auto sm:justify-start'
          >
            Clear filters
            <Cross2Icon className='ml-2' />
          </Button>
        )}

        {isLoading ? (
          <div className='flex justify-center py-16'>
            <Loader2 className='animate-spin' />
          </div>
        ) : viewMode === 'large_cards' ? (
          cardFilteredProperties.length ? (
            <div className='grid gap-4 sm:grid-cols-2 2xl:grid-cols-3'>
              {cardFilteredProperties.map((property) => (
                <PropertyItem key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className='py-16 text-center'>
                No properties found
              </CardContent>
            </Card>
          )
        ) : (
          <div className='overflow-x-auto'>
            <PropertiesTable
              data={properties ?? []}
              onRowClick={openProperty}
            />
          </div>
        )}
      </div>
    </Main>
  )
}
