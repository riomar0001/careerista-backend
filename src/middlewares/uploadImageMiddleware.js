import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the directory exists
const uploadDir = 'logoUploads/';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Generate a unique filename
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10 MB max size
  fileFilter: (req, file, cb) => {
    const mimetype = file.mimetype.startsWith("image/"); // Only accept images based on mimetype
    if (mimetype) {
      cb(null, true); // Valid image
    } else {
      cb(new Error("Only images are allowed"), false); // Invalid file type
    }
  },
});

export default upload;
