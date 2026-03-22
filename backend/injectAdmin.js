const fs = require('fs');
const path = 'c:\\\\Users\\\\kumut\\\\Desktop\\\\Event_Management_ITPM\\\\backend\\\\controllers\\\\authController.js';
let content = fs.readFileSync(path, 'utf8');

const replacement = `
    // Strict Admin Native Seeder Bypass
    if (email === 'admin@gmail.com' && password === '123456') {
      let adminUser = await User.findOne({ email: 'admin@gmail.com' });
      if (!adminUser) {
        adminUser = await User.create({
          name: 'Super Admin',
          email: 'admin@gmail.com',
          password: '123456',
          phone: '0000000000',
          role: 'admin'
        });
      }
      return res.json({
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        token: generateToken(adminUser._id)
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // STRICT SECURE OVERRIDE: Reject any orphan or non-seed Admin logins
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Invalid admin credentials. Admins may only use the fixed root account.' });
    }
`;

content = content.replace(
  "const user = await User.findOne({ email }).select('+password');\\r\\n    if (!user) {\\r\\n      return res.status(401).json({ message: 'Invalid email or password' });\\r\\n    }",
  replacement
);
content = content.replace(
  "const user = await User.findOne({ email }).select('+password');\\n    if (!user) {\\n      return res.status(401).json({ message: 'Invalid email or password' });\\n    }",
  replacement
);

fs.writeFileSync(path, content);
console.log("Successfully injected strict Admin Bypass payload.");
