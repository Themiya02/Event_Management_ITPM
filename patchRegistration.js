const fs = require('fs');

const path = 'backend/controllers/eventController.js';
let content = fs.readFileSync(path, 'utf8');

const regexToReplace = /exports\.registerForEvent = async \(req, res\) => \{\n  try \{\n    const eventId = req\.params\.id;\n    const event = await Event\.findById\(eventId\);\n    if \(\!event\) return res\.status\(404\)\.json\(\{ message: 'Event not found' \}\);\n    if \(\!event\.isOpenRegistration\) return res\.status\(400\)\.json\(\{ message: 'Registration closed for this event' \}\);\n\n    const already = await Registration\.findOne\(\{ user: req\.user\._id, event: eventId \}\);\n    if \(already\) return res\.status\(400\)\.json\(\{ message: 'Already registered' \}\);\n\n    await Registration\.create\(\{ user: req\.user\._id, event: eventId \}\);\n    event\.registrationsCount \+\= 1;\n    await event\.save\(\);\n\n    res\.json\(\{ message: 'Registered successfully' \}\);\n  \} catch \(error\) \{\n    res\.status\(500\)\.json\(\{ message: error\.message \}\);\n  \}\n\};/;

const newContent = `exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { participantName, campusId, campusYear } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.isOpenRegistration) return res.status(400).json({ message: 'Registration closed for this event' });

    if (!participantName || !campusId || !campusYear) {
      return res.status(400).json({ message: 'Participant Name, Campus ID, and Campus Year are strictly required.' });
    }

    const already = await Registration.findOne({ user: req.user._id, event: eventId });
    if (already) return res.status(400).json({ message: 'Already registered' });

    await Registration.create({ 
      user: req.user._id, 
      event: eventId,
      participantName,
      campusId,
      campusYear
    });
    
    event.registrationsCount += 1;
    await event.save();

    res.json({ message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};`;

content = content.replace(regexToReplace, newContent);
fs.writeFileSync(path, content, 'utf8');
console.log('Replaced registerForEvent logic.');
