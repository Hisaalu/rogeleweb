'use client'

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
  return (
    <>
      {/* Desktop sidebar — always visible from lg up */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex items-center border-b border-border px-4 py-4">
          <BrandLogo size={36} />
        </div>
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Admin panel
          </p>
        </div>
        <AdminSidebarNav />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform lg:hidden',
              mobileOpen ? 'translate-x-0' : '-translate-x-full',
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <BrandLogo size={36} />
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground transition hover:text-foreground"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-border px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Admin panel
              </p>
            </div>

            <div onClick={onClose}>
              <AdminSidebarNav />
            </div>
          </aside>
        </>
      )}
    </>
  )
}