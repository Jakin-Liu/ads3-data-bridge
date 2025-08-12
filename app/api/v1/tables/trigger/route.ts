import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 获取所有活跃状态的数据表信息，只返回需要的字段
    const tables = await prisma.bridgeTable.findMany({
      where: {
        status: 'active' // 只获取活跃状态的表
      },
      select: {
        id: true,
        name: true, // table_name
        alias_name: true // table别名
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // 格式化返回数据
    const formattedTables = tables.map(table => ({
      id: table.id,
      name: table.name,
      aliasName: table.alias_name || table.name // 如果没有别名，使用原名称
    }))

    return NextResponse.json({
      success: true,
      data: formattedTables,
      total: formattedTables.length
    })

  } catch (error) {
    console.error('获取触发器表信息失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取触发器表信息失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
