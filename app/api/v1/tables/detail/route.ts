import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get('tableId')
    const tableName = searchParams.get('tableName')

    if (!tableId && !tableName) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数',
          message: '请提供 tableId 或 tableName 参数'
        },
        { status: 400 }
      )
    }

    // 构建查询条件
    const whereCondition = tableId 
      ? { id: parseInt(tableId) }
      : { name: tableName! }

    // 获取表格基础信息
    const table = await prisma.ads3Table.findFirst({
      where: whereCondition
    })

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

    // 获取表格字段信息 - 参考 data 路由的 columnsInfo 获取逻辑
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

      // 生成字段列表信息，排除created_at和updated_at字段
      const fields = Array.isArray(columnsInfo) ? columnsInfo
        .filter(column => column.column_name !== 'created_at' && column.column_name !== 'updated_at' && column.column_name !== 'id')
        .map(column => {
          // 数据类型转换，参考 data route 的写法
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
            id: column.column_name, // 使用字段名作为ID
            name: column.column_name,
            aliasName: column.column_name, // 暂时使用字段名作为别名
            fieldType: convertedType,
            originalType: column.data_type,
            status: 'active',
            required: column.is_nullable === 'NO'
          }
        }) : []


      // 生成模板数据
      const templateData = generateTemplateData(fields)

      // 构建响应数据
      const tableInfo = {
        id: table.id,
        name: table.name,
        aliasName: table.alias_name,
        status: table.status,
        totalCount: table.total_count,
        fieldCount: table.field_count,
        createdAt: table.created_at,
        updatedAt: table.updated_at,
        fields: fields,
        templateData: [templateData]
      }

      return NextResponse.json({
        success: true,
        data: tableInfo
      })

    } catch (queryError) {
      // 如果查询失败，可能是因为表格不存在或结构问题
      console.error('查询表格字段失败:', queryError)
      
      return NextResponse.json(
        {
          success: false,
          error: '查询表格字段失败',
          message: '无法获取表格字段信息，可能表格不存在或结构有问题',
          details: queryError instanceof Error ? queryError.message : '未知查询错误'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('获取表格详情失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取表格详情失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// 生成模板数据的函数
function generateTemplateData(fields: any[]) {
  const templateData: Record<string, any> = {}
  
  fields.forEach(field => {
    const fieldName = field.aliasName || field.name
    const fieldType = field.fieldType
    
    // 根据字段类型和字段名生成示例数据
    if (fieldType === 'DateTime') {
      templateData[fieldName] = '2025-07-30T08:38:11.630Z'
    } else if (fieldType === 'Number') {
      // 根据字段名生成数字类型数据
      if (fieldName.includes('id') || fieldName.includes('ID')) {
        templateData[fieldName] = 1
      } else if (fieldName.includes('count') || fieldName.includes('Count')) {
        templateData[fieldName] = 100
      } else if (fieldName.includes('price') || fieldName.includes('Price')) {
        templateData[fieldName] = 99.99
      } else if (fieldName.includes('score') || fieldName.includes('Score')) {
        templateData[fieldName] = 4.5
      } else if (fieldName.includes('rank') || fieldName.includes('Rank')) {
        templateData[fieldName] = 1
      } else if (fieldName.includes('order') || fieldName.includes('Order')) {
        templateData[fieldName] = 1
      } else if (fieldName.includes('sort') || fieldName.includes('Sort')) {
        templateData[fieldName] = 1
      } else if (fieldName.includes('length') || fieldName.includes('Length')) {
        templateData[fieldName] = 100
      } else if (fieldName.includes('width') || fieldName.includes('Width')) {
        templateData[fieldName] = 50
      } else if (fieldName.includes('height') || fieldName.includes('Height')) {
        templateData[fieldName] = 30
      } else if (fieldName.includes('area') || fieldName.includes('Area')) {
        templateData[fieldName] = 150.5
      } else if (fieldName.includes('volume') || fieldName.includes('Volume')) {
        templateData[fieldName] = 1000.0
      } else if (fieldName.includes('weight') || fieldName.includes('Weight')) {
        templateData[fieldName] = 1.5
      } else if (fieldName.includes('rate') || fieldName.includes('Rate')) {
        templateData[fieldName] = 0.85
      } else {
        templateData[fieldName] = 42
      }
    } else if (fieldType === 'Boolean') {
      // 根据字段名生成布尔类型数据
      if (fieldName.includes('enabled') || fieldName.includes('Enabled')) {
        templateData[fieldName] = true
      } else if (fieldName.includes('visible') || fieldName.includes('Visible')) {
        templateData[fieldName] = true
      } else if (fieldName.includes('active') || fieldName.includes('Active')) {
        templateData[fieldName] = true
      } else if (fieldName.includes('deleted') || fieldName.includes('Deleted')) {
        templateData[fieldName] = false
      } else if (fieldName.includes('is_') || fieldName.includes('has_')) {
        templateData[fieldName] = true
      } else {
        templateData[fieldName] = true
      }
    } else if (fieldType === 'Json') {
      templateData[fieldName] = { data: 'example', timestamp: Date.now() }
    } else if (fieldType === 'JSON') {
      // 根据字段名生成JSON类型数据
      if (fieldName.includes('config') || fieldName.includes('Config')) {
        templateData[fieldName] = { key: 'value', enabled: true }
      } else if (fieldName.includes('setting') || fieldName.includes('Setting')) {
        templateData[fieldName] = { enabled: true, theme: 'dark' }
      } else if (fieldName.includes('metadata') || fieldName.includes('Meta')) {
        templateData[fieldName] = { version: '1.0', author: 'system' }
      } else if (fieldName.includes('options') || fieldName.includes('Option')) {
        templateData[fieldName] = { type: 'default', mode: 'auto' }
      } else {
        templateData[fieldName] = { data: 'example', timestamp: Date.now() }
      }
    } else if (fieldType === 'Array') {
      // 根据字段名生成数组类型数据
      if (fieldName.includes('tags') || fieldName.includes('Tags')) {
        templateData[fieldName] = ['tag1', 'tag2', 'tag3']
      } else if (fieldName.includes('categories') || fieldName.includes('Categories')) {
        templateData[fieldName] = ['category1', 'category2']
      } else if (fieldName.includes('images') || fieldName.includes('Images')) {
        templateData[fieldName] = ['image1.jpg', 'image2.jpg']
      } else if (fieldName.includes('files') || fieldName.includes('Files')) {
        templateData[fieldName] = ['file1.pdf', 'file2.doc']
      } else if (fieldName.includes('list') || fieldName.includes('List')) {
        templateData[fieldName] = ['item1', 'item2', 'item3']
      } else {
        templateData[fieldName] = [1, 2, 3, 4, 5]
      }
    } else {
      // String 类型 - 根据字段名生成字符串类型数据
      if (fieldName.includes('name') || fieldName.includes('Name')) {
        templateData[fieldName] = 'John Doe'
      } else if (fieldName.includes('email') || fieldName.includes('Email')) {
        templateData[fieldName] = 'john.doe@example.com'
      } else if (fieldName.includes('phone') || fieldName.includes('Phone')) {
        templateData[fieldName] = '+1-555-123-4567'
      } else if (fieldName.includes('address') || fieldName.includes('Address')) {
        templateData[fieldName] = '123 Main Street, New York, NY 10001'
      } else if (fieldName.includes('url') || fieldName.includes('URL')) {
        templateData[fieldName] = 'https://example.com'
      } else if (fieldName.includes('image') || fieldName.includes('Image')) {
        templateData[fieldName] = 'https://example.com/image.jpg'
      } else if (fieldName.includes('code') || fieldName.includes('Code')) {
        templateData[fieldName] = 'CODE001'
      } else if (fieldName.includes('type') || fieldName.includes('Type')) {
        templateData[fieldName] = 'default'
      } else if (fieldName.includes('category') || fieldName.includes('Category')) {
        templateData[fieldName] = 'General'
      } else if (fieldName.includes('tag') || fieldName.includes('Tag')) {
        templateData[fieldName] = 'sample-tag'
      } else if (fieldName.includes('color') || fieldName.includes('Color')) {
        templateData[fieldName] = '#FF6B35'
      } else if (fieldName.includes('size') || fieldName.includes('Size')) {
        templateData[fieldName] = 'M'
      } else if (fieldName.includes('level') || fieldName.includes('Level')) {
        templateData[fieldName] = 'A'
      } else if (fieldName.includes('grade') || fieldName.includes('Grade')) {
        templateData[fieldName] = 'A+'
      } else if (fieldName.includes('priority') || fieldName.includes('Priority')) {
        templateData[fieldName] = 'high'
      } else if (fieldName.includes('status') || fieldName.includes('Status')) {
        templateData[fieldName] = 'active'
      } else if (fieldName.includes('description') || fieldName.includes('Description')) {
        templateData[fieldName] = 'This is a sample description for the field'
      } else if (fieldName.includes('title') || fieldName.includes('Title')) {
        templateData[fieldName] = 'Sample Title'
      } else if (fieldName.includes('subject') || fieldName.includes('Subject')) {
        templateData[fieldName] = 'Sample Subject'
      } else if (fieldName.includes('message') || fieldName.includes('Message')) {
        templateData[fieldName] = 'This is a sample message'
      } else if (fieldName.includes('content') || fieldName.includes('Content')) {
        templateData[fieldName] = 'This is sample content for the field'
      } else if (fieldName.includes('text') || fieldName.includes('Text')) {
        templateData[fieldName] = 'Sample text content'
      } else if (fieldName.includes('summary') || fieldName.includes('Summary')) {
        templateData[fieldName] = 'This is a brief summary'
      } else if (fieldName.includes('detail') || fieldName.includes('Detail')) {
        templateData[fieldName] = 'Detailed information about this item'
      } else if (fieldName.includes('note') || fieldName.includes('Note')) {
        templateData[fieldName] = 'This is a sample note'
      } else if (fieldName.includes('remark') || fieldName.includes('Remark')) {
        templateData[fieldName] = 'This is a sample remark'
      } else if (fieldName.includes('comment') || fieldName.includes('Comment')) {
        templateData[fieldName] = 'This is a sample comment'
      } else if (fieldName.includes('key') || fieldName.includes('Key')) {
        templateData[fieldName] = 'sample_key_123'
      } else if (fieldName.includes('token') || fieldName.includes('Token')) {
        templateData[fieldName] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      } else if (fieldName.includes('secret') || fieldName.includes('Secret')) {
        templateData[fieldName] = 'secret_key_123'
      } else if (fieldName.includes('password') || fieldName.includes('Password')) {
        templateData[fieldName] = '********'
      } else if (fieldName.includes('option') || fieldName.includes('Option')) {
        templateData[fieldName] = 'default'
      } else if (fieldName.includes('choice') || fieldName.includes('Choice')) {
        templateData[fieldName] = 'A'
      } else if (fieldName.includes('selection') || fieldName.includes('Selection')) {
        templateData[fieldName] = 'option1'
      } else if (fieldName.includes('value') || fieldName.includes('Value')) {
        templateData[fieldName] = 'sample_value'
      } else if (fieldName.includes('data') || fieldName.includes('Data')) {
        templateData[fieldName] = 'sample_data'
      } else if (fieldName.includes('info') || fieldName.includes('Info')) {
        templateData[fieldName] = 'Sample information'
      } else {
        // 默认字符串类型
        templateData[fieldName] = 'Sample data'
      }
    }
  })

  return templateData
}
