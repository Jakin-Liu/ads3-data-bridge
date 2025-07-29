"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Search,
  Zap,
  Clock,
  TrendingUp,
  Play,
  Bot,
  Globe,
  Database,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
} from "lucide-react"
import type { DataTrigger } from "@/components/data-trigger-management"

interface DataTriggerListProps {
  triggers: DataTrigger[]
  onTriggerSelect: (trigger: DataTrigger) => void
  onCreateTrigger: () => void
}

export function DataTriggerList({ triggers, onTriggerSelect, onCreateTrigger }: DataTriggerListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTriggers = triggers.filter(
    (trigger) =>
      trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trigger.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trigger.tableHandle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTriggerTypeIcon = (type: string) => {
    switch (type) {
      case "schedule":
        return Clock
      case "increment":
        return TrendingUp
      case "immediate":
        return Play
      default:
        return Zap
    }
  }

  const getTriggerTypeLabel = (type: string) => {
    switch (type) {
      case "schedule":
        return "定时任务"
      case "increment":
        return "数据新增"
      case "immediate":
        return "立即触发"
      default:
        return "未知"
    }
  }

  const getTargetIcon = (target: string) => {
    return target === "agent" ? Bot : Globe
  }

  const getTargetLabel = (target: string) => {
    return target === "agent" ? "Maybe Agent" : "自定义URL"
  }

  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold elegant-text-gradient mb-2">数据触发</h1>
            <p className="text-slate-600">智能触发器管理与自动化数据推送配置</p>
          </div>
          <Button
            onClick={onCreateTrigger}
            className="elegant-gradient hover:opacity-90 transition-opacity elegant-shadow text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建触发器
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="搜索触发器名称或数据表..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-white/80 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20 elegant-shadow"
          />
        </div>
      </div>

      {/* Trigger List */}
      <div className="elegant-card rounded-xl overflow-hidden elegant-shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-200/60">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-600">触发器</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600">关联数据表</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600">触发方式</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600">目标</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600">状态</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600">执行统计</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600">最后触发</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTriggers.map((trigger) => {
                const TriggerIcon = getTriggerTypeIcon(trigger.triggerType)
                const TargetIcon = getTargetIcon(trigger.triggerTarget)
                const successRate =
                  trigger.successCount + trigger.failureCount > 0
                    ? ((trigger.successCount / (trigger.successCount + trigger.failureCount)) * 100).toFixed(1)
                    : "0"

                return (
                  <tr
                    key={trigger.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => onTriggerSelect(trigger)}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 elegant-gradient rounded-lg flex items-center justify-center elegant-shadow">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{trigger.name}</div>
                          <div className="text-sm text-slate-500">触发器</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium text-slate-800">{trigger.tableName}</div>
                          <div className="text-xs text-slate-500 code-font">{trigger.tableHandle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <TriggerIcon className="w-4 h-4 text-yellow-500" />
                        <div>
                          <div className="text-sm text-slate-800">{getTriggerTypeLabel(trigger.triggerType)}</div>
                          <div className="text-xs text-slate-500">
                            {trigger.triggerType === "schedule" && `每 ${trigger.scheduleInterval} 分钟`}
                            {trigger.triggerType === "increment" && `每 ${trigger.incrementCount} 条`}
                            {trigger.triggerType === "immediate" && "手动触发"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <TargetIcon className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="text-sm text-slate-800">{getTargetLabel(trigger.triggerTarget)}</div>
                          <div className="text-xs text-slate-500 code-font">
                            {trigger.triggerTarget === "agent" ? trigger.agentId : trigger.triggerUrl}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={trigger.enabled}
                          className="data-[state=checked]:bg-yellow-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className={`text-sm ${trigger.enabled ? "text-green-600" : "text-slate-400"}`}>
                          {trigger.enabled ? "已启用" : "已禁用"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600 code-font">{trigger.successCount}</span>
                          <span className="text-xs text-slate-400">/</span>
                          <AlertCircle className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-red-600 code-font">{trigger.failureCount}</span>
                        </div>
                        <div className="text-xs text-slate-500">成功率: {successRate}%</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="code-font text-green-600 text-sm">{trigger.lastTriggered || "未触发"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            onTriggerSelect(trigger)
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          查看
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200 text-slate-500 hover:bg-slate-50 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            // 编辑功能
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTriggers.length === 0 && (
        <div className="text-center py-16">
          <div className="elegant-card max-w-md mx-auto p-8 rounded-2xl elegant-shadow">
            <div className="text-slate-400 mb-4">
              <Search className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2">未找到匹配的触发器</h3>
            <p className="text-slate-500 mb-4">尝试调整搜索条件或创建新的触发器</p>
            <Button className="elegant-gradient text-white" onClick={onCreateTrigger}>
              <Plus className="w-4 h-4 mr-2" />
              创建触发器
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
