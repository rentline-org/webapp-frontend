import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invalidateUserProfile, useUpdateProfileAvatar } from '../query'
import { avatarUploadSchema, type TAvatarUploadSchema } from '../types'
import { AvatarUploadField } from './avatar-upload-field'

type AvatarUploadProps = {
  avatarUrl?: string | null
  initials?: string
}

const AvatarUpload = ({ avatarUrl, initials = 'U' }: AvatarUploadProps) => {
  const queryClient = useQueryClient()
  const { mutate, isPending: isUploading } = useUpdateProfileAvatar()

  const form = useForm<TAvatarUploadSchema>({
    resolver: zodResolver(avatarUploadSchema),
    defaultValues: {
      avatar: undefined,
    },
  })

  const handleFileChange = async (file: File | null) => {
    if (!file) return

    form.setValue('avatar', file, { shouldDirty: true, shouldValidate: true })

    mutate(form.getValues(), {
      async onSuccess() {
        toast.success('Profile updated!')
        await invalidateUserProfile(queryClient)

        form.reset()
      },
    })
  }

  return (
    <AvatarUploadField
      value={avatarUrl}
      fallbackText={initials}
      isUploading={isUploading}
      disabled={isUploading}
      onChange={handleFileChange}
    />
  )
}

export default AvatarUpload
