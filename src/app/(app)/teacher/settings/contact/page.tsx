import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { ContactContent } from '@/components/legal/contact-content'
import { PublicFooter } from '@/components/layout/public-footer'

export const metadata: Metadata = { title: 'Contact Us' }

export default function TeacherContactPage() {
  return (
    <>
      <PageHeader title="Contact Us" fallbackHref="/teacher/settings" />
      <ContactContent />
      <PublicFooter />
    </>
  )
}