import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { PenLine } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { getMoneyFormatConfig } from '@/lib/countries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { DatePicker } from './date-picker'
import InputWithEndButtons from './ui/input-number'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Switch } from './ui/switch'

type EditableKind = 'text' | 'number' | 'checkbox' | 'select' | 'date'

type SelectOption = {
  label: string
  value: string
}

type EditableItemProps = {
  label: string
  value: string | number | boolean | Date | null
  kind?: EditableKind
  editable?: boolean
  icon?: React.ReactNode
  options?: SelectOption[]
  placeholder?: string
  defaultContent?: ReactNode
  isCurrency?: boolean
  onSubmit?: (value: string | number | boolean | Date | null) => void
}

function EditableItem({
  label,
  value,
  kind = 'text',
  editable = false,
  icon,
  options = [],
  placeholder = 'Not set',
  onSubmit,
  defaultContent,
}: EditableItemProps) {
  const [showEditButton, setShowEditButton] = useState(false)
  const [editState, setEditState] = useState(false)
  const [draft, setDraft] = useState(value)
  const rootRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore((s) => s.auth)
  const currencyConfig = useMemo(
    () => getMoneyFormatConfig(user?.active_organization.country ?? 'US'),
    [user?.active_organization.country]
  )

  const hasCommittedRef = useRef(false)

  const canShowButton = editable && showEditButton && !editState

  const startEdit = () => {
    hasCommittedRef.current = false
    setDraft(value)
    setEditState(true)
  }

  const commitEdit = useCallback(
    (nextValue?: typeof draft) => {
      if (hasCommittedRef.current) return
      hasCommittedRef.current = true

      const finalValue = nextValue !== undefined ? nextValue : draft

      setEditState(false)

      if (finalValue !== value) {
        onSubmit?.(finalValue)
      }
    },
    [draft, onSubmit, value]
  )

  useEffect(() => {
    if (!editState) return

    const handleClickOutside = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) {
        commitEdit()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [commitEdit, editState])

  const cancelEdit = () => {
    hasCommittedRef.current = true
    setDraft(value)
    setEditState(false)
  }

  const handleBlurCommit = () => {
    // delay fixes race conditions (select, datepicker, etc.)
    setTimeout(() => commitEdit(), 0)
  }

  const displayValue =
    value === null || value === '' ? placeholder : String(value)

  return (
    <Item
      variant='outline'
      className='group w-full'
      onMouseEnter={() => setShowEditButton(true)}
      onMouseLeave={() => setShowEditButton(false)}
      ref={rootRef}
    >
      {icon && <ItemMedia variant='icon'>{icon}</ItemMedia>}

      <ItemContent className='min-w-0 flex-1'>
        <ItemTitle className='truncate'>{label}</ItemTitle>

        {editable && editState ? (
          <>
            {kind === 'text' && (
              <Input
                value={String(draft ?? '')}
                autoFocus
                className='h-8 w-full border-0 bg-transparent px-2 text-sm shadow-none ring-0 outline-none'
                onChange={(e) => setDraft(e.target.value)}
                onBlur={handleBlurCommit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitEdit()
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    cancelEdit()
                  }
                }}
              />
            )}

            {kind === 'number' && (
              <InputWithEndButtons
                value={draft === null ? 0 : Number(draft)}
                autoFocus
                autoFormat
                onChange={(val) => setDraft(val === 0 ? null : Number(val))}
                onBlur={handleBlurCommit}
                currency={currencyConfig.currency}
                locale={currencyConfig.locale}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitEdit()
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    cancelEdit()
                  }
                }}
              />
            )}

            {kind === 'select' && (
              <Select
                value={String(draft ?? '')}
                onValueChange={(val) => {
                  setDraft(val)
                  commitEdit(val) // immediate commit (no blur reliance)
                }}
              >
                <SelectTrigger className='h-8 w-full border-0 bg-transparent px-0 text-sm shadow-none'>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {kind === 'checkbox' && (
              <div className='flex items-center gap-2 pt-1'>
                <Switch
                  checked={Boolean(draft)}
                  autoFocus
                  onCheckedChange={(checked) => {
                    setDraft(checked)
                    commitEdit(checked)
                  }}
                />
                <span className='text-sm text-muted-foreground'>
                  {draft ? 'Yes' : 'No'}
                </span>
              </div>
            )}

            {kind === 'date' && (
              <DatePicker
                selected={draft ? new Date(String(draft)) : undefined}
                onBlur={handleBlurCommit}
                onSelect={(date) => {
                  setDraft(date as Date)
                  commitEdit(date as Date)
                }}
                placeholder={placeholder}
              />
            )}
          </>
        ) : (
          <ItemDescription className='leading-5 whitespace-pre-wrap'>
            {defaultContent
              ? defaultContent
              : kind === 'checkbox'
                ? value
                  ? 'Yes'
                  : 'No'
                : displayValue}
          </ItemDescription>
        )}
      </ItemContent>

      {canShowButton && (
        <ItemActions className='shrink-0'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-8'
            onClick={startEdit}
          >
            <PenLine className='size-4' />
          </Button>
        </ItemActions>
      )}
    </Item>
  )
}

export default EditableItem
