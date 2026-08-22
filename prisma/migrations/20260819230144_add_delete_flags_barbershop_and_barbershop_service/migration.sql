-- AlterTable
ALTER TABLE "Barbershop" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "BarbershopService" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
