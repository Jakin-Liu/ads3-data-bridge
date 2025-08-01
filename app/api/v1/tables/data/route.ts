import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get('tableId')
    const tableName = searchParams.get('tableName')

    // 验证参数
    if (!tableId && !tableName) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数',
          message: '请提供 table_id 或 table_name 参数'
        },
        { status: 400 }
      )
    }

    // 查找表格信息
    let table
    if (tableId) {
      table = await prisma.ads3Table.findUnique({
        where: { id: parseInt(tableId) }
      })
    } else if (tableName) {
      table = await prisma.ads3Table.findFirst({
        where: { 
          OR: [
            { name: tableName },
            { alias_name: tableName }
          ]
        }
      })
    }

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          error: '表格不存在',
          message: '未找到指定的表格'
        },
        { status: 404 }
      )
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
      )
    }

    // 动态查询表格数据
    const actualTableName = `user_data_${table.name}`
    
    try {
      // 使用 information_schema.columns 获取表格字段信息
      const columnsInfo = await prisma.$queryRawUnsafe(
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

      // 查询表的唯一键信息
      const uniqueKeysInfo = await prisma.$queryRawUnsafe(
        `SELECT tc.constraint_name,
               string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS unique_columns
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = $1
          AND tc.constraint_type = 'UNIQUE'
        GROUP BY tc.constraint_name`,
        actualTableName
      )

      // 使用原生SQL查询来获取动态表格的数据
      const data = await prisma.$queryRawUnsafe(
        `SELECT * FROM "${actualTableName}" ORDER BY id DESC LIMIT 100`
      )

      // 生成字段列表信息，排除created_at和updated_at字段
      const fields = Array.isArray(columnsInfo) ? columnsInfo
        .filter(column => column.column_name !== 'created_at' && column.column_name !== 'updated_at' && column.column_name !== 'id')
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
            name: column.column_name,
            type: convertedType,
            original_type: column.data_type,
            required: column.is_nullable === 'NO'
          }
        }) : []

      // 格式化records数据，排除created_at和updated_at字段
      const formattedRecords = Array.isArray(data) ? data.map((record, index) => {
        const filteredRecord = { ...record }
        delete filteredRecord.created_at
        delete filteredRecord.updated_at
        delete filteredRecord.id
        
        return {
          id: index + 1,
          fields: Object.keys(filteredRecord),
          values: Object.values(filteredRecord)
        }
      }) : []

      return NextResponse.json({
        success: true,
        data: {
          tableInfo: {
            id: table.id,
            name: table.name
          },
          fields: fields,
          records: formattedRecords,
          total: Array.isArray(data) ? data.length : 0,
          limit: 100,
          tableName: table.name,
          uniqueKeys: Array.isArray(uniqueKeysInfo) ? uniqueKeysInfo.flatMap(key => 
            key.unique_columns.split(', ').map((col: string) => col.trim())
          ) : []
        }
      })

    } catch (queryError) {
      // 如果查询失败，可能是因为表格不存在或结构问题
      console.error('查询表格数据失败:', queryError)
      
      return NextResponse.json(
        {
          success: false,
          error: '查询表格数据失败',
          message: '无法获取表格数据，可能表格不存在或结构有问题',
          details: queryError instanceof Error ? queryError.message : '未知查询错误'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('获取表格数据失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取表格数据失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
