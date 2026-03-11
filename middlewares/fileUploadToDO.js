const multer = require('multer');
const path = require('path');
const { randomUUID } = require('crypto');
const { getStorageBucket, isFirebaseConfigured } = require('../services/firebaseAdmin');
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
}).single('file');
const uploadFile = (req, res, next) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ error: 'File upload error', details: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            if (!isFirebaseConfigured()) {
                return res.status(500).json({
                    error: 'Firebase is not configured',
                    details: 'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY and FIREBASE_STORAGE_BUCKET'
                });
            }

            const bucket = getStorageBucket();
            const extension = path.extname(req.file.originalname);
            const fileName = `blogs/thumbnail/${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
            const downloadToken = randomUUID();
            const file = bucket.file(fileName);

            await file.save(req.file.buffer, {
                metadata: {
                    contentType: req.file.mimetype,
                    metadata: {
                        firebaseStorageDownloadTokens: downloadToken
                    }
                }
            });

            const encodedFileName = encodeURIComponent(fileName);
            req.body.file = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedFileName}?alt=media&token=${downloadToken}`;
            next();
        } catch (error) {
            return res.status(500).json({ error: 'Failed to upload file', details: error.message });
        }
    });
};

module.exports = uploadFile;