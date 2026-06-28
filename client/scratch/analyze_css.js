const fs = require('fs');
const path = require('path');

const cssPath = 'c:/Users/vishw/Downloads/event-booking-imagekit-migration-fixed/client/src/style.css';
const content = fs.readFileSync(cssPath, 'utf8');

// A very simple CSS parser to find duplicate selectors
const rules = {};
let currentSelector = null;
let currentBlock = [];
let braceCount = 0;
let lines = content.split('\n');

console.log('Total CSS lines:', lines.length);

// Let's check if there are blocks of identical text repeated (e.g. accidental duplicate appends)
const chunkSize = 200; // lines
const chunks = [];
for (let i = 0; i < lines.length; i += chunkSize) {
  chunks.push(lines.slice(i, i + chunkSize).join('\n'));
}

const duplicates = {};
for (let i = 0; i < chunks.length; i++) {
  for (let j = i + 1; j < chunks.length; j++) {
    if (chunks[i] === chunks[j] && chunks[i].trim().length > 100) {
      duplicates[i] = duplicates[i] || [];
      duplicates[i].push(j);
    }
  }
}

console.log('Duplicate chunks found (chunk size 200 lines):');
console.log(duplicates);
