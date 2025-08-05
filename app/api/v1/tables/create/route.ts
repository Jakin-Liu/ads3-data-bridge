import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 定义字段类型枚举
const FieldTypeEnum = z.enum(['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Text', 'Number', 'Json']);

// 定义字段验证schema
const FieldSchema = z.object({
  name: z.string().min(1, '字段名称不能为空'),
  type: FieldTypeEnum,
  required: z.boolean().default(false),
  description: z.string().optional(),
});

// 定义表创建请求的验证schema
const CreateTableSchema = z.object({
  tableName: z.string().min(1, '表名不能为空').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, '表名只能包含字母、数字和下划线，且必须以字母或下划线开头'),
  tableAliasName: z.string().min(1, '表别名不能为空'),
  description: z.string().optional(),
  fields: z.array(FieldSchema).min(1, '至少需要一个字段'),
  uniqueKeys: z.array(z.string()).optional().default([]),
});

// 将Prisma字段类型映射到PostgreSQL类型
function mapFieldTypeToPostgreSQL(type: string, required: boolean): string {
  const notNull = required ? ' NOT NULL' : '';
  
  switch (type) {
    case 'String':
      return `TEXT${notNull}`;
    case 'Text':
      return `TEXT${notNull}`;
    case 'Number':
      return `FLOAT${notNull}`;
    case 'Int':
      return `INTEGER${notNull}`;
    case 'Float':
      return `FLOAT${notNull}`;
    case 'Boolean':
      return `BOOLEAN${notNull}`;
    case 'DateTime':
      return `TIMESTAMP${notNull}`;
    case 'Json':
      return `JSONB${notNull}`;
    default:
      return `VARCHAR(255)${notNull}`;
  }
}

// 生成创建表的SQL语句
function generateCreateTableSQL(tableName: string, fields: any[]): string {
  const fieldDefinitions = fields.map(field => {
    const pgType = mapFieldTypeToPostgreSQL(field.type, field.required);
    return `"${field.name}" ${pgType}`;
  }).join(',\n  ');

  return `
CREATE TABLE IF NOT EXISTS "${tableName}" (
  id SERIAL PRIMARY KEY,
  ${fieldDefinitions},
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
}

function generateTableName (tableName: string) {
    return `user_data_${tableName}`
}

// 生成更新时间戳的触发器函数
function generateUpdateTriggerFunction(tableName: string): string {
  return `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';`;
}

// 生成创建触发器的SQL语句
function generateCreateTriggerSQL(tableName: string): string {
  return `
CREATE TRIGGER update_${tableName}_updated_at 
    BEFORE UPDATE ON "${tableName}"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();`;
}

// 生成创建唯一键约束的SQL语句
// uniqueKeys是字符串数组，表示这些字段共同组成一个唯一键
function generateUniqueKeyConstraintsSQL(tableName: string, uniqueKeys: string[]): string[] {
  if (!uniqueKeys || uniqueKeys.length === 0) {
    return [];
  }

  // 将字段数组转换为带引号的字段名，用逗号分隔
  const fieldNames = uniqueKeys.map(field => `"${field}"`).join(', ');
  // 生成唯一键约束名称，使用表名和key名字用下划线分开
  const keyName = uniqueKeys.join('_');
  const constraintName = `${tableName}_${keyName}_unique`;
  return [`ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}" UNIQUE (${fieldNames});`];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = CreateTableSchema.parse(body);
    
    const { tableName, tableAliasName, description, fields, uniqueKeys } = validatedData;

    const genTableName = generateTableName(tableName)
    
    // 检查表名是否已存在
    const existingTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ${genTableName}
    `;
    
    if (Array.isArray(existingTable) && existingTable.length > 0) {
      return NextResponse.json(
        { error: '表名已存在，请选择其他表名' },
        { status: 400 }
      );
    }

    // 验证唯一键字段是否存在于表字段中
    if (uniqueKeys && uniqueKeys.length > 0) {
      const tableFieldNames = fields.map(field => field.name);
      for (const uniqueKey of uniqueKeys) {
        if (!tableFieldNames.includes(uniqueKey)) {
          return NextResponse.json(
            { error: `唯一键字段 "${uniqueKey}" 不存在于表字段中` },
            { status: 400 }
          );
        }
      }
    }
    
    // 生成创建表的SQL
    const createTableSQL = generateCreateTableSQL(genTableName, fields);
    const triggerFunctionSQL = generateUpdateTriggerFunction(genTableName);
    const createTriggerSQL = generateCreateTriggerSQL(genTableName);
    
    // 生成唯一键约束SQL
    const uniqueKeyConstraintsSQL = generateUniqueKeyConstraintsSQL(genTableName, uniqueKeys);
    
    // 执行SQL创建表
    await prisma.$executeRawUnsafe(createTableSQL);
    await prisma.$executeRawUnsafe(triggerFunctionSQL);
    await prisma.$executeRawUnsafe(createTriggerSQL);
    
    // 执行唯一键约束
    for (const constraintSQL of uniqueKeyConstraintsSQL) {
      await prisma.$executeRawUnsafe(constraintSQL);
    }
    
    
    // 保存表信息到ads3_tables表
    const tableRecord = await prisma.ads3Table.create({
      data: {
        name: tableName,
        alias_name: tableAliasName,
        user_id: 'system', // 这里可以根据实际用户ID进行调整
        total_count: 0,
        field_count: fields.length,
      },
    });
    
    // 保存字段信息到ads3_table_fields表
    const fieldRecords = await Promise.all(
      fields.map(field =>
        prisma.ads3TableField.create({
          data: {
            table_id: tableRecord.id,
            name: field.name,
            alias_name: field.description || field.name,
          },
        })
      )
    );
    
    return NextResponse.json({
      success: true,
      message: '表创建成功',
      data: {
        tableId: tableRecord.id,
        tableName,
        tableAliasName,
        fieldCount: fields.length,
        fields: fieldRecords,
        uniqueKeys: uniqueKeys || [],
      },
    });
    
  } catch (error) {
    console.error('创建表时发生错误:', error);
    
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
      { error: '创建表失败，请稍后重试' },
      { status: 500 }
    );
  }
}
