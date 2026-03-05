const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function deleteDirRecursive(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath);
    for (const entry of entries) {
        const full = path.join(dirPath, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) deleteDirRecursive(full);
        else fs.unlinkSync(full);
    }
    fs.rmdirSync(dirPath);
}

const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
    deleteDirRecursive(nextDir);
    console.log('Cleared .next directory');
}

// Also delete middleware.ts if it still exists
const middleware = path.join(__dirname, 'src', 'middleware.ts');
if (fs.existsSync(middleware)) {
    fs.unlinkSync(middleware);
    console.log('Deleted middleware.ts');
} else {
    console.log('middleware.ts already gone');
}
console.log('Done! Now run: npm run dev');
