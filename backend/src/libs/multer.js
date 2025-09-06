const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = function (req, file, cb) {
  // Define allowed extensions as a regular expression
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const allowedMimeTypes = /image\/jpeg|image\/jpg|image\/png|image\/webp/;

  // Check both extension and mimetype
  const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (extName && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Only image files (jpeg, jpg, png, webp) are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

module.exports = upload;