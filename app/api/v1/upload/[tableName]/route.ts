import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendToQueue } from '@/lib/cloudflare';

// 定义上传数据的验证schema
const UploadDataSchema = z.object({
  data: z.array(z.record(z.any())).min(1, '数据不能为空'),
});

// 验证请求数据
const validateUploadRequest = (body: any) => {
  return UploadDataSchema.parse(body);
};

// 获取表信息
async function getTableInfo(tableName: string) {
  const table = await prisma.bridgeTable.findFirst({
    where: { 
      OR: [
        { name: tableName },
        { alias_name: tableName }
      ]
    }
  });
  
  return table;
}

// 获取表的实际字段信息
async function getTableColumns(actualTableName: string) {
  try {
    const columnsInfo = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = ${actualTableName}
      AND column_name NOT IN ('id', 'created_at', 'updated_at')
      ORDER BY ordinal_position
    `;
    
    return Array.isArray(columnsInfo) ? columnsInfo : [];
  } catch (error) {
    console.error('获取表字段信息失败:', error);
    throw new Error('无法获取表字段信息');
  }
}

// 验证数据字段是否与表结构一致
function validateDataFields(data: any[], expectedFields: any[]) {
  const expectedFieldNames = expectedFields.map(field => field.column_name);
  const errors: string[] = [];
  
  data.forEach((record, index) => {
    const recordFields = Object.keys(record);
    
    // 检查是否有未定义的字段
    const unknownFields = recordFields.filter(field => !expectedFieldNames.includes(field));
    if (unknownFields.length > 0) {
      errors.push(`记录 ${index + 1}: 包含未定义的字段: ${unknownFields.join(', ')}`);
    }
    
    // 检查必需字段是否存在
    const requiredFields = expectedFields
      .filter(field => field.is_nullable === 'NO' && !field.column_default)
      .map(field => field.column_name);
    
    const missingFields = requiredFields.filter(field => !recordFields.includes(field));
    if (missingFields.length > 0) {
      errors.push(`记录 ${index + 1}: 缺少必需字段: ${missingFields.join(', ')}`);
    }
  });
  
  return errors;
}



// 处理数据类型转换
function processValue(value: any, fieldType: string): any {
  if (value === null || value === undefined) {
    return null;
  }
  
  switch (fieldType) {
    case 'timestamp':
    case 'timestamp without time zone':
    case 'timestamp with time zone':
      // 如果是字符串格式的时间戳，转换为Date对象
      if (typeof value === 'string') {
        return new Date(value);
      }
      return value;
    case 'integer':
    case 'bigint':
    case 'smallint':
      return parseInt(value);
    case 'double precision':
    case 'real':
    case 'numeric':
      return parseFloat(value);
    case 'boolean':
      return Boolean(value);
    case 'json':
    case 'jsonb':
      // 处理JSON数据类型
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (error) {
          console.warn('JSON解析失败，保持原始字符串:', value);
          return value;
        }
      } else if (typeof value === 'object') {
        // 如果已经是对象或数组，直接返回
        return value;
      } else {
        // 其他类型转换为字符串
        return String(value);
      }
    default:
      return value;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tableName: string }> }
) {
  try {
    const { tableName } = await params;

    if (!tableName) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少表名参数',
          message: '请提供有效的表名'
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = validateUploadRequest(body);
    const { data } = validatedData;
    
    // 获取表信息
    const table = await getTableInfo(tableName);
    if (!table) {
      return NextResponse.json(
        {
          success: false,
          error: '表格不存在',
          message: `未找到表名为 "${tableName}" 的表格`
        },
        { status: 404 }
      );
    }
    
    // 检查表格状态
    if (table.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: '表格不可用',
          message: '该表格当前不可用'
        },
        { status: 400 }
      );
    }
    
    // 获取实际表名
    const actualTableName = `user_data_${table.name}`;
    
    // 获取表的字段信息
    const tableColumns = await getTableColumns(actualTableName);
    if (tableColumns.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '表格结构错误',
          message: '无法获取表格字段信息'
        },
        { status: 500 }
      );
    }
    
    // 验证数据字段一致性
    const fieldErrors = validateDataFields(data, tableColumns);
    if (fieldErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: '数据字段验证失败',
          message: '数据字段与表结构不匹配',
          details: fieldErrors
        },
        { status: 400 }
      );
    }
    
    // 插入数据
    let insertedCount = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < data.length; i++) {
      try {

        await sendToQueue(process.env.ADS3_BOT_MESSAGE_QUEUE || '', {
          table: tableName,
          data: [data[i]]
        });

        insertedCount++;
        continue;
        const record = data[i];
        const fields = Object.keys(record);
        
        // 处理数据类型转换
        const processedValues = fields.map(field => {
          const value = record[field];
          const fieldInfo = tableColumns.find(col => col.column_name === field);
          const fieldType = fieldInfo ? fieldInfo.data_type : 'text';
          const processedValue = processValue(value, fieldType);
          
          // 对于JSON类型，确保数据被正确序列化
          if (fieldType === 'json' || fieldType === 'jsonb') {
            if (typeof processedValue === 'object' && processedValue !== null) {
              return JSON.stringify(processedValue);
            }
          }
          
          return processedValue;
        });
        
        // 生成带类型转换的SQL
        const fieldList = fields.map(field => `"${field}"`).join(', ');
        const valuePlaceholders = fields.map((field, index) => {
          const fieldInfo = tableColumns.find(col => col.column_name === field);
          const fieldType = fieldInfo ? fieldInfo.data_type : 'text';
          
          if (fieldType === 'jsonb') {
            return `$${index + 1}::jsonb`;
          } else if (fieldType === 'json') {
            return `$${index + 1}::json`;
          } else {
            return `$${index + 1}`;
          }
        }).join(', ');
        
        const insertSQL = `
          INSERT INTO "${actualTableName}" (${fieldList})
          VALUES (${valuePlaceholders})
        `;
        await prisma.$executeRawUnsafe(insertSQL, ...processedValues);
        
        insertedCount++;
      } catch (error) {
        console.error(`插入记录 ${i + 1} 失败:`, error);
        errors.push(`记录 ${i + 1}: ${error instanceof Error ? error.message : '插入失败'}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: '数据上传完成',
      data: {
        tableId: table.id,
        tableName: table.name,
        targetTable: tableName,
        total: data.length,
        insertedCount: insertedCount,
        errorCount: errors.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });
    
  } catch (error) {
    console.error('数据上传失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '数据验证失败',
          message: '请求数据格式不正确',
          details: error.errors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: '数据上传失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 添加 GET 方法用于获取表信息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tableName: string }> }
) {
  try {
    const { tableName } = await params;
    
    if (!tableName) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少表名参数',
          message: '请提供有效的表名'
        },
        { status: 400 }
      );
    }
    
    // 获取表信息
    const table = await getTableInfo(tableName);
    if (!table) {
      return NextResponse.json(
        {
          success: false,
          error: '表格不存在',
          message: `未找到表名为 "${tableName}" 的表格`
        },
        { status: 404 }
      );
    }
    
    // 获取表的字段信息
    const actualTableName = `user_data_${table.name}`;
    const tableColumns = await getTableColumns(actualTableName);
    
    return NextResponse.json({
      success: true,
      data: {
        table: {
          id: table.id,
          name: table.name,
          alias_name: table.alias_name,
          status: table.status
        },
        columns: tableColumns
      }
    });
    
  } catch (error) {
    console.error('获取表信息失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '获取表信息失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 