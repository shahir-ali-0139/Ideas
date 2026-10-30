const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('script.js', 'utf8');

const idRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const missing = [];
const checked = new Set();

while ((match = idRegex.exec(js)) !== null) {
  const id = match[1];
  if (!checked.has(id)) {
    checked.add(id);
    if (!html.includes(`id="${id}"`)) {
      missing.push(id);
    }
  }
}

console.log('Checked IDs:', checked.size);
console.log('Missing IDs:', missing);
if (missing.length === 0) {
  console.log('All IDs match perfectly!');
} else {
  process.exit(1);
}

