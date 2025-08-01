"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Database, Sparkles, Eye, Save, FileText, Code, Lightbulb, Table, Copy, Edit2, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { DataTable, DataTableField } from "@/components/data-table-management"

interface DataTableCreateProps {
  onBack: () => void
  onSave: (table: DataTable) => void
}

// 字段类型枚举
const FIELD_TYPES = [
  { value: "String", label: "String", color: "bg-green-50 text-green-600 border-green-200" },
  { value: "Number", label: "Number", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "DateTime", label: "DateTime", color: "bg-purple-50 text-purple-600 border-purple-200" },
  { value: "Boolean", label: "Boolean", color: "bg-orange-50 text-orange-600 border-orange-200" },
  { value: "Json", label: "Json", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
]

export function DataTableCreate({ onBack, onSave }: DataTableCreateProps) {
  const { toast } = useToast()
  const [inputText, setInputText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedTable, setGeneratedTable] = useState<{
    name: string
    handle: string
    description: string
    fields: DataTableField[]
  } | null>(null)
  const [tableName, setTableName] = useState("")
  const [tableHandle, setTableHandle] = useState("")
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<DataTableField | null>(null)
  const [uniqueKeys, setUniqueKeys] = useState<string[]>([])
  const [showUniqueKeysModal, setShowUniqueKeysModal] = useState(false)

  // 示例输入文本
  const exampleInputs = [
    {
      title: "自然语言描述",
      icon: Lightbulb,
      content:
        "我需要一个用户行为分析表，包含用户ID、操作类型、时间戳、页面URL、设备类型、地理位置等字段。用户ID和操作类型是必填的。",
    },
    {
      title: "示例数据",
      icon: FileText,
      content: `user_id,action_type,timestamp,page_url,device_type
user_12345,page_view,2024-01-15T14:30:25Z,/dashboard,desktop
user_67890,button_click,2024-01-15T14:28:15Z,/profile,mobile
user_11111,form_submit,2024-01-15T14:25:45Z,/contact,desktop`,
    },
    {
      title: "表格数据",
      icon: Table,
      content: `订单ID	产品名称	数量	价格	客户ID	下单时间
ORD001	iPhone 15	1	7999	CUST001	2024-01-15 14:30
ORD002	MacBook Pro	1	12999	CUST002	2024-01-15 14:25
ORD003	AirPods	2	1299	CUST001	2024-01-15 14:20`,
    },
  ]

  const handleProcessInput = async () => {
    if (!inputText.trim()) return

    setIsProcessing(true)

    try {
      // 调用真实的 parse API
      const response = await fetch('/api/v1/tables/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputText }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'AI 解析失败，请重试')
      }

      if (!result.success || !result.data) {
        throw new Error('AI 返回数据格式错误')
      }

      // 使用API返回的真实数据
      const apiData = result.data
      const generatedTable = {
        name: apiData.tableAliasName || apiData.tableName,
        handle: apiData.tableName,
        description: apiData.description || '',
        fields: apiData.fields.map((field: any) => ({
          name: field.name,
          type: field.type,
          required: field.required,
          description: field.description || ''
        }))
      }

      setGeneratedTable(generatedTable)
      setTableName(generatedTable.name)
      setTableHandle(generatedTable.handle)
    } catch (error) {
      console.error('AI 解析失败:', error)
      toast({
        title: "AI 解析失败",
        description: error instanceof Error ? error.message : 'AI 解析失败，请重试',
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveTable = async () => {
    if (!generatedTable || !tableName || !tableHandle) return

    setIsProcessing(true)

    try {
      // 准备API请求数据
      const requestData = {
        tableName: tableHandle,
        tableAliasName: tableName,
        description: generatedTable.description,
        fields: generatedTable.fields,
        uniqueKeys: uniqueKeys
      }

      // 调用创建表的API
      const response = await fetch('/api/v1/tables/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '创建数据表失败，请重试')
      }

      if (!result.success) {
        throw new Error('API 返回数据格式错误')
      }

      // 创建成功后的表格对象
      const newTable: DataTable = {
        id: result.data.tableId.toString(),
        handle: tableHandle,
        name: tableName,
        totalRecords: 0,
        fieldCount: generatedTable.fields.length,
        lastUpdated: new Date().toLocaleString("zh-CN"),
        consumptionStatus: {
          apiEnabled: false,
          mcpEnabled: false,
          triggerEnabled: false,
        },
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fields: generatedTable.fields,
      }

      toast({
        title: "数据表创建成功",
        description: "数据表已成功保存到数据库中",
      })

      onSave(newTable)
    } catch (error) {
      console.error('创建数据表失败:', error)
      toast({
        title: "创建数据表失败",
        description: error instanceof Error ? error.message : '创建数据表失败，请重试',
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExampleClick = (content: string) => {
    setInputText(content)
  }

  // 开始编辑字段
  const handleEditField = (index: number) => {
    setEditingFieldIndex(index)
    setEditingField({ ...generatedTable!.fields[index] })
  }

  // 保存字段编辑
  const handleSaveField = () => {
    if (!editingField || editingFieldIndex === null || !generatedTable) return

    const updatedFields = [...generatedTable.fields]
    updatedFields[editingFieldIndex] = editingField

    setGeneratedTable({
      ...generatedTable,
      fields: updatedFields
    })

    setEditingFieldIndex(null)
    setEditingField(null)
  }

  // 取消字段编辑
  const handleCancelEdit = () => {
    setEditingFieldIndex(null)
    setEditingField(null)
  }

  // 获取字段类型显示信息
  const getFieldTypeInfo = (type: string) => {
    return FIELD_TYPES.find(t => t.value === type) || FIELD_TYPES[0]
  }

  // 切换唯一字段选择
  const toggleUniqueKey = (fieldName: string) => {
    setUniqueKeys(prev => 
      prev.includes(fieldName) 
        ? prev.filter(key => key !== fieldName)
        : [...prev, fieldName]
    )
  }

  // 获取唯一字段显示文本
  const getUniqueKeysDisplay = () => {
    if (uniqueKeys.length === 0) return "未设置"
    return `${uniqueKeys.length} 个字段`
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
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">新建数据表</h1>
              <p className="text-sm text-slate-500">使用AI智能解析，快速创建数据表结构</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 输入区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 主输入框 */}
          <Card className="elegant-card elegant-shadow">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center">
                <Sparkles className="w-5 h-5 mr-3 text-blue-500" />
                描述您的数据表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="请描述您需要的数据表结构，或者直接粘贴示例数据..."
                  className="w-full h-64 p-4 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 text-sm resize-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 elegant-shadow"
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">支持自然语言描述、CSV数据、表格数据等多种格式</div>
                  <div className="text-xs text-slate-500">{inputText.length} 字符</div>
                </div>
                <Button
                  onClick={handleProcessInput}
                  disabled={!inputText.trim() || isProcessing}
                  className="w-full elegant-gradient hover:opacity-90 disabled:opacity-50 text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      AI 正在解析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI 智能解析
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 表结构预览 */}
          {generatedTable && (
            <Card className="elegant-card elegant-shadow">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center">
                  <Eye className="w-5 h-5 mr-3 text-green-500" />
                  表结构预览
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 基本信息 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">表名称</label>
                    <Input
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      className="bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-green-400 focus:ring-green-400/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Handle</label>
                    <Input
                      value={tableHandle}
                      onChange={(e) => setTableHandle(e.target.value)}
                      className="bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-green-400 focus:ring-green-400/20"
                    />
                  </div>
                </div>

                {/* 表描述 */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">表描述</label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700">
                    {generatedTable.description}
                  </div>
                </div>

                {/* 唯一字段设置 */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">唯一字段组合</label>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">当前设置：</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            uniqueKeys.length > 0 
                              ? "bg-blue-50 text-blue-600 border-blue-200" 
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          {getUniqueKeysDisplay()}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowUniqueKeysModal(true)}
                        className="h-7 px-3 text-xs"
                      >
                        设置唯一字段
                      </Button>
                    </div>
                    
                    {uniqueKeys.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {uniqueKeys.map((key, index) => (
                          <Badge 
                            key={key}
                            variant="outline" 
                            className="text-xs bg-blue-50 text-blue-600 border-blue-200"
                          >
                            {key}
                            {index < uniqueKeys.length - 1 && <span className="ml-1">+</span>}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                      <div className="flex items-start space-x-2">
                        <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-xs text-red-700">
                          After setting unique fields, uploaded data will be deduplicated based on these fields.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 字段列表 */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-3">
                    字段定义 ({generatedTable.fields.length} 个字段)
                  </label>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {generatedTable.fields.map((field, index) => {
                      const isEditing = editingFieldIndex === index
                      const fieldTypeInfo = getFieldTypeInfo(field.type)
                      
                      return (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-lg border border-slate-200 elegant-shadow hover:border-slate-300 transition-colors"
                        >
                          {isEditing ? (
                            // 编辑模式
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600">编辑字段 #{index + 1}</span>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={handleSaveField}
                                    className="h-7 px-2 bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    保存
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    className="h-7 px-2"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    取消
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">字段名称</label>
                                  <Input
                                    value={editingField?.name || ''}
                                    onChange={(e) => setEditingField(prev => prev ? { ...prev, name: e.target.value } : null)}
                                    className="h-8 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">字段类型</label>
                                  <Select
                                    value={editingField?.type || 'String'}
                                    onValueChange={(value) => setEditingField(prev => prev ? { ...prev, type: value } : null)}
                                    defaultValue={generatedTable.fields[index].type}
                                  >
                                    <SelectTrigger className="h-8 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20">
                                      <SelectValue>
                                        {getFieldTypeInfo(editingField?.type || 'string').label}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {FIELD_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`required-${index}`}
                                  checked={editingField?.required || false}
                                  onChange={(e) => setEditingField(prev => prev ? { ...prev, required: e.target.checked } : null)}
                                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`required-${index}`} className="text-xs text-slate-600">
                                  必填字段
                                </label>
                              </div>
                            </div>
                          ) : (
                            // 显示模式
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <span className="code-font text-blue-600 font-medium">{field.name}</span>
                                  {field.required && (
                                    <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                                      必填
                                    </Badge>
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${fieldTypeInfo.color}`}
                                >
                                  {fieldTypeInfo.label}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditField(index)}
                                className="h-7 px-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 保存按钮 */}
                <Button
                  onClick={handleSaveTable}
                  disabled={!tableName || !tableHandle || isProcessing}
                  className="w-full elegant-gradient hover:opacity-90 disabled:opacity-50 text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      正在保存...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      保存数据表
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 示例和帮助 */}
        <div className="space-y-6">
          <Card className="elegant-card elegant-shadow">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center">
                <Code className="w-5 h-5 mr-3 text-purple-500" />
                输入示例
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exampleInputs.map((example, index) => {
                  const Icon = example.icon
                  return (
                    <div
                      key={index}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors cursor-pointer group"
                      onClick={() => handleExampleClick(example.content)}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-slate-800">{example.title}</span>
                        <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                      </div>
                      <div className="text-xs text-slate-500 code-font line-clamp-3">{example.content}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="elegant-card elegant-shadow">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center">
                <Lightbulb className="w-5 h-5 mr-3 text-yellow-500" />
                使用提示
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span>支持自然语言描述表结构和字段要求</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span>可直接粘贴CSV格式的示例数据</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span>支持从网页复制的表格数据</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span>AI会自动识别字段类型和必填属性</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span>预览后可手动调整表名和字段信息</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span>点击编辑按钮可修改字段名称和类型</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 唯一字段设置模态框 */}
      {showUniqueKeysModal && generatedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">设置唯一字段组合</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowUniqueKeysModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                选择多个字段组合作为唯一键，确保数据唯一性
              </p>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {generatedTable.fields.map((field, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      uniqueKeys.includes(field.name)
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-slate-200 hover:border-blue-300"
                    }`}
                    onClick={() => toggleUniqueKey(field.name)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        uniqueKeys.includes(field.name)
                          ? "bg-blue-500 border-blue-500"
                          : "border-slate-300"
                      }`}>
                        {uniqueKeys.includes(field.name) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-800">{field.name}</span>
                          {field.required && (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                              必填
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getFieldTypeInfo(field.type).color}`}
                          >
                            {getFieldTypeInfo(field.type).label}
                          </Badge>
                          <span className="text-xs text-slate-500">字段 #{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">已选择：</span>
                <span className="text-sm text-slate-500">{uniqueKeys.length} 个字段</span>
              </div>
              
              {uniqueKeys.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {uniqueKeys.map((key, index) => (
                    <Badge 
                      key={key}
                      variant="outline" 
                      className="text-xs bg-blue-50 text-blue-600 border-blue-200"
                    >
                      {key}
                      {index < uniqueKeys.length - 1 && <span className="ml-1">+</span>}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowUniqueKeysModal(false)}
                  className="flex-1"
                >
                  确认设置
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUniqueKeys([])
                    setShowUniqueKeysModal(false)
                  }}
                  className="flex-1"
                >
                  清空选择
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
