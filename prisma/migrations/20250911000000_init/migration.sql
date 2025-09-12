-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."ReportType" AS ENUM ('NOW', 'INSIGHT');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKr" TEXT,
    "description" TEXT,
    "systemPrompt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MainData" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "item" TEXT NOT NULL,
    "itemEn" TEXT,
    "question" TEXT NOT NULL,
    "questionEn" TEXT,
    "scale" INTEGER NOT NULL,
    "generalRule" TEXT NOT NULL,
    "generalRuleEn" TEXT,
    "modifiedScale" INTEGER NOT NULL,
    "cumulativeScore" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "index" DOUBLE PRECISION NOT NULL,
    "source" TEXT,
    "sourceEn" TEXT,
    "category" TEXT NOT NULL,
    "categoryEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "MainData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Analysis" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "item" TEXT NOT NULL,
    "scale" INTEGER NOT NULL,
    "modifiedScale" INTEGER NOT NULL,
    "cumulativeScore" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "index" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "public"."ReportType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "contentEn" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "public"."Company"("name");

-- CreateIndex
CREATE INDEX "MainData_companyId_idx" ON "public"."MainData"("companyId");

-- CreateIndex
CREATE INDEX "MainData_category_idx" ON "public"."MainData"("category");

-- CreateIndex
CREATE INDEX "MainData_sequenceNumber_idx" ON "public"."MainData"("sequenceNumber");

-- CreateIndex
CREATE INDEX "Analysis_companyId_idx" ON "public"."Analysis"("companyId");

-- CreateIndex
CREATE INDEX "Analysis_date_idx" ON "public"."Analysis"("date");

-- CreateIndex
CREATE INDEX "Analysis_category_idx" ON "public"."Analysis"("category");

-- CreateIndex
CREATE INDEX "Report_companyId_idx" ON "public"."Report"("companyId");

-- CreateIndex
CREATE INDEX "Report_date_idx" ON "public"."Report"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Report_companyId_date_type_key" ON "public"."Report"("companyId", "date", "type");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "public"."SystemSetting"("key");

-- AddForeignKey
ALTER TABLE "public"."MainData" ADD CONSTRAINT "MainData_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MainData" ADD CONSTRAINT "MainData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analysis" ADD CONSTRAINT "Analysis_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analysis" ADD CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

