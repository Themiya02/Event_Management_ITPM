require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Use fetch or axios? We'll use fetch manually.
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const User = require('./models/User');
    let admin = await User.findOne({ role: 'admin' });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    try {
        const headers = { Authorization: `Bearer ${token}` };
        console.log("Fetching endpoints...");
        const pendingReq = fetch('http://localhost:5000/api/events/admin/pending', { headers }).then(r=>r.json());
        const approvedReq = fetch('http://localhost:5000/api/events/approved', { headers }).then(r=>r.json());
        const allReq = fetch('http://localhost:5000/api/events/admin/all', { headers }).then(r=>r.json());

        const [p, a, al] = await Promise.all([pendingReq, approvedReq, allReq]);
        
        console.log("Pending:", Array.isArray(p) ? p.length : p);
        console.log("Approved:", Array.isArray(a) ? a.length : a);
        console.log("All:", Array.isArray(al) ? al.length : al);
        
    } catch(err) {
        console.error("Promise Rejected globally!", err.message);
    }
    process.exit(0);
});
