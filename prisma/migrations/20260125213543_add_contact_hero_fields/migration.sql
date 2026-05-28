-- AlterTable
ALTER TABLE "ContactSettings" ADD COLUMN "hero_image" TEXT;
ALTER TABLE "ContactSettings" ADD COLUMN "hero_subtitle" TEXT DEFAULT 'Kérdése van? Lépjen velünk kapcsolatba!';
ALTER TABLE "ContactSettings" ADD COLUMN "hero_title" TEXT DEFAULT 'Kapcsolat';
