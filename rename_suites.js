const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/najhi/Desktop/chafikSEO29/public_html';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      if (fullPath.endsWith('.html')) results.push(fullPath);
    }
  });
  return results;
}

const files = walk(rootDir);

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Rename TikTok Suite
    content = content.replace(/TikTok AI Tools/gi, 'AI Tiktok Creator Suite');
    content = content.replace(/Tiktok ai tools/gi, 'AI Tiktok Creator Suite');
    
    // Rename YouTube Suite
    content = content.replace(/YouTube Creator Suite/gi, 'AI Youtube Creator Suite');
    content = content.replace(/Youtube creator suite/gi, 'AI Youtube Creator Suite');
    
    // Rename E-commerce Suite
    content = content.replace(/Store/g, 'Create Your Digital Product');
    content = content.replace(/Ai E commerce suite/gi, 'Create Your Digital Product');
    content = content.replace(/E-commerce/gi, 'Create Your Digital Product');
    content = content.replace(/Ecommerce/gi, 'Create Your Digital Product');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed:', file);
  } catch (e) {
    console.error('Error processing:', file, e);
  }
});
