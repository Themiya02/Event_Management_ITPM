const fs = require('fs');
let t = fs.readFileSync('backend/controllers/authController.js', 'utf8');
t = t.replace(/\\n/g, '\n');
fs.writeFileSync('backend/controllers/authController.js', t);
console.log('Fixed actual newlines');
