'use client'

import React, { useMemo, useRef, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { ProtectedLayoutPortalContext } from '@/components/layout/ProtectedLayoutContext'

/**
 * Protected Layout
 *
 * Wraps all protected routes with:
 * - TopHeader at the very top (full width)
 * - Collapsible sidebar navigation below header (desktop)
 * - Mobile navigation (hamburger + bottom bar)
 * - Responsive layout with proper spacing
 *
 * Layout structure:
 * +------------------+
 * |   TOP HEADER     |  <- Full width
 * +------+-----------+
 * | SIDE |   MAIN   |
 * | BAR  |  CONTENT |
 * +------+-----------+
 *
 * Routes wrapped:
 * - /app (main session-break interface - shows all TopHeader controls)
 * - /tracker (calendar tracker - shows minimal TopHeader)
 * - /templates (session templates - shows minimal TopHeader)
 * - /analytics (analytics dashboard - shows minimal TopHeader)
 * - /settings (user settings - shows minimal TopHeader)
 * - /goals (goals tracking - shows minimal TopHeader)
 */

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const headerContainerRef = useRef<HTMLDivElement>(null)

  const portalContextValue = useMemo(
    () => ({ headerContainerRef }),
    [headerContainerRef]
  )

  const handleMenuClick = () => {
    setIsMobileSidebarOpen(true)
  }

  const handleCloseSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev)
  }

  return (
    <ProtectedLayoutPortalContext.Provider value={portalContextValue}>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header Region (populated via portal from child routes) */}
        <div ref={headerContainerRef} className="flex-none" />

        {/* Content Area: Sidebar + Main */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Desktop (always visible, collapsible) */}
          <div className="hidden h-full lg:block">
            <Sidebar
              isOpen={true}
              isMobile={false}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={handleToggleSidebarCollapse}
            />
          </div>

          {/* Sidebar - Mobile Drawer */}
          <Sidebar
            isOpen={isMobileSidebarOpen}
            onClose={handleCloseSidebar}
            isMobile={true}
            isCollapsed={false}
          />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Mobile Navigation */}
            <MobileNav onMenuClick={handleMenuClick} />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedLayoutPortalContext.Provider>
  )
}
