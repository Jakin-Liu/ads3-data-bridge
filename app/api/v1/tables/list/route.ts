import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 获取所有数据表信息
    const tables = await prisma.bridgeTable.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })

    // 获取字段数量
    // const fieldCounts = await prisma.bridgeTableField.groupBy({
    //   by: ['table_id'],
    //   where: {
    //     status: 'active'
    //   },
    //   _count: {
    //     id: true
    //   }
    // })

    // 创建字段数量映射
    // const fieldCountMap = new Map(
    //   fieldCounts.map(item => [item.table_id, item._count.id])
    // )

    // 获取消费状态信息（这里使用模拟数据，因为数据库中没有相关字段）
    const tablesWithConsumptionStatus = tables.map(table => {
      // 根据表名或ID生成消费状态
      const tableId = table.id
      const consumptionStatus = {
        apiEnabled: tableId % 3 === 0 || tableId % 3 === 1, // 模拟API启用状态
        mcpEnabled: tableId % 3 === 0 || tableId % 3 === 2, // 模拟MCP启用状态
        triggerEnabled: tableId % 3 === 0 || tableId % 3 === 1, // 模拟触发器启用状态
      }

      return {
        id: table.id,
        name: table.alias_name || table.name,
        handle: table.name, // Handle，格式为 # table_id
        totalRecords: table.total_count || 0, // 数据量
        fieldCount: table.field_count, // 字段数
        lastUpdated: table.updated_at ? 
          new Date(table.updated_at).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).replace(/\//g, '-') : 
          new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).replace(/\//g, '-'), // 最后更新
        fields: [], // 暂时使用空数组，后续可以从数据库获取字段信息
        consumptionStatus, // 消费状态
        status: table.status,
        createdAt: table.created_at,
        updatedAt: table.updated_at
      }
    })

    return NextResponse.json({
      success: true,
      data: tablesWithConsumptionStatus,
      total: tablesWithConsumptionStatus.length
    })

  } catch (error) {
    console.error('获取数据表列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取数据表列表失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
