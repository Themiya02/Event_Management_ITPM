const fs = require('fs');

let c = fs.readFileSync('backend/controllers/eventController.js', 'utf8');

// Fix getApprovedEvents back to strict status
c = c.replace(/exports\.getApprovedEvents = async \(req, res\) => \{\r?\n  try \{\r?\n    const events = await Event\.find\(\{\}\)\.sort\('-createdAt'\);/g, `exports.getApprovedEvents = async (req, res) => {\n  try {\n    const events = await Event.find({ status: 'Approved' }).sort('-createdAt');`);

const deleteFunc = `
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Registration.deleteMany({ event: req.params.id });
    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
`;

if (!c.includes('exports.deleteEvent')) {
  c += deleteFunc;
}

fs.writeFileSync('backend/controllers/eventController.js', c);


let r = fs.readFileSync('backend/routes/eventRoutes.js', 'utf8');

if(!r.includes('deleteEvent,')) {
    r = r.replace(/getEventById,\r?\n  updateEvent,/g, `getEventById,\n  updateEvent,\n  deleteEvent,`);
}
if(!r.includes('router.delete')) {
    r = r.replace(/router\.put\('\/:id', protect, updateEvent\);/g, `router.put('/:id', protect, updateEvent);\nrouter.delete('/:id', protect, deleteEvent);`);
}

fs.writeFileSync('backend/routes/eventRoutes.js', r);

console.log('Patched APIs globally');
