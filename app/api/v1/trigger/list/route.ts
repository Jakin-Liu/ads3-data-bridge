import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 获取所有触发器信息
    const triggers = await prisma.ads3QueueSubscriber.findMany({
      where: {
        // status: 'active'
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // 提取所有被使用的table_id
    const usedTableIds = [...new Set(triggers.map(trigger => trigger.table_id))];

    // 根据table_id查询被使用的表信息
    const usedTables = await prisma.ads3Table.findMany({
      where: {
        id: {
          in: usedTableIds
        },
        status: 'active' // 只获取活跃状态的表
      },
      select: {
        id: true,
        name: true,
        alias_name: true,
        status: true,
      }
    });

    // 创建table_id到表信息的映射
    const tableMap = new Map(usedTables.map(table => [table.id, table]));

    // 构建触发器列表数据
    const triggersWithTableInfo = triggers.map(trigger => {
      const tableInfo = tableMap.get(trigger.table_id);
      const triggerConfig = trigger.trigger_config as any;
      const endpointConfig = trigger.endpoint as any;

      return {
        id: trigger.id.toString(),
        tableAlias: tableInfo?.alias_name,
        name: trigger?.name,
        tableId: trigger.table_id,
        tableName: trigger.table_name,
        triggerType: trigger.trigger_type,
        triggerTarget: trigger.endpoint_type,
        triggerConfig: trigger.trigger_config,
        endpointConfig: trigger.endpoint,
        fields: trigger.fields || [],
        enabled: trigger.status === 'active',
        successCount: 0, // 暂时设为0，后续可以从其他表获取
        failureCount: 0, // 暂时设为0，后续可以从其他表获取
        createdAt: trigger.created_at.toISOString(),
        updatedAt: trigger.updated_at.toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        list: triggersWithTableInfo,
        total: triggersWithTableInfo.length
      },
    });

  } catch (error) {
    console.error('获取触发器列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取触发器列表失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 