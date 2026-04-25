import { useEffect } from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from '@/context/theme-provider'
import { Switch } from '@/components/ui/switch'

export const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme()

  const checked = theme === 'dark'

  useEffect(() => {
    const themeColor = checked ? '#020817' : '#ffffff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [checked])

  return (
    <div className='relative inline-grid h-7 w-14 grid-cols-[1fr_1fr] items-center text-sm font-medium'>
      <Switch
        checked={checked}
        onCheckedChange={(value) => setTheme(value ? 'dark' : 'light')}
        className='peer absolute inset-0 h-7 w-14 data-[state=checked]:bg-input/50 data-[state=unchecked]:bg-input/50 [&>span]:h-6 [&>span]:w-6 [&>span]:translate-x-0.5 [&>span]:transition-transform [&>span]:duration-300 [&>span]:ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=checked]:[&>span]:translate-x-7'
        aria-label='Toggle theme'
      />

      {/* LEFT (Light) */}
      <span className='pointer-events-none z-10 flex items-center justify-center'>
        <SunIcon className='size-4' />
      </span>

      {/* RIGHT (Dark) */}
      <span className='pointer-events-none z-10 flex items-center justify-center'>
        <MoonIcon className='size-4' />
      </span>
    </div>
  )
}
