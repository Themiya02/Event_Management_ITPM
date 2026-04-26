const express = require('express');
const router = express.Router();
const { protect, organizer } = require('../middleware/auth');
const {
  getEventsWithMaps,
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
  getAdminStats,
  updateApprovalCheckbox,
  adminDecideEvent,
  uploadStallMap,
  bookFoodStall,
  updateStallBookingStatus,
  getOrganizerRegistrations,
  updateRegistrationStatus,
  updateStallBooking,
  deleteStallBooking
} = require('../controllers/eventController');

router.post('/', protect, createEvent);
router.get('/mapped', protect, getEventsWithMaps);
router.get('/public/approved', getApprovedEvents);
router.get('/approved', protect, getApprovedEvents);
router.get('/organizer', protect, getOrganizerEvents);
router.post('/:id/register', protect, registerForEvent);
router.get('/my-registrations', protect, getMyRegistrations);
router.patch('/:id/status', protect, updateEventStatus);

// Organizer specific routes for registrations
router.get('/organizer/registrations', protect, organizer, getOrganizerRegistrations);
router.patch('/registrations/:registrationId/status', protect, organizer, updateRegistrationStatus);

// Admin routes
const { admin } = require('../middleware/auth');
router.get('/admin/pending', protect, admin, getAdminPendingEvents);
router.get('/admin/rejected', protect, admin, getAdminRejectedEvents);
router.get('/admin/all', protect, admin, getAdminAllEvents);
router.get('/admin/stats', protect, admin, getAdminStats);
router.patch('/admin/:id/approval', protect, admin, updateApprovalCheckbox);
router.patch('/admin/:id/decide', protect, admin, adminDecideEvent);
router.patch('/admin/:id/stall-map', protect, admin, uploadStallMap);
router.patch('/admin/stall-booking/:eventId/:bookingId/status', protect, admin, updateStallBookingStatus);

router.get('/:id', protect, getEventById);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

router.post('/:id/book-stall', protect, bookFoodStall);
router.patch('/:id/stall-booking/:bookingId', protect, updateStallBooking);
router.delete('/:id/stall-booking/:bookingId', protect, deleteStallBooking);


module.exports = router;
