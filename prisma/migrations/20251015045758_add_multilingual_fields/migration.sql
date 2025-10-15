-- AlterTable
ALTER TABLE "public"."MainData" ADD COLUMN     "categoryJa" TEXT,
ADD COLUMN     "categoryZh" TEXT,
ADD COLUMN     "generalRuleJa" TEXT,
ADD COLUMN     "generalRuleZh" TEXT,
ADD COLUMN     "itemJa" TEXT,
ADD COLUMN     "itemZh" TEXT,
ADD COLUMN     "questionJa" TEXT,
ADD COLUMN     "questionZh" TEXT,
ADD COLUMN     "sourceJa" TEXT,
ADD COLUMN     "sourceZh" TEXT;

-- AlterTable
ALTER TABLE "public"."Report" ADD COLUMN     "contentJa" TEXT,
ADD COLUMN     "contentZh" TEXT;
