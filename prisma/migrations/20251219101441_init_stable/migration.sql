-- CreateTable
CREATE TABLE "FacebookPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT,
    "created_time" DATETIME NOT NULL,
    "full_picture" TEXT,
    "local_image_path" TEXT,
    "permalink_url" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "video_url" TEXT,
    "attachments" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FacebookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME,
    "cover_url" TEXT,
    "local_cover_path" TEXT,
    "place" TEXT,
    "updatedAt" DATETIME NOT NULL
);
