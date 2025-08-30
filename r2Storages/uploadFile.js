const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Configure R2 client
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and common file types
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/json' ||
        file.mimetype === 'application/octet-stream' ||
        file.originalname.endsWith('.svga')) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed!'), false);
    }
  }
});

// Generate unique file name
const generateFileName = (originalName) => {
  const extension = originalName.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomString}.${extension}`;
};

/**
 * Upload a file to Cloudflare R2
 * @param {Object} file - The file object (from multer)
 * @param {string} [customFileName] - Optional custom file name
 * @returns {Promise<Object>} - Object containing file URL and file name
 */
const uploadFileR2 = async (file, customFileName = null) => {
    try {
        if (!file || !file.buffer) {
            throw new Error('No file provided or file buffer is missing');
        }

        const fileName = customFileName || generateFileName(file.originalname);
        const fileBuffer = file.buffer;
        const contentType = file.mimetype;

        // Upload to R2
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer,
            ContentType: contentType,
            ACL: 'public-read', // Make the file publicly accessible
        });

        await s3Client.send(command);

        // Return the public URL and file name
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
        
        return {
            success: true,
            fileName: fileName,
            fileUrl: publicUrl,
            message: 'File uploaded successfully to R2'
        };
    } catch (error) {
        console.log("Error uploading file to R2:", error);
        throw error;
    }
}

/**
 * Generate a presigned URL for direct upload to R2
 * @param {string} fileName - Original file name
 * @param {string} fileType - MIME type of the file
 * @param {number} expiresIn - URL expiration time in seconds (default: 900 = 15 minutes)
 * @returns {Promise<Object>} - Object containing signed URL and file key
 */
const generatePresignedUrl = async (fileName, fileType, expiresIn = 900) => {
    try {
        if (!fileName || !fileType) {
            throw new Error('FileName and fileType are required');
        }

        const fileKey = generateFileName(fileName);
        
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
            ContentType: fileType,
            ACL: 'public-read',
        });

        // Generate presigned URL
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        
        return {
            success: true,
            signedUrl,
            fileUrl: `${process.env.R2_PUBLIC_URL}/${fileKey}`,
            fileKey,
            expiresIn
        };
    } catch (error) {
        console.log("Error generating presigned URL:", error);
        throw error;
    }
}

/**
 * Delete a file from R2
 * @param {string} fileName - The file name to delete
 * @returns {Promise<Object>} - Success message
 */
const deleteFileR2 = async (fileName) => {
    try {
        if (!fileName) {
            throw new Error('FileName is required');
        }

        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
        });

        await s3Client.send(command);
        
        return {
            success: true,
            message: 'File deleted successfully from R2'
        };
    } catch (error) {
        console.log("Error deleting file from R2:", error);
        throw error;
    }
}

/**
 * Middleware for handling file uploads with Multer
 * @param {string} fieldName - The field name in the form data
 * @returns {Function} - Multer middleware function
 */
const uploadMiddleware = (fieldName = 'file') => {
    return upload.single(fieldName);
}

/**
 * Handle Multer errors in Express routes
 * @param {Error} error - The error object
 * @param {Object} res - Express response object
 */
const handleMulterError = (error, res) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'File too large', 
                details: 'Maximum file size is 10MB' 
            });
        }
    }
    
    return res.status(500).json({ 
        error: 'File upload failed', 
        details: error.message 
    });
}

module.exports = {
    uploadFileR2,
    generatePresignedUrl,
    deleteFileR2,
    uploadMiddleware,
    handleMulterError,
    s3Client
};