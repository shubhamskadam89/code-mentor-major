const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

// --- 1. Remove unwanted HTML files Vite emits at dist root ---
// (These are not needed for Chrome extensions and would confuse the browser)
const filesToRemove = ['popup.html', 'overlay.html'];
for (const file of filesToRemove) {
  const target = path.join(distDir, file);
  try {
    if (fs.existsSync(target)) {
      fs.rmSync(target);
      console.log(`✔ Removed ${file} from dist/`);
    }
  } catch (err) {
    console.warn(`⚠ Could not remove ${file}:`, err.message);
  }
}

// --- 2. Copy manifest.json into dist/ ---
const src  = path.join(__dirname, 'manifest.json');
const dest = path.join(distDir, 'manifest.json');

try {
  fs.copyFileSync(src, dest);
  console.log('✔ manifest.json copied to dist/');
} catch (err) {
  console.error('❌ Failed to copy manifest.json:', err.message);
  process.exit(1);
}
