-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContactSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "recipient_emails" TEXT,
    "footer_info" TEXT,
    "smtp_host" TEXT,
    "smtp_port" INTEGER,
    "smtp_user" TEXT,
    "smtp_password" TEXT,
    "smtp_secure" BOOLEAN NOT NULL DEFAULT true,
    "smtp_from_email" TEXT,
    "smtp_from_name" TEXT,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_ContactSettings" ("footer_info", "id", "recipient_emails", "updated_at") SELECT "footer_info", "id", "recipient_emails", "updated_at" FROM "ContactSettings";
DROP TABLE "ContactSettings";
ALTER TABLE "new_ContactSettings" RENAME TO "ContactSettings";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
