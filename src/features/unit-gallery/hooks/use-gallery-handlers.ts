import { useState } from 'react'
import { toast } from 'sonner'
import type { IGalleryMedia } from '../../units/types'
import {
  useUploadGallery,
  useDeleteUnitGalleryImage,
  useUpdateUnitGalleryImageName,
} from '../query'

type TUseGalleryParameters = {
  propertyId: number
  unitId: number
}

function useGalleryHandlers({ propertyId, unitId }: TUseGalleryParameters) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [deletedItemId, setDeletedItemId] = useState<string | null>(null)
  const { mutateAsync: uploadGalleryAsync, isPending: isUploadingGallery } =
    useUploadGallery()

  const { mutateAsync: deleteGalleryImageAsync, isPending: isDeleting } =
    useDeleteUnitGalleryImage()

  const { mutate: updateName, isPending: isUpdatingImageName } =
    useUpdateUnitGalleryImageName()

  const handleUpload = (payload: FormData, onSuccess?: () => void) => {
    toast.promise(
      uploadGalleryAsync(
        {
          payload,
          propertyId,
          unitId,
        },
        {
          onSuccess() {
            onSuccess?.()
            // refetch()
          },
        }
      ),
      {
        success: 'Gallery upload success',
        loading: 'Uploading gallery...',
      }
    )
  }

  const handleDelete = (media: IGalleryMedia, onSuccess?: () => void) => {
    setDeletedItemId(media.id)

    toast.promise(
      deleteGalleryImageAsync(
        {
          propertyId,
          unitId,
          mediaId: media.id,
        },
        {
          onSuccess() {
            onSuccess?.()
            setDeletedItemId(null)
          },
        }
      ),
      {
        loading: 'Deleting image...',
        success: 'Image deleted successfully!',
      }
    )
  }

  const updateImageName = (
    mediaId: string,
    name: string,
    onSuccess?: () => void
  ) => {
    setEditingItemId(mediaId)
    updateName(
      {
        mediaId,
        propertyId,
        unitId,
        name,
      },
      {
        onSuccess() {
          onSuccess?.()
          setEditingItemId(null)
        },
      }
    )
  }

  return {
    editingItemId,
    updateImageName,
    isUpdatingImageName,
    handleUpload,
    isUploadingGallery,
    handleDelete,
    deletedItemId,
    isDeleting,
  }
}

export default useGalleryHandlers
