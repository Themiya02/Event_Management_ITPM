const Event = require('../models/Event');
const Registration = require('../models/Registration');

exports.createEvent = async (req, res) => {
  try {
    const {
      name, description, date, time, location, campusType,
      isPaid, price, isOpenRegistration, seatLimit, imageUrl
    } = req.body;

    if (!name || !date || !time || !location || !campusType) {
      return res.status(400).json({ message: 'Missing required event information' });
    }

    const fee = isPaid ? Number((price || 0) * 0.05).toFixed(2) : 0;

    const event = await Event.create({
      organizer: req.user._id,
      name,
      description,
      date,
      time,
      location,
      campusType,
      imageUrl,
      seatLimit: seatLimit ? Number(seatLimit) : null,
      isPaid,
      price: isPaid ? Number(price || 0) : 0,
      campusFee: Number(fee),
      isOpenRegistration: isOpenRegistration ?? true,
      status: 'Pending',
      trackingStep: 1,
      rejectedAt: null,
      rejectionReason: null
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'Approved' }).sort('-createdAt');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort('-createdAt');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { participantName, campusId, campusYear, paymentSlip } = req.body;

    if (!participantName || !campusId || !campusYear) {
      return res.status(400).json({ message: 'Missing required campus details (Name, ID, Year)' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.isOpenRegistration) return res.status(400).json({ message: 'Registration closed for this event' });

    if (event.isPaid && !paymentSlip) {
      return res.status(400).json({ message: 'A payment slip must be uploaded for paid events.' });
    }

    const already = await Registration.findOne({ user: req.user._id, event: eventId });
    if (already) return res.status(400).json({ message: 'Already registered' });

    await Registration.create({ 
      user: req.user._id, 
      event: eventId,
      participantName,
      campusId,
      campusYear,
      paymentSlip: event.isPaid ? paymentSlip : null
    });

    event.registrationsCount += 1;
    await event.save();

    res.json({ message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id }).populate('event');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = status;
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const {
      name, description, date, time, location, campusType,
      isPaid, price, isOpenRegistration, seatLimit, imageUrl
    } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.name = name || event.name;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;
    event.campusType = campusType || event.campusType;
    event.imageUrl = imageUrl !== undefined ? imageUrl : event.imageUrl;
    event.seatLimit = seatLimit !== undefined ? Number(seatLimit) : event.seatLimit;
    event.isPaid = isPaid !== undefined ? isPaid : event.isPaid;
    event.price = isPaid ? Number(price || 0) : 0;
    event.campusFee = isPaid ? Number((price || 0) * 0.05).toFixed(2) : 0;
    event.isOpenRegistration = isOpenRegistration !== undefined ? isOpenRegistration : event.isOpenRegistration;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all pending events (for admin dashboard)
exports.getAdminPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: { $regex: /^pending$/i } })
      .populate('organizer', 'name email')
      .sort('-createdAt');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get rejected events
exports.getAdminRejectedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: { $regex: /^rejected$/i } })
      .populate('organizer', 'name email')
      .sort('-createdAt');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all events
exports.getAdminAllEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('organizer', 'name email')
      .sort('-createdAt');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update individual approval checkboxes (security, medical, community, dean)
exports.updateApprovalCheckbox = async (req, res) => {
  try {
    const { field, value } = req.body; 
    const validFields = ['security', 'medical', 'community', 'dean'];
    if (!validFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid approval field' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.approvals[field] = value;
    event.markModified('approvals');

    // Update trackingStep based on approvals
    const { security, medical, community, dean } = event.approvals;
    if (security && !medical) event.trackingStep = 2;
    else if (security && medical && !community) event.trackingStep = 3;
    else if (security && medical && community && !dean) event.trackingStep = 4;
    else if (security && medical && community && dean) event.trackingStep = 4;
    else event.trackingStep = 1;

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Final approve or reject decision
exports.adminDecideEvent = async (req, res) => {
  try {
    const { action, reason } = req.body; 
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (action === 'approve') {
      const { security, medical, community, dean } = event.approvals;
      if (!security || !medical || !community || !dean) {
        return res.status(400).json({ message: 'All 4 approval stages must be completed before approving.' });
      }
      event.status = 'Approved';
      event.rejectedAt = null;
      event.rejectionReason = null;
    } else if (action === 'reject') {
      event.status = 'Rejected';
      event.rejectedAt = reason?.rejectedAt || 'Admin';
      event.rejectionReason = reason?.rejectionReason || 'Rejected by admin';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Registration.deleteMany({ event: req.params.id });
    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
