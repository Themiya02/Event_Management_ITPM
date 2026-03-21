const fs = require('fs');
const filepath = 'backend/controllers/authController.js';
let content = fs.readFileSync(filepath, 'utf8');

const deleteLogic = `

// Delete Profile
exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    try {
      const Event = require('../models/Event');
      await Event.deleteMany({ organizer: req.user._id });
    } catch (e) {}
    try {
      const Registration = require('../models/Registration');
      await Registration.deleteMany({ user: req.user._id });
    } catch (e) {}

    await user.deleteOne();
    res.json({ message: 'User removed completely' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
`;

if (!content.includes('exports.deleteProfile')) {
  fs.writeFileSync(filepath, content + deleteLogic);
}
console.log('Added delete function');
