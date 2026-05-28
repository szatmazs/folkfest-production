/*
  Warnings:

  - You are about to drop the column `hero_image` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `hero_left_btn_label` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `hero_left_btn_link` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `hero_right_btn_label` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `hero_right_btn_link` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `hero_size` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `hero_subtitle` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `hero_title` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `hero_title_highlight` on the `Page` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Page" ("content", "created_at", "id", "slug", "title", "updated_at") SELECT "content", "created_at", "id", "slug", "title", "updated_at" FROM "Page";
DROP TABLE "Page";
ALTER TABLE "new_Page" RENAME TO "Page";
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
