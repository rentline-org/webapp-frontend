import { useTranslation } from 'react-i18next'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { cn, getPageNumbers } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { IPaginationMeta } from '@/api/pagination'

type ServerPaginationProps = {
  meta: IPaginationMeta
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  disabled?: boolean
  className?: string
}

export function ServerPagination({
  meta,
  onPageChange,
  onPerPageChange,
  disabled = false,
  className,
}: ServerPaginationProps) {
  const { t } = useTranslation('common')
  const pages = getPageNumbers(meta.current_page, meta.last_page)

  if (meta.last_page <= 1 && meta.total <= meta.per_page) return null

  return (
    <nav
      aria-label={t('pagination.pageOf', {
        page: meta.current_page,
        pages: meta.last_page,
      })}
      className={cn(
        'flex flex-col-reverse gap-4 px-1 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className='flex items-center justify-between gap-3 sm:justify-start'>
        <span className='text-sm text-muted-foreground'>
          {t('pagination.rowsPerPage')}
        </span>
        <Select
          value={String(meta.per_page)}
          disabled={disabled}
          onValueChange={(value) => onPerPageChange(Number(value))}
        >
          <SelectTrigger className='h-9 w-20'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent side='top'>
            {[10, 20, 30, 50].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='flex items-center justify-between gap-3 sm:justify-end'>
        <span className='text-sm font-medium'>
          {t('pagination.pageOf', {
            page: meta.current_page,
            pages: meta.last_page,
          })}
        </span>
        <div className='flex items-center gap-1'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='hidden size-9 sm:inline-flex'
            disabled={disabled || meta.current_page <= 1}
            onClick={() => onPageChange(1)}
          >
            <DoubleArrowLeftIcon />
            <span className='sr-only'>First page</span>
          </Button>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='size-9'
            disabled={disabled || meta.current_page <= 1}
            onClick={() => onPageChange(meta.current_page - 1)}
          >
            <ChevronLeftIcon />
            <span className='sr-only'>Previous page</span>
          </Button>
          <div className='hidden items-center gap-1 lg:flex'>
            {pages.map((page, index) =>
              page === '...' ? (
                <span key={`ellipsis-${index}`} className='px-2 text-sm'>
                  …
                </span>
              ) : (
                <Button
                  key={page}
                  type='button'
                  variant={page === meta.current_page ? 'default' : 'outline'}
                  className='size-9 p-0'
                  disabled={disabled}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              )
            )}
          </div>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='size-9'
            disabled={disabled || meta.current_page >= meta.last_page}
            onClick={() => onPageChange(meta.current_page + 1)}
          >
            <ChevronRightIcon />
            <span className='sr-only'>Next page</span>
          </Button>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='hidden size-9 sm:inline-flex'
            disabled={disabled || meta.current_page >= meta.last_page}
            onClick={() => onPageChange(meta.last_page)}
          >
            <DoubleArrowRightIcon />
            <span className='sr-only'>Last page</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
