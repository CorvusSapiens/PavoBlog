-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('LEETCODE', 'BOOK_REVIEW', 'MOVIE_REVIEW');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "type" "PostType" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeetCodeMeta" (
    "postId" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "listFrom" TEXT NOT NULL,
    "independent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LeetCodeMeta_pkey" PRIMARY KEY ("postId")
);

-- CreateTable
CREATE TABLE "LeetCodeProgress" (
    "postId" TEXT NOT NULL,
    "firstDate" DATE NOT NULL,
    "latestDate" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LeetCodeProgress_pkey" PRIMARY KEY ("postId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- AddForeignKey
ALTER TABLE "LeetCodeMeta" ADD CONSTRAINT "LeetCodeMeta_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeetCodeProgress" ADD CONSTRAINT "LeetCodeProgress_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
