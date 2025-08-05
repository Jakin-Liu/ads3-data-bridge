"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Square, ArrowLeft, Zap, Plus, Globe, Eye } from "lucide-react"
import type { DataTrigger } from "@/components/data-trigger-management"

interface DataTriggerDetailProps {
  trigger: DataTrigger | null
  isCreating: boolean
  onBack: () => void
}

// 数据表接口定义
interface TableOption {
  id: string
  name: string
  aliasName: string
}

// 字段接口定义
interface FieldInfo {
  name: string
  type: string
  required: boolean
}

export function DataTriggerDetail({ trigger, isCreating, onBack }: DataTriggerDetailProps) {
  const [triggerName, setTriggerName] = useState(trigger?.name || "")
  const [selectedTable, setSelectedTable] = useState(trigger?.tableId || "")
  const [triggerType, setTriggerType] = useState<"schedule" | "increment" | "immediate">(
    (trigger?.triggerType as "schedule" | "increment" | "immediate") || "increment",
  )
  const [triggerTarget, setTriggerTarget] = useState<"agent" | "url">((trigger?.endpointType as "agent" | "url") || "url")
  const [triggerUrl, setTriggerUrl] = useState(trigger?.endpointConfig?.url || "")
  const [selectedFields, setSelectedFields] = useState<string[]>(trigger?.selectedFields || [])
  const [enabled, setEnabled] = useState(trigger?.enabled || false)

  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // 动态数据表状态
  const [tableOptions, setTableOptions] = useState<TableOption[]>([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [tableError, setTableError] = useState<string | null>(null)

  // 字段信息状态
  const [availableFields, setAvailableFields] = useState<FieldInfo[]>([])
  const [loadingFields, setLoadingFields] = useState(false)
  const [fieldsError, setFieldsError] = useState<string | null>(null)

  // 获取数据表列表
  useEffect(() => {
    const fetchTables = async () => {
      setLoadingTables(true)
      setTableError(null)
      
      try {
        const response = await fetch('/api/v1/tables/trigger')
        const result = await response.json()
        
        if (result.success) {
          setTableOptions(result.data)
          
          // 如果是编辑模式，设置selectedTable
          if (!isCreating && trigger?.tableId) {
            setSelectedTable(trigger.tableId.toString())
          }
        } else {
          setTableError(result.message || '获取数据表列表失败')
        }
      } catch (error) {
        console.error('获取数据表列表失败:', error)
        setTableError('网络错误，请稍后重试')
      } finally {
        setLoadingTables(false)
      }
    }

    // 只在创建模式下获取数据表列表
    if (isCreating) {
      fetchTables()
    } else {
      // 编辑模式下直接设置selectedTable，不获取数据表列表
      if (trigger?.tableId) {
        setSelectedTable(trigger.tableId.toString())
      }
    }
  }, [isCreating, trigger?.tableId])

  // 获取字段信息
  useEffect(() => {
    const fetchFields = async () => {
      if (!selectedTable) {
        setAvailableFields([])
        return
      }

      setLoadingFields(true)
      setFieldsError(null)
      
      try {
        const response = await fetch(`/api/v1/tables/detail?tableId=${selectedTable}`)
        const result = await response.json()
        
        if (result.success) {
          // 从 detail API 返回的数据中提取字段信息
          const fields = result.data.fields || []
          setAvailableFields(fields.map((field: any) => ({
            name: field.name,
            type: field.fieldType,
            required: field.required
          })))
        } else {
          setFieldsError(result.message || '获取字段信息失败')
          setAvailableFields([])
        }
      } catch (error) {
        console.error('获取字段信息失败:', error)
        setFieldsError('网络错误，请稍后重试')
        setAvailableFields([])
      } finally {
        setLoadingFields(false)
      }
    }

    fetchFields()
  }, [selectedTable])

  const selectedTableData = tableOptions.find((t) => t.id === selectedTable)

  // 在编辑模式下，如果tableOptions还没有加载完成，使用trigger中的数据
  const displayTableData = selectedTableData || (trigger && !isCreating ? {
    id: trigger.tableId.toString(),
    name: trigger.tableHandle,
    aliasName: trigger.tableName
  } : null)

  const toggleFieldSelection = (fieldName: string) => {
    setSelectedFields((prev) => (prev.includes(fieldName) ? prev.filter((f) => f !== fieldName) : [...prev, fieldName]))
  }

  // 创建触发器
  const handleCreateTrigger = async () => {
    // 表单验证
    if (!triggerName.trim()) {
      setSubmitError('请输入触发器名称')
      return
    }

    if (!selectedTable) {
      setSubmitError('请选择关联数据表')
      return
    }

    if (selectedFields.length === 0) {
      setSubmitError('请至少选择一个推送字段')
      return
    }

    if (!triggerUrl.trim()) {
      setSubmitError('请输入触发URL')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const selectedTableData = tableOptions.find((t) => t.id === selectedTable)
      
      const requestData = {
        tableId: parseInt(selectedTable.toString()),
        name: triggerName.trim(),
        endpointType: 'api',
        endpoint: {
          url: triggerUrl.trim()
        },
        triggerType: 'new',
        fields: selectedFields
      }

      const response = await fetch('/api/v1/trigger/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (result.success) {
        // 创建成功，返回列表
        onBack()
      } else {
        setSubmitError(result.error || '创建触发器失败')
      }
    } catch (error) {
      console.error('创建触发器失败:', error)
      setSubmitError('网络错误，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 保存修改
  const handleUpdateTrigger = async () => {
    // 表单验证
    if (!triggerName.trim()) {
      setSubmitError('请输入触发器名称')
      return
    }

    if (selectedFields.length === 0) {
      setSubmitError('请至少选择一个推送字段')
      return
    }

    if (!triggerUrl.trim()) {
      setSubmitError('请输入触发URL')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const requestData = {
        name: triggerName.trim(),
        endpointType: 'api',
        endpoint: {
          url: triggerUrl.trim()
        },
        triggerType: 'new',
        fields: selectedFields,
        status: enabled ? 'active' : 'inactive'
      }

      const response = await fetch(`/api/v1/trigger/update/${trigger?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (result.success) {
        // 更新成功，返回列表
        onBack()
      } else {
        setSubmitError(result.error || '更新触发器失败')
      }
    } catch (error) {
      console.error('更新触发器失败:', error)
      setSubmitError('网络错误，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

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
                {isCreating ? (
                  <div>
                    {loadingTables ? (
                      <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm">
                        正在加载数据表...
                      </div>
                    ) : tableError ? (
                      <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {tableError}
                      </div>
                    ) : (
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
                            {table.aliasName} ({table.name})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  // 编辑模式显示已选择的数据表
                  <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm">
                    {displayTableData ? `${displayTableData.aliasName} (${displayTableData.name})` : (trigger?.tableName || "未选择数据表")}
                  </div>
                )}
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
                  {loadingFields ? (
                    <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm text-center">
                      正在加载字段...
                    </div>
                  ) : fieldsError ? (
                    <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                      {fieldsError}
                    </div>
                  ) : availableFields.length === 0 ? (
                    <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm text-center">
                      未找到字段信息
                    </div>
                  ) : (
                    availableFields.map((field) => (
                      <div
                        key={field.name}
                        className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer border border-slate-200"
                        onClick={() => toggleFieldSelection(field.name)}
                      >
                        {selectedFields.includes(field.name) ? (
                          <CheckSquare className="w-4 h-4 text-purple-500" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-sm code-font text-slate-700">{field.name}</span>
                      </div>
                    ))
                  )}
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
                <div className="max-w-sm">
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
                </div>
              </CardContent>
            </Card>

            {/* 触发目标配置 */}
            <Card className="elegant-card elegant-shadow">
              <CardHeader>
                <CardTitle className="text-slate-800">触发目标</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-sm">
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
                    {displayTableData ? `${displayTableData.aliasName} (${displayTableData.name})` : "未选择"}
                  </div>
                  <div>
                    <span className="text-yellow-600 font-medium">触发方式:</span>{" "}
                    数据新增触发
                  </div>
                  <div>
                    <span className="text-yellow-600 font-medium">触发目标:</span>{" "}
                    {triggerTarget === "url"
                      ? `自定义URL (${triggerUrl || "未设置"})`
                      : "未设置"}
                  </div>
                  <div>
                    <span className="text-yellow-600 font-medium">推送字段:</span>{" "}
                    {selectedFields.length > 0 ? selectedFields.join(", ") : "未选择"}
                    {availableFields.length > 0 && (
                      <div className="text-xs text-slate-500 mt-1">
                        共 {availableFields.length} 个可用字段
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-yellow-600 font-medium">启用状态:</span> {enabled ? "已启用" : "已禁用"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {submitError}
                </div>
              )}
              <div className="flex items-center justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="border-slate-200 text-slate-500 hover:bg-slate-50 bg-transparent"
                  disabled={isSubmitting}
                >
                  取消
                </Button>
                <Button 
                  className="elegant-gradient hover:opacity-90 text-white"
                  onClick={isCreating ? handleCreateTrigger : handleUpdateTrigger}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (isCreating ? "创建中..." : "保存中...") : (isCreating ? "创建触发器" : "保存更改")}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
