const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Message = require('./models/Message');

async function checkMessages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const msgs = await Message.find().sort({createdAt: -1}).limit(5).populate('sender', 'name').populate('receiver', 'name');
        console.log("Recent messages:");
        msgs.forEach(m => {
            console.log(`[${m.createdAt}] ${m.sender.name} -> ${m.receiver.name}: ${m.content}`);
        });
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
checkMessages();
