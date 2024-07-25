import Recipe from '../models/recipes.js';
import multer, { memoryStorage } from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_REGION

const s3client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey
  },
  region
});

const storage = memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error('Invalid file type'));
  }
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 50 } // 50MB file size limit 
});

export const uploadImage = async (id, image) => {
  if (!image) throw new Error('No image provided');
  const recipe = await Recipe.findById(id).exec();
  const folderKey = `recipes/${recipe.createdAt}/${image.originalname}`;
  const params = {
    Bucket: bucketName,
    Key: folderKey,
    Body: image.buffer,
    ContentType: image.mimetype,
    ACL: 'public-read'
  };
  await s3client.send(new PutObjectCommand(params));
  const imageUrl = `${process.env.AWS_PREFIX}${folderKey}`;
  return imageUrl;
}