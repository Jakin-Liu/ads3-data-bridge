import { prisma } from './prisma'

export interface TableField {
  id: string
  name: string
  aliasName: string
  fieldType: string
  originalType: string
  status: 'active' | 'inactive'
  required: boolean
}

export interface TableFieldInfo {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  character_maximum_length: number | null
  numeric_precision: number | null
  numeric_scale: number | null
}

/**
 * 获取指定表的字段信息
 * @param tableName 表名（可以是实际表名或带前缀的表名）
 * @returns 字段信息数组
 */
export async function getTableFields(tableName: string): Promise<TableField[]> {
  try {
    // 确保表名格式正确，如果是简单表名则添加前缀
    const actualTableName = tableName.startsWith('user_data_') ? tableName : `user_data_${tableName}`
    
    // 查询表的字段信息
    const columnsInfo = await prisma.$queryRawUnsafe<TableFieldInfo[]>(
      `SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position`,
      actualTableName
    )

    // 转换字段信息，排除系统字段
    const fields = Array.isArray(columnsInfo) ? columnsInfo
      .filter(column => 
        column.column_name !== 'created_at' && 
        column.column_name !== 'updated_at' && 
        column.column_name !== 'id'
      )
      .map(column => {
        // 数据类型转换
        let convertedType = column.data_type
        if (column.data_type === 'text' || column.data_type === 'character varying' || column.data_type === 'varchar') {
          convertedType = 'String'
        } else if (column.data_type === 'integer' || column.data_type === 'int' || column.data_type === 'bigint' || column.data_type === 'smallint') {
          convertedType = 'Number'
        } else if (column.data_type === 'float' || column.data_type === 'double precision' || column.data_type === 'real' || column.data_type === 'numeric' || column.data_type === 'decimal') {
          convertedType = 'Number'
        } else if (column.data_type.includes('timestamp') || column.data_type === 'date' || column.data_type === 'time') {
          convertedType = 'DateTime'
        } else if (column.data_type === 'boolean') {
          convertedType = 'Boolean'
        } else if (column.data_type === 'jsonb' || column.data_type === 'json') {
          convertedType = 'Json'
        }

        return {
          id: column.column_name,
          name: column.column_name,
          aliasName: column.column_name,
          fieldType: convertedType,
          originalType: column.data_type,
          status: 'active' as const,
          required: column.is_nullable === 'NO'
        }
      }) : []

    return fields

  } catch (error) {
    console.error('获取表字段信息失败:', error)
    throw new Error(`获取表 ${tableName} 的字段信息失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 检查表是否存在
 * @param tableName 表名
 * @returns 表是否存在
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const actualTableName = tableName.startsWith('user_data_') ? tableName : `user_data_${tableName}`
    
    const result = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_name = $1`,
      actualTableName
    )
    
    return Array.isArray(result) && result.length > 0
  } catch (error) {
    console.error('检查表是否存在失败:', error)
    return false
  }
}
