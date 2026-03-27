const fs = require('fs');
const path = require('path');

const vidDir = 'c:/xampp/htdocs/ba-in/assets/images/videos';

const allFiles = fs.readdirSync(vidDir).filter(f => /\.mp4$/i.test(f)).sort();

// Step 1: Delete duplicates with (1) in the name
const dupes = allFiles.filter(f => f.includes('(1)'));
dupes.forEach(f => {
    fs.unlinkSync(path.join(vidDir, f));
    console.log(`Deleted duplicate: ${f.substring(0, 50)}...`);
});

// Step 2: Get remaining files and rename to clean names
const videos = fs.readdirSync(vidDir).filter(f => /\.mp4$/i.test(f)).sort();
console.log(`\nRenaming ${videos.length} videos...\n`);

const mapping = {};
let count = 0;

// First pass: rename to temp names to avoid collisions
videos.forEach((file, i) => {
    const tmpName = `__tmp_${i}.mp4`;
    fs.renameSync(path.join(vidDir, file), path.join(vidDir, tmpName));
    mapping[file] = `video-${String(i + 1).padStart(2, '0')}.mp4`;
});

// Second pass: rename from temp to final clean names
videos.forEach((file, i) => {
    const tmpName = `__tmp_${i}.mp4`;
    const finalName = mapping[file];
    fs.renameSync(path.join(vidDir, tmpName), path.join(vidDir, finalName));
    console.log(`${finalName} ← ${file.substring(0, 55)}...`);
    count++;
});

// Save mapping
fs.writeFileSync(
    path.join(vidDir, 'original-names.json'),
    JSON.stringify(mapping, null, 2),
    'utf-8'
);

console.log(`\nDone! ${count} videos renamed. Mapping saved to original-names.json`);
