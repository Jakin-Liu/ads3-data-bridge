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

// 定义创建触发器请求的验证schema
const CreateTriggerSchema = z.object({
  tableId: z.number().min(1, '数据表ID不能为空'),
  name: z.string().min(1, '触发器名称不能为空'),
  endpointType: EndpointTypeEnum,
  endpoint: EndpointConfigSchema,
  triggerType: TriggerTypeEnum,
  fields: z.array(z.string()).min(1, '至少需要选择一个字段')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = CreateTriggerSchema.parse(body);
    
    const { 
      tableId,
      name,
      endpointType,
      triggerType,
      endpoint, 
      fields
    } = validatedData;

    // 检查数据表是否存在
    const existingTable = await prisma.ads3Table.findFirst({
      where: {
        id: tableId,
        status: 'active'
      }
    });

    if (!existingTable) {
      return NextResponse.json(
        { error: '指定的数据表不存在或已禁用' },
        { status: 400 }
      );
    }

    const actualTableName = `user_data_${existingTable.name}`

    // 验证选择的字段是否存在于数据表中
    const tableFields = await getTableFields(actualTableName)

    const availableFieldNames = tableFields.map(field => field.name);
    const invalidFields = fields.filter(field => !availableFieldNames.includes(field));
    
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `以下字段不存在于数据表中: ${invalidFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    if (endpointType === 'api' && !endpoint.url) {
      return NextResponse.json(
        { error: 'API端点URL不能为空' },
        { status: 400 }
      );
    } else if (endpointType === 'agent' && !endpoint.agentId) {
      return NextResponse.json(
        { error: 'Agent端点Agent ID不能为空' },
        { status: 400 }
      );
    }

    // 创建触发器记录
    const triggerRecord = await prisma.ads3QueueSubscriber.create({
      data: {
        name,
        table_id: tableId,
        table_name: existingTable.name,
        endpoint_type: endpointType as any,
        endpoint,
        trigger_type: triggerType, // 根据模型定义，目前只支持new类型
        fields,
        trigger_config: {},
      },
    });


    return NextResponse.json({
      success: true,
      message: '触发器创建成功',
      id: triggerRecord.id.toString(),
    });
    
  } catch (error) {
    console.error('创建触发器时发生错误:', error);
    
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
      { error: '创建触发器失败，请稍后重试' },
      { status: 500 }
    );
  }
}
