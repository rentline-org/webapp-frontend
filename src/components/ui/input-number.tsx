import { useMemo, useState, useEffect, useRef } from 'react'
import { MinusIcon, PlusIcon } from 'lucide-react'
import {
  Button,
  Group,
  Input,
  NumberField,
  type NumberFieldProps,
} from 'react-aria-components'

export interface CurrencyInputProps extends NumberFieldProps {
  currency?: string
  locale?: string
  autoFormat?: boolean
}

const InputWithEndButtons = ({
  currency: currencyCode,
  locale = 'pt-BR',
  ...props
}: CurrencyInputProps) => {
  const fractionDigits = useMemo(() => {
    const stepVal =
      typeof props.step === 'number' ? props.step : Number(props.step ?? 1)
    if (!isFinite(stepVal) || stepVal >= 1) return 0
    return Math.max(0, Math.round(-Math.log10(stepVal)))
  }, [props.step])

  const formatter = useMemo(() => {
    if (!currencyCode) return null
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
  }, [currencyCode, locale, fractionDigits])

  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
  }, [locale, fractionDigits])

  const formatValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return ''
    if (formatter) return formatter.format(value)
    return numberFormatter.format(value)
  }

  // Auto-formatting: maintain an internal digits buffer (cents) when enabled.
  const { autoFormat } = props as CurrencyInputProps
  const [rawDigits, setRawDigits] = useState<string>(() => {
    const v =
      typeof props.value === 'number' ? props.value : Number(props.value ?? NaN)
    if (isNaN(v)) return ''
    const cents = Math.round(v * Math.pow(10, fractionDigits))
    return cents > 0 ? String(cents) : ''
  })
  const rawRef = useRef(rawDigits)

  useEffect(() => {
    rawRef.current = rawDigits
  }, [rawDigits])

  // sync if controlled value changes externally
  useEffect(() => {
    const v =
      typeof props.value === 'number' ? props.value : Number(props.value ?? NaN)
    if (isNaN(v)) {
      if (rawRef.current !== '') setRawDigits('')
      return
    }
    const cents = Math.round(v * Math.pow(10, fractionDigits))
    const s = cents > 0 ? String(cents) : ''
    if (s !== rawRef.current) setRawDigits(s)
  }, [props.value, fractionDigits])

  const applyDigits = (digits: string) => {
    rawRef.current = digits
    setRawDigits(digits)
    const cents = digits === '' ? 0 : parseInt(digits, 10)
    const value = cents / Math.pow(10, fractionDigits)
    props.onChange?.(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!autoFormat) return
    const key = e.key
    if (/^[0-9]$/.test(key)) {
      e.preventDefault()
      const newDigits = (rawRef.current || '') + key
      applyDigits(newDigits)
      return
    }
    if (key === 'Backspace') {
      e.preventDefault()
      const newDigits = rawRef.current.slice(0, -1)
      applyDigits(newDigits)
      return
    }
    if (key === 'Delete') {
      e.preventDefault()
      applyDigits('')
      return
    }
    // allow navigation and control keys
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!autoFormat) return
    e.preventDefault()
    const text = e.clipboardData.getData('text') || ''
    const digits = text.replace(/\D/g, '')
    if (!digits) return
    const newDigits = (rawRef.current || '') + digits
    applyDigits(newDigits)
  }

  const step =
    props.step ?? (fractionDigits > 0 ? Math.pow(10, -fractionDigits) : 1)

  return (
    <NumberField
      defaultValue={0}
      minValue={0}
      step={step}
      className='w-full space-y-2'
      value={props.value}
      onChange={props.onChange}
    >
      <Group className='relative inline-flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border border-input bg-transparent text-base whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:border-ring data-focus-within:ring-[3px] data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:data-focus-within:has-aria-invalid:ring-destructive/40'>
        {currencyCode && (
          <span className='ml-3 shrink-0 text-sm text-muted-foreground'>
            {(() => {
              try {
                const parts = formatter?.formatToParts(0)
                const cur = parts?.find((p) => p.type === 'currency')?.value
                return cur ?? currencyCode
              } catch {
                return currencyCode
              }
            })()}
          </span>
        )}
        <Input
          className='w-full grow px-3 py-2 pr-14 text-left tabular-nums outline-none selection:bg-primary selection:text-primary-foreground'
          aria-label={props.name ?? props['aria-label']}
          inputMode={fractionDigits > 0 ? 'decimal' : 'numeric'}
          pattern={fractionDigits > 0 ? '[0-9.,]*' : '[0-9]*'}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onChange={() => {
            /* noop: handled via keyDown for auto-format */
          }}
          value={
            autoFormat
              ? rawDigits === ''
                ? numberFormatter.format(0)
                : numberFormatter.format(
                    parseInt(rawDigits, 10) / Math.pow(10, fractionDigits)
                  )
              : formatter
                ? formatValue(props.value as number | undefined)
                : (props.value ?? '').toString()
          }
          placeholder={formatter ? formatValue(0) : undefined}
        />
        <Button
          type='button'
          slot='decrement'
          className='mr-1.5 ml-auto flex aspect-square h-5 items-center justify-center rounded-sm border border-input bg-background text-sm text-muted-foreground transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
        >
          <MinusIcon className='size-3' />
          <span className='sr-only'>Decrement</span>
        </Button>
        <Button
          type='button'
          slot='increment'
          className='mr-2 flex aspect-square h-5 items-center justify-center rounded-sm border border-input bg-background text-sm text-muted-foreground transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
        >
          <PlusIcon className='size-3' />
          <span className='sr-only'>Increment</span>
        </Button>
      </Group>
    </NumberField>
  )
}

export default InputWithEndButtons
