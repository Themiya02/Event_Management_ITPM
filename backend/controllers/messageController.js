const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver and content are required' });
        }

        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            content
        });

        await message.save();

        // Optionally populate sender/receiver info before returning
        await message.populate('sender', 'name role avatar');
        await message.populate('receiver', 'name role avatar');

        const senderInfo = await User.findById(senderId);

        // Create a notification for the receiver
        await Notification.create({
            recipient: receiverId,
            message: `New message from ${senderInfo.name}`,
            type: 'new_message',
            relatedId: message._id
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error while sending message' });
    }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params; // The other user's ID
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 }).populate('sender', 'name role avatar');

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error while fetching messages' });
    }
};

// Get contacts (Admin sees organizers, Organizer sees admin)
exports.getContacts = async (req, res) => {
    try {
        const role = req.user.role;

        let contacts;
        if (role === 'admin') {
            // Admin can chat with organizers
            contacts = await User.find({ role: 'organizer' }).select('name email role avatar');
        } else if (role === 'organizer') {
            // Organizer can chat with admins
            contacts = await User.find({ role: 'admin' }).select('name email role avatar');
        } else {
            return res.status(403).json({ message: 'Unauthorized role for messaging' });
        }

        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Server error while fetching contacts' });
    }
};
