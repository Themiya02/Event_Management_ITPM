const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getContacts } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Get chat contacts (admin/organizer based on user role)
router.get('/contacts', protect, getContacts);

// Get messages between logged-in user and a specific user
router.get('/:userId', protect, getMessages);

// Send a message
router.post('/', protect, sendMessage);

module.exports = router;
