const fs = require('fs');

function fixFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('<<<<<<< HEAD')) {
            // Match git conflict marker, keeping only the HEAD portion
            const newContent = content.replace(/<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n[\s\S]*?\r?\n>>>>>>> [a-f0-9]+\r?\n?/g, '$1\n');
            fs.writeFileSync(filePath, newContent);
            console.log('Fixed', filePath);
        }
    } catch (e) {
        console.error('Error fixing', filePath, e);
    }
}

const files = [
    'c:\\Users\\kumut\\Desktop\\itpm new\\Event_Management_ITPM\\frontend\\src\\index.css',
    'c:\\Users\\kumut\\Desktop\\itpm new\\Event_Management_ITPM\\frontend\\src\\App.jsx',
    'c:\\Users\\kumut\\Desktop\\itpm new\\Event_Management_ITPM\\frontend\\src\\components\\layout\\Sidebar.css',
    'c:\\Users\\kumut\\Desktop\\itpm new\\Event_Management_ITPM\\frontend\\src\\pages\\food\\FoodDashboard.jsx',
    'c:\\Users\\kumut\\Desktop\\itpm new\\Event_Management_ITPM\\frontend\\src\\pages\\admin\\AdminEventReview.jsx',
    'c:\\Users\\kumut\\Desktop\\itpm new\\Event_Management_ITPM\\frontend\\src\\pages\\admin\\ApprovedEvents.jsx'
];

files.forEach(fixFile);
