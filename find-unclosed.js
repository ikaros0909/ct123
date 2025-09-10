const fs = require('fs');
const content = fs.readFileSync('app/page.tsx', 'utf8');
const lines = content.split('\n');

let opens = [];
let inString = false;
let stringChar = null;
let inComment = false;

for(let i = 0; i < 541; i++) {
  const line = lines[i];
  
  // Skip comment lines
  if(line.trim().startsWith('//')) continue;
  
  for(let j = 0; j < line.length; j++) {
    const c = line[j];
    const prev = j > 0 ? line[j-1] : '';
    const next = j < line.length - 1 ? line[j+1] : '';
    
    // Handle comments
    if(c === '/' && next === '*') inComment = true;
    if(c === '*' && next === '/') inComment = false;
    if(inComment) continue;
    
    // Handle strings
    if((c === '"' || c === "'" || c === '`') && prev !== '\\') {
      if(!inString) {
        inString = true;
        stringChar = c;
      } else if(c === stringChar) {
        inString = false;
      }
    }
    
    if(!inString && !inComment) {
      if(c === '(') {
        opens.push({
          line: i+1, 
          col: j+1, 
          context: line.substring(Math.max(0, j-10), Math.min(line.length, j+30))
        });
      }
      if(c === ')') {
        if(opens.length > 0) {
          opens.pop();
        } else {
          console.log('Extra ) at line', i+1, 'col', j+1);
        }
      }
    }
  }
}

console.log('\nUnclosed parentheses:');
opens.forEach(p => {
  console.log(`Line ${p.line}, col ${p.col}:`);
  console.log(`  Context: "${p.context}"`);
});

console.log('\nTotal unclosed:', opens.length);