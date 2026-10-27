import type { Metadata } from 'next'
import { serverApiRequest } from '@/lib/server-api'
import { fetchPublicSettings } from '@/lib/settings.server.public'
import type { Class } from '@/types/admin'
import { RegisterForm } from './register-form'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings()
  const customTitle = settings['site.browser_title']?.trim()
  return {
    title: customTitle ? `Create Account` : 'Create Account',
  }
}

export default async function RegisterPage() {
  let classes: Class[] = []
  
  try {
    const res = await serverApiRequest<unknown>('/api/v1/config/classes')
    const r = (res ?? {}) as { data?: Class[]; value?: Class[] }
    if (Array.isArray(res)) classes = res
    else if (Array.isArray(r.data)) classes = r.data
    else if (Array.isArray(r.value)) classes = r.value
  } catch {
    classes = []
  }

  return <RegisterForm classes={classes} />
}