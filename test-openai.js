import OpenAI from 'openai';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log('开始测试 OpenAI API...');
    console.log('API Key:', process.env.OPENAI_API_KEY ? '已配置' : '未配置');
    
    const prompt = `请分析以下输入内容并生成数据表结构。输入可能是自然语言描述、CSV数据、表格数据或其他格式：

输入内容：
用户行为分析表，包含用户ID、操作类型、时间戳、页面URL、设备类型、地理位置等字段

请自动识别输入类型并生成：
1. 生成一个合适的下划线表名（如果没有合适的表名，请生成一个符合的表名） 表名还需要有个别名
2. 每个字段的名称、数据类型、是否必填
3. 表的中文描述
4. 数据字段的类型，如果识别是字符串的都使用String返回，数字的都统一返回Number，时间类型统一返回DateTime
5. 字段名称尽量使用下划线标准

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

    console.log('发送请求到 OpenAI...');
    
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

    console.log('✅ OpenAI API 调用成功！');
    console.log('响应内容:');
    console.log(completion.choices[0]?.message?.content);
    
    // 尝试解析 JSON
    try {
      const responseText = completion.choices[0]?.message?.content;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('\n✅ JSON 解析成功:');
        console.log(JSON.stringify(parsedData, null, 2));
      } else {
        console.log('\n⚠️ 未找到有效的 JSON 格式');
      }
    } catch (parseError) {
      console.log('\n❌ JSON 解析失败:', parseError.message);
    }

  } catch (error) {
    console.error('❌ OpenAI API 调用失败:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    
    if (error.status) {
      console.error('HTTP 状态码:', error.status);
    }
    
    if (error.response) {
      console.error('响应详情:', error.response);
    }
  }
}

// 运行测试
testOpenAI(); 