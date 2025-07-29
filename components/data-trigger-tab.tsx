"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Square, Zap, Clock, Plus, Bot, Globe, AlertTriangle, Eye, Play } from "lucide-react"
import type { DataTable } from "@/components/data-table-management"

interface DataTriggerTabProps {
  table: DataTable
}

export function DataTriggerTab({ table }: DataTriggerTabProps) {
  const [triggerType, setTriggerType] = useState<"schedule" | "increment" | "immediate">("schedule")
  const [triggerTarget, setTriggerTarget] = useState<"agent" | "url">("agent")
  const [scheduleInterval, setScheduleInterval] = useState("60")
  const [incrementCount, setIncrementCount] = useState("10")
  const [agentId, setAgentId] = useState("")
  const [triggerUrl, setTriggerUrl] = useState("")
  const [selectedTriggerFields, setSelectedTriggerFields] = useState<string[]>(["user_id", "action_type", "timestamp"])

  const toggleTriggerFieldSelection = (fieldName: string) => {
    setSelectedTriggerFields((prev) =>
      prev.includes(fieldName) ? prev.filter((f) => f !== fieldName) : [...prev, fieldName],
    )
  }

  const canEnableScheduleTrigger = table.totalRecords < 1000

  return (
    <div className="space-y-6">
      {/* 触发器开关 */}
      <Card className="elegant-card elegant-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-800 flex items-center mb-2">
                <Zap className="w-5 h-5 mr-3 text-yellow-400" />
                智能触发器
              </CardTitle>
              <p className="text-sm text-slate-500">自动化数据推送到指定目标</p>
            </div>
            <Switch checked={table.triggerEnabled} className="data-[state=checked]:bg-yellow-500" />
          </div>
        </CardHeader>
      </Card>

      {table.triggerEnabled && (
        <>
          {/* 触发推送字段配置 */}
          <Card className="elegant-card elegant-shadow">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center">
                <CheckSquare className="w-5 h-5 mr-3 text-purple-400" />
                触发推送字段
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {table.fields.map((field) => (
                  <div
                    key={field.name}
                    className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer border border-slate-200"
                    onClick={() => toggleTriggerFieldSelection(field.name)}
                  >
                    {selectedTriggerFields.includes(field.name) ? (
                      <CheckSquare className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                    <div className="flex-1">
                      <span className="text-sm code-font text-slate-600">{field.name}</span>
                      <div className="text-xs text-slate-500">({field.type})</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-sm text-slate-500">
                  已选择 <span className="text-purple-400 font-semibold">{selectedTriggerFields.length}</span> 个字段：
                  <span className="code-font text-slate-600 ml-2">{selectedTriggerFields.join(", ")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 触发方式选择 */}
          <Card className="elegant-card elegant-shadow">
            <CardHeader>
              <CardTitle className="text-slate-800">触发方式</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-white ${
                    triggerType === "schedule"
                      ? "border-yellow-500/50 bg-yellow-500/10"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                  onClick={() => setTriggerType("schedule")}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium text-slate-800">定时任务触发</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">按设定间隔分批推送所有数据</p>
                  {!canEnableScheduleTrigger && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-400">数据量需 {"<"} 1000 条</span>
                    </div>
                  )}
                </div>
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-white ${
                    triggerType === "increment"
                      ? "border-yellow-500/50 bg-yellow-500/10"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                  onClick={() => setTriggerType("increment")}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Plus className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium text-slate-800">数据新增触发</span>
                  </div>
                  <p className="text-sm text-slate-500">新增指定条数时自动触发</p>
                </div>
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-white ${
                    triggerType === "immediate"
                      ? "border-yellow-500/50 bg-yellow-500/10"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                  onClick={() => setTriggerType("immediate")}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Play className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium text-slate-800">立即触发</span>
                  </div>
                  <p className="text-sm text-slate-500">手动立即推送当前数据</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 触发方式配置 */}
          <Card className="elegant-card elegant-shadow">
            <CardHeader>
              <CardTitle className="text-slate-800">触发配置</CardTitle>
            </CardHeader>
            <CardContent>
              {triggerType === "schedule" && canEnableScheduleTrigger && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">推送间隔（分钟）</label>
                  <Input
                    type="number"
                    value={scheduleInterval}
                    onChange={(e) => setScheduleInterval(e.target.value)}
                    placeholder="60"
                    className="bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20"
                  />
                  <p className="text-xs text-slate-500 mt-2">系统将每 {scheduleInterval} 分钟推送一批数据到目标</p>
                </div>
              )}

              {triggerType === "increment" && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">触发条数</label>
                  <Input
                    type="number"
                    value={incrementCount}
                    onChange={(e) => setIncrementCount(e.target.value)}
                    placeholder="10"
                    className="bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20"
                  />
                  <p className="text-xs text-slate-500 mt-2">当新增 {incrementCount} 条数据时自动触发推送</p>
                </div>
              )}

              {triggerType === "immediate" && (
                <div className="text-center py-8">
                  <Button className="elegant-gradient hover:opacity-90 text-white">
                    <Play className="w-5 h-5 mr-2" />
                    立即触发推送
                  </Button>
                  <p className="text-sm text-slate-500 mt-3">点击按钮将立即推送当前数据到配置的目标</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 触发目标选择 */}
          <Card className="elegant-card elegant-shadow">
            <CardHeader>
              <CardTitle className="text-slate-800">触发目标</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-white ${
                    triggerTarget === "agent"
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                  onClick={() => setTriggerTarget("agent")}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Bot className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-slate-800">Maybe Agent</span>
                  </div>
                  <p className="text-sm text-slate-500">推送到指定的AI Agent</p>
                </div>
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-white ${
                    triggerTarget === "url"
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                  onClick={() => setTriggerTarget("url")}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Globe className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-slate-800">自定义 URL</span>
                  </div>
                  <p className="text-sm text-slate-500">推送到自定义的API端点</p>
                </div>
              </div>

              {/* 目标配置 */}
              {triggerTarget === "agent" && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Agent ID</label>
                  <Input
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    placeholder="输入 Maybe Agent ID"
                    className="bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20"
                  />
                  <p className="text-xs text-slate-500 mt-2">数据将推送到指定的 Maybe Agent 进行处理</p>
                </div>
              )}

              {triggerTarget === "url" && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">触发 URL</label>
                  <Input
                    value={triggerUrl}
                    onChange={(e) => setTriggerUrl(e.target.value)}
                    placeholder="https://your-api.com/webhook"
                    className="bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20"
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                      POST
                    </Badge>
                    <span className="text-xs text-slate-500">数据将通过 POST 方式提交</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 配置预览 */}
          <Card className="elegant-card elegant-shadow">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center">
                <Eye className="w-5 h-5 mr-3 text-slate-400" />
                配置预览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500 space-y-2">
                <div>
                  <span className="text-yellow-400">触发方式:</span>{" "}
                  {triggerType === "schedule"
                    ? `定时任务 (每 ${scheduleInterval} 分钟)`
                    : triggerType === "increment"
                      ? `数据新增 (每 ${incrementCount} 条)`
                      : "立即触发"}
                </div>
                <div>
                  <span className="text-yellow-400">触发目标:</span>{" "}
                  {triggerTarget === "agent"
                    ? `Maybe Agent (${agentId || "未设置"})`
                    : `自定义URL (${triggerUrl || "未设置"})`}
                </div>
                <div>
                  <span className="text-yellow-400">推送字段:</span> {selectedTriggerFields.join(", ")}
                </div>
                <div>
                  <span className="text-yellow-400">数据表:</span> {table.handle}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
