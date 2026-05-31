const fs = require('fs');

let content = fs.readFileSync('c:/Users/najhi/Desktop/chafikSEO29/public_html/tools/youtube-suite.html', 'utf8');

// Update Grid Columns to exactly 4
content = content.replace(
  /grid-template-columns: repeat\(auto-fill, minmax\(300px, 1fr\)\);/,
  'grid-template-columns: repeat(4, 1fr);'
);

// We need to inject media queries to make it responsive since repeat(4, 1fr) isn't inherently responsive
const responsiveCSS = `
    @media(max-width: 1200px) { .tools-dashboard-grid { grid-template-columns: repeat(3, 1fr) !important; } }
    @media(max-width: 900px) { .tools-dashboard-grid { grid-template-columns: repeat(2, 1fr) !important; } }
    @media(max-width: 600px) { .tools-dashboard-grid { grid-template-columns: 1fr !important; } }
`;
content = content.replace('.tools-dashboard-grid {', responsiveCSS + '\n    .tools-dashboard-grid {');

// Update .yt-tool-card styles to look exactly like .tool-card-premium
const newCardCSS = `
    .yt-tool-card {
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4)) !important;
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
      border-radius: 20px !important;
      padding: 32px !important;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .yt-tool-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 20px;
      padding: 2px;
      background: linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.8));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
      height: auto;
    }
    .yt-tool-card:hover {
      transform: translateY(-6px) !important;
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7)) !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.15) !important;
    }
    
    .yt-tool-card-icon {
      width: 48px !important; height: 48px !important; border-radius: 12px !important;
      background: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important;
      display: flex; align-items: center; justify-content: center; font-size: 24px !important;
      margin-bottom: 24px !important; transition: transform 0.3s ease !important;
    }
    .yt-tool-card:hover .yt-tool-card-icon {
      transform: scale(1.1) !important; background: rgba(99, 102, 241, 0.1) !important; border-color: rgba(99, 102, 241, 0.3) !important;
    }
    
    .yt-open-btn {
      background: transparent !important; color: #818cf8 !important; border: none !important; padding: 0 !important; font-weight: 500 !important; font-size: 0.95rem !important; display: flex !important; align-items: center; gap: 8px !important; cursor: pointer; transition: gap 0.3s ease !important; align-self: flex-start;
    }
    .yt-tool-card:hover .yt-open-btn { gap: 12px !important; color: #a5b4fc !important; background: transparent !important; border: none !important; transform: none !important;}
`;

content = content.replace(/\/\* Tool Card \*\/[\s\S]*?\/\* ===== MODAL ===== \*\//, '/* Tool Card */\n' + newCardCSS + '\n    /* ===== MODAL ===== */');

fs.writeFileSync('c:/Users/najhi/Desktop/chafikSEO29/public_html/tools/youtube-suite.html', content, 'utf8');
