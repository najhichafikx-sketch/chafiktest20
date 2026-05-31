const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/najhi/Desktop/chafikSEO29/public_html';

// -------------------------------------------------------------
// 1. CSS for Global Floating Sidebar & In-Tool Sidebars
// -------------------------------------------------------------
const cssCode = `
/* === Global Floating Sidebar === */
.global-floating-sidebar {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
  border-left: none;
  border-radius: 0 16px 16px 0;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 9999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 54px;
  overflow: hidden;
  box-shadow: 4px 0 24px rgba(0,0,0,0.5);
}
.global-floating-sidebar:hover { width: 240px; }
.gfs-toggle {
  display: flex; align-items: center; gap: 16px; padding: 10px; color: #fff; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;
}
.gfs-toggle span:first-child { font-size: 20px; width: 24px; text-align: center; }
.gfs-link {
  display: flex; align-items: center; gap: 16px; padding: 10px; color: #cbd5e1; text-decoration: none; border-radius: 10px; transition: all 0.2s; white-space: nowrap;
}
.gfs-link:hover { background: rgba(99,102,241,0.15); color: #fff; }
.gfs-link span:first-child { font-size: 20px; width: 24px; text-align: center; }
.gfs-text { font-size: 0.9rem; font-weight: 600; opacity: 0; transition: opacity 0.3s ease; }
.global-floating-sidebar:hover .gfs-text { opacity: 1; }
@media(max-width: 768px) { .global-floating-sidebar { display: none; } }

/* === In-Tool Layout (TikTok) === */
.tk-app-layout {
  display: none; /* hidden initially */
  gap: 32px;
  align-items: flex-start;
}
.tk-app-layout.active { display: flex; }

.tk-in-tool-sidebar {
  width: 280px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: sticky;
  top: 100px;
}
.tk-its-btn {
  display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px;
  background: transparent; border: none; color: #94a3b8; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; text-align: left; width: 100%;
}
.tk-its-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
.tk-its-btn.active { background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }

@media(max-width: 900px) {
  .tk-app-layout { flex-direction: column; }
  .tk-in-tool-sidebar { width: 100%; position: static; }
}

/* === In-Modal Sidebar (YouTube) === */
.yt-modal {
  display: flex; padding: 0 !important; overflow: hidden !important;
}
.yt-modal-sidebar {
  width: 260px; background: rgba(0,0,0,0.3); border-right: 1px solid rgba(255,255,255,0.05); padding: 24px 16px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto;
}
.yt-modal-content-area {
  flex: 1; padding: 40px; overflow-y: auto; max-height: 88vh; position: relative;
}
.yt-ms-btn {
  display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; background: transparent; border: none; color: #94a3b8; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; text-align: left;
}
.yt-ms-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
.yt-ms-btn.active { background: rgba(255,0,80,0.15); color: #ff4b4b; border: 1px solid rgba(255,0,80,0.3); }
@media(max-width: 768px) {
  .yt-modal { flex-direction: column; }
  .yt-modal-sidebar { width: 100%; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); max-height: 200px; }
}
`;

const stylePath = path.join(rootDir, 'css', 'style.css');
let styleContent = fs.readFileSync(stylePath, 'utf8');
if (!styleContent.includes('.global-floating-sidebar')) {
  fs.writeFileSync(stylePath, styleContent + '\n' + cssCode, 'utf8');
}

// -------------------------------------------------------------
// 2. Global HTML Injection
// -------------------------------------------------------------
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(rootDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('global-floating-sidebar')) {
    const relativePath = path.relative(path.dirname(file), rootDir).replace(/\\/g, '/');
    const pre = relativePath === '' ? '' : relativePath + '/';

    const gfsHtml = `
  <!-- Global Floating Sidebar -->
  <div class="global-floating-sidebar">
    <div class="gfs-toggle">
      <span>🧰</span>
      <span class="gfs-text">Quick Tools</span>
    </div>
    <a href="${pre}tools/seo-article-generator.html" class="gfs-link">
      <span>📝</span><span class="gfs-text">SEO Generator</span>
    </a>
    <a href="${pre}tools/tiktok-tools.html" class="gfs-link">
      <span>🎵</span><span class="gfs-text">TikTok Suite</span>
    </a>
    <a href="${pre}tools/youtube-suite.html" class="gfs-link">
      <span>📺</span><span class="gfs-text">YouTube Suite</span>
    </a>
    <a href="${pre}Create Your Digital Product.html" class="gfs-link">
      <span>🛒</span><span class="gfs-text">Digital Product</span>
    </a>
  </div>
</body>`;
    
    content = content.replace('</body>', gfsHtml);
    fs.writeFileSync(file, content, 'utf8');
  }
});

// -------------------------------------------------------------
// 3. TikTok In-Tool Sidebar Update
// -------------------------------------------------------------
const tiktokPath = path.join(rootDir, 'tools', 'tiktok-tools.html');
let tkContent = fs.readFileSync(tiktokPath, 'utf8');

const tkSidebarHtml = `
      <!-- In-Tool Sidebar -->
      <div class="tk-in-tool-sidebar">
        <button class="back-btn" onclick="closeTkPane()" style="margin-bottom: 24px; justify-content: center;">← Back to Grid</button>
        <button class="tk-its-btn" onclick="openTkPane('script')" id="its-script">📝 Viral Script</button>
        <button class="tk-its-btn" onclick="openTkPane('hook')" id="its-hook">🪝 Viral Hook</button>
        <button class="tk-its-btn" onclick="openTkPane('rewrite')" id="its-rewrite">🔄 Trend Rewriter</button>
        <button class="tk-its-btn" onclick="openTkPane('faceless')" id="its-faceless">🎭 Faceless Script</button>
        <button class="tk-its-btn" onclick="openTkPane('ideas')" id="its-ideas">💡 30-Day Ideas</button>
        <button class="tk-its-btn" onclick="openTkPane('caphash')" id="its-caphash">#️⃣ Caption & Tags</button>
        <button class="tk-its-btn" onclick="openTkPane('engage')" id="its-engage">🔥 Engage Boost</button>
        <button class="tk-its-btn" onclick="openTkPane('timing')" id="its-timing">⏰ Timing & Strategy</button>
        <button class="tk-its-btn" onclick="openTkPane('prompt')" id="its-prompt">🎬 Script to Prompt</button>
        <button class="tk-its-btn" onclick="openTkPane('channel')" id="its-channel">👑 Channel Builder</button>
      </div>
      <!-- Pane Container -->
      <div class="tk-pane-container" style="flex: 1;">
`;

// Replace <div class="tk-wrap"> contents structure
if (!tkContent.includes('tk-in-tool-sidebar')) {
  // Wrap all tk-panes in tk-app-layout
  tkContent = tkContent.replace(/(<div class="tk-pane" id="pane-script">)/, '<div class="tk-app-layout" id="tk-app-layout">\n' + tkSidebarHtml + '\n$1');
  
  // Close tk-pane-container and tk-app-layout at the end of the last pane
  tkContent = tkContent.replace(/(<div class="tk-pane" id="pane-channel">[\s\S]*?<\/div>\s*<\/div>)/, '$1\n      </div>\n    </div>');

  // Remove the old back-btn from inside the panes
  tkContent = tkContent.replace(/<button class="back-btn" onclick="closeTkPane\(\)">← Back to Tools<\/button>/g, '');

  // Update JS
  const newTkJs = `
    function openTkPane(id) {
      document.getElementById('tk-grid').style.display = 'none';
      document.getElementById('tk-app-layout').classList.add('active');
      document.querySelectorAll('.tk-pane').forEach(p => p.classList.remove('active'));
      document.getElementById('pane-' + id).classList.add('active');
      
      document.querySelectorAll('.tk-its-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById('its-' + id);
      if(activeBtn) activeBtn.classList.add('active');
      
      window.scrollTo({top: document.querySelector('.tk-wrap').offsetTop - 100, behavior: 'smooth'});
    }
    function closeTkPane() {
      document.querySelectorAll('.tk-pane').forEach(p => p.classList.remove('active'));
      document.getElementById('tk-app-layout').classList.remove('active');
      document.getElementById('tk-grid').style.display = 'grid';
    }
`;
  tkContent = tkContent.replace(/function openTkPane[\s\S]*?function closeTkPane[\s\S]*?\}/, newTkJs);
  fs.writeFileSync(tiktokPath, tkContent, 'utf8');
}

// -------------------------------------------------------------
// 4. YouTube In-Modal Sidebar Update
// -------------------------------------------------------------
const ytPath = path.join(rootDir, 'tools', 'youtube-suite.html');
let ytContent = fs.readFileSync(ytPath, 'utf8');

if (!ytContent.includes('yt-modal-sidebar')) {
  // Extract all the modal HTML and wrap inside yt-modal-content-area
  const oldModalHTML = `<button class="yt-modal-close" id="yt-modal-close">✕</button>
      <div class="yt-modal-header">`;
      
  const newModalHTML = `
      <div class="yt-modal-sidebar" id="yt-modal-sidebar">
        <!-- populated by JS -->
      </div>
      <div class="yt-modal-content-area">
        <button class="yt-modal-close" id="yt-modal-close" style="top:20px; right:20px; z-index:100;">✕</button>
        <div class="yt-modal-header">`;

  ytContent = ytContent.replace(oldModalHTML, newModalHTML);
  ytContent = ytContent.replace(/<div id="yt-results-body"><\/div>\s*<\/div>\s*<\/div>/, '<div id="yt-results-body"></div>\n      </div>\n      </div>\n    </div>');

  // Update JS to render sidebar and handle clicking
  const ytJsUpdate = `
  function openModal(toolId) {
    currentTool = ALL_TOOLS.find(t => t.id === toolId);
    if (!currentTool) return;
    
    document.getElementById('modal-icon').innerHTML = currentTool.icon;
    document.getElementById('modal-icon').style.background = currentTool.iconBg;
    document.getElementById('modal-icon').style.borderColor = currentTool.iconBorder;
    document.getElementById('modal-title').textContent = currentTool.name;
    document.getElementById('modal-desc').textContent = currentTool.desc;
    document.getElementById('modal-input-label').textContent = currentTool.inputLabel;
    document.getElementById('modal-input').placeholder = currentTool.placeholder;
    document.getElementById('modal-generate-btn').innerHTML = currentTool.btnText;
    document.getElementById('modal-input').value = '';

    // Render Sidebar
    const sidebar = document.getElementById('yt-modal-sidebar');
    sidebar.innerHTML = '<div style="color:var(--text-tertiary); font-size:0.75rem; font-weight:700; padding:10px 12px; letter-spacing:0.1em; text-transform:uppercase;">Quick Switch</div>';
    ALL_TOOLS.forEach(t => {
      sidebar.innerHTML += \`<button class="yt-ms-btn \${t.id === toolId ? 'active' : ''}" onclick="openModal('\${t.id}')">\${t.icon} \${t.name.split(' ')[0]} \${t.name.split(' ')[1] || ''}</button>\`;
    });

    resetModal();
    document.getElementById('yt-modal-overlay').classList.add('active');
    setTimeout(() => document.getElementById('modal-input').focus(), 300);
  }
`;
  ytContent = ytContent.replace(/function openModal\(toolId\) \{[\s\S]*?resetModal\(\);[\s\S]*?setTimeout[\s\S]*?\}\n/, ytJsUpdate);
  
  fs.writeFileSync(ytPath, ytContent, 'utf8');
}
