const fs = require('fs');
const filepath = 'backend/controllers/authController.js';
let content = fs.readFileSync(filepath, 'utf8');
content = content.replace(/const user = await User\.create\(\{\s+name,\s+email,\s+password\s+\}\);/, `const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user'
    });`);
fs.writeFileSync(filepath, content);
console.log('Fixed Phone Bug');
