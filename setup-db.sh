#!/bin/bash

# 创建.env文件
echo 'DATABASE_URL="postgresql://neondb_owner:npg_Zt81NwKLmOoc@ep-cold-dawn-ae6hhsuq-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"' > .env

# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init

echo "数据库设置完成！"
echo "现在可以访问 http://localhost:3000/api/hello 测试API" 