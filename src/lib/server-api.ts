import 'server-only'
import { apiRequest } from './api-client'
import { getAccessToken } from './auth'

export async function serverApiRequest<T>(
  path: string,
  options: Omit<Parameters<typeof apiRequest>[1], 'token'> = {},
): Promise<T> {
  const token = await getAccessToken()
  return apiRequest<T>(path, { ...options, token })
}