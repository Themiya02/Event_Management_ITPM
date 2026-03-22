require('dotenv').config({path: '../.env'});
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const User = require('./models/User');
    const Event = require('./models/Event');

    let admin = await User.findOne({ role: 'admin' });
    if(!admin) {
        console.log("No admin found in DB!");
        process.exit(1);
    }
    console.log("Found Admin:", admin.email);

    // Mock the backend controller logic exactly
    try {
        const events = await Event.find({ status: { $regex: /^pending$/i } })
            .populate('organizer', 'name email')
            .sort('-createdAt');
            
        console.log(`Endpoint returned ${events.length} pending events.`);
        if (events.length > 0) {
            console.log("JSON Payload:");
            console.log(JSON.stringify(events[0], null, 2));
        }
    } catch(err) {
        console.error("Endpoint crash simulation:", err.message);
    }
    process.exit(0);
}).catch(console.error);
