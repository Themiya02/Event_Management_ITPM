const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const User = require('./models/User');
    const Event = require('./models/Event');

    const users = await User.find({});
    console.log('Total Users:', users.length);
    for (const u of users) {
        const events = await Event.find({ organizer: u._id });
        if (events.length > 0) {
            console.log(`\nUser: ${u.email} (Role: ${u.role})`);
            console.log(`-> Has ${events.length} events.`);
            events.forEach(e => {
                const dateStr = e.date ? new Date(e.date).toLocaleDateString() : 'N/A';
                console.log(`   - Name: ${e.name} | Status: ${e.status} | Date: ${dateStr}`);
            });
        }
    }
    mongoose.disconnect();
}).catch(console.error);
