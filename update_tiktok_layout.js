const fs = require('fs');

let content = fs.readFileSync('c:/Users/najhi/Desktop/chafikSEO29/public_html/tools/tiktok-tools.html', 'utf8');

const cssToAdd = `
    /* Premium Grid for TikTok */
    .premium-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      padding: 0 0 40px;
    }
    @media(max-width: 1200px) { .premium-grid { grid-template-columns: repeat(3, 1fr); } }
    @media(max-width: 900px) { .premium-grid { grid-template-columns: repeat(2, 1fr); } }
    @media(max-width: 600px) { .premium-grid { grid-template-columns: 1fr; } }
    
    .tool-card-premium {
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4));
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 32px;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      height: 100%;
      cursor: pointer;
    }
    
    .tool-card-premium::before {
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
    }
    
    .tool-card-premium:hover {
      transform: translateY(-6px);
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7));
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.15);
    }
    
    .tool-card-premium:hover::before { opacity: 1; }
    
    .tc-icon {
      width: 48px; height: 48px; border-radius: 12px;
      background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex; align-items: center; justify-content: center; font-size: 24px;
      margin-bottom: 24px; transition: transform 0.3s ease;
    }
    
    .tool-card-premium:hover .tc-icon {
      transform: scale(1.1); background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.3);
    }
    
    .tc-title { font-size: 1.15rem; font-weight: 600; margin-bottom: 10px; color: #f8fafc; }
    .tc-desc { color: #94a3b8; font-size: 0.85rem; line-height: 1.5; margin-bottom: 24px; flex-grow: 1; }
    .tc-btn { background: transparent; color: #818cf8; border: none; padding: 0; font-weight: 500; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: gap 0.3s ease; align-self: flex-start; }
    .tool-card-premium:hover .tc-btn { gap: 12px; color: #a5b4fc; }

    .back-btn {
      display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px;
      background: rgba(255,255,255,0.05); color: #fff; padding: 8px 16px; border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1); cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.2s;
    }
    .back-btn:hover { background: rgba(255,255,255,0.1); transform: translateX(-4px); }
`;

content = content.replace('</style>', cssToAdd + '\n  </style>');

const gridHtml = `
    <!-- Tool Grid -->
    <div class="premium-grid" id="tk-grid">
      <div class="tool-card-premium" onclick="openTkPane('script')">
        <div class="tc-icon">📝</div>
        <h3 class="tc-title">Viral Script Generator</h3>
        <p class="tc-desc">Hook, Story, and CTA for your next viral video.</p>
        <button class="tc-btn">Open Tool &rarr;</button>
      </div>
      <div class="tool-card-premium" onclick="openTkPane('hook')">
        <div class="tc-icon">🪝</div>
        <h3 class="tc-title">Viral Hook Generator</h3>
        <p class="tc-desc">10 scroll-stopping hooks tailored to your niche.</p>
        <button class="tc-btn">Open Tool &rarr;</button>
      </div>
      <div class="tool-card-premium" onclick="openTkPane('rewrite')">
        <div class="tc-icon" style="position:relative;">🔄<span class="tk-badge pro" style="top:-8px;right:-18px;">Pro</span></div>
        <h3 class="tc-title">Trend Rewriter AI</h3>
        <p class="tc-desc">Rewrite any idea into a highly engaging trending format.</p>
        <button class="tc-btn">Open Tool &rarr;</button>
      </div>
      <div class="tool-card-premium" onclick="openTkPane('faceless')">
        <div class="tc-icon">🎭</div>
        <h3 class="tc-title">Faceless Video Script</h3>
        <p class="tc-desc">Fast-paced facts and stories without showing your face.</p>
        <button class="tc-btn">Open Tool &rarr;</button>
      </div>
      <div class="tool-card-premium" onclick="openTkPane('ideas')">
        <div class="tc-icon" style="position:relative;">💡<span class="tk-badge pro" style="top:-8px;right:-18px;">Pro</span></div>
        <h3 class="tc-title">30-Day Idea Generator</h3>
        <p class="tc-desc">Get a complete month of TikTok video ideas instantly.</p>
        <button class="tc-btn">Open Tool &rarr;</button>
      </div>
      <div class="tool-card-premium" onclick="openTkPane('caphash')">
        <div class="tc-icon">#️⃣</div>
        <h3 class="tc-title">Caption & Hashtag SEO</h3>
        <p class="tc-desc">SEO-optimized captions and viral hashtag sets.</p>
        <button class="tc-btn">Open Tool &rarr;</button>
      </div>
      <div class="tool-card-premium" onclick="openTkPane('engage')">
        <div class="tc-icon" style="position:relative;">🔥<span class="tk-badge prem" style="top:-8px;right:-38px;">Premium</span></div>
        <h3 class="tc-title">Engagement Booster</h3>
        <p class="tc-desc">Optimize existing scripts to maximize viewer retention.</p>
        <button class="tc-btn">Open Tool &rarr;</button>
      </div>
      <div class="tool-card-premium" onclick="openTkPane('timing')">
        <div class="tc-icon">⏰</div>
        <h3 class="tc-title">Timing & Strategy AI</h3>
        <p class="tc-desc">Find the perfect posting times and growth strategy.</p>
        <button class="tc-btn">Open Tool &rarr;</button>
      </div>
      <div class="tool-card-premium" onclick="openTkPane('prompt')">
        <div class="tc-icon">🎬</div>
        <h3 class="tc-title">Script to Video Prompt</h3>
        <p class="tc-desc">Generate AI video prompts (Sora/Midjourney) from scripts.</p>
        <button class="tc-btn">Open Tool &rarr;</button>
      </div>
      <div class="tool-card-premium" onclick="openTkPane('channel')">
        <div class="tc-icon" style="position:relative;">👑<span class="tk-badge prem" style="top:-8px;right:-38px;">Premium</span></div>
        <h3 class="tc-title">Faceless Channel Builder</h3>
        <p class="tc-desc">Generate a full 30-day automated channel blueprint.</p>
        <button class="tc-btn">Open Tool &rarr;</button>
      </div>
    </div>
`;

// Remove the old tk-nav
content = content.replace(/<nav class="tk-nav" id="tk-nav">[\s\S]*?<\/nav>/, gridHtml);

// Inject back button to each pane
content = content.replace(/(<div class="tk-pane[^>]*>)/g, '$1\n      <button class="back-btn" onclick="closeTkPane()">← Back to Tools</button>');

// Remove active class from pane-script initially so grid shows
content = content.replace('<div class="tk-pane active" id="pane-script">', '<div class="tk-pane" id="pane-script">');

// Add JS logic
const jsToAdd = `
    function openTkPane(id) {
      document.getElementById('tk-grid').style.display = 'none';
      document.querySelectorAll('.tk-pane').forEach(p => p.classList.remove('active'));
      document.getElementById('pane-' + id).classList.add('active');
      window.scrollTo({top: document.querySelector('.tk-wrap').offsetTop - 100, behavior: 'smooth'});
    }
    function closeTkPane() {
      document.querySelectorAll('.tk-pane').forEach(p => p.classList.remove('active'));
      document.getElementById('tk-grid').style.display = 'grid';
    }
`;

content = content.replace('// --- Tabs Logic ---', '// --- Tabs Logic ---\n' + jsToAdd);
// Remove the old tab listener logic
content = content.replace(/document\.querySelectorAll\('\.tk-tab'\)\.forEach\(tab => \{[\s\S]*?\}\);/g, '');

fs.writeFileSync('c:/Users/najhi/Desktop/chafikSEO29/public_html/tools/tiktok-tools.html', content, 'utf8');
