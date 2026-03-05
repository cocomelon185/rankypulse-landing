const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, 'src', 'middleware.ts');
if (fs.existsSync(target)) {
    fs.unlinkSync(target);
    console.log('Deleted middleware.ts');
} else {
    console.log('middleware.ts not found');
}
