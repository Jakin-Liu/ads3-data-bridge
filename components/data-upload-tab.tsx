"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Wifi, Code, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { DataTable } from "@/components/data-table-management"

interface DataUploadTabProps {
  table: DataTable
}

interface TableDetail {
  id: number
  name: string
  aliasName: string
  status: string
  totalCount: number
  fieldCount: number
  createdAt: string
  updatedAt: string
  fields: Array<{
    id: string
    name: string
    aliasName: string
    fieldType: string
    originalType: string
    status: string
    required: boolean
  }>
  templateData: Array<Record<string, any>>
}

export function DataUploadTab({ table }: DataUploadTabProps) {
  const [uploadMethod, setUploadMethod] = useState("manual")
  const [tableDetail, setTableDetail] = useState<TableDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const apiUploadUrl = `https://api-databridge.ton.ai/api/v1/upload/${table.handle}`
  const mcpUploadUrl = `mcp://databridge.ai/v1/upload/${table.handle}`

  // 获取表格详情和模板数据
  useEffect(() => {
    const fetchTableDetail = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/v1/tables/detail?tableName=${table.handle}`)
        const result = await response.json()
        
        if (result.success) {
          setTableDetail(result.data)
        } else {
          console.error('获取表格详情失败:', result.message)
        }
      } catch (error) {
        console.error('获取表格详情失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTableDetail()
  }, [table.name])

  // 生成请求示例数据
  const generateRequestExample = () => {
    if (!tableDetail || !tableDetail.templateData || tableDetail.templateData.length === 0) {
      return [
        {
        }
      ]
    }
    
    return tableDetail.templateData
  }

  // 生成响应示例
  const generateResponseExample = () => {
    const exampleData = generateRequestExample()
    return {
      success: true,
      message: "数据上传成功",
      inserted: exampleData.length,
      errors: []
    }
  }

  return (
    <div className="space-y-6">
      {/* 上传方式选择 */}
      <Tabs value={uploadMethod} onValueChange={setUploadMethod} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 shadow-sm">
          <TabsTrigger
            value="manual"
            className="flex items-center space-x-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:border-green-200"
          >
            <Upload className="w-4 h-4" />
            <span>手动上传</span>
          </TabsTrigger>
          <TabsTrigger
            value="api"
            className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-blue-200"
          >
            <Wifi className="w-4 h-4" />
            <span>API 上传</span>
          </TabsTrigger>
          <TabsTrigger
            value="mcp"
            className="flex items-center space-x-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-purple-200"
          >
            <Code className="w-4 h-4" />
            <span>MCP 上传</span>
          </TabsTrigger>
        </TabsList>

        {/* 手动上传 */}
        <TabsContent value="manual" className="space-y-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Upload className="w-5 h-5 mr-3 text-green-500" />
                文件上传
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 上传区域 */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">拖拽文件到此处</h3>
                <p className="text-gray-600 mb-4">支持 CSV、JSON 格式文件，最大 100MB</p>
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  选择文件上传
                </Button>
              </div>

              {/* 格式要求 */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">格式要求</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• CSV 文件需包含表头，字段名与数据表定义一致</li>
                  <li>• JSON 文件支持单个对象或对象数组格式</li>
                  <li>• 必填字段不能为空，可选字段可以省略</li>
                  <li>• 时间字段请使用 ISO 8601 格式</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API 上传 */}
        <TabsContent value="api" className="space-y-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Wifi className="w-5 h-5 mr-3 text-blue-500" />
                API 上传接口
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 接口信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">接口地址</label>
                  <div className="flex items-center space-x-3">
                    <code className="flex-1 text-sm code-font text-blue-600 bg-gray-50 p-3 rounded border border-gray-200">
                      {apiUploadUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">请求方法</label>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      POST
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">内容类型</label>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      application/json
                    </Badge>
                  </div>
                </div>
              </div>



              {/* 请求示例 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">请求示例</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-white"
                    onClick={async () => {
                      const requestExample = `curl -X POST "${apiUploadUrl}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": ${JSON.stringify(generateRequestExample(), null, 2)}
  }'`
                      try {
                        await navigator.clipboard.writeText(requestExample)
                        toast({
                          title: "复制成功",
                          description: "请求示例已复制到剪贴板",
                        })
                      } catch (error) {
                        toast({
                          title: "复制失败",
                          description: "无法复制到剪贴板，请手动复制",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制示例
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="text-sm code-font text-gray-700 overflow-x-auto">
                    {`curl -X POST "${apiUploadUrl}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": ${JSON.stringify(generateRequestExample(), null, 2)}
  }'`}
                  </pre>
                </div>
              </div>

              {/* 响应示例 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">响应示例</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="text-sm code-font text-gray-700 overflow-x-auto">
                    {JSON.stringify(generateResponseExample(), null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MCP 上传 */}
        <TabsContent value="mcp" className="space-y-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Code className="w-5 h-5 mr-3 text-purple-500" />
                MCP 上传接口
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 接口信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MCP 地址</label>
                  <div className="flex items-center space-x-3">
                    <code className="flex-1 text-sm code-font text-purple-600 bg-gray-50 p-3 rounded border border-gray-200">
                      {mcpUploadUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-600 hover:bg-purple-50 bg-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">协议版本</label>
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                      MCP v1.0
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">传输方式</label>
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                      JSON-RPC
                    </Badge>
                  </div>
                </div>
              </div>

              {/* MCP 配置示例 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">MCP 客户端配置</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="text-sm code-font text-gray-700 overflow-x-auto">
                    {`{
  "mcpServers": {
    "databridge": {
      "command": "npx",
      "args": ["@ai-databridge/mcp-server"],
      "env": {
        "DATABRIDGE_API_KEY": "your-api-key",
        "DATABRIDGE_ENDPOINT": "${mcpUploadUrl}"
      }
    }
  }
}`}
                  </pre>
                </div>
              </div>

              {/* 使用示例 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">使用示例</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="text-sm code-font text-gray-700 overflow-x-auto">
                    {`// 通过 MCP 上传数据
await mcp.call("databridge/upload", {
  table: "${table.handle}",
  data: ${JSON.stringify(generateRequestExample(), null, 2)}
});`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
