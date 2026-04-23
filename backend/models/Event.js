const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true, trim: true },
  artistName: { type: String, trim: true },
  description: { type: String, trim: true },
  imageUrl: { type: String, default: '' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  campusType: { type: String, enum: ['indoor', 'outdoor'], required: true },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  campusFee: { type: Number, default: 0 },
  isOpenRegistration: { type: Boolean, default: true },
  seatLimit: { type: Number, default: null },
  approvals: {
    security: { type: Boolean, default: false },
    medical: { type: Boolean, default: false },
    community: { type: Boolean, default: false },
    dean: { type: Boolean, default: false }
  },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'In Progress', 'Completed'], default: 'Pending' },
  trackingStep: { type: Number, default: 1 },
  rejectedAt: { type: String, default: null },
  rejectionReason: { type: String, default: null },
  assignedManagers: {
    securityManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    medicineManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  registrationsCount: { type: Number, default: 0 },
  stallMapUrl: { type: String, default: '' },
<<<<<<< HEAD
  stallPricing: [{
    stall: { type: String, trim: true, required: true },
    price: { type: Number, required: true, min: 0 }
  }],
=======
>>>>>>> kumuthu01
  bankDetails: {
    accountName: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    branch: { type: String, default: '' },
    instructions: { type: String, default: '' }
  },
  bookedStalls: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vendorName: { type: String },
    /** Same email the vendor used when they registered (captured at application submit). */
    vendorEmail: { type: String, trim: true, default: '' },
    stallLocation: { type: String, default: '' },
    stallName: { type: String },
    description: { type: String },
    foodType: { type: String },
    needsElectricity: { type: Boolean, default: false },
    needsWater: { type: Boolean, default: false },
    totalPrice: { type: Number },
    paymentReceipt: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    x: { type: Number },
    y: { type: Number },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    paymentReceipt: { type: String, default: '' },
    bookedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
