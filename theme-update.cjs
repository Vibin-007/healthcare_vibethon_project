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
      // skip Admin.tsx and Sidebar.tsx and Layout.tsx as we already hand-coded them perfectly
      if (fullPath.includes('Admin.tsx') || fullPath.includes('Sidebar.tsx') || fullPath.includes('Layout.tsx')) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Backgrounds & Borders
      content = content.replace(/bg-dark-card/g, 'bg-white shadow-sm');
      content = content.replace(/bg-dark-light/g, 'bg-white');
      content = content.replace(/bg-dark\b/g, 'bg-[#f8fafc]');
      content = content.replace(/border-dark-border/g, 'border-gray-200');
      
      // Accents
      content = content.replace(/bg-accent/g, 'bg-purple-600');
      content = content.replace(/hover:bg-accent-dark/g, 'hover:bg-purple-700');
      content = content.replace(/text-accent-light/g, 'text-purple-600');
      content = content.replace(/text-accent/g, 'text-purple-600');
      content = content.replace(/border-accent\/20/g, 'border-purple-200');
      content = content.replace(/bg-accent\/10/g, 'bg-purple-50');
      content = content.replace(/bg-accent\/20/g, 'bg-purple-100');
      
      // Replace text-white EXCEPT when it's inside a button with bg-purple-600 or bg-emerald or bg-blue or bg-red
      // A simple regex approach:
      // First, change text-white to text-gray-900 globally
      content = content.replace(/text-white/g, 'text-gray-900');
      // Then, for buttons or elements that have bg-purple-600, revert text-gray-900 back to text-white
      content = content.replace(/bg-purple-600([^>]*?)text-gray-900/g, 'bg-purple-600$1text-white');
      content = content.replace(/bg-emerald([^>]*?)text-gray-900/g, 'bg-emerald$1text-white');
      content = content.replace(/bg-blue([^>]*?)text-gray-900/g, 'bg-blue$1text-white');
      content = content.replace(/bg-red([^>]*?)text-gray-900/g, 'bg-red$1text-white');
      
      // Text Grays
      content = content.replace(/text-gray-400/g, 'text-gray-500');
      content = content.replace(/text-gray-300/g, 'text-gray-600');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

dirs.forEach(processDir);
console.log('Done!');
