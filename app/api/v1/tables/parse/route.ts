import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log(process.env.OPENAI_API_KEY);

// 定义表字段类型
interface TableField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

// 定义表结构响应
interface TableStructure {
  tableName: string;
  tableAliasName?: string;
  fields: TableField[];
  description?: string;
}

// 解析 CSV 数据的辅助函数
function parseCSVData(csvText: string): string[][] {
  const lines = csvText.trim().split('\n');
  return lines.map(line => line.split(',').map(cell => cell.trim()));
}

// 解析表格数据的辅助函数
function parseTableData(tableText: string): string[][] {
  const lines = tableText.trim().split('\n');
  return lines.map(line => line.split(/\s+/).map(cell => cell.trim()));
}

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || !input.trim()) {
      return NextResponse.json(
        { error: '请输入表结构描述或示例数据' },
        { status: 400 }
      );
    }

    // 构建统一的提示，让 AI 自动识别输入类型
    const prompt = `请分析以下输入内容并生成数据表结构。输入可能是自然语言描述、CSV数据、表格数据或其他格式：

输入内容：
${input}

请自动识别输入类型并生成：
1. 生成一个合适的下划线表名（如果没有合适的表名，请生成一个符合的表名） 表名还需要有个别名
2. 每个字段的名称、数据类型、是否必填
3. 表的中文描述
4. 数据type字段的类型 枚举值: String, Number, DateTime, Boolean, Json
  - 字符串的都使用String返回
  - 数字的都统一返回Number
  - 时间类型统一返回DateTime
  - 布尔类型统一返回Boolean
  - 对象类型统一返回Json
  - 其他类型统一返回String
5. 字段名称尽量使用下划线标准
6. 只有当用户明确提示字段要求必填，才返回required字段为true，否则都返回false

请以JSON格式返回，格式如下：
{
  "tableName": "表名",
  "tableAliasName": "别名",
  "description": "表的英文描述信息",
  "fields": [
    {
      "name": "字段名",
      "type": "数据类型",
      "required": true/false,
      "description": "字段描述"
    }
  ]
}`;

    // 调用 OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是一个专业的数据分析师，擅长根据用户需求或示例数据生成数据库表结构。请严格按照JSON格式返回结果。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      return NextResponse.json(
        { error: 'AI 解析失败，请重试' },
        { status: 500 }
      );
    }

    // 解析 AI 返回的 JSON
    let tableStructure: TableStructure;
    try {
      // 提取 JSON 部分
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法解析 AI 返回的 JSON');
      }
      
      tableStructure = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('解析 AI 响应失败:', parseError);
      return NextResponse.json(
        { error: 'AI 返回格式错误，请重试' },
        { status: 500 }
      );
    }

    // 验证表结构
    if (!tableStructure.tableName || !tableStructure.fields || tableStructure.fields.length === 0) {
      return NextResponse.json(
        { error: 'AI 生成的表结构不完整，请重试' },
        { status: 500 }
      );
    }

    // 返回解析后的表结构
    return NextResponse.json({
      success: true,
      data: {
        tableName: tableStructure.tableName,
        tableAliasName: tableStructure.tableAliasName || tableStructure.tableName,
        description: tableStructure.description || '',
        fields: tableStructure.fields.map(field => ({
          name: field.name,
          type: field.type,
          required: field.required,
          description: field.description || ''
        }))
      }
    });

  } catch (error) {
    console.error('解析表结构时出错:', error);
    return NextResponse.json(
      { error: '解析表结构失败，请重试' },
      { status: 500 }
    );
  }
} 