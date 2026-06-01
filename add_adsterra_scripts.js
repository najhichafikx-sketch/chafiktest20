const fs = require('fs');
const path = require('path');

// ==========================================
// ضع كود إعلانات Adsterra أو أي شركة أخرى هنا
// ==========================================
const AD_SCRIPT_HEAD = `
<!-- Adsterra Head Script Example -->
<script type='text/javascript' src='//pl25446034.profitablecpmrate.com/c1/c2/c3/c1c2c3.js'></script>
`;

const AD_SCRIPT_BODY = `
<!-- Adsterra Body/Banner Script Example -->
<div id="container-a1b2c3"></div>
`;
// ==========================================

const htmlDirs = [
  path.join(__dirname, 'public_html'),
  path.join(__dirname, 'public_html', 'tools'),
  path.join(__dirname, 'public_html', 'blog')
];

let filesModified = 0;

htmlDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;

      // إضافة الكود في منطقة الـ HEAD (مهم للـ Popunder)
      if (!content.includes('Adsterra Head Script Example') && content.includes('</head>')) {
        content = content.replace('</head>', `${AD_SCRIPT_HEAD}\n</head>`);
        changed = true;
      }

      // إضافة الكود في بداية منطقة الـ BODY (مهم للبنرات أو الإعلانات العائمة)
      if (!content.includes('Adsterra Body/Banner Script Example') && content.includes('<body>')) {
        content = content.replace('<body>', `<body>\n${AD_SCRIPT_BODY}`);
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ تم إضافة الإعلانات إلى: ${file}`);
        filesModified++;
      }
    });
  }
});

console.log(`\n🎉 اكتمل! تم تعديل ${filesModified} ملف HTML.`);
