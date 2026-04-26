const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Event = require('./models/Event');
const Registration = require('./models/Registration');
const Notification = require('./models/Notification');
const Message = require('./models/Message');

async function cleanup() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        // Define "today" (since midnight)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find events created today OR with test prefixes
        const query = {
            $or: [
                { createdAt: { $gte: today } },
                { name: { $regex: /^E2E/i } },
                { name: { $regex: /^Comprehensive/i } },
                { name: { $regex: /^Test Event/i } }
            ]
        };

        const eventsToDelete = await Event.find(query);
        console.log(`Found ${eventsToDelete.length} test events to delete.`);

        if (eventsToDelete.length > 0) {
            const eventIds = eventsToDelete.map(e => e._id);

            // Delete registrations for these events
            const regResult = await Registration.deleteMany({ event: { $in: eventIds } });
            console.log(`🗑️ Deleted ${regResult.deletedCount} associated registrations.`);

            // Delete notifications related to these events
            const notifResult = await Notification.deleteMany({ 
                $or: [
                    { relatedId: { $in: eventIds } },
                    { message: { $regex: new RegExp(eventsToDelete.map(e => e.name).join('|'), 'i') } }
                ]
            });
            console.log(`🗑️ Deleted ${notifResult.deletedCount} associated notifications.`);

            // Delete the events
            const eventResult = await Event.deleteMany({ _id: { $in: eventIds } });
            console.log(`🗑️ Deleted ${eventResult.deletedCount} events.`);
        }

        // Optional: Clean up test messages
        const msgResult = await Message.deleteMany({
            content: { $regex: /Support Request:|Admin Response:/i }
        });
        console.log(`🗑️ Deleted ${msgResult.deletedCount} test chat messages.`);

        console.log('\n✨ Cleanup Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup Failed:', error);
        process.exit(1);
    }
}

cleanup();
