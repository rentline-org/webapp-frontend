import axios from 'axios'
import type { ApiErrorResponse } from '@/api'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  let errMsg: string | null = null

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status
    const data = error.response?.data

    if (status === 422) {
      errMsg =
        data?.message ??
        Object.values(data?.errors ?? {})
          .flat()
          .find(Boolean) ??
        'Validation failed.'
    } else if (status && status >= 500) {
      errMsg = data?.message ?? 'Internal server error.'
    } else if (status === 204) {
      errMsg = 'No content.'
    } else {
      errMsg = data?.message ?? error.message
    }
  } else if (error instanceof Error) {
    errMsg = error.message
  }

  // console.log(error);

  if (errMsg) {
    toast.error(errMsg)
  }
}
