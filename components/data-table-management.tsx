"use client"

import { useState } from "react"
import { DataTableList } from "@/components/data-table-list"
import { DataTableDetail } from "@/components/data-table-detail"
import { DataTableCreate } from "@/components/data-table-create"

export interface DataTableField {
  name: string
  type: string
  required: boolean
}

export interface DataTable {
  id: string
  handle: string
  name: string
  totalRecords: number
  fieldCount: number
  lastUpdated: string
  mcpEnabled: boolean
  apiEnabled: boolean
  triggerEnabled: boolean
  fields: DataTableField[]
}

// 模拟数据
const mockDataTables: DataTable[] = [
  {
    id: "1",
    handle: "user_behavior",
    name: "用户行为数据",
    totalRecords: 15420,
    fieldCount: 8,
    lastUpdated: "2024-01-15 14:30",
    mcpEnabled: true,
    apiEnabled: true,
    triggerEnabled: true,
    fields: [
      { name: "user_id", type: "string", required: true },
      { name: "action_type", type: "string", required: true },
      { name: "timestamp", type: "datetime", required: true },
      { name: "session_id", type: "string", required: false },
      { name: "page_url", type: "string", required: false },
      { name: "device_type", type: "string", required: false },
      { name: "location", type: "string", required: false },
      { name: "metadata", type: "json", required: false },
    ],
  },
  {
    id: "2",
    handle: "product_sales",
    name: "产品销售记录",
    totalRecords: 8932,
    fieldCount: 12,
    lastUpdated: "2024-01-14 09:15",
    mcpEnabled: false,
    apiEnabled: true,
    triggerEnabled: false,
    fields: [
      { name: "order_id", type: "string", required: true },
      { name: "product_id", type: "string", required: true },
      { name: "customer_id", type: "string", required: true },
      { name: "quantity", type: "number", required: true },
      { name: "price", type: "number", required: true },
      { name: "discount", type: "number", required: false },
      { name: "category", type: "string", required: false },
      { name: "sales_channel", type: "string", required: false },
      { name: "region", type: "string", required: false },
      { name: "payment_method", type: "string", required: false },
      { name: "created_at", type: "datetime", required: true },
      { name: "updated_at", type: "datetime", required: false },
    ],
  },
  {
    id: "3",
    handle: "customer_feedback",
    name: "客户反馈数据",
    totalRecords: 456,
    fieldCount: 6,
    lastUpdated: "2024-01-13 16:45",
    mcpEnabled: true,
    apiEnabled: false,
    triggerEnabled: true,
    fields: [
      { name: "feedback_id", type: "string", required: true },
      { name: "customer_id", type: "string", required: true },
      { name: "rating", type: "number", required: true },
      { name: "comment", type: "text", required: false },
      { name: "category", type: "string", required: false },
      { name: "created_at", type: "datetime", required: true },
    ],
  },
]

export function DataTableManagement() {
  const [selectedTable, setSelectedTable] = useState<DataTable | null>(null)
  const [dataTables, setDataTables] = useState<DataTable[]>(mockDataTables)
  const [isCreating, setIsCreating] = useState(false)

  const handleTableSelect = (table: DataTable) => {
    setSelectedTable(table)
    setIsCreating(false)
  }

  const handleCreateTable = () => {
    setSelectedTable(null)
    setIsCreating(true)
  }

  const handleBackToList = () => {
    setSelectedTable(null)
    setIsCreating(false)
  }

  const handleSaveTable = (newTable: DataTable) => {
    setDataTables((prev) => [...prev, newTable])
    setIsCreating(false)
  }

  if (isCreating) {
    return <DataTableCreate onBack={handleBackToList} onSave={handleSaveTable} />
  }

  if (selectedTable) {
    return <DataTableDetail table={selectedTable} onBack={handleBackToList} />
  }

  return <DataTableList tables={dataTables} onTableSelect={handleTableSelect} onCreateTable={handleCreateTable} />
}
