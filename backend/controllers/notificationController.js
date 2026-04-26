const Notification = require('../models/Notification');
const User = require('../models/User');

// Get notifications for a specific user
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        const userIdStr = userId.toString();

        // Fetch notifications specific to the user OR broadcast to their role OR 'all'
        const notifications = await Notification.find({
            $or: [
                { recipient: userId },
                { recipient: userIdStr },
                { recipient: 'all' },
                { recipient: role }
            ]
        }).sort({ createdAt: -1 }).limit(50);

        // Map through and determine read status for the specific user
        const formattedNotifications = notifications.map(notif => {
            const isRead = notif.readBy.includes(userId);
            return {
                ...notif.toObject(),
                isRead
            };
        });

        res.json(formattedNotifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error while fetching notifications' });
    }
};

// Mark a single notification as read
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;

        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (!notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
            await notification.save();
        }

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error while updating notification' });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        const userIdStr = userId.toString();

        const notifications = await Notification.find({
            $or: [
                { recipient: userId },
                { recipient: userIdStr },
                { recipient: 'all' },
                { recipient: role }
            ],
            readBy: { $ne: userId }
        });

        for (let notif of notifications) {
            notif.readBy.push(userId);
            await notif.save();
        }

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Server error while updating notifications' });
    }
};
