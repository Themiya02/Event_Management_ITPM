const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getPackages,
  applySponsorship,
  verifyOTP,
  resendOTP,
  getAllSponsorships,
  updateStatus
} = require('../controllers/sponsorshipController');
const { protect } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'slips');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for payment slip uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'slip-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPG, PNG) and PDF files are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Public routes
router.get('/packages', getPackages);
router.post('/apply', upload.single('paymentSlip'), applySponsorship);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Admin routes (protected)
router.get('/all', protect, getAllSponsorships);
router.patch('/:id/status', protect, updateStatus);

module.exports = router;
