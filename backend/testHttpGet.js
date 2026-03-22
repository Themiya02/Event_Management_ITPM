const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const User = require('./models/User');
    const jwt = require('jsonwebtoken');

    let admin = await User.findOne({ role: 'admin' });
    if(!admin) {
        console.log("No admin found in DB!");
        process.exit(1);
    }
    
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    try {
        const response = await axios.get('http://localhost:5000/api/events/admin/pending', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Axios Status:", response.status);
        console.log("Payload Length:", response.data.length);
        console.log("First Event Name:", response.data.length > 0 ? response.data[0].name : 'N/A');
    } catch(err) {
        console.error("HTTP Request Failed:", err.response ? err.response.data : err.message);
    }
    process.exit(0);
});
