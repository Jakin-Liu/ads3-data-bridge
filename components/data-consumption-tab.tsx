"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CheckSquare, Square, Wifi, Code, Copy } from "lucide-react"
import type { DataTable } from "@/components/data-table-management"

interface DataConsumptionTabProps {
  table: DataTable
}

export function DataConsumptionTab({ table }: DataConsumptionTabProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>(["user_id", "action_type", "timestamp"])

  const toggleFieldSelection = (fieldName: string) => {
    setSelectedFields((prev) => (prev.includes(fieldName) ? prev.filter((f) => f !== fieldName) : [...prev, fieldName]))
  }

  const generateApiUrl = () => {
    const baseUrl = "https://api.databridge.ai/v1/consume"
    const params = new URLSearchParams({
      table: table.handle,
      fields: selectedFields.join(","),
    })
    return `${baseUrl}?${params.toString()}`
  }

  const generateMcpUrl = () => {
    const baseUrl = "mcp://databridge.ai/v1/consume"
    const params = new URLSearchParams({
      table: table.handle,
      fields: selectedFields.join(","),
    })
    return `${baseUrl}?${params.toString()}`
  }

  return (
    <div className="space-y-6">
      {/* 推送字段选择 */}
      <Card className="tech-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CheckSquare className="w-5 h-5 mr-3 text-purple-400" />
            推送字段配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {table.fields.map((field) => (
              <div
                key={field.name}
                className="flex items-center space-x-3 p-3 hover:bg-slate-800/30 rounded-lg cursor-pointer border border-slate-700/30"
                onClick={() => toggleFieldSelection(field.name)}
              >
                {selectedFields.includes(field.name) ? (
                  <CheckSquare className="w-4 h-4 text-purple-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <div className="flex-1">
                  <span className="text-sm code-font text-slate-300">{field.name}</span>
                  <div className="text-xs text-slate-500">({field.type})</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
            <div className="text-sm text-slate-400">
              已选择 <span className="text-purple-400 font-semibold">{selectedFields.length}</span> 个字段：
              <span className="code-font text-slate-300 ml-2">{selectedFields.join(", ")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API 消费配置 */}
      <Card className="tech-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Wifi className="w-5 h-5 mr-3 text-blue-400" />
              API 消费配置
            </CardTitle>
            <Switch checked={table.apiEnabled} className="data-[state=checked]:bg-blue-500" />
          </div>
        </CardHeader>
        {table.apiEnabled && (
          <CardContent>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="text-slate-400 mb-3 text-sm">API 消费地址</div>
              <div className="flex items-center space-x-3">
                <code className="flex-1 text-sm code-font text-blue-400 bg-slate-900/50 p-3 rounded border border-slate-700/30">
                  {generateApiUrl()}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-2">通过此地址可以消费数据表中的指定字段数据</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* MCP 消费配置 */}
      <Card className="tech-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Code className="w-5 h-5 mr-3 text-purple-400" />
              MCP 消费配置
            </CardTitle>
            <Switch checked={table.mcpEnabled} className="data-[state=checked]:bg-purple-500" />
          </div>
        </CardHeader>
        {table.mcpEnabled && (
          <CardContent>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="text-slate-400 mb-3 text-sm">MCP 协议地址</div>
              <div className="flex items-center space-x-3">
                <code className="flex-1 text-sm code-font text-purple-400 bg-slate-900/50 p-3 rounded border border-slate-700/30">
                  {generateMcpUrl()}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-2">通过 MCP 协议消费数据表中的指定字段数据</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
