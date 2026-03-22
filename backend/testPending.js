require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Event = require('./models/Event');
    const pending = await Event.find({ status: { $regex: /^pending$/i } });
    console.log('Regex Pending count:', pending.length);
    const pendingStrict = await Event.find({ status: 'Pending' });
    console.log('Strict Pending count:', pendingStrict.length);
    const all = await Event.find();
    console.log('All statuses:', all.map(e => e.status));
    process.exit(0);
}).catch(console.error);
