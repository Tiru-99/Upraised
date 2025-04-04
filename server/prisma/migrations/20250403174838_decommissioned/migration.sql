/*
  Warnings:

  - The values [DECOMMISIONED] on the enum `GadgetStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `decommisionedAt` on the `Gadget` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GadgetStatus_new" AS ENUM ('AVAILABLE', 'DEPLOYED', 'DESTROYED', 'DECOMISSIONED');
ALTER TABLE "Gadget" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Gadget" ALTER COLUMN "status" TYPE "GadgetStatus_new" USING ("status"::text::"GadgetStatus_new");
ALTER TYPE "GadgetStatus" RENAME TO "GadgetStatus_old";
ALTER TYPE "GadgetStatus_new" RENAME TO "GadgetStatus";
DROP TYPE "GadgetStatus_old";
ALTER TABLE "Gadget" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- AlterTable
ALTER TABLE "Gadget" DROP COLUMN "decommisionedAt",
ADD COLUMN     "decomissionedAt" TIMESTAMP(3);
