"use client"

import { useState, useEffect } from "react"
import { DataTableList } from "@/components/data-table-list"
import { DataTableDetail } from "@/components/data-table-detail"
import { DataTableCreate } from "@/components/data-table-create"

export interface DataTableField {
  name: string
  type: string
  required: boolean
}

export interface DataTable {
  id: number
  handle: string
  name: string
  totalRecords: number
  fieldCount: number
  lastUpdated: string
  fields: DataTableField[]
  consumptionStatus: {
    apiEnabled: boolean
    mcpEnabled: boolean
    triggerEnabled: boolean
  }
  status: string
  createdAt: string
  updatedAt: string
}



export function DataTableManagement() {
  const [selectedTable, setSelectedTable] = useState<DataTable | null>(null)
  const [dataTables, setDataTables] = useState<DataTable[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取数据表列表
  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/v1/tables/list')
        const result = await response.json()
        
        if (result.success) {
          setDataTables(result.data)
        } else {
          setError(result.error || '获取数据表列表失败')
          setDataTables([])
        }
      } catch (error) {
        console.error('获取数据表列表失败:', error)
        setError('网络错误')
        setDataTables([])
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [])

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

  return <DataTableList 
    tables={dataTables} 
    onTableSelect={handleTableSelect} 
    onCreateTable={handleCreateTable}
    loading={loading}
    error={error}
  />
}
