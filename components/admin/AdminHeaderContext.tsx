"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface AdminHeaderState {
  title: string | null
  action: ReactNode | null
}

interface AdminHeaderContextType {
  state: AdminHeaderState
  setHeader: (title: string | null, action?: ReactNode | null) => void
}

const AdminHeaderContext = createContext<AdminHeaderContextType | null>(null)

export function AdminHeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminHeaderState>({ title: null, action: null })

  const setHeader = useCallback((title: string | null, action?: ReactNode | null) => {
    setState({ title, action: action ?? null })
  }, [])

  return (
    <AdminHeaderContext.Provider value={{ state, setHeader }}>
      {children}
    </AdminHeaderContext.Provider>
  )
}

export function useAdminHeader(title: string, action?: ReactNode | null) {
  const ctx = useContext(AdminHeaderContext)
  if (!ctx) {
    throw new Error("useAdminHeader must be used within AdminHeaderProvider")
  }

  useEffect(() => {
    ctx.setHeader(title, action)
    return () => ctx.setHeader(null, null)
  }, [title, action])
}

export function useAdminHeaderContext() {
  const ctx = useContext(AdminHeaderContext)
  if (!ctx) {
    throw new Error("useAdminHeaderContext must be used within AdminHeaderProvider")
  }
  return ctx
}
