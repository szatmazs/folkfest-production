-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HomeSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "hero_subtitle" TEXT,
    "hero_title" TEXT,
    "hero_title_highlight" TEXT,
    "hero_description" TEXT,
    "mission_title" TEXT,
    "mission_description" TEXT,
    "activities_title" TEXT,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_HomeSettings" ("activities_title", "hero_description", "hero_subtitle", "hero_title", "hero_title_highlight", "id", "mission_description", "mission_title", "updated_at") SELECT "activities_title", "hero_description", "hero_subtitle", "hero_title", "hero_title_highlight", "id", "mission_description", "mission_title", "updated_at" FROM "HomeSettings";
DROP TABLE "HomeSettings";
ALTER TABLE "new_HomeSettings" RENAME TO "HomeSettings";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
