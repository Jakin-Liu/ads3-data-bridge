-- 创建ads3_tables表
CREATE TABLE "ads3_tables" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "user_id" VARCHAR(255) NOT NULL,
    "status" VARCHAR(15) NOT NULL DEFAULT 'active',
    "alias_name" VARCHAR(255),
    "total_count" INTEGER NOT NULL DEFAULT 0,
    "field_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为ads3_tables表创建触发器
CREATE TRIGGER update_ads3_tables_updated_at 
    BEFORE UPDATE ON "ads3_tables" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
