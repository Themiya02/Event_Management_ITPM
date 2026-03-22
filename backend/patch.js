const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/eventio').then(async () => {
  const Event = require('./models/Event.js');
  const res = await Event.updateMany({name: /lantharuma/i}, {isOpenRegistration: false});
  console.log('Fixed count:', res.modifiedCount);
  process.exit(0);
}).catch(console.error);
