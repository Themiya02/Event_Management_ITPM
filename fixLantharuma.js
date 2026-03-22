const mongoose = require('mongoose');
const path = require('path');

mongoose.connect('mongodb://localhost:27017/eventio')
  .then(async () => {
    const Event = require(path.join(__dirname, 'backend', 'models', 'Event.js'));
    const res = await Event.updateMany({name: /lantharuma/i}, {isOpenRegistration: false});
    console.log(`Successfully fixed ${res.modifiedCount} "lantharuma" events!`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
