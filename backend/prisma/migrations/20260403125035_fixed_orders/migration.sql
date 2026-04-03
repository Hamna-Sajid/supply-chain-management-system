/*
  Warnings:

  - Made the column `updated_at` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "updated_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "SaleItem" ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(65,30);
