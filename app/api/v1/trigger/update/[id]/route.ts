import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getTableFields } from '@/lib/db';

// 定义触发器类型枚举
const TriggerTypeEnum = z.enum(['new']);

// 定义端点类型枚举
const EndpointTypeEnum = z.enum(['api', 'agent']);

// 定义端点配置验证schema
const EndpointConfigSchema = z.object({
  url: z.string().url().optional(),
  agentId: z.string().optional()
});

// 定义更新触发器请求的验证schema
const UpdateTriggerSchema = z.object({
  name: z.string().min(1, '触发器名称不能为空').optional(),
  endpointType: EndpointTypeEnum.optional(),
  endpoint: EndpointConfigSchema.optional(),
  triggerType: TriggerTypeEnum.optional(),
  fields: z.array(z.string()).min(1, '至少需要选择一个字段').optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = UpdateTriggerSchema.parse(body);
    
    // 检查触发器是否存在
    const existingTrigger = await prisma.ads3QueueSubscriber.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!existingTrigger) {
      return NextResponse.json(
        { error: '触发器不存在' },
        { status: 404 }
      );
    }

    // 检查数据表是否存在
    const existingTable = await prisma.ads3Table.findFirst({
      where: {
        id: existingTrigger.table_id,
        status: 'active'
      }
    });

    if (!existingTable) {
      return NextResponse.json(
        { error: '关联的数据表不存在或已禁用' },
        { status: 400 }
      );
    }

    const actualTableName = `user_data_${existingTable.name}`;

    // 如果更新了字段选择，验证字段是否存在于数据表中
    if (validatedData.fields) {
      const tableFields = await getTableFields(actualTableName);
      const availableFieldNames = tableFields.map(field => field.name);
      const invalidFields = validatedData.fields.filter(field => !availableFieldNames.includes(field));
      
      if (invalidFields.length > 0) {
        return NextResponse.json(
          { error: `以下字段不存在于数据表中: ${invalidFields.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // 验证端点配置
    if (validatedData.endpointType === 'api' && validatedData.endpoint && !validatedData.endpoint.url) {
      return NextResponse.json(
        { error: 'API端点URL不能为空' },
        { status: 400 }
      );
    } else if (validatedData.endpointType === 'agent' && validatedData.endpoint && !validatedData.endpoint.agentId) {
      return NextResponse.json(
        { error: 'Agent端点Agent ID不能为空' },
        { status: 400 }
      );
    }

    // 构建更新数据
    const updateData: any = {
    };

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }

    if (validatedData.endpointType !== undefined) {
      updateData.endpoint_type = validatedData.endpointType;
    }

    if (validatedData.endpoint !== undefined) {
      updateData.endpoint = validatedData.endpoint;
    }

    if (validatedData.triggerType !== undefined) {
      updateData.trigger_type = validatedData.triggerType;
    }

    if (validatedData.fields !== undefined) {
      updateData.fields = validatedData.fields;
    }

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }

    // 更新触发器记录
    const updatedTrigger = await prisma.ads3QueueSubscriber.update({
      where: {
        id: parseInt(id)
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: '触发器更新成功',
      data: {
        id: updatedTrigger.id.toString()
      },
    });
    
  } catch (error) {
    console.error('更新触发器时发生错误:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: '数据验证失败', 
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '更新触发器失败，请稍后重试' },
      { status: 500 }
    );
  }
} 