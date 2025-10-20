'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { useProtectedLayoutPortals } from '@/app/(protected)/layout'

interface ProtectedHeaderPortalProps {
  children: React.ReactNode
}

/**
 * Mounts header content inside the protected layout's fixed header region.
 * Keeps per-page header logic colocated while rendering it above the sidebar.
 */
export function ProtectedHeaderPortal({ children }: ProtectedHeaderPortalProps) {
  const { headerContainerRef } = useProtectedLayoutPortals()
  const [target, setTarget] = React.useState<HTMLDivElement | null>(null)

  React.useEffect(() => {
    setTarget(headerContainerRef.current)
  }, [headerContainerRef])

  if (!target) {
    return null
  }

  return createPortal(children, target)
}
