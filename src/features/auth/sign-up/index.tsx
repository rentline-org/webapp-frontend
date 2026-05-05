import { Link } from '@tanstack/react-router'
import { LogoFull } from '@/assets/logo-full'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import { Safari } from '@/components/ui/safari'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  const { theme } = useTheme()

  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='w-full lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-120 sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <LogoFull className='me-2' />
          </div>
        </div>
        <div className='mx-auto flex w-full max-w-md flex-col justify-center space-y-2'>
          <div className='mb-6 flex flex-col space-y-2 text-start'>
            <h2 className='text-lg font-semibold tracking-tight'>
              Create your account
            </h2>
            <p className='text-sm text-muted-foreground'>
              Enter your information below to get started right away!
              <br className='max-sm:hidden' /> Already have an account?{' '}
              <Link
                to='/sign-in'
                className='text-nowrap underline underline-offset-4 hover:text-primary'
              >
                Sign In
              </Link>
            </p>
          </div>
          <SignUpForm />
          <p className='px-8 text-center text-sm text-muted-foreground'>
            By clicking sign in, you agree to our{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <div
        className={cn(
          'relative h-full overflow-hidden bg-muted max-lg:hidden',
          '*:absolute *:top-[15%] *:left-20 *:w-[120%] *:max-w-none *:select-none'
        )}
      >
        <Safari
          mode='simple'
          url='app.rentline.io'
          imageSrc={`/images/dashboard_${theme === 'light' ? 'light' : 'dark'}.png`}
        />
      </div>
    </div>
  )
}
