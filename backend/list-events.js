
const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

const listEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const events = await Event.find({});
    console.log(`Remaining events: ${events.length}`);
    events.forEach(e => console.log(`- ${e.name} (${e.status})`));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

listEvents();
