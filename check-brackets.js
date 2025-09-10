const fs = require('fs');
const content = fs.readFileSync('app/page.tsx', 'utf8');
const lines = content.split('\n');

let braceStack = [];
let parenStack = [];
let bracketStack = [];
let inJSX = false;
let inString = false;
let stringChar = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Skip comments
  if (line.trim().startsWith('//')) continue;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const prevChar = j > 0 ? line[j - 1] : null;
    
    // Handle strings
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = null;
      }
    }
    
    if (inString) continue;
    
    // Track brackets
    if (char === '{') {
      braceStack.push({ line: i + 1, col: j + 1 });
    } else if (char === '}') {
      if (braceStack.length === 0) {
        console.log(`ERROR: Unexpected } at line ${i + 1}, col ${j + 1}`);
      } else {
        braceStack.pop();
      }
    } else if (char === '(') {
      parenStack.push({ line: i + 1, col: j + 1 });
    } else if (char === ')') {
      if (parenStack.length === 0) {
        console.log(`ERROR: Unexpected ) at line ${i + 1}, col ${j + 1}`);
      } else {
        parenStack.pop();
      }
    } else if (char === '[') {
      bracketStack.push({ line: i + 1, col: j + 1 });
    } else if (char === ']') {
      if (bracketStack.length === 0) {
        console.log(`ERROR: Unexpected ] at line ${i + 1}, col ${j + 1}`);
      } else {
        bracketStack.pop();
      }
    }
  }
  
  // Check stack depth around the error line
  if (i >= 536 && i <= 542) {
    console.log(`Line ${i + 1}: braces=${braceStack.length}, parens=${parenStack.length}, brackets=${bracketStack.length}`);
  }
}

if (braceStack.length > 0) {
  console.log(`\nUnclosed braces:`);
  braceStack.forEach(pos => {
    console.log(`  { at line ${pos.line}, col ${pos.col}`);
  });
}

if (parenStack.length > 0) {
  console.log(`\nUnclosed parentheses:`);
  parenStack.forEach(pos => {
    console.log(`  ( at line ${pos.line}, col ${pos.col}`);
  });
}

if (bracketStack.length > 0) {
  console.log(`\nUnclosed brackets:`);
  bracketStack.forEach(pos => {
    console.log(`  [ at line ${pos.line}, col ${pos.col}`);
  });
}

console.log(`\nFinal: braces=${braceStack.length}, parens=${parenStack.length}, brackets=${bracketStack.length}`);