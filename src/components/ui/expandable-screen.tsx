import {
  createContext,
  useContext,
  useEffect,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface ExpandableScreenContextValue {
  isExpanded: boolean
  expand: () => void
  collapse: () => void
  layoutId: string
  triggerRadius: string
  contentRadius: string
  animationDuration: number
}

const ExpandableScreenContext =
  createContext<ExpandableScreenContextValue | null>(null)

function useExpandableScreen() {
  const context = useContext(ExpandableScreenContext)
  if (!context) {
    throw new Error(
      'useExpandableScreen must be used within an ExpandableScreen'
    )
  }
  return context
}

interface ExpandableScreenProps {
  children: ReactNode
  defaultExpanded?: boolean
  onExpandChange?: (expanded: boolean) => void
  layoutId?: string
  triggerRadius?: string
  contentRadius?: string
  animationDuration?: number
  lockScroll?: boolean
}

export function ExpandableScreen({
  children,
  defaultExpanded = false,
  onExpandChange,
  layoutId = 'expandable-card',
  triggerRadius = 'var(--radius-xl)',
  contentRadius = 'var(--radius-xl)',
  animationDuration = 0.3,
  lockScroll = true,
}: ExpandableScreenProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const expand = () => {
    setIsExpanded(true)
    onExpandChange?.(true)
  }

  const collapse = () => {
    setIsExpanded(false)
    onExpandChange?.(false)
  }

  useEffect(() => {
    if (!lockScroll) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = isExpanded
      ? 'hidden'
      : previousOverflow || ''

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isExpanded, lockScroll])

  return (
    <ExpandableScreenContext.Provider
      value={{
        isExpanded,
        expand,
        collapse,
        layoutId,
        triggerRadius,
        contentRadius,
        animationDuration,
      }}
    >
      {children}
    </ExpandableScreenContext.Provider>
  )
}

type ButtonVariant = VariantProps<typeof buttonVariants>['variant']
type ButtonSize = VariantProps<typeof buttonVariants>['size']

interface ExpandableScreenTriggerProps {
  children: ReactNode
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export function ExpandableScreenTrigger({
  children,
  className = '',
  variant = 'ghost',
  size = 'default',
  fullWidth = false,
}: ExpandableScreenTriggerProps) {
  const { isExpanded, expand, layoutId, triggerRadius } = useExpandableScreen()

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      expand()
    }
  }

  return (
    <AnimatePresence initial={false}>
      {!isExpanded && (
        <motion.div
          className={cn(
            'relative inline-block rounded-md',
            fullWidth && 'w-full'
          )}
        >
          <motion.div
            style={{ borderRadius: triggerRadius }}
            layout
            layoutId={layoutId}
            className='absolute inset-0 transform-gpu bg-card shadow-sm ring-1 ring-border will-change-transform'
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            layout={false}
            role='button'
            tabIndex={0}
            onClick={expand}
            onKeyDown={handleKeyDown}
            className={cn(
              buttonVariants({ variant, size }),
              'relative cursor-pointer rounded-md!',
              className
            )}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface ExpandableScreenContentProps {
  children: ReactNode
  className?: string
  showCloseButton?: boolean
  closeButtonClassName?: string
  closeButtonVariant?: ButtonVariant
  closeButtonSize?: ButtonSize
}

export function ExpandableScreenContent({
  children,
  className = '',
  showCloseButton = true,
  closeButtonClassName = '',
  closeButtonVariant = 'ghost',
  closeButtonSize = 'icon',
}: ExpandableScreenContentProps) {
  const { isExpanded, collapse, layoutId, contentRadius, animationDuration } =
    useExpandableScreen()

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/50 p-3 backdrop-blur-sm sm:p-6'>
          <motion.div
            layoutId={layoutId}
            transition={{
              duration: animationDuration,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ borderRadius: contentRadius }}
            layout
            className={cn(
              'relative flex h-[min(92vh,900px)] w-full transform-gpu overflow-hidden border border-border bg-background text-card-foreground shadow-2xl ring-1 ring-border/60 will-change-transform',
              className
            )}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.25 }}
              className='relative z-20 w-full overflow-y-auto'
            >
              {children}
            </motion.div>

            {showCloseButton && (
              <motion.button
                type='button'
                onClick={collapse}
                className={cn(
                  buttonVariants({
                    variant: closeButtonVariant,
                    size: closeButtonSize,
                  }),
                  'absolute top-4 right-4 z-30',
                  closeButtonClassName
                )}
                aria-label='Close'
              >
                <X className='h-5 w-5' />
              </motion.button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

interface ExpandableScreenBackgroundProps {
  trigger?: ReactNode
  content?: ReactNode
  className?: string
}

export function ExpandableScreenBackground({
  trigger,
  content,
  className = '',
}: ExpandableScreenBackgroundProps) {
  const { isExpanded } = useExpandableScreen()

  if (isExpanded && content) {
    return <div className={className}>{content}</div>
  }

  if (!isExpanded && trigger) {
    return <div className={className}>{trigger}</div>
  }

  return null
}

export { useExpandableScreen }
