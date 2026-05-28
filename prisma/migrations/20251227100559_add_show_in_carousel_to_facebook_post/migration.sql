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
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "show_in_carousel" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_FacebookPost" ("attachments", "created_time", "custom_title", "full_picture", "id", "is_visible", "likes", "local_image_path", "message", "permalink_url", "updatedAt", "video_url") SELECT "attachments", "created_time", "custom_title", "full_picture", "id", "is_visible", "likes", "local_image_path", "message", "permalink_url", "updatedAt", "video_url" FROM "FacebookPost";
DROP TABLE "FacebookPost";
ALTER TABLE "new_FacebookPost" RENAME TO "FacebookPost";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
