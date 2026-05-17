import { useState } from 'react';
import { toast } from 'sonner';
import { useDeletePropertyGalleryImage, useUpdatePropertyGalleryImageName, useUploadPropertyGallery } from '@/features/property-gallery/query';
import type { IGalleryMedia } from '../../units/types';

type TUseGalleryParameters = {
  propertyId: number
}

function usePropertyGalleryHandlers({ propertyId }: TUseGalleryParameters) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [deletedItemId, setDeletedItemId] = useState<string | null>(null)
  const { mutateAsync: uploadGalleryAsync, isPending: isUploadingGallery } =
    useUploadPropertyGallery()

  const { mutateAsync: deleteGalleryImageAsync, isPending: isDeleting } =
    useDeletePropertyGalleryImage()

  const { mutate: updateName, isPending: isUpdatingImageName } =
    useUpdatePropertyGalleryImageName()

  const handleUpload = (payload: FormData, onSuccess?: () => void) => {
    toast.promise(
      uploadGalleryAsync(
        {
          payload,
          propertyId,
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

export default usePropertyGalleryHandlers
