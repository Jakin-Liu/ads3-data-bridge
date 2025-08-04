"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Wifi, Code, Copy, Loader2 } from "lucide-react"
import { getApiBaseUrl } from "@/lib/utils"
import type { DataTable } from "@/components/data-table-management"

interface Field {
  id: string
  name: string
  aliasName: string
  fieldType: string
  originalType: string
  status: string
  required: boolean
}

interface DataConsumptionTabProps {
  table: DataTable
}

export function DataConsumptionTab({ table }: DataConsumptionTabProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [availableFields, setAvailableFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 从API获取字段信息
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/v1/tables/detail?tableName=${table.handle}`)
        const result = await response.json()
        
        if (result.success && result.data.fields) {
          setAvailableFields(result.data.fields)
          // 默认选择前3个字段
          const defaultFields = result.data.fields.slice(0, 3).map((field: Field) => field.name)
          setSelectedFields(defaultFields)
        } else {
          setError(result.message || '获取字段信息失败')
        }
      } catch (err) {
        setError('网络错误，无法获取字段信息')
        console.error('获取字段信息失败:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFields()
  }, [table.name])

  const toggleFieldSelection = (fieldName: string) => {
    setSelectedFields((prev) => 
      prev.includes(fieldName) 
        ? prev.filter((f) => f !== fieldName) 
        : [...prev, fieldName]
    )
  }

  const selectAllFields = () => {
    setSelectedFields(availableFields.map(field => field.name))
  }

  const deselectAllFields = () => {
    setSelectedFields([])
  }



  const generateApiUrl = () => {
    const baseUrl = `${getApiBaseUrl()}/api/v1/consume/${table.handle}`
    const params = new URLSearchParams()
    params.append('consumer', 'api')
    selectedFields.forEach(field => {
      params.append('fields', field)
    })
    return `${baseUrl}?${params.toString()}`
  }

  const generateMcpUrl = () => {
    const baseUrl = `${getApiBaseUrl()}/api/v1/consume/${table.handle}`
    const params = new URLSearchParams()
    params.append('consumer', 'mcp')
    selectedFields.forEach(field => {
      params.append('fields', field)
    })
    return `${baseUrl}?${params.toString()}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-gray-600">正在加载字段信息...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="py-12">
            <div className="text-center text-red-600">
              <p>加载失败: {error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 推送字段选择 */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">
            推送字段配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableFields.map((field) => (
              <div
                key={field.name}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
              >
                <Checkbox
                  checked={selectedFields.includes(field.name)}
                  onCheckedChange={() => toggleFieldSelection(field.name)}
                  className="text-purple-600"
                />
                <div className="flex-1">
                  <span className="text-sm code-font text-gray-700">{field.name}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">
              已选择 <span className="text-purple-600 font-semibold">{selectedFields.length}</span> 个字段：
              <span className="code-font text-gray-700 ml-2">{selectedFields.join(", ")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API 消费配置 */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Wifi className="w-5 h-5 mr-3 text-blue-600" />
            API 消费配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-gray-600 mb-3 text-sm">API 消费地址</div>
            <div className="flex items-center space-x-3">
              <code className="flex-1 text-sm code-font text-blue-600 bg-white p-3 rounded border border-gray-200">
                {generateApiUrl()}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-blue-600 hover:bg-blue-50 bg-white"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">通过此地址可以消费数据表中的指定字段数据</p>
          </div>
        </CardContent>
      </Card>

      {/* MCP 消费配置 */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Code className="w-5 h-5 mr-3 text-purple-600" />
            MCP 消费配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-gray-600 mb-3 text-sm">MCP 协议地址</div>
            <div className="flex items-center space-x-3">
              <code className="flex-1 text-sm code-font text-purple-600 bg-white p-3 rounded border border-gray-200">
                {generateMcpUrl()}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/30 text-purple-600 hover:bg-purple-50 bg-white"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">通过 MCP 协议消费数据表中的指定字段数据</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}