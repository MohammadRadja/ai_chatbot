CREATE TABLE `IngestionRun` (
  `id` varchar(191) NOT NULL,
  `status` enum('RUNNING','COMPLETED','PARTIAL','FAILED') NOT NULL DEFAULT 'RUNNING',
  `sourceCount` int NOT NULL DEFAULT 0,
  `successCount` int NOT NULL DEFAULT 0,
  `failureCount` int NOT NULL DEFAULT 0,
  `chunkCount` int NOT NULL DEFAULT 0,
  `errorSummary` text NULL,
  `startedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` datetime(3) NULL,
  PRIMARY KEY (`id`),
  INDEX `IngestionRun_status_startedAt_idx` (`status`, `startedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `KnowledgeSource` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `kind` varchar(191) NOT NULL,
  `url` varchar(500) NOT NULL,
  `content` longtext NULL,
  `contentHash` varchar(191) NULL,
  `fetchedAt` datetime(3) NULL,
  `httpStatus` int NULL,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `KnowledgeSource_key_key` (`key`),
  UNIQUE INDEX `KnowledgeSource_url_key` (`url`),
  INDEX `KnowledgeSource_isActive_updatedAt_idx` (`isActive`, `updatedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `KnowledgeChunk` (
  `id` varchar(191) NOT NULL,
  `sourceId` varchar(191) NOT NULL,
  `chunkIndex` int NOT NULL,
  `heading` varchar(191) NULL,
  `content` text NOT NULL,
  `normalizedText` text NOT NULL,
  `contentHash` varchar(191) NOT NULL,
  `tokenCount` int NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `KnowledgeChunk_sourceId_contentHash_key` (`sourceId`, `contentHash`),
  INDEX `KnowledgeChunk_sourceId_chunkIndex_idx` (`sourceId`, `chunkIndex`),
  INDEX `KnowledgeChunk_createdAt_idx` (`createdAt`),
  CONSTRAINT `KnowledgeChunk_sourceId_fkey` FOREIGN KEY (`sourceId`) REFERENCES `KnowledgeSource` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Conversation` (
  `id` varchar(191) NOT NULL,
  `locale` varchar(191) NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Conversation_updatedAt_idx` (`updatedAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Message` (
  `id` varchar(191) NOT NULL,
  `conversationId` varchar(191) NOT NULL,
  `role` enum('USER','ASSISTANT') NOT NULL,
  `content` text NOT NULL,
  `unanswered` boolean NOT NULL DEFAULT false,
  `metadata` json NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Message_conversationId_createdAt_idx` (`conversationId`, `createdAt`),
  INDEX `Message_role_unanswered_idx` (`role`, `unanswered`),
  CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Citation` (
  `id` varchar(191) NOT NULL,
  `messageId` varchar(191) NOT NULL,
  `sourceId` varchar(191) NOT NULL,
  `chunkId` varchar(191) NULL,
  `label` varchar(191) NOT NULL,
  `url` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Citation_messageId_sourceId_key` (`messageId`, `sourceId`),
  INDEX `Citation_sourceId_idx` (`sourceId`),
  CONSTRAINT `Citation_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Citation_sourceId_fkey` FOREIGN KEY (`sourceId`) REFERENCES `KnowledgeSource` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Lead` (
  `id` varchar(191) NOT NULL,
  `conversationId` varchar(191) NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `message` text NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Lead_createdAt_idx` (`createdAt`),
  INDEX `Lead_email_idx` (`email`),
  CONSTRAINT `Lead_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
