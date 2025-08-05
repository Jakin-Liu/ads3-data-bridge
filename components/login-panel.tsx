'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'

export function LoginPanel() {
  const { login, error } = useAuth()

  const handleLogin = () => {
    // Mock user data - 模拟用户数据
    // const mockUser = {
    //   id: '1',
    //   name: 'Eason C',
    //   email: 'eason@ads3.network',
    //   avatar: '/placeholder-user.jpg',
    // }
    // // 模拟登录成功
    // login(mockUser)
    const authUrl = `https://admin.task3.org/auth?auth_type=task3_auth&redirect_url=${window.location.href}`
    window?.open(authUrl, '_self')
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 pointer-events-none" />

      <Card className="w-full max-w-md mx-4 elegant-card elegant-shadow-xl relative">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 elegant-gradient rounded-xl flex items-center justify-center elegant-shadow">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold elegant-text-gradient">Welcome</CardTitle>
            <CardDescription className="text-slate-600 mt-2">Login with your Ads3 account</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <Button
            onClick={handleLogin}
            className="w-full h-12 elegant-gradient text-white font-medium rounded-xl hover:opacity-90 transition-all duration-300 elegant-shadow"
          >
            Login with Ads3
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
