import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile_${req.user._id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Only image files are allowed"), ok);
};

export const uploadProfileImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});