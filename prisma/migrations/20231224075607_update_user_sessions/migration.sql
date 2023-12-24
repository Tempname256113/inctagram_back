/*
  Warnings:

  - Added the required column `expiresAt` to the `user_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_sessions" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
