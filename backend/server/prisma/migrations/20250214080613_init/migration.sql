-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT,
    "full_name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "list_type" TEXT NOT NULL,
    "list_name" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER,
    "unit" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "notes" TEXT,

    CONSTRAINT "ListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedList" (
    "userId" INTEGER NOT NULL,
    "list_item_id" INTEGER NOT NULL,
    "shared_with_user_id" INTEGER NOT NULL,
    "permission_level" TEXT NOT NULL DEFAULT 'read'
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SharedList_userId_list_item_id_shared_with_user_id_key" ON "SharedList"("userId", "list_item_id", "shared_with_user_id");

-- AddForeignKey
ALTER TABLE "ListItem" ADD CONSTRAINT "ListItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedList" ADD CONSTRAINT "SharedList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedList" ADD CONSTRAINT "SharedList_list_item_id_fkey" FOREIGN KEY ("list_item_id") REFERENCES "ListItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedList" ADD CONSTRAINT "SharedList_shared_with_user_id_fkey" FOREIGN KEY ("shared_with_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
