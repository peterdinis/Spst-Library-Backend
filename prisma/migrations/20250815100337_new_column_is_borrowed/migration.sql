-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "authorId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "publisherName" TEXT NOT NULL,
    "isbn" TEXT,
    "isAviable" BOOLEAN NOT NULL DEFAULT true,
    "dateCreated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isBorrowed" BOOLEAN NOT NULL DEFAULT false,
    "publishedYear" INTEGER,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "language" TEXT,
    CONSTRAINT "Book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Book_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("authorId", "categoryId", "coverImageUrl", "dateCreated", "description", "id", "isAviable", "isbn", "language", "publishedYear", "publisherName", "quantity", "title") SELECT "authorId", "categoryId", "coverImageUrl", "dateCreated", "description", "id", "isAviable", "isbn", "language", "publishedYear", "publisherName", "quantity", "title" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
CREATE INDEX "Book_title_idx" ON "Book"("title");
CREATE INDEX "Book_authorId_idx" ON "Book"("authorId");
CREATE INDEX "Book_categoryId_idx" ON "Book"("categoryId");
CREATE INDEX "Book_publishedYear_idx" ON "Book"("publishedYear");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
