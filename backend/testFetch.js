require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const User = require('./models/User');
    let admin = await User.findOne({ role: 'admin' });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    try {
        const response = await fetch('http://localhost:5000/api/events/admin/pending', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        console.log("Fetch Status:", response.status);
        console.log("Payload Length:", data.length);
        if(data.length > 0) {
            console.log("First Event Name:", data[0].name);
        }
    } catch(err) {
        console.error("Fetch Failed:", err.message);
    }
    process.exit(0);
});
