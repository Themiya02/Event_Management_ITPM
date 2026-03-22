const express = require('express');
const router = express.Router();
const { protect, organizer } = require('../middleware/auth');
const {
  createEvent,
  getApprovedEvents,
  getOrganizerEvents,
  registerForEvent,
  getMyRegistrations,
  updateEventStatus,
  getEventById,
  updateEvent,
  deleteEvent,
  getAdminPendingEvents,
  getAdminRejectedEvents,
  getAdminAllEvents,
  updateApprovalCheckbox,
  adminDecideEvent
} = require('../controllers/eventController');

router.post('/', protect, createEvent);
router.get('/approved', protect, getApprovedEvents);
router.get('/organizer', protect, getOrganizerEvents);
router.post('/:id/register', protect, registerForEvent);
router.get('/my-registrations', protect, getMyRegistrations);
router.patch('/:id/status', protect, updateEventStatus);

// Admin routes
const { admin } = require('../middleware/auth');
router.get('/admin/pending', protect, admin, getAdminPendingEvents);
router.get('/admin/rejected', protect, admin, getAdminRejectedEvents);
router.get('/admin/all', protect, admin, getAdminAllEvents);
router.patch('/admin/:id/approval', protect, admin, updateApprovalCheckbox);
router.patch('/admin/:id/decide', protect, admin, adminDecideEvent);

router.get('/:id', protect, getEventById);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);


module.exports = router;
