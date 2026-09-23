-- CreateEnum
CREATE TYPE "MembershipRequestStatus" AS ENUM ('PENDING', 'APPROVED');

-- CreateTable
CREATE TABLE "membership_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "isUpoStudent" BOOLEAN NOT NULL,
    "status" "MembershipRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_requests_pkey" PRIMARY KEY ("id")
);

