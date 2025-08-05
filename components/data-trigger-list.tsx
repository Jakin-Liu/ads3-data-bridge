"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Search,
  Zap,
  Bot,
  Globe,
  Database,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Loader2,
} from "lucide-react"
import type { DataTrigger } from "@/components/data-trigger-management"

interface DataTriggerListProps {
  triggers?: DataTrigger[] // 改为可选，支持动态获取
  onTriggerSelect: (trigger: DataTrigger) => void
  onCreateTrigger: () => void
}

export function DataTriggerList({ triggers: propTriggers, onTriggerSelect, onCreateTrigger }: DataTriggerListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  
  // 动态触发器状态
  const [triggers, setTriggers] = useState<DataTrigger[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 请求状态管理
  const [hasLoaded, setHasLoaded] = useState(false)
  const requestRef = useRef<AbortController | null>(null)

  // 获取触发器列表
  useEffect(() => {
    const fetchTriggers = async () => {
      // 如果props中有triggers，使用props中的数据
      if (propTriggers) {
        setTriggers(propTriggers)
        setHasLoaded(true)
        return
      }

      // 如果已经加载过数据，不再重复请求
      if (hasLoaded) {
        return
      }

      // 如果正在加载，取消之前的请求
      if (requestRef.current) {
        requestRef.current.abort()
      }

      setLoading(true)
      setError(null)
      
      // 创建新的AbortController
      requestRef.current = new AbortController()
      
      try {
        const response = await fetch('/api/v1/trigger/list', {
          signal: requestRef.current.signal
        })
        const result = await response.json()
        
        if (result.success) {
          // 处理API返回的字段结构，映射到组件期望的格式
          const mappedTriggers = result.data.list.map((trigger: any) => {
            // 从triggerConfig和endpointConfig中提取具体配置
            const triggerConfig = trigger.triggerConfig || {};
            const endpointConfig = trigger.endpointConfig || {};
            
            // 解析触发类型和目标类型
            let triggerType = 'schedule'; // 默认值
            let triggerTarget = 'agent'; // 默认值
            let scheduleInterval = '60';
            let incrementCount = '10';
            let agentId = '';
            let triggerUrl = '';

            // 从endpoint_type判断目标类型
            if (trigger.triggerTarget === 'api') {
              triggerTarget = 'url';
              triggerUrl = endpointConfig?.url || '';
            } else if (trigger.triggerTarget === 'queue') {
              // queue类型可能对应agent，需要从endpoint配置中判断
              if (endpointConfig?.agentId) {
                triggerTarget = 'agent';
                agentId = endpointConfig.agentId;
              } else {
                triggerTarget = 'url';
                triggerUrl = endpointConfig?.url || '';
              }
            }

            // 从trigger_type判断触发类型
            if (trigger.triggerType === 'new') {
              triggerType = 'increment';
              incrementCount = triggerConfig?.incrementCount || '10';
            } else if (trigger.triggerType === 'schedule') {
              triggerType = 'schedule';
              scheduleInterval = triggerConfig?.scheduleInterval || '60';
            } else if (trigger.triggerType === 'immediate') {
              triggerType = 'immediate';
            }

            return {
              id: trigger.id,
              name: trigger.name || `触发器-${trigger.id}`,
              tableId: trigger.tableId,
              tableName: trigger.tableName, // 使用tableName作为主要显示名称
              tableAlias: trigger.tableAlias, // 使用别名作为主要显示名称
              tableHandle: trigger.tableHandle || trigger.tableName, // 添加tableHandle字段
              triggerType: triggerType,
              endpointType: triggerTarget, // 添加endpointType字段
              triggerConfig: triggerConfig,
              endpointConfig: endpointConfig,
              fields: trigger.fields || [],
              selectedFields: trigger.fields || [],
              incrementCount: incrementCount,
              scheduleInterval: scheduleInterval,
              agentId: agentId,
              triggerUrl: triggerUrl,
              enabled: trigger.enabled,
              lastTriggered: null, // 暂时设为null
              successCount: trigger.successCount || 0,
              failureCount: trigger.failureCount || 0,
              createdAt: trigger.createdAt,
              updatedAt: trigger.updatedAt || trigger.createdAt,
            };
          });
          
          setTriggers(mappedTriggers)
          setHasLoaded(true)
        } else {
          setError(result.message || '获取触发器列表失败')
        }
      } catch (error) {
        // 如果是取消请求，不显示错误
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
        console.error('获取触发器列表失败:', error)
        setError('网络错误，请稍后重试')
      } finally {
        setLoading(false)
        requestRef.current = null
      }
    }

    fetchTriggers()

    // 清理函数
    return () => {
      if (requestRef.current) {
        requestRef.current.abort()
      }
    }
  }, [propTriggers, hasLoaded])

  // 手动刷新触发器列表
  const refreshTriggers = () => {
    setHasLoaded(false)
    setError(null)
    // 重新触发useEffect
  }

  const filteredTriggers = triggers.filter(
    (trigger) =>
      trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trigger.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trigger.tableHandle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTargetIcon = (target: string) => {
    return target === "agent" ? Bot : Globe
  }

  const getTargetLabel = (target: string) => {
    return target === "agent" ? "Maybe Agent" : "自定义URL"
  }

  if (loading) {
    return (
      <div className="p-6 relative">
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
        </div>
        
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-600">正在加载触发器列表...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 relative">
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
        </div>
        
        <div className="text-center py-16">
          <div className="elegant-card max-w-md mx-auto p-8 rounded-2xl elegant-shadow">
            <div className="text-red-400 mb-4">
              <AlertCircle className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2">加载失败</h3>
            <p className="text-slate-500 mb-4">{error}</p>
            <Button 
              className="elegant-gradient text-white" 
              onClick={refreshTriggers}
            >
              重新加载
            </Button>
          </div>
        </div>
      </div>
    )
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
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTriggers}
              className="border-slate-200 text-slate-500 hover:bg-slate-50 bg-transparent"
              disabled={loading}
            >
              <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button
              onClick={onCreateTrigger}
              className="elegant-gradient hover:opacity-90 transition-opacity elegant-shadow text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              新建触发器
            </Button>
          </div>
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
                <th className="text-left p-4 text-sm font-medium text-slate-600">目标</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600">状态</th>
                <th className="text-left p-4 text-sm font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTriggers.map((trigger) => {
                const TargetIcon = getTargetIcon(trigger.endpointType)

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
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium text-slate-800">{trigger.tableName}</div>
                          <div className="text-xs text-slate-500 code-font">{trigger.tableAlias}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <TargetIcon className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="text-sm text-slate-800">{getTargetLabel(trigger.endpointType)}</div>
                          <div className="text-xs text-slate-500 code-font">
                            {trigger.endpointType === "agent" ? trigger.agentId : trigger.triggerUrl}
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
