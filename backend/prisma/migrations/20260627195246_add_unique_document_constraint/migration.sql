/*
  Warnings:

  - A unique constraint covering the columns `[userId,githubUrl]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Document_userId_githubUrl_key" ON "Document"("userId", "githubUrl");
