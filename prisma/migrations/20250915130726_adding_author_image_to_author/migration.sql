-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Author" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "litPeriod" TEXT NOT NULL,
    "authorImage" TEXT NOT NULL DEFAULT '',
    "bornDate" TEXT NOT NULL,
    "deathDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Author" ("bio", "bornDate", "createdAt", "deathDate", "id", "litPeriod", "name", "updatedAt") SELECT "bio", "bornDate", "createdAt", "deathDate", "id", "litPeriod", "name", "updatedAt" FROM "Author";
DROP TABLE "Author";
ALTER TABLE "new_Author" RENAME TO "Author";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
