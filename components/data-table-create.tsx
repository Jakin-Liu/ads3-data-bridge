"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Database, Sparkles, Eye, Save, FileText, Code, Lightbulb, Table, Copy } from "lucide-react"
import type { DataTable, DataTableField } from "@/components/data-table-management"

interface DataTableCreateProps {
  onBack: () => void
  onSave: (table: DataTable) => void
}

export function DataTableCreate({ onBack, onSave }: DataTableCreateProps) {
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

    // 模拟AI处理延迟
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 模拟AI生成的表结构
    const mockGeneratedTable = {
      name: "用户行为数据",
      handle: "user_behavior_analysis",
      description: "用户在网站上的行为数据分析表，用于跟踪用户操作和页面访问情况",
      fields: [
        { name: "user_id", type: "string", required: true },
        { name: "action_type", type: "string", required: true },
        { name: "timestamp", type: "datetime", required: true },
        { name: "page_url", type: "string", required: false },
        { name: "device_type", type: "string", required: false },
        { name: "session_id", type: "string", required: false },
        { name: "location", type: "string", required: false },
        { name: "user_agent", type: "string", required: false },
      ],
    }

    setGeneratedTable(mockGeneratedTable)
    setTableName(mockGeneratedTable.name)
    setTableHandle(mockGeneratedTable.handle)
    setIsProcessing(false)
  }

  const handleSaveTable = () => {
    if (!generatedTable || !tableName || !tableHandle) return

    const newTable: DataTable = {
      id: Date.now().toString(),
      handle: tableHandle,
      name: tableName,
      totalRecords: 0,
      fieldCount: generatedTable.fields.length,
      lastUpdated: new Date().toLocaleString("zh-CN"),
      mcpEnabled: false,
      apiEnabled: false,
      triggerEnabled: false,
      fields: generatedTable.fields,
    }

    onSave(newTable)
  }

  const handleExampleClick = (content: string) => {
    setInputText(content)
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

                {/* 字段列表 */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-3">
                    字段定义 ({generatedTable.fields.length} 个字段)
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {generatedTable.fields.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 elegant-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="code-font text-blue-600 font-medium">{field.name}</span>
                          {field.required && (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                              必填
                            </Badge>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            field.type === "string"
                              ? "bg-green-50 text-green-600 border-green-200"
                              : field.type === "number"
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : field.type === "datetime"
                                  ? "bg-purple-50 text-purple-600 border-purple-200"
                                  : "bg-yellow-50 text-yellow-600 border-yellow-200"
                          }`}
                        >
                          {field.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 保存按钮 */}
                <Button
                  onClick={handleSaveTable}
                  disabled={!tableName || !tableHandle}
                  className="w-full elegant-gradient hover:opacity-90 disabled:opacity-50 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存数据表
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
