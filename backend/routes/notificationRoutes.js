const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// Get all notifications for logged-in user
router.get('/', protect, getNotifications);

// Mark all as read
router.put('/read-all', protect, markAllAsRead);

// Mark specific notification as read
router.put('/:id/read', protect, markAsRead);

module.exports = router;
