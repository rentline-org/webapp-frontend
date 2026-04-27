export class ApiError<TData> extends Error {
  status?: number
  errors?: Record<string, string[]>
  data?: TData

  constructor(
    message: string,
    options?: {
      status?: number
      errors?: Record<string, string[]>
      data?: TData
    }
  ) {
    super(message)

    this.status = options?.status
    this.errors = options?.errors
    this.data = options?.data
  }
}
