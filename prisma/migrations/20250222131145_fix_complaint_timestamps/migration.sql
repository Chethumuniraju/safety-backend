/*
  Warnings:

  - You are about to drop the column `createdAt` on the `complaints` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `complaints` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `complaints` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_complaints" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "policeStationId" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "emergencyContacts" TEXT,
    "address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "complaints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "complaints_policeStationId_fkey" FOREIGN KEY ("policeStationId") REFERENCES "police_stations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_complaints" ("address", "description", "emergencyContacts", "id", "latitude", "location", "longitude", "policeStationId", "status", "userId") SELECT "address", "description", "emergencyContacts", "id", "latitude", "location", "longitude", "policeStationId", "status", "userId" FROM "complaints";
DROP TABLE "complaints";
ALTER TABLE "new_complaints" RENAME TO "complaints";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
