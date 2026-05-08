'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { TopHeader } from '@/components/layout/TopHeader'
import { EditorProvider } from '@/components/EditorManager'

/**
 * Protected Layout
 *
 * Wraps all protected routes with:
 * - TopHeader at the very top (full width, rendered directly)
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
 */

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

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
    <EditorProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header - rendered directly, no portal needed */}
        <div className="flex-none">
          <TopHeader />
        </div>

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
          <div className="flex flex-1 flex-col min-h-screen overflow-hidden">
            {/* Mobile Navigation */}
            <MobileNav onMenuClick={handleMenuClick} />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto min-h-screen pb-20 lg:pb-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </EditorProvider>
  )
}
