-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "main_image" TEXT,
    "description" TEXT,
    "content" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "video_url" TEXT NOT NULL,
    "description" TEXT,
    "published_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HomeSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "hero_subtitle" TEXT DEFAULT 'Kulturális Egyesület',
    "hero_title" TEXT DEFAULT 'Hagyomány',
    "hero_title_highlight" TEXT DEFAULT 'Modern Formában',
    "hero_description" TEXT DEFAULT 'A FolkFest Kulturális Egyesület célja a Kárpát-medencei népi kultúra megőrzése és népszerűsítése.',
    "mission_title" TEXT DEFAULT 'Küldetésünk',
    "mission_description" TEXT DEFAULT 'Az egyesület célja a tehetséggondozás, a Kárpát-medencei népi kultúra népszerűsítése és a népművészeti értékek megőrzése. Kiemelt figyelmet fordítunk a fiatal generációk bevonására és a határon túli kapcsolatok ápolására.',
    "activities_title" TEXT DEFAULT 'Tevékenységek',
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FacebookPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT,
    "created_time" DATETIME NOT NULL,
    "full_picture" TEXT,
    "local_image_path" TEXT,
    "permalink_url" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "video_url" TEXT,
    "attachments" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "custom_title" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_FacebookPost" ("attachments", "created_time", "full_picture", "id", "likes", "local_image_path", "message", "permalink_url", "updatedAt", "video_url") SELECT "attachments", "created_time", "full_picture", "id", "likes", "local_image_path", "message", "permalink_url", "updatedAt", "video_url" FROM "FacebookPost";
DROP TABLE "FacebookPost";
ALTER TABLE "new_FacebookPost" RENAME TO "FacebookPost";
CREATE TABLE "new_FacebookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME,
    "cover_url" TEXT,
    "local_cover_path" TEXT,
    "place" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_FacebookEvent" ("cover_url", "description", "end_time", "id", "local_cover_path", "name", "place", "start_time", "updatedAt") SELECT "cover_url", "description", "end_time", "id", "local_cover_path", "name", "place", "start_time", "updatedAt" FROM "FacebookEvent";
DROP TABLE "FacebookEvent";
ALTER TABLE "new_FacebookEvent" RENAME TO "FacebookEvent";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
