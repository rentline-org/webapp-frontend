import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { changeAppLocale, getAppLocale, type AppLocale } from '@/i18n'
import { Button } from '@/components/ui/button'
import {
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  invalidateUserProfile,
  useUpdateUserLocale,
} from '@/features/settings/profile/query'
import { useQueryClient } from '@tanstack/react-query'

export function AccountForm() {
  const { t } = useTranslation('settings')
  const [language, setLanguage] = useState<AppLocale>(getAppLocale())
  const updateLocale = useUpdateUserLocale()
  const queryClient = useQueryClient()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateLocale.mutate(language, {
      onSuccess: async () => {
        await changeAppLocale(language)
        await invalidateUserProfile(queryClient)
        toast.success(t('account.saved'))
      },
    })
  }

  return (
    <form onSubmit={onSubmit} className='max-w-xl space-y-6'>
      <div className='space-y-2'>
        <FormLabel htmlFor='account-language'>{t('account.language')}</FormLabel>
        <Select
          value={language}
          onValueChange={(value) => setLanguage(value as AppLocale)}
        >
          <SelectTrigger id='account-language' className='w-full sm:max-w-72'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='en'>{t('account.english')}</SelectItem>
            <SelectItem value='pt-BR'>
              {t('account.portugueseBrazil')}
            </SelectItem>
          </SelectContent>
        </Select>
        <p className='text-sm text-muted-foreground'>
          {t('account.languageDescription')}
        </p>
      </div>
      <Button type='submit' disabled={updateLocale.isPending}>
        {t('account.save')}
      </Button>
    </form>
  )
}
