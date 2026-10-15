import type { ApiError } from '@/types/api'

const API_URL = process.env.ROGELEDB_API_URL ?? 'http://localhost:8080'

export class ApiClientError extends Error {
  code: string
  status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  token?: string | null
  headers?: Record<string, string>
  cache?: RequestCache
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, cache, token } = options

  const init: RequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
    cache: cache ?? 'no-store',
  }

  if (body !== undefined) {
    init.headers = {
      ...init.headers,
      'Content-Type': 'application/json',
    }
    init.body = JSON.stringify(body)
  }

  if (token) {
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  const res = await fetch(`${API_URL}${path}`, init)

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const err = data as ApiError | null
    throw new ApiClientError(
      err?.error?.message ?? 'Request failed',
      err?.error?.code ?? 'UNKNOWN',
      res.status,
    )
  }

  return data as T
}