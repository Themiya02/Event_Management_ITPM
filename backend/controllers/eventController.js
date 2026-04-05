const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { sendStallBookingDecisionEmail } = require('../utils/emailService');

exports.getEventsWithMaps = async (req, res) => {
  try {
    const events = await Event.find({ stallMapUrl: { $exists: true, $ne: null, $ne: '' } }).sort('-createdAt');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const {
      name, artistName, description, date, time, location, campusType,
      isPaid, price, isOpenRegistration, seatLimit, imageUrl
    } = req.body;

    if (!name || !date || !time || !location || !campusType) {
      return res.status(400).json({ message: 'Missing required event information' });
    }

    const fee = isPaid ? Number((price || 0) * 0.05).toFixed(2) : 0;

    const event = await Event.create({
      organizer: req.user._id,
      name,
      artistName,
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
      name, artistName, description, date, time, location, campusType,
      isPaid, price, isOpenRegistration, seatLimit, imageUrl
    } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.name = name || event.name;
    event.artistName = artistName !== undefined ? artistName : event.artistName;
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

function normalizeStallPricingRows(stallPricing) {
  if (!Array.isArray(stallPricing)) return null;
  const rows = stallPricing
    .map((r) => ({
      stall: String(r.stall || '').trim(),
      price: Number(r.price)
    }))
    .filter((r) => r.stall.length > 0 && !Number.isNaN(r.price) && r.price >= 0);

  if (rows.length === 0) return [];

  const seen = new Set();
  for (const r of rows) {
    const key = r.stall.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`Duplicate stall: ${r.stall}`);
    }
    seen.add(key);
  }
  return rows;
}

function resolveStallBasePrice(event, stallLocation) {
  const normalized = String(stallLocation || '').trim().toLowerCase();
  const list = event.stallPricing || [];
  if (!list.length) {
    return { base: 10000, valid: true };
  }
  const row = list.find((s) => String(s.stall || '').trim().toLowerCase() === normalized);
  if (!row) return { base: null, valid: false };
  return { base: Number(row.price), valid: true };
}

// Admin: Upload stall map + stall/price table for an event
exports.uploadStallMap = async (req, res) => {
  try {
    const { stallMapUrl, stallPricing } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (stallMapUrl !== undefined && stallMapUrl !== null && String(stallMapUrl).trim() !== '') {
      event.stallMapUrl = stallMapUrl;
    }

    if (Array.isArray(stallPricing)) {
      let rows;
      try {
        rows = normalizeStallPricingRows(stallPricing);
      } catch (e) {
        return res.status(400).json({ message: e.message });
      }
      if (stallPricing.length > 0 && rows.length === 0) {
        return res.status(400).json({ message: 'Each row needs a stall name and a valid price (0 or more).' });
      }
      if (rows.length > 0) {
        event.stallPricing = rows;
      }
    }

    if (!event.stallMapUrl) {
      return res.status(400).json({ message: 'Upload a stall map before saving.' });
    }
    if (!event.stallPricing || event.stallPricing.length === 0) {
      return res.status(400).json({ message: 'Add at least one stall with price before saving.' });
    }

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
    const { stallLocation, stallName, description, foodType, needsElectricity, needsWater, paymentReceipt, x, y } = req.body;
    const normalizedStallLocation = String(stallLocation || '').trim();
    
    if (!normalizedStallLocation || !stallName || !paymentReceipt) {
      return res.status(400).json({ message: 'Stall location, stall name, and payment receipt are required.' });
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

    const { base, valid } = resolveStallBasePrice(event, normalizedStallLocation);
    if (!valid || base == null) {
      return res.status(400).json({ message: 'Selected stall is not valid for this event.' });
    }

    // Block duplicate slot codes (case-insensitive), e.g. A-01 and a-01
    const duplicateSlot = (event.bookedStalls || []).some(
      (booking) => String(booking.stallLocation || '').trim().toLowerCase() === normalizedStallLocation.toLowerCase()
    );
    if (duplicateSlot) {
      return res.status(400).json({ message: `Stall "${normalizedStallLocation}" is already booked. Please choose a different stall.` });
    }

    // Calculate total price server-side for integrity
    let totalPrice = base;
    if (needsElectricity) totalPrice += 3000;
    if (needsWater) totalPrice += 2000;

    // Append the booking
    event.bookedStalls.push({
      vendorId: req.user._id,
      vendorName: req.user.name,
      vendorEmail: req.user.email || '',
      stallLocation: normalizedStallLocation,
      stallName,
      description,
      foodType,
      needsElectricity: Boolean(needsElectricity),
      needsWater: Boolean(needsWater),
      totalPrice,
      paymentReceipt,
      status: 'Pending',
      x: x !== undefined ? Number(x) : undefined,
      y: y !== undefined ? Number(y) : undefined
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
    const normalizedStatus = typeof status === 'string'
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : '';
    
    if (!['Pending', 'Approved', 'Rejected'].includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const booking = event.bookedStalls.id(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = normalizedStatus;
    await event.save();

    if (['Approved', 'Rejected'].includes(normalizedStatus)) {
      void (async () => {
        try {
          let to = (booking.vendorEmail && String(booking.vendorEmail).trim()) || '';
          let vendorName = booking.vendorName;
          if (!to && booking.vendorId) {
            const vendor = await User.findById(booking.vendorId).select('email name');
            to = (vendor?.email && String(vendor.email).trim()) || '';
            if (vendor?.name) vendorName = vendor.name;
          }
          if (!to) {
            console.warn('[stall booking email] No vendor email on booking or user record', bookingId);
            return;
          }
          await sendStallBookingDecisionEmail({
            to,
            vendorName,
            eventName: event.name,
            stallName: booking.stallName,
            stallLocation: booking.stallLocation,
            status: normalizedStatus
          });
        } catch (err) {
          console.error('[stall booking email]', err.message);
        }
      })();
    }

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

    const locForPrice = booking.stallLocation;
    const { base, valid } = resolveStallBasePrice(event, locForPrice);
    if (!valid || base == null) {
      return res.status(400).json({ message: 'Selected stall is not valid for this event.' });
    }
    let totalPrice = base;
    if (booking.needsElectricity) totalPrice += 3000;
    if (booking.needsWater) totalPrice += 2000;
    booking.totalPrice = totalPrice;

    if (req.user?.email) {
      booking.vendorEmail = String(req.user.email).trim();
    }

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Food Stall: Delete own booking (only if Pending)
exports.deleteStallBooking = async (req, res) => {
  try {
    const { eventId, bookingId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const booking = event.bookedStalls.id(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Ownership & Status Check
    if (String(booking.vendorId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this application' });
    }
    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot delete application after admin review.' });
    }

    event.bookedStalls.pull(bookingId);
    await event.save();
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

