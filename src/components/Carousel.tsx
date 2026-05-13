/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { type JSX, useEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  type PanInfo,
  useMotionValue,
  useTransform,
} from 'motion/react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export interface CarouselItem {
  name: string
  image: string
  id: string
}

export interface CarouselProps {
  items?: CarouselItem[]
  baseWidth?: number
  autoplay?: boolean
  autoplayDelay?: number
  pauseOnHover?: boolean
  loop?: boolean
  round?: boolean
}

const DRAG_BUFFER = 0
const VELOCITY_THRESHOLD = 500
const GAP = 16
const SPRING_OPTIONS = { type: 'spring' as const, stiffness: 300, damping: 30 }

interface CarouselItemProps {
  item: CarouselItem
  index: number
  itemWidth: number
  round: boolean
  trackItemOffset: number
  x: ReturnType<typeof useMotionValue<number>>
  transition: any
  itemHeight: number
}

function CarouselItem({
  item,
  index,
  itemWidth,
  round,
  trackItemOffset,
  x,
  transition,
  itemHeight,
}: CarouselItemProps) {
  const range = [
    -(index + 1) * trackItemOffset,
    -index * trackItemOffset,
    -(index - 1) * trackItemOffset,
  ]
  const outputRange = [90, 0, -90]
  const rotateY = useTransform(x, range, outputRange, { clamp: false })

  return (
    <motion.div
      key={`${item?.id ?? index}-${index}`}
      className={cn(
        'relative shrink-0 cursor-grab overflow-hidden active:cursor-grabbing',
        round
          ? 'flex items-center justify-center rounded-full border border-border bg-card text-center shadow-sm'
          : 'flex flex-col rounded-xl border border-border bg-card shadow-sm'
      )}
      style={{
        width: itemWidth,
        height: itemHeight,
        rotateY,
        ...(round && { borderRadius: '50%' }),
      }}
      transition={transition}
    >
      <div className='relative h-full w-full'>
        <img
          src={item.image}
          alt={item.name}
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            round && 'rounded-full'
          )}
          draggable={false}
        />

        <div
          className={cn(
            'absolute inset-x-0 bottom-0 bg-linear-to-t from-background/90 via-background/60 to-transparent',
            round && 'rounded-b-full'
          )}
        />

        <div
          className={cn(
            'absolute inset-x-0 bottom-0 p-5',
            round && 'bottom-3 px-6 py-5'
          )}
        >
          <div className='inline-flex max-w-full rounded-md bg-background/80 px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm'>
            <span className='truncate'>{item.name}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Carousel({
  items = [],
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}: CarouselProps): JSX.Element {
  const containerPadding = 16
  const itemWidth = baseWidth - containerPadding * 2
  const trackItemOffset = itemWidth + GAP
  const itemHeight = round ? baseWidth : Math.round(baseWidth * 1.05)

  const itemsForRender = useMemo(() => {
    if (!loop) return items
    if (items.length === 0) return []
    return [items[items.length - 1], ...items, items[0]]
  }, [items, loop])

  const [position, setPosition] = useState<number>(loop ? 1 : 0)
  const x = useMotionValue(0)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isJumping, setIsJumping] = useState<boolean>(false)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current
      const handleMouseEnter = () => setIsHovered(true)
      const handleMouseLeave = () => setIsHovered(false)

      container.addEventListener('mouseenter', handleMouseEnter)
      container.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [pauseOnHover])

  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1) return undefined
    if (pauseOnHover && isHovered) return undefined

    const timer = setInterval(() => {
      setPosition((prev) => Math.min(prev + 1, itemsForRender.length - 1))
    }, autoplayDelay)

    return () => clearInterval(timer)
  }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length])

  useEffect(() => {
    const startingPosition = loop ? 1 : 0
    setPosition(startingPosition)
    x.set(-startingPosition * trackItemOffset)
  }, [items.length, loop, trackItemOffset, x])

  useEffect(() => {
    if (!loop && position > itemsForRender.length - 1) {
      setPosition(Math.max(0, itemsForRender.length - 1))
    }
  }, [itemsForRender.length, loop, position])

  const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS

  const handleAnimationStart = () => {
    setIsAnimating(true)
  }

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) {
      setIsAnimating(false)
      return
    }

    const lastCloneIndex = itemsForRender.length - 1

    if (position === lastCloneIndex) {
      setIsJumping(true)
      const target = 1
      setPosition(target)
      x.set(-target * trackItemOffset)
      requestAnimationFrame(() => {
        setIsJumping(false)
        setIsAnimating(false)
      })
      return
    }

    if (position === 0) {
      setIsJumping(true)
      const target = items.length
      setPosition(target)
      x.set(-target * trackItemOffset)
      requestAnimationFrame(() => {
        setIsJumping(false)
        setIsAnimating(false)
      })
      return
    }

    setIsAnimating(false)
  }

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ): void => {
    const { offset, velocity } = info
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
          ? -1
          : 0

    if (direction === 0) return

    setPosition((prev) => {
      const next = prev + direction
      const max = itemsForRender.length - 1
      return Math.max(0, Math.min(next, max))
    })
  }

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0),
          right: 0,
        },
      }

  const activeIndex =
    items.length === 0
      ? 0
      : loop
        ? (position - 1 + items.length) % items.length
        : Math.min(position, items.length - 1)

  return (
    <Card
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-background p-4 text-foreground shadow-sm',
        round
          ? 'rounded-full border border-border'
          : 'rounded-3xl border border-border'
      )}
      style={{
        width: `${baseWidth}px`,
        height: `${itemHeight + 48}px`,
      }}
    >
      <motion.div
        className='flex h-full'
        drag={isAnimating ? false : 'x'}
        {...dragProps}
        style={{
          width: itemWidth,
          height: '100%',
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(position * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationStart={handleAnimationStart}
        onAnimationComplete={handleAnimationComplete}
      >
        {itemsForRender.map((item, index) => (
          <CarouselItem
            key={`${item?.id ?? index}-${index}`}
            item={item}
            index={index}
            itemWidth={itemWidth}
            round={round}
            trackItemOffset={trackItemOffset}
            x={x}
            transition={effectiveTransition}
            itemHeight={itemHeight - 32}
          />
        ))}
      </motion.div>

      <div
        className={cn(
          'flex w-full justify-center',
          round && 'absolute bottom-12 left-1/2 z-20 -translate-x-1/2'
        )}
      >
        <div className='mt-4 flex w-37.5 justify-between px-8'>
          {items.map((_, index) => (
            <motion.button
              key={index}
              type='button'
              className={cn(
                'h-2 w-2 rounded-full transition-colors duration-150',
                activeIndex === index ? 'bg-primary' : 'bg-muted-foreground/40'
              )}
              animate={{
                scale: activeIndex === index ? 1.2 : 1,
              }}
              onClick={() => setPosition(loop ? index + 1 : index)}
              transition={{ duration: 0.15 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
