const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        searchDir(fullPath, pattern);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('.tech') || line.includes('.com.co') || line.includes('trinova') || line.includes('neurolabs')) {
          if (line.includes('http') || line.includes('domain') || line.includes('host')) {
            console.log(`${fullPath}:${idx+1} -> ${line.trim()}`);
          }
        }
      });
    }
  }
}

searchDir('src', 'neurolabs');
