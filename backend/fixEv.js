const mongoose = require('mongoose');
const Event = require('./models/Event.js');

mongoose.connect('mongodb://127.0.0.1:27017/eventio', { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  const res = await Event.updateMany(
    { name: { $regex: /Lantharuma/i } }, 
    { $set: { isOpenRegistration: false } }
  );
  console.log('Fixed count:', res.modifiedCount);
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
