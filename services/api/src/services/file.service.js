const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const prisma = require('../repositories/prisma');
const auditService = require('./audit.service');
const { AppError } = require('../middleware/errorHandler');

const UPLOADS_DIR = path.resolve(__dirname, '../../storage/uploads');

class FileService {
  constructor() {
    // Ensure storage directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  getUploadsDir() {
    return UPLOADS_DIR;
  }

  /**
   * Calculate SHA-256 checksum for a file on disk
   */
  async calculateChecksum(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      stream.on('error', (err) => reject(err));
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
    });
  }

  /**
   * Save uploaded file record
   */
  async uploadFile(userId, file, projectId = null) {
    if (!file) {
      throw new AppError('No file provided.', 400, 'NO_FILE_PROVIDED');
    }

    const filePath = path.join(UPLOADS_DIR, file.filename);
    const checksum = await this.calculateChecksum(filePath);

    // Optional project validation
    let validProjectId = null;
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        }
      });
      if (project) {
        validProjectId = project.id;
      }
    }

    const storedFile = await prisma.storedFile.create({
      data: {
        userId,
        projectId: validProjectId,
        filename: file.originalname,
        storageKey: file.filename,
        mimeType: file.mimetype || 'application/octet-stream',
        sizeBytes: file.size,
        checksum
      }
    });

    await auditService.record({
      userId,
      action: 'FILE_UPLOADED',
      resourceType: 'StoredFile',
      resourceId: storedFile.id,
      details: {
        filename: storedFile.filename,
        sizeBytes: storedFile.sizeBytes,
        mimeType: storedFile.mimeType,
        checksum: storedFile.checksum
      }
    });

    return {
      id: storedFile.id,
      filename: storedFile.filename,
      sizeBytes: storedFile.sizeBytes,
      mimeType: storedFile.mimeType,
      checksum: storedFile.checksum,
      projectId: storedFile.projectId,
      createdAt: storedFile.createdAt,
      updatedAt: storedFile.updatedAt
    };
  }

  /**
   * List files for the authenticated user
   */
  async listFiles(userId, projectId = null) {
    const whereClause = {
      userId,
      ...(projectId ? { projectId } : {})
    };

    const files = await prisma.storedFile.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return files.map((f) => ({
      id: f.id,
      filename: f.filename,
      sizeBytes: f.sizeBytes,
      mimeType: f.mimeType,
      checksum: f.checksum,
      projectId: f.projectId,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt
    }));
  }

  /**
   * Get file metadata
   */
  async getFile(userId, fileId) {
    const file = await prisma.storedFile.findUnique({
      where: { id: fileId }
    });

    if (!file || file.userId !== userId) {
      throw new AppError('File not found or access denied.', 404, 'FILE_NOT_FOUND');
    }

    return {
      id: file.id,
      filename: file.filename,
      sizeBytes: file.sizeBytes,
      mimeType: file.mimeType,
      checksum: file.checksum,
      projectId: file.projectId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    };
  }

  /**
   * Retrieve file path and details for streaming download
   */
  async getFileForDownload(userId, fileId) {
    const file = await prisma.storedFile.findUnique({
      where: { id: fileId }
    });

    if (!file || file.userId !== userId) {
      throw new AppError('File not found or access denied.', 404, 'FILE_NOT_FOUND');
    }

    const diskPath = path.join(UPLOADS_DIR, file.storageKey);
    if (!fs.existsSync(diskPath)) {
      throw new AppError('Underlying physical file is missing from storage.', 404, 'STORAGE_FILE_MISSING');
    }

    return {
      diskPath,
      filename: file.filename,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes
    };
  }

  /**
   * Delete a stored file from disk and database
   */
  async deleteFile(userId, fileId) {
    const file = await prisma.storedFile.findUnique({
      where: { id: fileId }
    });

    if (!file || file.userId !== userId) {
      throw new AppError('File not found or access denied.', 404, 'FILE_NOT_FOUND');
    }

    const diskPath = path.join(UPLOADS_DIR, file.storageKey);

    // Delete disk file
    try {
      if (fs.existsSync(diskPath)) {
        await fs.promises.unlink(diskPath);
      }
    } catch (err) {
      // Continue DB cleanup even if disk file unlink throws
    }

    await prisma.storedFile.delete({
      where: { id: fileId }
    });

    await auditService.record({
      userId,
      action: 'FILE_DELETED',
      resourceType: 'StoredFile',
      resourceId: fileId,
      details: { filename: file.filename }
    });

    return {
      id: fileId,
      filename: file.filename,
      deleted: true
    };
  }
}

module.exports = new FileService();

