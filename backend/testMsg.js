const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Message = require('./models/Message');
const User = require('./models/User');
const Notification = require('./models/Notification');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        const sender = await User.findOne({role: 'admin'});
        const receiver = await User.findOne({role: 'organizer'});
        
        if (!sender || !receiver) {
            console.log('Users not found');
            process.exit(0);
        }

        const message = new Message({
            sender: sender._id,
            receiver: receiver._id,
            content: 'Test message from script'
        });

        await message.save();
        await message.populate('sender', 'name role avatar');
        await message.populate('receiver', 'name role avatar');

        const senderInfo = await User.findById(sender._id);

        const notif = await Notification.create({
            recipient: receiver._id,
            message: `New message from ${senderInfo.name}`,
            type: 'new_message',
            relatedId: message._id
        });

        console.log('Message created:', message._id);
        console.log('Notification created:', notif._id);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
test();
