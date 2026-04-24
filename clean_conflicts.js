
import fs from 'fs';

const filePath = process.argv[2];
let content = fs.readFileSync(filePath, 'utf8');

// Simple conflict resolver: keep the second part (hasini_dev / kumuthu01 side)
// and remove the markers and the first part.
// Note: This is a risky heuristic but often correct in this specific merge scenario.

const conflictRegex = /<<<<<<< HEAD[\s\S]*?=======([\s\S]*?)>>>>>>> [\w-_]+/g;

content = content.replace(conflictRegex, (match, p1) => {
    return p1;
});

fs.writeFileSync(filePath, content);
console.log('Cleaned ' + filePath);
