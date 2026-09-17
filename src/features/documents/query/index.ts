import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import axios from 'axios'
import {
  handleDelete,
  handleGet,
  handlePatch,
  handlePost,
  RentlineApi,
  type IResponse,
} from '@/api'
import {
  normalizePaginatedResponse,
  type IPaginatedData,
} from '@/api/pagination'
import { handleServerError } from '@/lib/handle-server-error'
import type {
  IDocument,
  IDocumentAuditEvent,
  IDocumentFile,
  IDocumentFilters,
  IDocumentKind,
  IDocumentSigner,
  IDocumentUpdatePayload,
  IDocumentUploadVariables,
  TDocumentUpdateVariables,
} from '../types'
import {
  DOCUMENTS_ENDPOINT,
  DOCUMENT_KINDS_ENDPOINT,
  documentKey,
  documentKindsKey,
  documentListKey,
  documentsKey,
  patchDocumentCaches,
  removeDocumentCaches,
} from './cache'

const getDocuments = async (
  filters: IDocumentFilters
): Promise<IPaginatedData<IDocument>> => {
  const response = await handleGet<unknown, IDocumentFilters>(
    DOCUMENTS_ENDPOINT,
    filters
  )

  return normalizePaginatedResponse<IDocument>(
    response,
    filters.page,
    filters.per_page
  )
}

const getDocumentKinds = async (): Promise<IDocumentKind[]> => {
  const response = await handleGet<IResponse<IDocumentKind[]>>(
    DOCUMENT_KINDS_ENDPOINT
  )
  return response.data
}

const getDocument = async (documentId: number): Promise<IDocument> => {
  const response = await handleGet<IResponse<IDocument>>(
    `${DOCUMENTS_ENDPOINT}/${documentId}`
  )

  return response.data
}

const createDocument = async ({
  payload,
  onProgress,
  signal,
}: IDocumentUploadVariables): Promise<IDocument> => {
  const response = await handlePost<IResponse<IDocument>, FormData>(
    DOCUMENTS_ENDPOINT,
    payload,
    {
      signal,
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return
        onProgress(
          Math.min(100, Math.round((event.loaded / event.total) * 100))
        )
      },
    }
  )

  return response.data
}

const archiveDocument = async (document: IDocument): Promise<IDocument> => {
  const response = await handlePost<IResponse<IDocument>>(
    `${DOCUMENTS_ENDPOINT}/${document.id}/archive`
  )
  return response.data
}

const activateDocument = async (document: IDocument): Promise<IDocument> => {
  const response = await handlePost<IResponse<IDocument>>(
    `${DOCUMENTS_ENDPOINT}/${document.id}/activate`
  )
  return response.data
}

const createDocumentRevision = async ({
  document,
  ...upload
}: IDocumentUploadVariables & { document: IDocument }): Promise<IDocument> => {
  const response = await handlePost<IResponse<IDocument>, FormData>(
    `${DOCUMENTS_ENDPOINT}/${document.id}/versions`,
    upload.payload,
    {
      signal: upload.signal,
      onUploadProgress: (event) => {
        if (!upload.onProgress || !event.total) return
        upload.onProgress(
          Math.min(100, Math.round((event.loaded / event.total) * 100))
        )
      },
    }
  )
  return response.data
}

const updateDocument = async (
  documentId: number,
  payload: IDocumentUpdatePayload
): Promise<IDocument> => {
  const response = await handlePatch<
    IResponse<IDocument>,
    IDocumentUpdatePayload
  >(`${DOCUMENTS_ENDPOINT}/${documentId}`, payload)

  return response.data
}

const deleteDocument = async (documentId: number): Promise<void> => {
  await handleDelete<unknown>(`${DOCUMENTS_ENDPOINT}/${documentId}`)
}

const uploadSignedDocument = async ({
  document,
  file,
}: {
  document: IDocument
  file: File
}): Promise<IDocument> => {
  const formData = new FormData()
  formData.append('signed_file', file)
  const response = await handlePost<IResponse<IDocument>, FormData>(
    `${DOCUMENTS_ENDPOINT}/${document.id}/signature`,
    formData
  )

  return response.data
}

const removeSignedDocument = async (
  document: IDocument
): Promise<IDocument> => {
  const response = await handleDelete<IResponse<IDocument>>(
    `${DOCUMENTS_ENDPOINT}/${document.id}/signature`
  )

  return response.data
}

const getDocumentAuditEvents = async (
  documentId: number
): Promise<IPaginatedData<IDocumentAuditEvent>> => {
  const response = await handleGet<unknown>(
    `${DOCUMENTS_ENDPOINT}/${documentId}/audit-events`,
    { per_page: 100 }
  )
  return normalizePaginatedResponse<IDocumentAuditEvent>(response)
}

export function useGetDocuments(filters: IDocumentFilters = {}) {
  return useQuery({
    queryKey: documentListKey(filters),
    queryFn: () => getDocuments(filters),
  })
}

export function useGetDocumentKinds() {
  return useQuery({
    queryKey: documentKindsKey,
    queryFn: getDocumentKinds,
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetDocument(documentId: number, enabled = true) {
  return useQuery({
    queryKey: documentKey(documentId),
    queryFn: () => getDocument(documentId),
    enabled: enabled && documentId > 0,
  })
}

export function useGetDocumentAuditEvents(documentId: number, enabled = true) {
  return useQuery({
    queryKey: [...documentKey(documentId), 'audit-events'],
    queryFn: () => getDocumentAuditEvents(documentId),
    enabled: enabled && documentId > 0,
  })
}

export function useUpdateDocumentSigner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'signer', 'update'],
    mutationFn: async ({
      document,
      signer,
      status,
    }: {
      document: IDocument
      signer: IDocumentSigner
      status: IDocumentSigner['status']
    }) => {
      const response = await handlePatch<
        IResponse<IDocument>,
        { status: IDocumentSigner['status'] }
      >(`${DOCUMENTS_ENDPOINT}/${document.id}/signers/${signer.id}`, {
        status,
      })
      return response.data
    },
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export function useAddDocumentSigner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'signer', 'add'],
    mutationFn: async ({
      document,
      contactId,
      role,
    }: {
      document: IDocument
      contactId: number
      role: string
    }) => {
      const response = await handlePost<
        IResponse<IDocument>,
        { contact_id: number; role: string }
      >(`${DOCUMENTS_ENDPOINT}/${document.id}/signers`, {
        contact_id: contactId,
        role,
      })
      return response.data
    },
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export function useRemoveDocumentSigner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'signer', 'remove'],
    mutationFn: async ({
      document,
      signer,
    }: {
      document: IDocument
      signer: IDocumentSigner
    }) => {
      const response = await handleDelete<IResponse<IDocument>>(
        `${DOCUMENTS_ENDPOINT}/${document.id}/signers/${signer.id}`
      )
      return response.data
    },
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export function useGrantDocumentShare() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'share', 'grant'],
    mutationFn: async ({
      document,
      userId,
      contactId,
    }: {
      document: IDocument
      userId: number
      contactId: number
    }) => {
      const response = await handlePost<
        IResponse<IDocument>,
        { user_id: number; contact_id: number }
      >(`${DOCUMENTS_ENDPOINT}/${document.id}/shares`, {
        user_id: userId,
        contact_id: contactId,
      })
      return response.data
    },
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export function useRevokeDocumentShare() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'share', 'revoke'],
    mutationFn: async ({
      document,
      shareId,
    }: {
      document: IDocument
      shareId: number
    }) => {
      const response = await handleDelete<IResponse<IDocument>>(
        `${DOCUMENTS_ENDPOINT}/${document.id}/shares/${shareId}`
      )
      return response.data
    },
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export function useCreateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'create'],
    mutationFn: createDocument,
    onSuccess: async (document) => {
      queryClient.setQueryData(documentKey(document.id), document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: (error) => {
      if (!axios.isCancel(error)) handleServerError(error)
    },
  })
}

export function useArchiveDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'archive'],
    mutationFn: archiveDocument,
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export function useActivateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'activate'],
    mutationFn: activateDocument,
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export function useCreateDocumentRevision() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'version', 'create'],
    mutationFn: createDocumentRevision,
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: (error) => {
      if (!axios.isCancel(error)) handleServerError(error)
    },
  })
}

export function useUpdateDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'update'],
    mutationFn: ({ document, payload }: TDocumentUpdateVariables) =>
      updateDocument(document.id, payload),
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'delete'],
    mutationFn: (document: IDocument) => deleteDocument(document.id),
    onMutate: async (document) => {
      await queryClient.cancelQueries({ queryKey: documentsKey })

      const previous = queryClient.getQueriesData<unknown>({
        queryKey: documentsKey,
      })
      removeDocumentCaches(queryClient, document.id)

      return { previous }
    },
    onError: (error, _document, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
      handleServerError(error)
    },
    onSettled: async () => {
      await invalidateDocumentsQuery(queryClient)
    },
  })
}

export function useUploadDocumentSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'signature', 'upload'],
    mutationFn: uploadSignedDocument,
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export function useRemoveDocumentSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...documentsKey, 'signature', 'remove'],
    mutationFn: removeSignedDocument,
    onSuccess: async (document) => {
      patchDocumentCaches(queryClient, document)
      await invalidateDocumentsQuery(queryClient)
    },
    onError: handleServerError,
  })
}

export async function downloadDocumentFile(file: IDocumentFile) {
  const response = await RentlineApi.get<Blob>(file.download_url, {
    responseType: 'blob',
  })
  const objectUrl = URL.createObjectURL(response.data)
  const anchor = window.document.createElement('a')
  anchor.href = objectUrl
  anchor.download = file.file_name
  window.document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000)
}

export async function invalidateDocumentsQuery(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: documentsKey })
}

export async function resetDocumentsQuery(queryClient: QueryClient) {
  await queryClient.cancelQueries({ queryKey: documentsKey })
  queryClient.removeQueries({ queryKey: documentsKey })
}
