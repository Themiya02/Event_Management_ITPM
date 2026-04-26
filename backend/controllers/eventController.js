const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');

exports.getEventsWithMaps = async (req, res) => {
  try {
    const { summary } = req.query;
    let query = Event.find({ stallMapUrl: { $exists: true, $ne: null, $ne: '' } });
    if (summary === 'true') {
      query = query.select('name date time location status imageUrl organizer createdAt stallMapUrl stallPricing bankDetails registrationsCount');
    }
    const events = await query.sort('-createdAt');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    // Option 1: Venue Availability Checker & Conflict Detection
    const conflict = await Event.findOne({
      location: { $regex: new RegExp(`^${location}$`, 'i') }, // Case-insensitive location check
      date: new Date(date),
      time: time,
      status: { $in: ['Pending', 'Approved', 'In Progress'] }
    });

    if (conflict) {
      return res.status(400).json({ 
        message: `Venue Conflict Detected: "${location}" is already scheduled for an event ("${conflict.name}") at ${time} on this date. Please choose a different venue or time.` 
      });
    }

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

    // Notify Admin about new event
    await Notification.create({
      recipient: 'admin',
      message: `A new event "${event.name}" has been created and is pending review.`,
      type: 'event_created',
      relatedId: event._id
    });

    // Notify Organizer about successful creation
    await Notification.create({
      recipient: req.user._id,
      message: `Your event "${event.name}" was created successfully and is pending review.`,
      type: 'system',
      relatedId: event._id
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApprovedEvents = async (req, res) => {
  try {
    const { summary } = req.query;
    let query = Event.find({ status: 'Approved' });
    if (summary === 'true') {
      query = query.select('-imageUrl -bookedStalls -paymentReceipt -stallMapUrl');
    }
    const events = await query.sort('-createdAt');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrganizerEvents = async (req, res) => {
  try {
    const { summary, tracking } = req.query;
    let query = Event.find({ organizer: req.user._id }); // Filter for organizer's own events
    
    if (tracking === 'true') {
      // Extremely lightweight query for the tracking page
      query = query.select('name trackingStep status rejectedAt rejectionReason approvals');
    } else if (summary === 'true') {
      // Exclude heavy fields like bookedStalls and large descriptions/images
      query = query.select('-bookedStalls -description -imageUrl -paymentReceipt -stallMapUrl');
    }
    
    const events = await query.sort('-createdAt');
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

    // Notify the user about successful registration
    await Notification.create({
      recipient: req.user._id,
      message: `You have successfully registered for "${event.name}".`,
      type: 'system',
      relatedId: event._id
    });

    // Notify the organizer about the new registration
    await Notification.create({
      recipient: event.organizer,
      message: `New registration: ${participantName} has registered for "${event.name}".`,
      type: 'registration_received',
      relatedId: event._id
    });

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

exports.getOrganizerRegistrations = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).select('_id');
    const eventIds = events.map(e => e._id);
    
    const registrations = await Registration.find({ event: { $in: eventIds } })
      .populate('event', 'name isPaid price')
      .populate('user', 'name email')
      .sort('-registeredAt');
      
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await Registration.findById(req.params.registrationId).populate('event');
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    
    if (registration.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    registration.status = status;
    await registration.save();
    
    // Notify the user about their registration status update
    await Notification.create({
      recipient: registration.user,
      message: `Your registration for "${registration.event.name}" has been ${status.toLowerCase()}.`,
      type: status === 'Approved' ? 'registration_approved' : 'registration_rejected',
      relatedId: registration.event._id
    });
    
    res.json(registration);
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

    if (status === 'Approved') {
      // Notify Organizer
      await Notification.create({
        recipient: event.organizer,
        message: `Your event "${event.name}" has been approved!`,
        type: 'event_approved',
        relatedId: event._id
      });
      // Notify All Users
      await Notification.create({
        recipient: 'all',
        message: `New event uploaded: "${event.name}"! Check it out.`,
        type: 'event_approved',
        relatedId: event._id
      });
    } else if (status === 'Rejected') {
      await Notification.create({
        recipient: event.organizer,
        message: `Your event "${event.name}" has been rejected.`,
        type: 'event_rejected',
        relatedId: event._id
      });
    }

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
    const { summary } = req.query;
    let query = Event.find({ status: { $regex: /^pending$/i } });
    if (summary === 'true') {
      // Exclude massive fields to ensure lightning fast loads
      query = query.select('-imageUrl -description -bookedStalls -paymentReceipt -stallMapUrl');
    }
    const events = await query
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
    const { summary } = req.query;
    let query = Event.find({ status: { $regex: /^rejected$/i } });
    if (summary === 'true') {
      query = query.select('-imageUrl -description -bookedStalls -paymentReceipt -stallMapUrl');
    }
    const events = await query
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
    const { summary } = req.query;
    let query = Event.find({});
    
    // If summary is requested, exclude heavy fields
    if (summary === 'true') {
      query = query.select('-imageUrl -description -bookedStalls -paymentReceipt');
    }

    const events = await query
      .populate('organizer', 'name email')
      .sort('-createdAt');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get event statistics
exports.getAdminStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Event.countDocuments({}),
      Event.countDocuments({ status: { $regex: /^pending$/i } }),
      Event.countDocuments({ status: { $regex: /^approved$/i } }),
      Event.countDocuments({ status: { $regex: /^rejected$/i } })
    ]);
    res.json({ total, pending, approved, rejected });
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

    // Notify Organizer about step progress
    await Notification.create({
      recipient: event.organizer,
      message: `Your event "${event.name}" has been approved for the ${field} stage.`,
      type: 'system',
      relatedId: event._id
    });

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

    if (action === 'approve') {
      // Notify Organizer
      await Notification.create({
        recipient: event.organizer,
        message: `Your event "${event.name}" has been approved by the Admin!`,
        type: 'event_approved',
        relatedId: event._id
      });
      // Notify All Users
      await Notification.create({
        recipient: 'all',
        message: `New event uploaded: "${event.name}"! Check it out.`,
        type: 'event_approved',
        relatedId: event._id
      });
    } else if (action === 'reject') {
      await Notification.create({
        recipient: event.organizer,
        message: `Your event "${event.name}" has been rejected by the Admin.`,
        type: 'event_rejected',
        relatedId: event._id
      });
    }

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

// Admin: Upload stall map for an event
exports.uploadStallMap = async (req, res) => {
  try {
    const { stallMapUrl, stallPricing } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    if (stallMapUrl) event.stallMapUrl = stallMapUrl;
    if (stallPricing) event.stallPricing = stallPricing;
    
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Add or update bank details for food stall payments
exports.updateBankDetails = async (req, res) => {
  try {
    const { accountName, bankName, accountNumber, branch, instructions } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.bankDetails = {
      accountName: accountName || '',
      bankName: bankName || '',
      accountNumber: accountNumber || '',
      branch: branch || '',
      instructions: instructions || ''
    };

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete bank details
exports.deleteBankDetails = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.bankDetails = {
      accountName: '',
      bankName: '',
      accountNumber: '',
      branch: '',
      instructions: ''
    };

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Food Stall: Book a stall on the map
exports.bookFoodStall = async (req, res) => {
  try {
    const { stallName, description, foodType, needsElectricity, needsWater, paymentReceipt, x, y, stallLocation } = req.body;
    const normalizedStallLocation = String(stallLocation || '').trim();
    
    if (!normalizedStallLocation || !stallName || !paymentReceipt) {
      return res.status(400).json({ message: 'Stall location, stall name, and payment receipt are required.' });
    }
    if (!/^[a-zA-Z0-9]+$/.test(normalizedStallLocation)) {
      return res.status(400).json({ message: 'Stall location must be alphanumeric (e.g., A1, B2).' });
    }
    if (stallName.trim().length < 5) {
      return res.status(400).json({ message: 'Stall name must have at least 5 letters.' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Ensure the event has a map
    if (!event.stallMapUrl) {
      return res.status(400).json({ message: 'Event does not have a stall map available.' });
    }

    // Block duplicate slot codes (case-insensitive), e.g. A-01 and a-01
    const duplicateSlot = (event.bookedStalls || []).some(
      (booking) => String(booking.stallLocation || '').trim().toLowerCase() === normalizedStallLocation.toLowerCase()
    );
    if (duplicateSlot) {
      return res.status(400).json({ message: `Stall "${normalizedStallLocation}" is already booked. Please choose a different stall.` });
    }

    // Calculate total price server-side for integrity
    let totalPrice = 10000; // Base stall price
    if (needsElectricity) totalPrice += 3000;
    if (needsWater) totalPrice += 2000;

    // Append the booking
    event.bookedStalls.push({
      vendorId: req.user._id,
      vendorName: req.user.name,
      stallLocation: normalizedStallLocation,
      stallName,
      description,
      foodType,
      needsElectricity: Boolean(needsElectricity),
      needsWater: Boolean(needsWater),
      totalPrice,
      paymentReceipt,
      status: 'Pending',
      x,
      y
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update Food Stall Booking Status
exports.updateStallBookingStatus = async (req, res) => {
  try {
    const { eventId, bookingId } = req.params;
    const { status } = req.body;
    
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const booking = event.bookedStalls.id(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });


    booking.status = status;
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Food Stall: Update own booking (only if Pending)
exports.updateStallBooking = async (req, res) => {
  try {
    const { eventId, bookingId } = req.params;
    const { stallLocation, stallName, description, foodType, needsElectricity, needsWater, paymentReceipt } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const booking = event.bookedStalls.id(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Ownership & Status Check
    if (String(booking.vendorId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to edit this application' });
    }
    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot edit application after admin review.' });
    }

    // Validation (reuse same rules as create)
    const normalizedStallLocation = String(stallLocation || '').trim();
    if (normalizedStallLocation && !/^[a-zA-Z0-9]+$/.test(normalizedStallLocation)) {
      return res.status(400).json({ message: 'Stall location must be alphanumeric (e.g., A1, B2).' });
    }
    if (stallName && stallName.trim().length < 5) {
      return res.status(400).json({ message: 'Stall name must have at least 5 letters.' });
    }

    // Check for duplicate stall location (excluding current booking)
    if (normalizedStallLocation && normalizedStallLocation.toLowerCase() !== String(booking.stallLocation).toLowerCase()) {
      const duplicate = (event.bookedStalls || []).some(
        (b) => b._id.toString() !== bookingId && String(b.stallLocation || '').trim().toLowerCase() === normalizedStallLocation.toLowerCase()
      );
      if (duplicate) {
        return res.status(400).json({ message: `Stall "${normalizedStallLocation}" is already booked.` });
      }
    }

    // Update fields
    if (stallLocation !== undefined) booking.stallLocation = normalizedStallLocation;
    if (stallName !== undefined) booking.stallName = stallName;
    if (description !== undefined) booking.description = description;
    if (foodType !== undefined) booking.foodType = foodType;
    if (needsElectricity !== undefined) booking.needsElectricity = Boolean(needsElectricity);
    if (needsWater !== undefined) booking.needsWater = Boolean(needsWater);
    if (paymentReceipt !== undefined) booking.paymentReceipt = paymentReceipt;

    // Recalculate price
    let totalPrice = 10000;
    if (booking.needsElectricity) totalPrice += 3000;
    if (booking.needsWater) totalPrice += 2000;
    booking.totalPrice = totalPrice;


    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

