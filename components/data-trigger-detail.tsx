"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Square, ArrowLeft, Zap, Clock, Plus, Bot, Globe, AlertTriangle, Eye, Play } from "lucide-react"
import type { DataTrigger } from "@/components/data-trigger-management"

interface DataTriggerDetailProps {
  trigger: DataTrigger | null
  isCreating: boolean
  onBack: () => void
}

export function DataTriggerDetail({ trigger, isCreating, onBack }: DataTriggerDetailProps) {
  const [triggerName, setTriggerName] = useState(trigger?.name || "")
  const [selectedTable, setSelectedTable] = useState(trigger?.tableId || "")
  const [triggerType, setTriggerType] = useState<"schedule" | "increment" | "immediate">(
    trigger?.triggerType || "schedule",
  )
  const [triggerTarget, setTriggerTarget] = useState<"agent" | "url">(trigger?.triggerTarget || "agent")
  const [scheduleInterval, setScheduleInterval] = useState(trigger?.scheduleInterval || "60")
  const [incrementCount, setIncrementCount] = useState(trigger?.incrementCount || "10")
  const [agentId, setAgentId] = useState(trigger?.agentId || "")
  const [triggerUrl, setTriggerUrl] = useState(trigger?.triggerUrl || "")
  const [selectedFields, setSelectedFields] = useState<string[]>(trigger?.selectedFields || [])
  const [enabled, setEnabled] = useState(trigger?.enabled || false)

  // 模拟数据表选项
  const tableOptions = [
    {
      id: "1",
      name: "用户行为数据",
      handle: "user_behavior",
      fields: ["user_id", "action_type", "timestamp", "page_url", "device_type"],
    },
    {
      id: "2",
      name: "产品销售记录",
      handle: "product_sales",
      fields: ["order_id", "product_id", "customer_id", "price", "created_at"],
    },
    {
      id: "3",
      name: "客户反馈数据",
      handle: "customer_feedback",
      fields: ["feedback_id", "customer_id", "rating", "comment"],
    },
  ]

  const selectedTableData = tableOptions.find((t) => t.id === selectedTable)
  const availableFields = selectedTableData?.fields || []

  const toggleFieldSelection = (fieldName: string) => {
    setSelectedFields((prev) => (prev.includes(fieldName) ? prev.filter((f) => f !== fieldName) : [...prev, fieldName]))
  }

  const canEnableScheduleTrigger = true // 简化逻辑

  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-slate-200 text-slate-500 hover:bg-slate-50 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 elegant-gradient rounded-xl flex items-center justify-center elegant-shadow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{isCreating ? "新建触发器" : trigger?.name}</h1>
              <p className="text-sm text-slate-500">{isCreating ? "配置自动化数据推送触发器" : "编辑触发器配置"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
        <Card className="elegant-card elegant-shadow">
          <CardHeader>
            <CardTitle className="text-slate-800">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">触发器名称</label>
                <Input
                  value={triggerName}
                  onChange={(e) => setTriggerName(e.target.value)}
                  placeholder="输入触发器名称"
                  className="bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">关联数据表</label>
                <select
                  value={selectedTable}
                  onChange={(e) => {
                    setSelectedTable(e.target.value)
                    setSelectedFields([]) // 重置字段选择
                  }}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 text-sm focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20"
                >
                  <option value="">选择数据表</option>
                  {tableOptions.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.name} ({table.handle})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800">启用状态</h4>
                <p className="text-sm text-slate-500">控制触发器是否自动执行</p>
              </div>
              <Switch checked={enabled} onCheckedChange={setEnabled} className="data-[state=checked]:bg-yellow-500" />
            </div>
          </CardContent>
        </Card>

        {selectedTable && (
          <>
            {/* 推送字段配置 */}
            <Card className="elegant-card elegant-shadow">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center">
                  <CheckSquare className="w-5 h-5 mr-3 text-purple-500" />
                  推送字段配置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableFields.map((field) => (
                    <div
                      key={field}
                      className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer border border-slate-200"
                      onClick={() => toggleFieldSelection(field)}
                    >
                      {selectedFields.includes(field) ? (
                        <CheckSquare className="w-4 h-4 text-purple-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-sm code-font text-slate-700">{field}</span>
                    </div>
                  ))}
                </div>
                {selectedFields.length > 0 && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-sm text-slate-600">
                      已选择 <span className="text-purple-600 font-semibold">{selectedFields.length}</span> 个字段：
                      <span className="code-font text-slate-700 ml-2">{selectedFields.join(", ")}</span>
                    </div>
                  </div>
                )}
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
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      triggerType === "schedule"
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => setTriggerType("schedule")}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-slate-800">定时任务触发</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">按设定间隔分批推送所有数据</p>
                    {!canEnableScheduleTrigger && (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-600">数据量需 {"<"} 1000 条</span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      triggerType === "increment"
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => setTriggerType("increment")}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Plus className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-slate-800">数据新增触发</span>
                    </div>
                    <p className="text-sm text-slate-600">新增指定条数时自动触发</p>
                  </div>
                  <div
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      triggerType === "immediate"
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => setTriggerType("immediate")}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Play className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-slate-800">立即触发</span>
                    </div>
                    <p className="text-sm text-slate-600">手动立即推送当前数据</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 触发配置 */}
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
                    <Button className="elegant-gradient hover:opacity-90 text-white text-lg px-8 py-3">
                      <Play className="w-5 h-5 mr-2" />
                      立即触发推送
                    </Button>
                    <p className="text-sm text-slate-500 mt-3">点击按钮将立即推送当前数据到配置的目标</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 触发目标配置 */}
            <Card className="elegant-card elegant-shadow">
              <CardHeader>
                <CardTitle className="text-slate-800">触发目标</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      triggerTarget === "agent"
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => setTriggerTarget("agent")}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Bot className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-slate-800">Maybe Agent</span>
                    </div>
                    <p className="text-sm text-slate-600">推送到指定的AI Agent</p>
                  </div>
                  <div
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      triggerTarget === "url"
                        ? "border-green-400 bg-green-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => setTriggerTarget("url")}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Globe className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-slate-800">自定义 URL</span>
                    </div>
                    <p className="text-sm text-slate-600">推送到自定义的API端点</p>
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
                      className="bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
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
                      className="bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-green-400 focus:ring-green-400/20"
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
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
                  <Eye className="w-5 h-5 mr-3 text-slate-500" />
                  配置预览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600 space-y-2">
                  <div>
                    <span className="text-yellow-600 font-medium">触发器名称:</span> {triggerName || "未设置"}
                  </div>
                  <div>
                    <span className="text-yellow-600 font-medium">关联数据表:</span>{" "}
                    {selectedTableData?.name || "未选择"} ({selectedTableData?.handle || ""})
                  </div>
                  <div>
                    <span className="text-yellow-600 font-medium">触发方式:</span>{" "}
                    {triggerType === "schedule"
                      ? `定时任务 (每 ${scheduleInterval} 分钟)`
                      : triggerType === "increment"
                        ? `数据新增 (每 ${incrementCount} 条)`
                        : "立即触发"}
                  </div>
                  <div>
                    <span className="text-yellow-600 font-medium">触发目标:</span>{" "}
                    {triggerTarget === "agent"
                      ? `Maybe Agent (${agentId || "未设置"})`
                      : `自定义URL (${triggerUrl || "未设置"})`}
                  </div>
                  <div>
                    <span className="text-yellow-600 font-medium">推送字段:</span>{" "}
                    {selectedFields.length > 0 ? selectedFields.join(", ") : "未选择"}
                  </div>
                  <div>
                    <span className="text-yellow-600 font-medium">启用状态:</span> {enabled ? "已启用" : "已禁用"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="border-slate-200 text-slate-500 hover:bg-slate-50 bg-transparent"
              >
                取消
              </Button>
              <Button className="elegant-gradient hover:opacity-90 text-white">
                {isCreating ? "创建触发器" : "保存更改"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
