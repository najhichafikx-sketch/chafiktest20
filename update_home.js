const fs = require('fs');

const indexPath = 'c:/Users/najhi/Desktop/chafikSEO29/public_html/index.html';
let content = fs.readFileSync(indexPath, 'utf8');

// Replace prices with "Free"
content = content.replace(/\$[0-9]+\/month/g, 'Free');

fs.writeFileSync(indexPath, content, 'utf8');

// Now update style.css for .tools-grid
const stylePath = 'c:/Users/najhi/Desktop/chafikSEO29/public_html/css/style.css';
let styleContent = fs.readFileSync(stylePath, 'utf8');

// Check if .tools-grid has grid-template-columns
if (styleContent.includes('.tools-grid {')) {
  // Replace the auto-fit with 4 columns
  styleContent = styleContent.replace(/grid-template-columns: repeat\(auto-fit, minmax\(280px, 1fr\)\);/, 'grid-template-columns: repeat(4, 1fr);');
  styleContent = styleContent.replace(/grid-template-columns: repeat\(auto-fit, minmax\(300px, 1fr\)\);/, 'grid-template-columns: repeat(4, 1fr);');
  
  // Add responsive rules for .tools-grid if not present
  if (!styleContent.includes('@media(max-width: 1200px) { .tools-grid { grid-template-columns: repeat(3, 1fr); } }')) {
     styleContent += `\n
@media(max-width: 1200px) { .tools-grid { grid-template-columns: repeat(3, 1fr); } }
@media(max-width: 900px) { .tools-grid { grid-template-columns: repeat(2, 1fr); } }
@media(max-width: 600px) { .tools-grid { grid-template-columns: 1fr; } }
`;
  }
} else {
   styleContent += `\n
.tools-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
}
@media(max-width: 1200px) { .tools-grid { grid-template-columns: repeat(3, 1fr); } }
@media(max-width: 900px) { .tools-grid { grid-template-columns: repeat(2, 1fr); } }
@media(max-width: 600px) { .tools-grid { grid-template-columns: 1fr; } }
`;
}

fs.writeFileSync(stylePath, styleContent, 'utf8');
