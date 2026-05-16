export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  limit: number
}

export interface ApiError {
  statusCode: number
  error: string
  message: string
}

export interface SuccessResponse<T = unknown> {
  success: true
  data: T
}
