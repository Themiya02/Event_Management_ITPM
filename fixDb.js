const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/eventio')
  .then(async () => {
    const Event = require('./backend/models/Event');
    
    // We update all events to have the CORRECT isOpenRegistration boolean 
    // Wait, the user has "lantharuma" as an Open Event but it was saved as true (Registration Open).
    // The user's system only has test data. I'll just flip them all blindly or try to fix it based on name?
    // Let's just flip it for "lantharuma" to demonstrate the dynamic fix.
    const event = await Event.findOne({ name: 'lantharuma' });
    if(event) {
        event.isOpenRegistration = false;
        await event.save();
        console.log('Fixed lantharuma event to isOpenRegistration = false');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
