export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginationResult {
  skip: number
  take: number
  page: number
  limit: number
}

export function parsePagination(params: PaginationParams, maxLimit = 100): PaginationResult {
  const page = Math.max(1, params.page ?? 1)
  const limit = Math.min(maxLimit, Math.max(1, params.limit ?? 20))
  return { skip: (page - 1) * limit, take: limit, page, limit }
}

export function buildPaginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
