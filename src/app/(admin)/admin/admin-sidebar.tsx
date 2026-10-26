'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { AdminSidebarNav } from './admin-sidebar-nav'
import { cn } from '@/lib/utils'

export function AdminSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card shadow-sm lg:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <BrandLogo size={32} />
        </div>
        <AdminSidebarNav />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          <aside
            className={cn(
              'relative flex w-full max-w-[280px] flex-col bg-card shadow-2xl transition-transform duration-300 ease-in-out',
              mobileOpen ? 'translate-x-0' : '-translate-x-full',
            )}
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <BrandLogo size={32} />
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AdminSidebarNav />
            </div>
          </aside>
        </div>
      )}
    </>
  )
}