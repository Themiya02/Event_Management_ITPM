const fs = require('fs');
const filepath = 'backend/controllers/authController.js';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/}\r?\n};/g, '};');

fs.writeFileSync(filepath, content);
console.log('Fixed auth controller syntax error');
