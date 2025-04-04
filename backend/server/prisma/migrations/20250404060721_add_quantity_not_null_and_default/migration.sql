/*
  Warnings:

  - Made the column `quantity` on table `Item` required. This step will fail if there are existing NULL values in that column.

*/

-- Update NULL quantities
UPDATE "Item" SET quantity = 1 WHERE quantity IS NULL;

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "quantity" SET NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1;

-- Add the constrain
ALTER TABLE "Item" ADD CONSTRAINT quantity_not_zero CHECK ( quantity > 0 );
