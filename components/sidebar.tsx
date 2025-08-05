'use client'

import { cn } from '@/lib/utils'
import { Database, Settings, Cpu, Zap, Activity, User, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/contexts/auth-context'

interface SidebarProps {
  activeMenu: string
  onMenuChange: (menu: string) => void
}

export function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  const { user, isAuthenticated, logout, error } = useAuth()

  const menuItems = [
    {
      id: 'data-tables',
      label: '数据表管理',
      icon: Database,
    },
    {
      id: 'data-triggers',
      label: '数据触发',
      icon: Zap,
    },
    {
      id: 'system-settings',
      label: '系统设置',
      icon: Settings,
    },
  ]

  return (
    <div className="w-72 bg-white/80 border-r border-slate-200/80 backdrop-blur-xl flex flex-col relative">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-purple-50/30 pointer-events-none" />

      {/* Logo */}
      <div className="p-6 border-b border-slate-200/60 relative">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 elegant-gradient rounded-xl flex items-center justify-center relative overflow-hidden elegant-shadow">
              <Cpu className="w-6 h-6 text-white relative z-10" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold elegant-text-gradient">AI 数据中枢</h1>
            <p className="text-xs text-blue-600 code-font">DataBridge v2.0</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2 mt-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-600">系统运行正常</span>
          </div>
          <div className="flex items-center space-x-1 ml-4">
            <Activity className="w-3 h-3 text-blue-500" />
            <span className="text-blue-600">实时监控</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 relative">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeMenu === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onMenuChange(item.id)}
                  className={cn(
                    'w-full flex items-center space-x-4 p-4 rounded-xl text-left transition-all duration-300 relative group',
                    isActive
                      ? 'elegant-card elegant-shadow-lg bg-gradient-to-r from-blue-50 to-purple-50'
                      : 'hover:bg-slate-50/80 hover:border-blue-200/50 border border-transparent'
                  )}
                >
                  <div className="relative">
                    <Icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600')} />
                  </div>
                  <div className="relative">
                    <div className={cn('font-medium transition-colors', isActive ? 'text-slate-800' : 'text-slate-600 group-hover:text-slate-800')}>
                      {item.label}
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    </div>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-200/60 relative space-y-3">
        {/* Error Message */}
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {isAuthenticated && user ? (
          <div className="flex items-center space-x-3 p-3 rounded-xl elegant-card elegant-shadow">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar} alt={user.name || user.email} />
              <AvatarFallback className="elegant-gradient text-white text-sm font-medium">
                {(user.name || user.email || 'U')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-slate-800 truncate">{user.name || user.email}</p>
                {user.isAdmin && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Admin</span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 text-slate-400">
                  <LogOut className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="elegant-card">
                <AlertDialogHeader>
                  <AlertDialogTitle className="elegant-text-gradient">确认退出登录</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-600">您确定要退出登录吗？退出后需要重新登录才能访问系统。</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="hover:bg-slate-100">取消</AlertDialogCancel>
                  <AlertDialogAction onClick={logout} className="bg-red-500 hover:bg-red-600 text-white">
                    确认退出
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <Button
            className="w-full elegant-gradient text-white font-medium rounded-xl hover:opacity-90 transition-all duration-300 elegant-shadow"
            onClick={() => {
              /* Login will be handled by parent component */
            }}
          >
            <User className="w-4 h-4 mr-2" />
            Login
          </Button>
        )}

        {/* System Status */}
        <div className="text-xs text-slate-500 code-font">
          <div className="flex justify-between items-center">
            <span>Build 2024.01.15</span>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600">在线</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
