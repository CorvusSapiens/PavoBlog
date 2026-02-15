-- CreateIndex
CREATE INDEX "LeetCodeSource_sourceId_idx" ON "LeetCodeSource"("sourceId");

-- CreateIndex
CREATE INDEX "Post_type_updatedAt_idx" ON "Post"("type", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "PostTag_tagId_idx" ON "PostTag"("tagId");
