import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 根据当前域名动态生成API基础URL
 * 在客户端环境中使用当前域名，在服务端环境中使用默认域名
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // 客户端环境，使用当前域名
    const protocol = window.location.protocol
    const host = window.location.host
    return `${protocol}//${host}`
  }
  // 服务端环境，使用默认域名
  return 'https://data.ads3.ai'
}
