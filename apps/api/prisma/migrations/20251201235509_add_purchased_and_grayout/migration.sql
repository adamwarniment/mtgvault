-- AlterTable
ALTER TABLE "Binder" ADD COLUMN     "grayOutUnpurchased" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "isPurchased" BOOLEAN NOT NULL DEFAULT true;
