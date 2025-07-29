"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Database, FileText, Upload, Settings, Hash } from "lucide-react"
import type { DataTable } from "@/components/data-table-management"
import { DataFieldsTab } from "@/components/data-fields-tab"
import { DataUploadTab } from "@/components/data-upload-tab"
import { DataConsumptionTab } from "@/components/data-consumption-tab"

interface DataTableDetailProps {
  table: DataTable
  onBack: () => void
}

export function DataTableDetail({ table, onBack }: DataTableDetailProps) {
  const [activeTab, setActiveTab] = useState("fields")

  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-slate-500/30 text-slate-400 hover:bg-slate-500/10 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
          <div className="w-px h-6 bg-slate-700" />
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 tech-gradient rounded-xl flex items-center justify-center relative overflow-hidden">
              <Database className="w-6 h-6 text-white relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse-slow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{table.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Hash className="w-3 h-3 text-blue-400" />
                <span className="text-sm code-font text-blue-400">{table.handle}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">数据总量:</span>
            <span className="font-mono text-blue-400 font-semibold">{table.totalRecords.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">字段数:</span>
            <span className="font-mono text-purple-400 font-semibold">{table.fieldCount}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">最后更新:</span>
            <span className="font-mono text-green-400">{table.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger
            value="fields"
            className="flex items-center space-x-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
          >
            <FileText className="w-4 h-4" />
            <span>数据字段</span>
          </TabsTrigger>
          <TabsTrigger
            value="upload"
            className="flex items-center space-x-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
          >
            <Upload className="w-4 h-4" />
            <span>数据上传</span>
          </TabsTrigger>
          <TabsTrigger
            value="consumption"
            className="flex items-center space-x-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <Settings className="w-4 h-4" />
            <span>数据消费</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-6">
          <DataFieldsTab table={table} />
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <DataUploadTab table={table} />
        </TabsContent>

        <TabsContent value="consumption" className="space-y-6">
          <DataConsumptionTab table={table} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
