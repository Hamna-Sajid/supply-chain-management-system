/*
  Warnings:

  - Made the column `subtotal` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subtotal` on table `SaleItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "subtotal" SET NOT NULL,
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "RawMaterial" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SaleItem" ALTER COLUMN "subtotal" SET NOT NULL,
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(65,30);
