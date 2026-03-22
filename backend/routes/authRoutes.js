const express = require('express');
const router = express.Router();
const { register, login, getProfile, adminRegister, adminLogin, organizerRegister, organizerLogin, updateProfile, deleteProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);

// New Organizer Routes
router.post('/organizer/register', organizerRegister);
router.post('/organizer/login', organizerLogin);

// Profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteProfile);

module.exports = router;
