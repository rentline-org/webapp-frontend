import type { GalleryDraftItem } from '@/features/property-gallery/types'

export const getBaseName = (fileName: string) => {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot > 0 ? fileName.slice(0, lastDot) : fileName
}

export const createDraftItem = (file: File): GalleryDraftItem => ({
  id: crypto.randomUUID(),
  file,
  previewUrl: URL.createObjectURL(file),
  title: getBaseName(file.name),
})

export const revokePreview = (previewUrl: string) => {
  if (previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl)
  }
}

export const buildGalleryPayload = (items: GalleryDraftItem[]) => {
  const formData = new FormData()

  items.forEach((item, index) => {
    formData.append(`images[${index}]`, item.file)
    formData.append(`names[${index}]`, item.title)
  })

  return formData
}
