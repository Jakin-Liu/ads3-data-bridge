import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取表信息
async function getTableInfo(tableName: string) {
  const table = await prisma.ads3Table.findFirst({
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

// 验证字段是否存在于表中
function validateFields(requestedFields: string[], availableFields: any[]) {
  const availableFieldNames = availableFields.map(field => field.column_name);
  const invalidFields = requestedFields.filter(field => !availableFieldNames.includes(field));
  
  return {
    valid: invalidFields.length === 0,
    invalidFields
  };
}

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

    // 获取URL参数
    const { searchParams } = new URL(request.url);
    const consumer = searchParams.get('consumer');
    const fields = searchParams.getAll('fields');

    // 验证必需参数
    if (!consumer) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少consumer参数',
          message: '请提供consumer参数'
        },
        { status: 400 }
      );
    }

    // 如果fields长度为0，表示返回所有字段
    const requestedFields = fields.length === 0 ? [] : fields;

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

    // 验证请求的字段是否有效（仅当指定了特定字段时）
    if (requestedFields.length > 0) {
      const fieldValidation = validateFields(requestedFields, tableColumns);
      if (!fieldValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: '字段验证失败',
            message: '请求的字段不存在',
            details: {
              invalidFields: fieldValidation.invalidFields,
              availableFields: tableColumns.map(col => col.column_name)
            }
          },
          { status: 400 }
        );
      }
    }

    // 获取消费者的游标信息
    const cursorResult = await prisma.$queryRawUnsafe(`
      SELECT * FROM "ads3_consumer_cursor" 
      WHERE "consumer" = $1 AND "table_id" = $2
      LIMIT 1
    `, consumer, table.id);
    
    let cursor = Array.isArray(cursorResult) && cursorResult.length > 0 ? cursorResult[0] : null;

    // 如果没有游标记录，创建一个新的游标
    if (!cursor) {
      const insertResult = await prisma.$executeRawUnsafe(`
        INSERT INTO "ads3_consumer_cursor" ("consumer", "table_id", "table_name", "cursor_id", "created_at", "updated_at")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, consumer, table.id, table.name, 0);
      
      cursor = {
        consumer: consumer,
        table_id: table.id,
        table_name: table.name,
        cursor_id: 0
      };
    }

    // 构建查询SQL - 基于游标查询下一条数据
    const querySQL = `
      SELECT *
      FROM "${actualTableName}"
      WHERE "id" > $1
      ORDER BY "id" ASC
      LIMIT 1
    `;

    // 执行查询
    const result = await prisma.$queryRawUnsafe(querySQL, cursor.cursor_id);
    const allData = Array.isArray(result) ? result[0] : null;

    if (!allData) {
      return NextResponse.json(
        {
          success: false,
          error: '未找到数据',
          message: `未找到consumer为 "${consumer}" 的新数据`
        },
        { status: 404 }
      );
    }

    // 更新游标到当前记录ID
    await prisma.$executeRawUnsafe(`
      UPDATE "ads3_consumer_cursor" 
      SET "cursor_id" = $1, "updated_at" = NOW()
      WHERE "consumer" = $2 AND "table_id" = $3
    `, allData.id, consumer, table.id);

    // 过滤字段 - 如果指定了特定字段，则只返回这些字段，并按照fields顺序排列
    let filteredData = allData;
    if (requestedFields.length > 0) {
      filteredData = {};
      requestedFields.forEach(field => {
        if (allData.hasOwnProperty(field)) {
          filteredData[field] = allData[field];
        }
      });
    } else {
      // 如果fields为空，按照数据库字段顺序返回所有字段
      filteredData = {};
      tableColumns.forEach(column => {
        if (allData.hasOwnProperty(column.column_name)) {
          filteredData[column.column_name] = allData[column.column_name];
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        consumer: consumer,
        data: [filteredData]
      }
    });

  } catch (error) {
    console.error('数据消费失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '数据消费失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 