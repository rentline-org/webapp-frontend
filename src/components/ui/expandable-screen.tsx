import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

type ExpandableScreenContextValue<T> = {
  isExpanded: boolean
  selectedItem: T | null
  open: (item: T) => void
  close: () => void
  layoutId: string
  animationDuration: number
}

const ExpandableScreenContext =
  createContext<ExpandableScreenContextValue<any> | null>(null)

export function useExpandableScreen<T>() {
  const context = useContext(ExpandableScreenContext)
  if (!context)
    throw new Error('useExpandableScreen must be used within ExpandableScreen')
  return context as ExpandableScreenContextValue<T>
}

type ExpandableScreenProps<T> = {
  children: ReactNode
  layoutId?: string
  animationDuration?: number
  lockScroll?: boolean
  defaultExpanded?: boolean
  defaultItem?: T | null
  onOpenChange?: (open: boolean, item: T | null) => void
}

export function ExpandableScreen<T>({
  children,
  layoutId = 'expandable-card',
  animationDuration = 0.35,
  lockScroll = true,
  defaultExpanded = false,
  defaultItem = null,
  onOpenChange,
}: ExpandableScreenProps<T>) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [selectedItem, setSelectedItem] = useState<T | null>(defaultItem)

  const open = (item: T) => {
    setSelectedItem(item)
    setIsExpanded(true)
    onOpenChange?.(true, item)
  }

  const close = () => {
    setIsExpanded(false)
    onOpenChange?.(false, selectedItem)
  }

  useEffect(() => {
    if (!lockScroll) return
    document.body.style.overflow = isExpanded ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isExpanded, lockScroll])

  return (
    <ExpandableScreenContext.Provider
      value={{
        isExpanded,
        selectedItem,
        open,
        close,
        layoutId,
        animationDuration,
      }}
    >
      {children}
    </ExpandableScreenContext.Provider>
  )
}

type ExpandableScreenContentProps = {
  children: ReactNode
  className?: string
  showCloseButton?: boolean
  closeButtonClassName?: string
}

export function ExpandableScreenContent({
  children,
  className = '',
  showCloseButton = true,
  closeButtonClassName = '',
}: ExpandableScreenContentProps) {
  const { isExpanded, close, layoutId, animationDuration } =
    useExpandableScreen<any>()

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-2'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            layoutId={layoutId}
            transition={{
              duration: animationDuration,
              type: 'spring',
              bounce: 0.2,
            }}
            className={cn(
              'relative flex h-full w-full transform-gpu overflow-hidden rounded-3xl bg-background shadow-2xl will-change-transform',
              className
            )}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.2 }}
              className='relative z-20 w-full'
            >
              {children}
            </motion.div>

            {showCloseButton && (
              <motion.button
                onClick={close}
                className={`absolute top-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  closeButtonClassName ||
                  'bg-black/30 text-white hover:bg-black/45'
                }`}
                aria-label='Close'
              >
                <X className='h-5 w-5' />
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
