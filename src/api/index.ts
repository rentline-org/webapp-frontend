import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { getCookie } from '@/lib/cookies'

export const RentlineApi = axios.create({
  baseURL: import.meta.env.VITE_RENTLINE_API_URL,
  // withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

RentlineApi.interceptors.request.use((config) => {
  const token = getCookie('token')

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
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
  const res = await RentlineApi.post<
    TResponse,
    AxiosResponse<TResponse>,
    TRequest
  >(url, data, config)

  return res.data
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
