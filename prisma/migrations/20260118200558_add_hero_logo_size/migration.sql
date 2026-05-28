-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "hero_type" TEXT NOT NULL DEFAULT 'small',
    "hero_image" TEXT,
    "hero_title" TEXT,
    "hero_subtitle" TEXT,
    "hero_logo" TEXT,
    "hero_button_label" TEXT,
    "hero_button_link" TEXT,
    "hero_logo_size" TEXT NOT NULL DEFAULT 'medium'
);
INSERT INTO "new_Page" ("content", "created_at", "hero_button_label", "hero_button_link", "hero_image", "hero_logo", "hero_subtitle", "hero_title", "hero_type", "id", "slug", "title", "updated_at") SELECT "content", "created_at", "hero_button_label", "hero_button_link", "hero_image", "hero_logo", "hero_subtitle", "hero_title", "hero_type", "id", "slug", "title", "updated_at" FROM "Page";
DROP TABLE "Page";
ALTER TABLE "new_Page" RENAME TO "Page";
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
