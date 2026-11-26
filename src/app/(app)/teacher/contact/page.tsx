import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { ContactContent } from '@/components/legal/contact-content'
import { PublicFooter } from '@/components/layout/public-footer'

export const metadata: Metadata = { title: 'Send us a message' }

export default function TeacherContactPage() {
  return (
    <>
      <PageHeader title="Send us a message" fallbackHref="/teacher/dashboard" />
      <ContactContent />
      <PublicFooter />
    </>
  )
}