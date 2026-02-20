import express from 'express';
import AWS from 'aws-sdk';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

// Use memory storage for multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'));
    }
    cb(null, true);
  },
});

router.post('/creator-image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const key = `creators/${Date.now()}_${req.file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3.upload(params).promise();

    // const presignedUrl = s3.getSignedUrl('getObject', {
    //   Bucket: process.env.AWS_S3_BUCKET,
    //   Key: key, // ✅ SAME KEY
    //   Expires: 7 * 24 * 60 * 60,
    // });

    // res.json({ url: presignedUrl });
      // Use public URL since bucket allows public access
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    res.json({ url: fileUrl });
    

  } catch (err) {
    console.error('S3 Upload Error:', err.message);
    res.status(400).json({ message: err.message || 'Upload failed' });
  }
});


export default router;
