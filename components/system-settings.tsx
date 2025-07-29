"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Shield, Clock } from "lucide-react"

export function SystemSettings() {
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKey((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const mockApiKeys = [
    {
      id: "1",
      name: "Production API Key",
      key: "ak_prod_1234567890abcdef",
      permissions: ["read", "write"],
      lastUsed: "2024-01-15 14:30",
      status: "active",
    },
    {
      id: "2",
      name: "Development API Key",
      key: "ak_dev_abcdef1234567890",
      permissions: ["read"],
      lastUsed: "2024-01-14 09:15",
      status: "active",
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold elegant-text-gradient mb-2">系统设置</h1>
        <p className="text-slate-600">API密钥管理与系统配置中心</p>
      </div>

      <Card className="elegant-card elegant-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 flex items-center">
              <Key className="w-5 h-5 mr-3 text-blue-500" />
              API 密钥管理
            </CardTitle>
            <Button className="elegant-gradient hover:opacity-90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              新建密钥
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockApiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="elegant-card p-6 rounded-xl hover:border-blue-300 transition-all duration-300 elegant-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="font-medium text-slate-800">{apiKey.name}</h3>
                      <Badge
                        variant={apiKey.status === "active" ? "default" : "secondary"}
                        className={
                          apiKey.status === "active"
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }
                      >
                        {apiKey.status === "active" ? "活跃" : "已禁用"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <code className="bg-slate-50 px-3 py-2 rounded border border-slate-200 text-xs code-font text-blue-600">
                            {showApiKey[apiKey.id] ? apiKey.key : "••••••••••••••••"}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleApiKeyVisibility(apiKey.id)}
                            className="text-slate-500 hover:text-blue-500"
                          >
                            {showApiKey[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-slate-500">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-purple-500" />
                          <span>权限: {apiKey.permissions.join(", ")}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span>最后使用: {apiKey.lastUsed}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
