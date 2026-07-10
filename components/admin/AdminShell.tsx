"use client"

import AdminSidebar from "./AdminSidebar"

interface AdminShellProps {
  children: React.ReactNode
  title?: string
  action?: React.ReactNode
}

export default function AdminShell({ children, title, action }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#F8F6F3] dark:bg-neutral-950 flex">
      <AdminSidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-black/[0.05] dark:border-white/[0.06]">
          <div className="flex items-center justify-between h-14 px-6">
            <div className="flex items-center gap-3">
              {/* Spacer for mobile hamburger */}
              <div className="w-8 lg:hidden" />
              {title && (
                <h1 className="text-base font-semibold text-[#2E2E2E] dark:text-neutral-100" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {title}
                </h1>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
