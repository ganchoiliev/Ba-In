const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const vidDir = 'c:/xampp/htdocs/ba-in/assets/images/videos';
const thumbDir = 'c:/xampp/htdocs/ba-in/assets/images/video-thumbs';

const videos = fs.readdirSync(vidDir)
    .filter(f => /\.mp4$/i.test(f) && !f.includes('(1)'))
    .sort();

console.log(`Generating thumbnails for ${videos.length} videos...\n`);

let success = 0;
let fail = 0;

videos.forEach((file, i) => {
    const input = path.join(vidDir, file);
    // Create a clean thumbnail filename from index
    const thumbName = `vid-thumb-${String(i).padStart(2, '0')}.jpg`;
    const output = path.join(thumbDir, thumbName);

    try {
        // Extract frame at 0.5 seconds, scale to 400px wide, high quality JPEG
        execSync(
            `ffmpeg -y -ss 0.5 -i "${input}" -vframes 1 -vf "scale=400:-1" -q:v 3 "${output}"`,
            { stdio: 'pipe', timeout: 15000 }
        );
        console.log(`[${i + 1}/${videos.length}] OK: ${thumbName}`);
        success++;
    } catch (e) {
        // Try at 0 seconds if 0.5s fails (very short video)
        try {
            execSync(
                `ffmpeg -y -ss 0 -i "${input}" -vframes 1 -vf "scale=400:-1" -q:v 3 "${output}"`,
                { stdio: 'pipe', timeout: 15000 }
            );
            console.log(`[${i + 1}/${videos.length}] OK (fallback): ${thumbName}`);
            success++;
        } catch (e2) {
            console.log(`[${i + 1}/${videos.length}] FAIL: ${file}`);
            fail++;
        }
    }
});

console.log(`\nDone! ${success} thumbnails generated, ${fail} failed.`);

// Output the mapping for build script
const mapping = {};
videos.forEach((file, i) => {
    mapping[file] = `vid-thumb-${String(i).padStart(2, '0')}.jpg`;
});
fs.writeFileSync(
    path.join(thumbDir, 'mapping.json'),
    JSON.stringify(mapping, null, 2),
    'utf-8'
);
console.log('Mapping saved to mapping.json');
