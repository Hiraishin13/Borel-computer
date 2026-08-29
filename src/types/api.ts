export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: { field: string; message: string }[]
  }
}

export type ApiResult<T> = T | ApiError
