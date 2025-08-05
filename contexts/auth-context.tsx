'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useUser } from '@/hooks/use-user'

interface User {
  id: string
  name?: string // nickName 映射到 name
  email: string
  avatar?: string
  description?: string
  handler?: string
  interestedTags?: string[]
  social?: {
    wallet_address?: string
    twitter?: any
    discord?: any
    telegram?: any
  }
  isAdmin?: boolean
  language?: string
  lastLoginTime?: string
  [key: string]: any // 允许其他字段
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, error, fetchUserInfo, clearUser, setUser } = useUser()

  // 在初始化时检查token和本地存储的用户信息
  useEffect(() => {
    let isInitialized = false

    const initializeAuth = async () => {
      // 防止重复初始化
      if (isInitialized) return
      isInitialized = true

      // 检查URL中的token参数
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')

        if (token) {
          console.log('发现URL中的token，开始登录流程')
          // 存储token到localStorage
          localStorage.setItem('auth_token', token)

          // 从URL中移除token参数
          urlParams.delete('token')
          const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
          window.history.replaceState({}, document.title, newUrl)

          // 获取用户信息
          await fetchUserInfo(token)
        } else {
          // 检查localStorage中是否有token
          const storedToken = localStorage.getItem('auth_token')
          if (storedToken) {
            console.log('发现本地存储的token，恢复登录状态')
            await fetchUserInfo(storedToken)
          }
        }
      }
    }

    initializeAuth()
  }, []) // 移除fetchUserInfo依赖，只在组件挂载时执行一次

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    // 清除用户数据
    clearUser()
    // 清除存储的token
    localStorage?.removeItem('auth_token')
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
