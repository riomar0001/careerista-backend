import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the directory exists
const uploadDir = 'cvUploads/';

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
  limits: { fileSize: 1024 * 1024 * 10 },  // 10MB max size
  fileFilter: (req, file, cb) => {
    const filetypes = /doc|docx|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only document files (.doc, .docx, .pdf) are allowed')); // Reject invalid file type
    }
  },
});

export default upload;
