"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronRight,
  Database,
  Upload,
  Settings,
  Zap,
  BarChart3,
  Edit,
  Copy,
  Cpu,
  Activity,
  Code,
  Eye,
  Wifi,
  Hash,
  CheckSquare,
  Square,
  Clock,
  Plus,
  Bot,
  Globe,
  AlertTriangle,
} from "lucide-react"

interface DataTableField {
  name: string
  type: string
  required: boolean
}

interface DataTable {
  id: string
  handle: string
  name: string
  totalRecords: number
  fieldCount: number
  lastUpdated: string
  mcpEnabled: boolean
  apiEnabled: boolean
  fields: DataTableField[]
}

interface DataTableCardProps {
  table: DataTable
}

export function DataTableCard({ table }: DataTableCardProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [selectedGroupBy, setSelectedGroupBy] = useState("user_id")
  const [selectedFields, setSelectedFields] = useState<string[]>(["user_id", "action_type", "timestamp"])

  // 触发器配置状态
  const [triggerType, setTriggerType] = useState<"schedule" | "increment">("schedule")
  const [triggerTarget, setTriggerTarget] = useState<"agent" | "url">("agent")
  const [scheduleInterval, setScheduleInterval] = useState("60") // 分钟
  const [incrementCount, setIncrementCount] = useState("10")
  const [agentId, setAgentId] = useState("")
  const [triggerUrl, setTriggerUrl] = useState("")

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleFieldSelection = (fieldName: string) => {
    setSelectedFields((prev) => (prev.includes(fieldName) ? prev.filter((f) => f !== fieldName) : [...prev, fieldName]))
  }

  const generateApiUrl = () => {
    const baseUrl = "https://api.databridge.ai/v1/consume"
    const params = new URLSearchParams({
      table: table.handle,
      groupBy: selectedGroupBy,
      fields: selectedFields.join(","),
    })
    return `${baseUrl}?${params.toString()}`
  }

  const generateMcpUrl = () => {
    const baseUrl = "mcp://databridge.ai/v1/consume"
    const params = new URLSearchParams({
      table: table.handle,
      groupBy: selectedGroupBy,
      fields: selectedFields.join(","),
    })
    return `${baseUrl}?${params.toString()}`
  }

  const sections = [
    { id: "structure", title: "数据结构与上传", icon: Database, color: "blue" },
    { id: "consumption", title: "数据消费配置", icon: Cpu, color: "purple" },
    { id: "triggers", title: "智能触发器", icon: Zap, color: "yellow" },
    { id: "callbacks", title: "实时监控", icon: Activity, color: "green" },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      purple: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      yellow: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
      green: "text-green-400 border-green-500/30 bg-green-500/10",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const canEnableScheduleTrigger = table.totalRecords < 1000

  return (
    <Card className="tech-card border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 tech-gradient rounded-xl flex items-center justify-center relative overflow-hidden">
                <Database className="w-6 h-6 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse-slow" />
              </div>
              <div className="absolute -inset-1 tech-gradient rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <CardTitle className="text-xl text-white">{table.name}</CardTitle>
                <div className="flex items-center space-x-2 px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <Hash className="w-3 h-3 text-blue-400" />
                  <span className="text-sm code-font text-blue-400">{table.handle}</span>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-400">数据总量:</span>
                  <span className="font-mono text-blue-400 font-semibold">{table.totalRecords.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400">字段数:</span>
                  <span className="font-mono text-purple-400 font-semibold">{table.fieldCount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-slate-400">更新:</span>
                  <span className="font-mono text-green-400 text-xs">{table.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
            >
              <Edit className="w-4 h-4 mr-1" />
              编辑
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSections[section.id]
          const colorClasses = getColorClasses(section.color)

          return (
            <Collapsible key={section.id} open={isExpanded} onOpenChange={() => toggleSection(section.id)}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-4 h-auto tech-card hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className="flex items-center space-x-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-blue-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <div className={`p-2 rounded-lg border ${colorClasses}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-white">{section.title}</span>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                      {section.id === "consumption" && (
                        <>
                          {table.apiEnabled && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30"
                            >
                              <Wifi className="w-3 h-3 mr-1" />
                              API
                            </Badge>
                          )}
                          {table.mcpEnabled && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30"
                            >
                              <Code className="w-3 h-3 mr-1" />
                              MCP
                            </Badge>
                          )}
                        </>
                      )}
                      {section.id === "triggers" && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          已启用
                        </Badge>
                      )}
                    </div>
                  </div>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4 ml-8 space-y-4">
                {section.id === "structure" && (
                  <div className="tech-card p-6 rounded-xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-white mb-4 flex items-center">
                          <Code className="w-4 h-4 mr-2 text-blue-400" />
                          字段定义
                        </h4>
                        <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                          {table.fields.map((field) => (
                            <div
                              key={field.name}
                              className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-700/50"
                            >
                              <span className="code-font text-blue-400">{field.name}</span>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    field.type === "string"
                                      ? "bg-green-500/10 text-green-400 border-green-500/30"
                                      : field.type === "number"
                                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                        : field.type === "datetime"
                                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                                  }`}
                                >
                                  {field.type}
                                </Badge>
                                {field.required && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-red-500/10 text-red-400 border-red-500/30"
                                  >
                                    必填
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-4 flex items-center">
                          <Upload className="w-4 h-4 mr-2 text-purple-400" />
                          数据上传
                        </h4>
                        <Button className="w-full mb-4 tech-gradient hover:opacity-90">
                          <Upload className="w-4 h-4 mr-2" />
                          上传 CSV/JSON
                        </Button>
                        <div className="text-xs text-slate-400 p-3 bg-slate-800/30 rounded border border-slate-700/30">
                          <div className="flex items-center justify-between">
                            <span>最近上传:</span>
                            <span className="code-font text-green-400">2024-01-15 14:30</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span>记录数:</span>
                            <span className="code-font text-blue-400">1,250 条</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {section.id === "consumption" && (
                  <div className="tech-card p-6 rounded-xl space-y-6">
                    {/* 配置选项 */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-white mb-3 flex items-center">
                          <Settings className="w-4 h-4 mr-2 text-blue-400" />
                          分组维度
                        </h4>
                        <select
                          value={selectedGroupBy}
                          onChange={(e) => setSelectedGroupBy(e.target.value)}
                          className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                        >
                          {table.fields.map((field) => (
                            <option key={field.name} value={field.name}>
                              {field.name} ({field.type})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-3 flex items-center">
                          <CheckSquare className="w-4 h-4 mr-2 text-purple-400" />
                          推送字段
                        </h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {table.fields.map((field) => (
                            <div
                              key={field.name}
                              className="flex items-center space-x-2 p-2 hover:bg-slate-800/30 rounded cursor-pointer"
                              onClick={() => toggleFieldSelection(field.name)}
                            >
                              {selectedFields.includes(field.name) ? (
                                <CheckSquare className="w-4 h-4 text-purple-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500" />
                              )}
                              <span className="text-sm code-font text-slate-300">{field.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* API 消费配置 */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-white flex items-center">
                          <Wifi className="w-4 h-4 mr-2 text-blue-400" />
                          API 消费配置
                        </h4>
                        <Switch checked={table.apiEnabled} className="data-[state=checked]:bg-blue-500" />
                      </div>
                      {table.apiEnabled && (
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                            <div className="text-slate-400 mb-2 text-sm">API 消费地址</div>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 text-xs code-font text-blue-400 bg-slate-900/50 p-2 rounded">
                                {generateApiUrl()}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* MCP 消费配置 */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-white flex items-center">
                          <Code className="w-4 h-4 mr-2 text-purple-400" />
                          MCP 消费配置
                        </h4>
                        <Switch checked={table.mcpEnabled} className="data-[state=checked]:bg-purple-500" />
                      </div>
                      {table.mcpEnabled && (
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
                            <div className="text-slate-400 mb-2 text-sm">MCP 协议地址</div>
                            <div className="flex items-center space-x-2">
                              <code className="flex-1 text-xs code-font text-purple-400 bg-slate-900/50 p-2 rounded">
                                {generateMcpUrl()}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {section.id === "triggers" && (
                  <div className="tech-card p-6 rounded-xl space-y-6">
                    {/* 触发器开关 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white flex items-center mb-2">
                          <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                          智能触发器
                        </h4>
                        <p className="text-sm text-slate-400">自动化数据推送到指定目标</p>
                      </div>
                      <Switch checked={table.triggerEnabled} className="data-[state=checked]:bg-yellow-500" />
                    </div>

                    {table.triggerEnabled && (
                      <div className="space-y-6">
                        {/* 触发方式选择 */}
                        <div>
                          <h5 className="font-medium text-white mb-3">触发方式</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                triggerType === "schedule"
                                  ? "border-yellow-500/50 bg-yellow-500/10"
                                  : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50"
                              }`}
                              onClick={() => setTriggerType("schedule")}
                            >
                              <div className="flex items-center space-x-3 mb-2">
                                <Clock className="w-5 h-5 text-yellow-400" />
                                <span className="font-medium text-white">定时任务触发</span>
                              </div>
                              <p className="text-sm text-slate-400">按设定间隔分批推送所有数据</p>
                              {!canEnableScheduleTrigger && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <AlertTriangle className="w-4 h-4 text-red-400" />
                                  <span className="text-xs text-red-400">数据量需 {"<"} 1000 条</span>
                                </div>
                              )}
                            </div>
                            <div
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                triggerType === "increment"
                                  ? "border-yellow-500/50 bg-yellow-500/10"
                                  : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50"
                              }`}
                              onClick={() => setTriggerType("increment")}
                            >
                              <div className="flex items-center space-x-3 mb-2">
                                <Plus className="w-5 h-5 text-yellow-400" />
                                <span className="font-medium text-white">数据新增触发</span>
                              </div>
                              <p className="text-sm text-slate-400">新增指定条数时自动触发</p>
                            </div>
                          </div>
                        </div>

                        {/* 触发方式配置 */}
                        {triggerType === "schedule" && canEnableScheduleTrigger && (
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">推送间隔（分钟）</label>
                            <Input
                              type="number"
                              value={scheduleInterval}
                              onChange={(e) => setScheduleInterval(e.target.value)}
                              placeholder="60"
                              className="bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20"
                            />
                            <p className="text-xs text-slate-400 mt-1">
                              系统将每 {scheduleInterval} 分钟推送一批数据到目标
                            </p>
                          </div>
                        )}

                        {triggerType === "increment" && (
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">触发条数</label>
                            <Input
                              type="number"
                              value={incrementCount}
                              onChange={(e) => setIncrementCount(e.target.value)}
                              placeholder="10"
                              className="bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-yellow-400 focus:ring-yellow-400/20"
                            />
                            <p className="text-xs text-slate-400 mt-1">当新增 {incrementCount} 条数据时自动触发推送</p>
                          </div>
                        )}

                        {/* 触发目标选择 */}
                        <div>
                          <h5 className="font-medium text-white mb-3">触发目标</h5>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                triggerTarget === "agent"
                                  ? "border-blue-500/50 bg-blue-500/10"
                                  : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50"
                              }`}
                              onClick={() => setTriggerTarget("agent")}
                            >
                              <div className="flex items-center space-x-3 mb-2">
                                <Bot className="w-5 h-5 text-blue-400" />
                                <span className="font-medium text-white">Maybe Agent</span>
                              </div>
                              <p className="text-sm text-slate-400">推送到指定的AI Agent</p>
                            </div>
                            <div
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                triggerTarget === "url"
                                  ? "border-green-500/50 bg-green-500/10"
                                  : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50"
                              }`}
                              onClick={() => setTriggerTarget("url")}
                            >
                              <div className="flex items-center space-x-3 mb-2">
                                <Globe className="w-5 h-5 text-green-400" />
                                <span className="font-medium text-white">自定义 URL</span>
                              </div>
                              <p className="text-sm text-slate-400">推送到自定义的API端点</p>
                            </div>
                          </div>

                          {/* 目标配置 */}
                          {triggerTarget === "agent" && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Agent ID</label>
                              <Input
                                value={agentId}
                                onChange={(e) => setAgentId(e.target.value)}
                                placeholder="输入 Maybe Agent ID"
                                className="bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                              />
                              <p className="text-xs text-slate-400 mt-1">数据将推送到指定的 Maybe Agent 进行处理</p>
                            </div>
                          )}

                          {triggerTarget === "url" && (
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">触发 URL</label>
                              <Input
                                value={triggerUrl}
                                onChange={(e) => setTriggerUrl(e.target.value)}
                                placeholder="https://your-api.com/webhook"
                                className="bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-green-400 focus:ring-green-400/20"
                              />
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-500/10 text-green-400 border-green-500/30"
                                >
                                  POST
                                </Badge>
                                <span className="text-xs text-slate-400">数据将通过 POST 方式提交</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 配置预览 */}
                        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                          <h6 className="font-medium text-white mb-2 flex items-center">
                            <Eye className="w-4 h-4 mr-2 text-slate-400" />
                            配置预览
                          </h6>
                          <div className="text-sm text-slate-400 space-y-1">
                            <div>
                              <span className="text-yellow-400">触发方式:</span>{" "}
                              {triggerType === "schedule"
                                ? `定时任务 (每 ${scheduleInterval} 分钟)`
                                : `数据新增 (每 ${incrementCount} 条)`}
                            </div>
                            <div>
                              <span className="text-yellow-400">触发目标:</span>{" "}
                              {triggerTarget === "agent"
                                ? `Maybe Agent (${agentId || "未设置"})`
                                : `自定义URL (${triggerUrl || "未设置"})`}
                            </div>
                            <div>
                              <span className="text-yellow-400">推送字段:</span> {selectedFields.join(", ")}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {section.id === "callbacks" && (
                  <div className="tech-card p-6 rounded-xl">
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-3xl font-bold text-green-400 code-font mb-1">1,245</div>
                        <div className="text-sm text-green-300">成功触达</div>
                      </div>
                      <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="text-3xl font-bold text-red-400 code-font mb-1">23</div>
                        <div className="text-sm text-red-300">失败次数</div>
                      </div>
                      <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="text-3xl font-bold text-blue-400 code-font mb-1">98.2%</div>
                        <div className="text-sm text-blue-300">成功率</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                      <div className="text-sm text-slate-400 flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-green-400" />
                        最近触达: <span className="code-font text-green-400 ml-2">2024-01-15 15:30</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                      >
                        <Eye className="w-3 h-3 mr-2" />
                        查看详情
                      </Button>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </CardContent>
    </Card>
  )
}
