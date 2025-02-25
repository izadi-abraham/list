/*
  Warnings:

  - You are about to drop the column `list_item_id` on the `SharedList` table. All the data in the column will be lost.
  - You are about to drop the `ListItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,item_id,shared_with_user_id]` on the table `SharedList` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `item_id` to the `SharedList` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ListItem" DROP CONSTRAINT "ListItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "SharedList" DROP CONSTRAINT "SharedList_list_item_id_fkey";

-- DropIndex
DROP INDEX "SharedList_userId_list_item_id_shared_with_user_id_key";

-- AlterTable
ALTER TABLE "SharedList" DROP COLUMN "list_item_id",
ADD COLUMN     "item_id" INTEGER NOT NULL,
ADD COLUMN     "listId" INTEGER;

-- DropTable
DROP TABLE "ListItem";

-- CreateTable
CREATE TABLE "List" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "list_type" TEXT NOT NULL,
    "list_name" TEXT NOT NULL,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "listId" INTEGER NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER,
    "unit" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "notes" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedList_userId_item_id_shared_with_user_id_key" ON "SharedList"("userId", "item_id", "shared_with_user_id");

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedList" ADD CONSTRAINT "SharedList_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedList" ADD CONSTRAINT "SharedList_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE SET NULL ON UPDATE CASCADE;
