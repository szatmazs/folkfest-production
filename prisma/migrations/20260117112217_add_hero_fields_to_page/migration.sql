/*
  Warnings:

  - You are about to drop the column `date` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HomeSettings" ADD COLUMN "hero_left_button_label" TEXT DEFAULT 'Események';
ALTER TABLE "HomeSettings" ADD COLUMN "hero_left_button_link" TEXT DEFAULT '/events';
ALTER TABLE "HomeSettings" ADD COLUMN "hero_right_button_label" TEXT DEFAULT 'Rólunk';
ALTER TABLE "HomeSettings" ADD COLUMN "hero_right_button_link" TEXT DEFAULT '/about';

-- CreateTable
CREATE TABLE "ProjectPartner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT,
    "logo_url" TEXT,
    "country" TEXT,
    CONSTRAINT "ProjectPartner_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT,
    "content" TEXT,
    CONSTRAINT "ProjectResult_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeletedFacebookPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deleted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "target" TEXT NOT NULL DEFAULT '_self',
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "artist" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "coverUrl" TEXT NOT NULL,
    "promoLink" TEXT,
    "tracklist" TEXT NOT NULL,
    "streamingLinks" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "website_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "description" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Video" ("created_at", "description", "id", "published_at", "title", "updated_at", "video_url") SELECT "created_at", "description", "id", "published_at", "title", "updated_at", "video_url" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "main_image" TEXT,
    "description" TEXT,
    "project_data" TEXT,
    "content" TEXT,
    "start_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("content", "created_at", "description", "id", "main_image", "slug", "title", "updated_at") SELECT "content", "created_at", "description", "id", "main_image", "slug", "title", "updated_at" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE TABLE "new_Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "hero_size" TEXT NOT NULL DEFAULT 'small',
    "hero_image" TEXT,
    "hero_title" TEXT,
    "hero_subtitle" TEXT,
    "hero_title_highlight" TEXT,
    "hero_left_btn_label" TEXT,
    "hero_left_btn_link" TEXT,
    "hero_right_btn_label" TEXT,
    "hero_right_btn_link" TEXT
);
INSERT INTO "new_Page" ("content", "created_at", "id", "slug", "title", "updated_at") SELECT "content", "created_at", "id", "slug", "title", "updated_at" FROM "Page";
DROP TABLE "Page";
ALTER TABLE "new_Page" RENAME TO "Page";
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
