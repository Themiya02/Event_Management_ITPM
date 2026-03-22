const fs = require('fs');
fs.copyFileSync(
    'C:/Users/kumut/.gemini/antigravity/brain/3ff4ad3d-4539-4f98-bb79-d6de98d11d18/dashboard_glass_bg_1774087271404.png',
    'frontend/public/dashboard_bg.png'
);
console.log('Background copied perfectly');
