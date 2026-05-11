import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useResendOtp } from '../query'

type Props = {
  email: string
}

const OTP_EXPIRY_SECONDS = 60

const ResendOtpCode = ({ email }: Props) => {
  const { mutate, isPending } = useResendOtp()

  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS)

  /**
   * Countdown timer
   */
  useEffect(() => {
    if (secondsLeft <= 0) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [secondsLeft])

  const restartTimer = () => {
    setSecondsLeft(OTP_EXPIRY_SECONDS)
  }

  const onClickResend = () => {
    mutate(email, {
      onSuccess() {
        restartTimer()

        toast.success('OTP code sent! Check your email')
      },
      onError() {
        toast.error('Failed to resend OTP code')
      },
    })
  }

  const isDisabled = isPending || secondsLeft > 0

  return (
    <div className='space-y-2 text-sm text-muted-foreground'>
      <p>
        Haven&apos;t received it?{' '}
        <Button
          type='button'
          variant='link'
          className='h-auto p-0'
          onClick={onClickResend}
          disabled={isDisabled}
        >
          {isPending ? (
            <span className='inline-flex items-center gap-2'>
              <Loader2 className='size-4 animate-spin' />
              Sending...
            </span>
          ) : (
            'Resend a new code'
          )}
        </Button>
        .
      </p>

      <p className='text-xs'>
        {secondsLeft > 0 ? (
          <>
            You can request a new code in{' '}
            <span className='font-medium text-foreground'>{secondsLeft}s</span>
          </>
        ) : (
          'Your OTP code has expired.'
        )}
      </p>
    </div>
  )
}

export default ResendOtpCode
