'use client'

import { useState, useCallback } from 'react'

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

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserInfo = useCallback(async (token: string): Promise<User | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('https://api.task3.org/api/v1/user/info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      })

      if (!response.ok) {
        throw new Error(`获取用户信息失败: ${response.status}`)
      }

      const apiResponse = await response.json()

      // 调试信息：打印API返回的完整响应
      console.log('API返回的完整响应:', apiResponse)

      // 检查响应格式
      if (apiResponse.code !== 0 || !apiResponse.data) {
        throw new Error(apiResponse.message || '获取用户信息失败')
      }

      const userData = apiResponse.data

      // 根据实际API结构处理用户数据
      const processedUser = {
        id: userData.userId,
        name: userData.nickName,
        email: userData.email,
        avatar: userData.avatar,
        // 保留其他有用的字段
        description: userData.description,
        handler: userData.handler,
        interestedTags: userData.interestedTags,
        social: userData.social,
        isAdmin: userData.isAdmin,
        language: userData.language,
        lastLoginTime: userData.lastLoginTime,
        ...userData, // 保留所有原始字段
      }

      console.log('处理后的用户数据:', processedUser)
      setUser(processedUser)
      return processedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户信息失败'
      setError(errorMessage)
      console.error('Failed to fetch user info:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearUser = useCallback(() => {
    setUser(null)
    setError(null)
  }, [])

  return {
    user,
    loading,
    error,
    fetchUserInfo,
    clearUser,
    setUser,
  }
}
