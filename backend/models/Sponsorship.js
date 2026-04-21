const mongoose = require('mongoose');

const sponsorshipSchema = new mongoose.Schema({
  sponsorName: {
    type: String,
    required: [true, 'Sponsor company name is required'],
    trim: true,
    minlength: [2, 'Company name must be at least 2 characters'],
    maxlength: [100, 'Company name must not exceed 100 characters']
  },
  sponsorEmail: {
    type: String,
    required: [true, 'Sponsor email is required'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true,
    minlength: [2, 'Contact person name must be at least 2 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9+\-\s()]{7,15}$/, 'Please provide a valid phone number']
  },
  packageType: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    required: [true, 'Package type is required']
  },
  packageAmount: {
    type: Number,
    required: true
  },
  paymentSlip: {
    type: String, // filename/path
    required: [true, 'Payment slip is required']
  },
  otpCode: {
    type: String,
    select: false
  },
  otpExpiry: {
    type: Date,
    select: false
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending_otp', 'pending_review', 'approved', 'rejected'],
    default: 'pending_otp'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message must not exceed 500 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sponsorship', sponsorshipSchema);
