const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.Mixed, // Can be ObjectId (User) or String ('all', 'admin', etc.)
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['event_created', 'event_approved', 'event_rejected', 'new_message', 'system'],
        default: 'system'
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
