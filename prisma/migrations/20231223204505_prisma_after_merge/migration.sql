/*
  Warnings:

  - You are about to drop the `auth_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `change_password_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_additional_info` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Providers" AS ENUM ('Google', 'Github');

-- CreateEnum
CREATE TYPE "UserChangePasswordRequestStates" AS ENUM ('pending', 'processed');

-- DropForeignKey
ALTER TABLE "auth_tokens" DROP CONSTRAINT "auth_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "change_password_requests" DROP CONSTRAINT "change_password_requests_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_additional_info" DROP CONSTRAINT "user_additional_info_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "password" DROP NOT NULL;

-- DropTable
DROP TABLE "auth_tokens";

-- DropTable
DROP TABLE "change_password_requests";

-- DropTable
DROP TABLE "user_additional_info";

-- DropEnum
DROP TYPE "ChangePasswordRequestStateEnum";

-- CreateTable
CREATE TABLE "user_email_info" (
    "userId" INTEGER NOT NULL,
    "emailIsConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "emailConfirmCode" TEXT,
    "expiresAt" TIMESTAMP(3),
    "provider" "Providers",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_email_info_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "user_change_password_requests" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "state" "UserChangePasswordRequestStates" NOT NULL DEFAULT 'pending',
    "passwordRecoveryCode" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_change_password_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_email_info" ADD CONSTRAINT "user_email_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_change_password_requests" ADD CONSTRAINT "user_change_password_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
