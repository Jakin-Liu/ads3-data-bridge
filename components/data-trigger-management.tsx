"use client"

import { useState } from "react"
import { DataTriggerList } from "@/components/data-trigger-list"
import { DataTriggerDetail } from "@/components/data-trigger-detail"

export interface DataTrigger {
  id: string
  name: string
  tableId: string
  tableName: string
  tableHandle: string
  triggerType: "schedule" | "increment" | "immediate"
  triggerTarget: "agent" | "url"
  scheduleInterval?: string
  incrementCount?: string
  agentId?: string
  triggerUrl?: string
  selectedFields: string[]
  enabled: boolean
  lastTriggered?: string
  successCount: number
  failureCount: number
  createdAt: string
}

// 模拟触发器数据
const mockTriggers: DataTrigger[] = [
  {
    id: "1",
    name: "用户行为数据定时推送",
    tableId: "1",
    tableName: "用户行为数据",
    tableHandle: "user_behavior",
    triggerType: "schedule",
    triggerTarget: "agent",
    scheduleInterval: "30",
    agentId: "agent_12345",
    selectedFields: ["user_id", "action_type", "timestamp", "page_url"],
    enabled: true,
    lastTriggered: "2024-01-15 15:30",
    successCount: 1245,
    failureCount: 12,
    createdAt: "2024-01-10 10:00",
  },
  {
    id: "2",
    name: "销售数据增量触发",
    tableId: "2",
    tableName: "产品销售记录",
    tableHandle: "product_sales",
    triggerType: "increment",
    triggerTarget: "url",
    incrementCount: "50",
    triggerUrl: "https://api.example.com/webhook/sales",
    selectedFields: ["order_id", "product_id", "customer_id", "price", "created_at"],
    enabled: true,
    lastTriggered: "2024-01-15 14:20",
    successCount: 892,
    failureCount: 5,
    createdAt: "2024-01-08 14:30",
  },
  {
    id: "3",
    name: "客户反馈立即推送",
    tableId: "3",
    tableName: "客户反馈数据",
    tableHandle: "customer_feedback",
    triggerType: "immediate",
    triggerTarget: "agent",
    agentId: "agent_67890",
    selectedFields: ["feedback_id", "customer_id", "rating", "comment"],
    enabled: false,
    lastTriggered: "2024-01-14 16:45",
    successCount: 156,
    failureCount: 2,
    createdAt: "2024-01-05 09:15",
  },
]

export function DataTriggerManagement() {
  const [selectedTrigger, setSelectedTrigger] = useState<DataTrigger | null>(null)
  const [triggers, setTriggers] = useState<DataTrigger[]>(mockTriggers)
  const [isCreating, setIsCreating] = useState(false)

  const handleTriggerSelect = (trigger: DataTrigger) => {
    setSelectedTrigger(trigger)
    setIsCreating(false)
  }

  const handleCreateTrigger = () => {
    setSelectedTrigger(null)
    setIsCreating(true)
  }

  const handleBackToList = () => {
    setSelectedTrigger(null)
    setIsCreating(false)
  }

  if (selectedTrigger || isCreating) {
    return <DataTriggerDetail trigger={selectedTrigger} isCreating={isCreating} onBack={handleBackToList} />
  }

  return (
    <DataTriggerList triggers={triggers} onTriggerSelect={handleTriggerSelect} onCreateTrigger={handleCreateTrigger} />
  )
}
