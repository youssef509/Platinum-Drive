-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountStatus" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "storageQuotaBytes" BIGINT NOT NULL DEFAULT 10737418240,
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedBy" TEXT,
ADD COLUMN     "suspendedReason" TEXT,
ADD COLUMN     "usedStorageBytes" BIGINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "language" TEXT NOT NULL DEFAULT 'ar',
    "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '24',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "desktopNotifications" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnUpload" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnShare" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnComment" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnMention" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnStorageLimit" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnLoginAttempt" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnFileExpiry" BOOLEAN NOT NULL DEFAULT true,
    "defaultFolderId" TEXT,
    "autoOrganize" BOOLEAN NOT NULL DEFAULT false,
    "compressImages" BOOLEAN NOT NULL DEFAULT false,
    "generateThumbnails" BOOLEAN NOT NULL DEFAULT true,
    "profileVisibility" TEXT NOT NULL DEFAULT 'private',
    "showOnlineStatus" BOOLEAN NOT NULL DEFAULT true,
    "allowIndexing" BOOLEAN NOT NULL DEFAULT false,
    "defaultSortBy" TEXT NOT NULL DEFAULT 'name',
    "defaultViewMode" TEXT NOT NULL DEFAULT 'grid',
    "showHiddenFiles" BOOLEAN NOT NULL DEFAULT false,
    "autoDeleteTrashed" INTEGER NOT NULL DEFAULT 30,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
    "requireReauth" BOOLEAN NOT NULL DEFAULT false,
    "loginAlerts" BOOLEAN NOT NULL DEFAULT true,
    "defaultSharePermission" TEXT NOT NULL DEFAULT 'view',
    "defaultLinkExpiry" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageQuota" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quotaBytes" BIGINT NOT NULL,
    "usedBytes" BIGINT NOT NULL DEFAULT 0,
    "filesCount" INTEGER NOT NULL DEFAULT 0,
    "foldersCount" INTEGER NOT NULL DEFAULT 0,
    "maxFileSize" BIGINT,
    "maxFiles" INTEGER,
    "allowedFileTypes" TEXT[],
    "monthlyBandwidthBytes" BIGINT,
    "usedBandwidthBytes" BIGINT NOT NULL DEFAULT 0,
    "bandwidthResetDate" TIMESTAMP(3),
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageQuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotaHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "previousQuota" BIGINT NOT NULL,
    "newQuota" BIGINT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuotaHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileTypePolicy" (
    "id" SERIAL NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extension" TEXT,
    "category" TEXT,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "maxFileSize" BIGINT,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "scanOnUpload" BOOLEAN NOT NULL DEFAULT true,
    "generatePreview" BOOLEAN NOT NULL DEFAULT false,
    "convertFormat" TEXT,
    "displayName" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileTypePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StorageQuota_userId_key" ON "StorageQuota"("userId");

-- CreateIndex
CREATE INDEX "StorageQuota_userId_idx" ON "StorageQuota"("userId");

-- CreateIndex
CREATE INDEX "QuotaHistory_userId_createdAt_idx" ON "QuotaHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "QuotaHistory_createdAt_idx" ON "QuotaHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");

-- CreateIndex
CREATE INDEX "SystemSettings_category_idx" ON "SystemSettings"("category");

-- CreateIndex
CREATE INDEX "SystemSettings_key_idx" ON "SystemSettings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "FileTypePolicy_mimeType_key" ON "FileTypePolicy"("mimeType");

-- CreateIndex
CREATE INDEX "FileTypePolicy_category_idx" ON "FileTypePolicy"("category");

-- CreateIndex
CREATE INDEX "FileTypePolicy_isAllowed_idx" ON "FileTypePolicy"("isAllowed");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_accountStatus_idx" ON "User"("accountStatus");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageQuota" ADD CONSTRAINT "StorageQuota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotaHistory" ADD CONSTRAINT "QuotaHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
