const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const events = await Event.find({ status: { $regex: /^pending$/i } }).populate('organizer', 'name email');
    console.log("Found Pending Events:", events.length);
    events.forEach(e => {
        console.log(`- ${e.name} (Status: ${e.status}) by ${e.organizer ? e.organizer.email : 'None'}`);
    });
    mongoose.disconnect();
}).catch(console.error);
