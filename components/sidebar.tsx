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
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { user, isAuthenticated, logout, error } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    {
      id: 'data-tables',
      label: '数据表管理',
      icon: Database,
      path: '/data-tables'
    },
    {
      id: 'system-settings',
      label: '系统设置',
      icon: Settings,
      path: '/system-settings'
    },
  ]

  return (
    <div className={cn("w-56 bg-white/80 border-r border-slate-200/80 backdrop-blur-xl flex flex-col relative", className)}>
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-purple-50/30 pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="p-4 border-b border-slate-200/60 relative block">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="w-8 h-8 elegant-gradient rounded-lg flex items-center justify-center relative overflow-hidden elegant-shadow">
              <Cpu className="w-5 h-5 text-white relative z-10" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold elegant-text-gradient">AI 数据桥</h1>
            <p className="text-[10px] text-blue-600 code-font">DataBridge v1.0</p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-3 relative">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <li key={item.id}>
                <Link
                  href={item.path}
                  className={cn(
                    'w-full flex items-center space-x-3 p-2.5 rounded-lg text-left transition-all duration-300 relative group',
                    isActive
                      ? 'elegant-card elegant-shadow-lg bg-gradient-to-r from-blue-50 to-purple-50'
                      : 'hover:bg-slate-50/80 hover:border-blue-200/50 border border-transparent'
                  )}
                >
                  <div className="relative">
                    <Icon className={cn('w-4 h-4 transition-colors', isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600')} />
                  </div>
                  <div className="relative">
                    <div className={cn('font-medium text-sm transition-colors', isActive ? 'text-slate-800' : 'text-slate-600 group-hover:text-slate-800')}>
                      {item.label}
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-slate-200/60 relative space-y-2">
        {/* Error Message */}
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {isAuthenticated && user ? (
          <div className="flex items-center space-x-2 p-2 rounded-lg elegant-card elegant-shadow">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar} alt={user.name || user.email} />
              <AvatarFallback className="elegant-gradient text-white text-xs font-medium">
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
                <p className="text-xs font-medium text-slate-800 truncate">{user.name || user.email}</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 text-slate-400">
                  <LogOut className="w-3.5 h-3.5" />
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
            className="w-full elegant-gradient text-white font-medium rounded-lg hover:opacity-90 transition-all duration-300 elegant-shadow text-xs h-8"
            onClick={() => router.push('/login')}
          >
            <User className="w-3.5 h-3.5 mr-1.5" />
            Login
          </Button>
        )}
      </div>
    </div>
  )
}
