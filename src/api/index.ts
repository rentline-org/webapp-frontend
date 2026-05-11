import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { getCookie } from '@/lib/cookies'
import { ApiError } from './errors'

export type ApiErrorResponse = {
  message?: string
  detail?: string
  error_code?: string
  errors?: Record<string, string[]>
}

export interface IResponse<TData> extends ApiErrorResponse {
  data: TData
}

export const RentlineApi = axios.create({
  baseURL: import.meta.env.VITE_RENTLINE_API_URL,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
})

export const RentlineAuth = axios.create({
  baseURL: import.meta.env.VITE_RENTLINE_API_AUTH,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
})

RentlineApi.interceptors.request.use((config) => {
  // const token = getCookie('token')
  const activeOrgId = getCookie('active_org')

  // if (token) {
  //   config.headers['Authorization'] = `Bearer ${token}`
  // }

  if (activeOrgId) {
    config.headers['X-Organization-Id'] = String(activeOrgId)
  }

  return config
})

export const handleGet = async <TResponse, TParams = unknown>(
  url: string,
  params?: TParams,
  config?: AxiosRequestConfig<TParams>
): Promise<TResponse> => {
  const res = await RentlineApi.get<
    TResponse,
    AxiosResponse<TResponse>,
    TParams
  >(url, {
    ...config,
    params,
  })

  return res.data
}

export const handlePost = async <TResponse, TRequest = unknown>(
  url: string,
  data?: TRequest,
  config?: AxiosRequestConfig<TRequest>
): Promise<TResponse> => {
  try {
    const res = await RentlineApi.post<
      TResponse,
      AxiosResponse<TResponse>,
      TRequest
    >(url, data, config)

    return res.data
  } catch (err) {
    if (axios.isAxiosError<ApiErrorResponse>(err)) {
      const responseData = err.response?.data

      const message =
        responseData?.message ??
        responseData?.detail ??
        Object.values(responseData?.errors ?? {}).flat()[0] ??
        err.message ??
        'Request failed'

      throw new ApiError(message, {
        status: err.response?.status,
        errors: responseData?.errors,
        data: responseData,
      })
    }

    throw err
  }
}

export const handlePut = async <TResponse, TRequest = unknown>(
  url: string,
  data?: TRequest,
  config?: AxiosRequestConfig<TRequest>
): Promise<TResponse> => {
  const res = await RentlineApi.put<
    TResponse,
    AxiosResponse<TResponse>,
    TRequest
  >(url, data, config)

  return res.data
}

export const handlePatch = async <TResponse, TRequest = unknown>(
  url: string,
  data?: TRequest,
  config?: AxiosRequestConfig<TRequest>
): Promise<TResponse> => {
  const res = await RentlineApi.patch<
    TResponse,
    AxiosResponse<TResponse>,
    TRequest
  >(url, data, config)

  return res.data
}

export const handleDelete = async <TResponse, TParams = unknown>(
  url: string,
  params?: TParams,
  config?: AxiosRequestConfig<TParams>
): Promise<TResponse> => {
  const res = await RentlineApi.delete<
    TResponse,
    AxiosResponse<TResponse>,
    TParams
  >(url, {
    ...config,
    params,
  })

  return res.data
}
