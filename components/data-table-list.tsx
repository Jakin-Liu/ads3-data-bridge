"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Cpu, Activity, Zap, Hash, Database, Calendar, BarChart3, Eye, Edit } from "lucide-react"
import type { DataTable } from "@/components/data-table-management"

interface DataTableListProps {
  tables: DataTable[]
  onTableSelect: (table: DataTable) => void
  onCreateTable: () => void
  loading?: boolean
  error?: string | null
}

export function DataTableList({ tables, onTableSelect, onCreateTable, loading = false, error = null }: DataTableListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTables = tables.filter(
    (table) =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.handle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold elegant-text-gradient mb-2">数据表管理</h1>
            <p className="text-slate-600">智能数据建模与AI消费场景配置中心</p>
          </div>
          <Button
            onClick={() => {
              console.log("新建数据表按钮被点击")
              onCreateTable()
            }}
            className="elegant-gradient hover:opacity-90 transition-opacity elegant-shadow text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建数据表
          </Button>
        </div>

        {/* Search and Stats */}
        <div className="flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="搜索数据表名称或Handle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white/80 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20 elegant-shadow"
            />
          </div>

          {/* Stats Cards */}
          <div className="flex items-center space-x-4">
            <div className="elegant-card px-4 py-2 rounded-lg elegant-shadow">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-500" />
                <div className="text-sm">
                  <span className="text-slate-500">总数据表</span>
                  <div className="font-bold text-slate-800">{tables.length}</div>
                </div>
              </div>
            </div>
            <div className="elegant-card px-4 py-2 rounded-lg elegant-shadow">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-500" />
                <div className="text-sm">
                  <span className="text-slate-500">API消费</span>
                  <div className="font-bold text-green-600">{tables.filter((t) => t.consumptionStatus?.apiEnabled).length}</div>
                </div>
              </div>
            </div>
            <div className="elegant-card px-4 py-2 rounded-lg elegant-shadow">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <div className="text-sm">
                  <span className="text-slate-500">总记录</span>
                  <div className="font-bold text-purple-600 code-font">
                    {tables.reduce((sum, t) => sum + t.totalRecords, 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table List */}
      <div className="elegant-card rounded-xl overflow-hidden elegant-shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600">正在加载数据表...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600 mb-2">加载失败</p>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-slate-200/60">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">数据表</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">Handle</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">数据量</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">字段数</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">消费状态</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">最后更新</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTables.map((table) => (
                <tr
                  key={table.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => onTableSelect(table)}
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 elegant-gradient rounded-lg flex items-center justify-center elegant-shadow">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{table.name}</div>
                        <div className="text-sm text-slate-500">数据表</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Hash className="w-3 h-3 text-blue-500" />
                      <span className="code-font text-blue-600 text-sm">{table.handle}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                      <span className="code-font text-slate-800 font-semibold">
                        {table.totalRecords.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="code-font text-slate-600">{table.fieldCount}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {table.consumptionStatus?.apiEnabled && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                          API
                        </Badge>
                      )}
                      {table.consumptionStatus?.mcpEnabled && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">
                          MCP
                        </Badge>
                      )}
                      {table.consumptionStatus?.triggerEnabled && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-600 border-yellow-200">
                          触发器
                        </Badge>
                      )}
                      {!table.consumptionStatus?.apiEnabled && !table.consumptionStatus?.mcpEnabled && !table.consumptionStatus?.triggerEnabled && (
                        <span className="text-slate-400 text-sm">未配置</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="code-font text-green-600 text-sm">{table.lastUpdated}</span>
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
                          onTableSelect(table)
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
                              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-16">
          <div className="elegant-card max-w-md mx-auto p-8 rounded-2xl elegant-shadow">
            <div className="text-slate-400 mb-4">
              <Search className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2">未找到匹配的数据表</h3>
            <p className="text-slate-500 mb-4">尝试调整搜索条件或创建新的数据表</p>
            <Button className="elegant-gradient text-white" onClick={onCreateTable}>
              <Plus className="w-4 h-4 mr-2" />
              创建数据表
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
