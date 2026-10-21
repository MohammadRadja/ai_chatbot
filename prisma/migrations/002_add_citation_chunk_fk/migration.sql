ALTER TABLE `Citation`
ADD CONSTRAINT `Citation_chunkId_fkey`
FOREIGN KEY (`chunkId`) REFERENCES `KnowledgeChunk`(`id`)
ON DELETE SET NULL ON UPDATE CASCADE;
