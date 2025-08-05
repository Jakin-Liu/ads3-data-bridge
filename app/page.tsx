'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { DataTableManagement } from '@/components/data-table-management'
import { SystemSettings } from '@/components/system-settings'
import { DataTriggerManagement } from '@/components/data-trigger-management'
import { LoginPanel } from '@/components/login-panel'
import { AuthProvider, useAuth } from '@/contexts/auth-context'

function DashboardContent() {
  const [activeMenu, setActiveMenu] = useState('data-tables')
  const { isAuthenticated } = useAuth()

  // 如果未登录，显示登录面板
  if (!isAuthenticated) {
    return <LoginPanel />
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 pointer-events-none" />

      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <main className="flex-1 overflow-auto relative">
        {activeMenu === 'data-tables' && <DataTableManagement />}
        {activeMenu === 'data-triggers' && <DataTriggerManagement />}
        {activeMenu === 'system-settings' && <SystemSettings />}
      </main>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}
