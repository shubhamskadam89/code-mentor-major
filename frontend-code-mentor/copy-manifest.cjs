const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'manifest.json');
const dest = path.join(__dirname, 'dist', 'manifest.json');

fs.copyFile(src, dest, (err) => {
  if (err) {
    console.error('❌ Failed to copy manifest.json:', err);
  } else {
    console.log('✔ manifest.json copied to dist/');
  }
});
