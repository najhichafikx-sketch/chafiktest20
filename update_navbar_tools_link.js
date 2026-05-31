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
    
    // Determine the correct path to index.html based on file depth
    const relativePath = path.relative(path.dirname(file), rootDir).replace(/\\/g, '/');
    const indexUrl = relativePath === '' ? 'index.html#tools' : relativePath + '/index.html#tools';

    // Replace the specific Tools link
    content = content.replace(
      /<a href="#" class="nav-link" style="cursor:pointer;">Tools ▾<\/a>/g, 
      `<a href="${indexUrl}" class="nav-link" style="cursor:pointer;">Tools ▾</a>`
    );
    
    // Also handle if they were previously replaced without style
    content = content.replace(
      /<a href="#" class="nav-link">Tools ▾<\/a>/g, 
      `<a href="${indexUrl}" class="nav-link">Tools ▾</a>`
    );

    fs.writeFileSync(file, content, 'utf8');
  } catch (e) {
    console.error('Error processing:', file, e);
  }
});
