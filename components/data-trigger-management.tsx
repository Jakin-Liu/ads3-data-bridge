"use client"

import { useState } from "react"
import { DataTriggerList } from "@/components/data-trigger-list"
import { DataTriggerDetail } from "@/components/data-trigger-detail"

export interface DataTrigger {
  id: string
  name: string
  tableId: string | number
  tableName: string
  tableHandle: string
  tableAlias?: string
  triggerType: string
  endpointType: string
  triggerConfig?: any
  endpointConfig?: any
  fields: string[]
  selectedFields: string[]
  enabled: boolean
  successCount: number
  failureCount: number
  lastTriggered?: string | null
  createdAt: string
  updatedAt: string
  agentId?: string
  triggerUrl?: string
  incrementCount?: string
  scheduleInterval?: string
}

export function DataTriggerManagement() {
  const [selectedTrigger, setSelectedTrigger] = useState<DataTrigger | null>(null)
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
    <DataTriggerList onTriggerSelect={handleTriggerSelect} onCreateTrigger={handleCreateTrigger} />
  )
}
