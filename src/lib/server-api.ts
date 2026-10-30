import { cookies } from 'next/headers'

const API_URL = process.env.ROGELEDB_API_URL || 'http://localhost:8080'
const SERVICE_TOKEN = process.env.ROGELE_SERVICE_TOKEN

export async function serverApiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('rogele_access_token')?.value

  const token = accessToken || SERVICE_TOKEN

  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (!response.ok) {
    let errorMessage = `API error: ${response.statusText}`
    try {
      const errorBody = await response.json()
      errorMessage = errorBody.error?.message || errorMessage
    } catch {}
    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}