export const ACCESS_TOKEN_COOKIE = 'rogele_access_token'
export const REFRESH_TOKEN_COOKIE = 'rogele_refresh_token'
export const USER_COOKIE = 'rogele_user'

const BASE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export function sessionCookieOptions(maxAge: number) {
  return { ...BASE_OPTIONS, maxAge }
}

export function clearCookieOptions() {
  return { ...BASE_OPTIONS, maxAge: 0 }
}