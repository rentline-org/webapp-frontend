export class ApiError extends Error {
  status?: number
  errors?: Record<string, string[]>

  constructor(
    message: string,
    opts?: { status?: number; errors?: Record<string, string[]> }
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = opts?.status
    this.errors = opts?.errors
  }
}
