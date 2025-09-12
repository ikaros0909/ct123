const fs = require('fs');
const lines = fs.readFileSync('app/page.tsx', 'utf8').split('\n');

let inTemplate = false;
let templateStack = [];

for(let i = 0; i < 541 && i < lines.length; i++) {
  const line = lines[i];
  let inString = false;
  let stringChar = null;
  
  for(let j = 0; j < line.length; j++) {
    const char = line[j];
    const prev = j > 0 ? line[j-1] : '';
    
    // Handle regular strings
    if((char === '"' || char === "'") && prev !== '\\') {
      if(!inString) {
        inString = true;
        stringChar = char;
      } else if(char === stringChar) {
        inString = false;
        stringChar = null;
      }
    }
    
    // Handle template literals
    if(char === '`' && prev !== '\\' && !inString) {
      if(!inTemplate) {
        inTemplate = true;
        templateStack.push({line: i+1, col: j+1});
      } else {
        inTemplate = false;
        templateStack.pop();
      }
    }
  }
}

if(templateStack.length > 0) {
  console.log('Unclosed template literals:');
  templateStack.forEach(t => {
    console.log(`  Line ${t.line}, col ${t.col}`);
  });
} else {
  console.log('All template literals are properly closed');
}