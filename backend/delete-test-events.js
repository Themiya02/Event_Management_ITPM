
const mongoose = require('mongoose');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config();

const deleteTestEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_management');
    console.log('Connected to MongoDB');

    // Delete events that look like test events
    const testPattern = /Complete Event|Edited Event|Paid Event|T\d+|Music Fest|Gourmet|Test|Venue|Food|DEBUG|E2E/i;

    const eventsToDelete = await Event.find({ name: { $regex: testPattern } });
    console.log(`Found ${eventsToDelete.length} test events to delete.`);

    for (const event of eventsToDelete) {
      console.log(`Deleting event: ${event.name} (${event._id})`);
      await Registration.deleteMany({ event: event._id });
      await Notification.deleteMany({ relatedId: event._id });
      await Event.deleteOne({ _id: event._id });
    }

    // Delete test users
    const userPattern = /@test\.com$/i;
    const usersToDelete = await User.find({ email: { $regex: userPattern } });
    console.log(`Found ${usersToDelete.length} test users to delete.`);
    for (const user of usersToDelete) {
      console.log(`Deleting user: ${user.email} (${user._id})`);
      await User.deleteOne({ _id: user._id });
    }

    // Also delete any other events created recently by chaminda@gmail.com if needed?
    // Let's just stick to the pattern for now to be safe, or ask?
    // Actually, I'll just delete ALL events if they are all tests.

    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

deleteTestEvents();
