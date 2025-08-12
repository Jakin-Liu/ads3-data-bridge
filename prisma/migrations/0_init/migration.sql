-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."TableStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."FieldStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."EndpointType" AS ENUM ('api', 'queue');

-- CreateEnum
CREATE TYPE "public"."SubscribeStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "public"."TriggerType" AS ENUM ('new');

-- CreateTable
CREATE TABLE "public"."ads3_tables" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "status" "public"."TableStatus" NOT NULL DEFAULT 'active',
    "user_id" VARCHAR(30) NOT NULL,
    "alias_name" TEXT,
    "total_count" INTEGER NOT NULL DEFAULT 0,
    "field_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads3_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ads3_table_fields" (
    "id" SERIAL NOT NULL,
    "table_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "alias_name" TEXT,
    "field_type" TEXT NOT NULL DEFAULT 'string',
    "status" "public"."FieldStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads3_table_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ads3_consumer_cursor" (
    "id" SERIAL NOT NULL,
    "consumer" VARCHAR(30) NOT NULL,
    "table_id" INTEGER NOT NULL,
    "table_name" VARCHAR(50) NOT NULL,
    "cursor_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads3_consumer_cursor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ads3_queue_subscribers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "table_id" INTEGER NOT NULL,
    "table_name" VARCHAR(100) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "endpoint_type" TEXT NOT NULL DEFAULT 'api',
    "endpoint" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "trigger_type" TEXT NOT NULL DEFAULT 'new',
    "fields" TEXT[],
    "trigger_config" JSONB NOT NULL,

    CONSTRAINT "ads3_queue_subscribers_pkey" PRIMARY KEY ("id")
);

