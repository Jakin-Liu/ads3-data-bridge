import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 数据桥',
  description: '智能数据处理平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
