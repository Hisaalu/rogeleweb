import 'server-only'
import { apiRequest } from './api-client'
import { getAccessToken } from './auth'

export async function serverApiRequest<T>(
  path: string,
  options: Omit<Parameters<typeof apiRequest>[1], 'token'> = {},
): Promise<T> {
  let token = await getAccessToken()
  
  if (!token) {
    token = process.env.ROGELE_SERVICE_TOKEN || null
  }

  return apiRequest<T>(path, { ...options, token })
}