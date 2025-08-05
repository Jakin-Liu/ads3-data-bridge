import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 获取触发器信息
    const trigger = await prisma.ads3QueueSubscriber.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!trigger) {
      return NextResponse.json(
        { error: '触发器不存在' },
        { status: 404 }
      );
    }

    // 获取关联的数据表信息
    const tableInfo = await prisma.ads3Table.findFirst({
      where: {
        name: trigger.table_name,
        status: 'active'
      }
    });

    const triggerConfig = trigger.trigger_config as any;
    const endpointConfig = trigger.endpoint as any;

    // 构建响应数据
    const responseData = {
      id: trigger.id.toString(),
      name: triggerConfig?.name || `触发器-${trigger.id}`,
      tableId: tableInfo?.id.toString() || '',
      tableName: tableInfo?.alias_name || tableInfo?.name || trigger.table_name,
      tableHandle: trigger.table_name,
      triggerType: triggerConfig?.triggerType,
      endpointType: triggerConfig?.endpointType,
      endpointConfig,
      selectedFields: trigger.fields || [],
      enabled: trigger.status === 'active',
      successCount: 0, // 暂时设为0，后续可以从其他表获取
      failureCount: 0, // 暂时设为0，后续可以从其他表获取
      createdAt: trigger.created_at.toISOString(),
      updatedAt: trigger.updated_at.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('获取触发器详情失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取触发器详情失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 