/*
  Warnings:

  - You are about to drop the column `listFrom` on the `LeetCodeMeta` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LeetCodeMeta" DROP COLUMN "listFrom";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "tags";

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "PostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "LeetCodeSource" (
    "postId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,

    CONSTRAINT "LeetCodeSource_pkey" PRIMARY KEY ("postId","sourceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ListSource_name_key" ON "ListSource"("name");

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeetCodeSource" ADD CONSTRAINT "LeetCodeSource_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeetCodeSource" ADD CONSTRAINT "LeetCodeSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ListSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
