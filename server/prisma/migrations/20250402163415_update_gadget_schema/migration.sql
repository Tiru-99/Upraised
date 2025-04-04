-- CreateEnum
CREATE TYPE "GadgetStatus" AS ENUM ('AVAILABLE', 'DEPLOYED', 'DESTROYED', 'DECOMMISIONED');

-- CreateTable
CREATE TABLE "Gadget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "GadgetStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "Gadget_pkey" PRIMARY KEY ("id")
);
