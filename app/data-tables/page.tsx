'use client'

import { DataTableManagement } from '@/components/data-table-management'
import { Sidebar } from '@/components/sidebar'
import { useAuth } from '@/contexts/auth-context'
import { LoginPanel } from '@/components/login-panel'

export default function DataTablesPage() {
  const { isAuthenticated, loading } = useAuth()

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden items-center justify-center">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 pointer-events-none" />

        <div className="text-center">
          <div className="w-12 h-12 elegant-gradient rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-6 h-6 text-white animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="text-sm text-slate-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPanel />
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 pointer-events-none" />

      <Sidebar />

      <main className="flex-1 overflow-auto p-6 relative">
        <DataTableManagement />
      </main>
    </div>
  )
} 