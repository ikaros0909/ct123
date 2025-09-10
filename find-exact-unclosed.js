const fs = require('fs');
const content = fs.readFileSync('app/page.tsx', 'utf8');
const lines = content.split('\n');

let stack = [];
let inString = false;
let stringChar = null;

for(let i = 44; i < 542 && i < lines.length; i++) {
  const line = lines[i];
  
  for(let j = 0; j < line.length; j++) {
    const char = line[j];
    const prev = j > 0 ? line[j-1] : '';
    
    // Handle strings
    if((char === '"' || char === "'" || char === '`') && prev !== '\\') {
      if(!inString) {
        inString = true;
        stringChar = char;
      } else if(char === stringChar) {
        inString = false;
        stringChar = null;
      }
    }
    
    if(!inString) {
      if(char === '(') {
        stack.push({line: i+1, col: j+1, char: '('});
      }
      if(char === ')') {
        const popped = stack.pop();
        if(!popped) {
          console.log(`Extra ) at line ${i+1}, col ${j+1}`);
        }
      }
    }
  }
}

console.log('\nRemaining unclosed parentheses:');
stack.forEach(item => {
  console.log(`Line ${item.line}, col ${item.col}: (`);
  if(lines[item.line-1]) {
    console.log(`  Context: "${lines[item.line-1].substring(Math.max(0, item.col-20), Math.min(lines[item.line-1].length, item.col+30))}"`);
  }
});