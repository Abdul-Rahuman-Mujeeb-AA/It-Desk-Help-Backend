const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf|doc|docx/;
  const valid =
    allowed.test(path.extname(file.originalname).toLowerCase()) &&
    allowed.test(file.mimetype);
  cb(valid ? null : new Error("Unsupported file type"), valid);
};

module.exports = multer({ storage, fileFilter });
