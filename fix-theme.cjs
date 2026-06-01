const fs = require('fs');
const path = require('path');

const dirs = ['./src/pages', './src/components'];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/hover:bg-purple-600-dark/g, 'hover:bg-purple-700');
      content = content.replace(/shadow-accent\/20/g, 'shadow-purple-500/20');
      content = content.replace(/shadow-accent\/25/g, 'shadow-purple-500/25');
      content = content.replace(/shadow-accent\/40/g, 'shadow-purple-500/40');
      content = content.replace(/from-accent-light/g, 'from-purple-400');
      content = content.replace(/to-accent/g, 'to-purple-600');
      content = content.replace(/hover:border-accent\/30/g, 'hover:border-purple-300');
      content = content.replace(/focus:border-accent/g, 'focus:border-purple-500');
      content = content.replace(/focus:ring-accent\/50/g, 'focus:ring-purple-500/50');
      content = content.replace(/border-accent/g, 'border-purple-500');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

dirs.forEach(processDir);
console.log('Fixed theme classes!');
