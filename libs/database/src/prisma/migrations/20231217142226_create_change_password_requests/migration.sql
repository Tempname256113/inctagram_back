-- CreateEnum
CREATE TYPE "ChangePasswordRequestStateEnum" AS ENUM ('pending', 'processed');

-- CreateTable
CREATE TABLE "change_password_requests" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "state" "ChangePasswordRequestStateEnum" NOT NULL DEFAULT 'pending',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "change_password_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "change_password_requests" ADD CONSTRAINT "change_password_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
