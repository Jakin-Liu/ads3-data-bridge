"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Wifi, Code, Copy } from "lucide-react"
import type { DataTable } from "@/components/data-table-management"

interface DataUploadTabProps {
  table: DataTable
}

export function DataUploadTab({ table }: DataUploadTabProps) {
  const [uploadMethod, setUploadMethod] = useState("manual")

  const apiUploadUrl = `https://api.databridge.ai/v1/upload/${table.handle}`
  const mcpUploadUrl = `mcp://databridge.ai/v1/upload/${table.handle}`

  return (
    <div className="space-y-6">
      {/* 上传方式选择 */}
      <Tabs value={uploadMethod} onValueChange={setUploadMethod} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger
            value="manual"
            className="flex items-center space-x-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
          >
            <Upload className="w-4 h-4" />
            <span>手动上传</span>
          </TabsTrigger>
          <TabsTrigger
            value="api"
            className="flex items-center space-x-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            <Wifi className="w-4 h-4" />
            <span>API 上传</span>
          </TabsTrigger>
          <TabsTrigger
            value="mcp"
            className="flex items-center space-x-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <Code className="w-4 h-4" />
            <span>MCP 上传</span>
          </TabsTrigger>
        </TabsList>

        {/* 手动上传 */}
        <TabsContent value="manual" className="space-y-6">
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Upload className="w-5 h-5 mr-3 text-green-400" />
                文件上传
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 上传区域 */}
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-green-500/50 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">拖拽文件到此处</h3>
                <p className="text-slate-400 mb-4">支持 CSV、JSON 格式文件，最大 100MB</p>
                <Button className="tech-gradient hover:opacity-90">
                  <Upload className="w-4 h-4 mr-2" />
                  选择文件上传
                </Button>
              </div>

              {/* 格式要求 */}
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <h4 className="font-medium text-white mb-2">格式要求</h4>
                <ul className="text-sm text-slate-400 space-y-1">
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
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wifi className="w-5 h-5 mr-3 text-blue-400" />
                API 上传接口
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 接口信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">接口地址</label>
                  <div className="flex items-center space-x-3">
                    <code className="flex-1 text-sm code-font text-blue-400 bg-slate-900/50 p-3 rounded border border-slate-700/30">
                      {apiUploadUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">请求方法</label>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                      POST
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">内容类型</label>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                      application/json
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 请求示例 */}
              <div>
                <h4 className="font-medium text-white mb-3">请求示例</h4>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                  <pre className="text-sm code-font text-slate-300 overflow-x-auto">
                    {`curl -X POST "${apiUploadUrl}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "data": [
      {
        "user_id": "user_12345",
        "action_type": "page_view",
        "timestamp": "2024-01-15T14:30:25Z",
        "metadata": {"page": "/dashboard"}
      }
    ]
  }'`}
                  </pre>
                </div>
              </div>

              {/* 响应示例 */}
              <div>
                <h4 className="font-medium text-white mb-3">响应示例</h4>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                  <pre className="text-sm code-font text-slate-300 overflow-x-auto">
                    {`{
  "success": true,
  "message": "数据上传成功",
  "inserted": 1,
  "errors": []
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MCP 上传 */}
        <TabsContent value="mcp" className="space-y-6">
          <Card className="tech-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Code className="w-5 h-5 mr-3 text-purple-400" />
                MCP 上传接口
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 接口信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">MCP 地址</label>
                  <div className="flex items-center space-x-3">
                    <code className="flex-1 text-sm code-font text-purple-400 bg-slate-900/50 p-3 rounded border border-slate-700/30">
                      {mcpUploadUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">协议版本</label>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      MCP v1.0
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">传输方式</label>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      JSON-RPC
                    </Badge>
                  </div>
                </div>
              </div>

              {/* MCP 配置示例 */}
              <div>
                <h4 className="font-medium text-white mb-3">MCP 客户端配置</h4>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                  <pre className="text-sm code-font text-slate-300 overflow-x-auto">
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
                <h4 className="font-medium text-white mb-3">使用示例</h4>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                  <pre className="text-sm code-font text-slate-300 overflow-x-auto">
                    {`// 通过 MCP 上传数据
await mcp.call("databridge/upload", {
  table: "${table.handle}",
  data: [
    {
      user_id: "user_12345",
      action_type: "page_view",
      timestamp: "2024-01-15T14:30:25Z"
    }
  ]
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
