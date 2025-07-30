"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Code, Loader2 } from "lucide-react"
import type { DataTable } from "@/components/data-table-management"

interface DataFieldsTabProps {
  table: DataTable
}

interface FieldInfo {
  name: string
  type: string
  original_type: string
  required: boolean
}

interface RecordData {
  id: number
  fields: string[]
  values: any[]
}

interface ApiResponse {
  success: boolean
  data?: {
    tableInfo: {
      id: number
      name: string
    }
    fields: FieldInfo[]
    records: RecordData[]
    total: number
    limit: number
    tableName: string
  }
  error?: string
  message?: string
}

export function DataFieldsTab({ table }: DataFieldsTabProps) {
  const [fields, setFields] = useState<FieldInfo[]>([])
  const [records, setRecords] = useState<RecordData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 调用API获取表格数据
        const response = await fetch(`/api/v1/tables/data?tableId=${table.id}`)
        const result: ApiResponse = await response.json()
        
        if (result.success && result.data) {
          setFields(result.data.fields)
          setRecords(result.data.records)
        } else {
          setError(result.message || '获取数据失败')
        }
      } catch (err) {
        setError('网络请求失败')
        console.error('获取表格数据失败:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTableData()
  }, [table.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-3 text-blue-500" />
              字段定义
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-600">加载字段信息中...</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Code className="w-5 h-5 mr-3 text-green-500" />
              数据示例
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
              <span className="ml-2 text-gray-600">加载数据中...</span>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-red-500 mb-2">加载失败</div>
                <div className="text-sm text-gray-600">{error}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 字段定义 */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-3 text-blue-500" />
              字段定义
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="code-font text-blue-600 font-medium">{field.name}</span>
                    {field.required && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                        必填
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      field.type === "String"
                        ? "bg-green-50 text-green-600 border-green-200"
                        : field.type === "Number"
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : field.type === "DateTime"
                            ? "bg-purple-50 text-purple-600 border-purple-200"
                            : field.type === "Boolean"
                              ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {field.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 数据示例 - 表格形式 */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Code className="w-5 h-5 mr-3 text-green-500" />
              数据示例 (最近{records.length}条)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200 max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {fields.slice(0, 4).map((field) => (
                        <th key={field.name} className="text-left p-2 text-xs font-medium text-gray-700 code-font">
                          {field.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 10).map((record, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        {record.values.slice(0, 4).map((value, valueIndex) => (
                          <td key={valueIndex} className="p-2 text-xs code-font text-gray-700">
                            {typeof value === 'string' && value.length > 20 
                              ? `${value.substring(0, 20)}...` 
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600">
                显示最近 {Math.min(records.length, 10)} 条数据记录，仅展示前 4 个字段。完整数据包含 {fields.length} 个字段。
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
