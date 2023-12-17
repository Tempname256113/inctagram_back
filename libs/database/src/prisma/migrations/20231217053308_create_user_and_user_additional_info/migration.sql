-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_additional_info" (
    "userId" INTEGER NOT NULL,
    "emailIsConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "registrationConfirmCode" TEXT NOT NULL,
    "registrationCodeEndDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_additional_info_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "user_additional_info" ADD CONSTRAINT "user_additional_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
