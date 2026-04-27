const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  participantName: { type: String, required: true },
  campusId: { type: String, required: true },
  campusYear: { type: String, required: true },
  paymentSlip: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  registeredAt: { type: Date, default: Date.now }
});

// Optimization: Add indexes
registrationSchema.index({ user: 1 });
registrationSchema.index({ event: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
