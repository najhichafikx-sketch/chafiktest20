const fs = require('fs');
const path = require('path');

const rootDir = 'c:/Users/najhi/Desktop/chafikSEO29/public_html';

const navbarTemplate = `
    <!-- Navbar -->
    <nav class="navbar" id="navbar">
        <div class="container nav-inner">
            <a href="PREFIX_PLACEHOLDERindex.html" class="nav-logo">
                <div class="nav-logo-icon">⚡</div>
                Chafiktech Ai
            </a>
            <div class="nav-links">
                <a href="PREFIX_PLACEHOLDERindex.html" class="nav-link">Home</a>
                <div class="nav-dropdown">
                    <a href="#" class="nav-link" style="cursor:pointer;">Tools ▾</a>
                    <div class="dropdown-content">
                        <a href="PREFIX_PLACEHOLDERtools/seo-article-generator.html">SEO Article Generator</a>
                        <a href="PREFIX_PLACEHOLDERtools/video-to-prompt.html">Video to Prompt</a>
                        <a href="PREFIX_PLACEHOLDERtools/tiktok-tools.html">TikTok AI Tools</a>
                        <a href="PREFIX_PLACEHOLDERtools/prompt-viral.html">Prompt Viral</a>
                        <a href="PREFIX_PLACEHOLDERtools/youtube-suite.html">YouTube Suite</a>
                        <a href="PREFIX_PLACEHOLDERtools/ai-humanizer.html">AI Humanizer</a>
                        <a href="PREFIX_PLACEHOLDERtools/digital-product-creator.html">Digital Product Creator</a>
                        <a href="PREFIX_PLACEHOLDERtools/prompt-article.html">Article Prompt</a>
                    </div>
                </div>
                <a href="PREFIX_PLACEHOLDERecommerce.html" class="nav-link">Store</a>
                <a href="PREFIX_PLACEHOLDERpricing.html" class="nav-link">Pricing</a>
                <a href="PREFIX_PLACEHOLDERabout.html" class="nav-link">About</a>
                <a href="PREFIX_PLACEHOLDERcontact.html" class="nav-link">Contact</a>
            </div>
            <div class="nav-actions">
                <button class="theme-toggle theme-btn" id="theme-toggle" aria-label="Toggle theme">🌙</button>
                <a href="PREFIX_PLACEHOLDERlogin.html" class="btn btn-secondary btn-sm">Log In</a>
            </div>
            <div class="hamburger" id="hamburger">
                <span></span><span></span><span></span>
            </div>
        </div>
    </nav>
`;

const footerTemplate = `
    <!-- Footer -->
    <footer class="footer reveal">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <a href="PREFIX_PLACEHOLDERindex.html" class="nav-logo">
                        <div class="nav-logo-icon">⚡</div>
                        Chafiktech Ai
                    </a>
                    <p>Empowering creators with next-generation AI tools for content creation, optimization, and growth.</p>
                    <div class="footer-social">
                        <a href="#" aria-label="Twitter">𝕏</a>
                        <a href="#" aria-label="LinkedIn">in</a>
                        <a href="#" aria-label="GitHub">⌨</a>
                        <a href="#" aria-label="Discord">💬</a>
                    </div>
                </div>
                <div class="footer-column">
                    <h4>Products</h4>
                    <a href="PREFIX_PLACEHOLDERtools/seo-article-generator.html">SEO Article Generator</a>
                    <a href="PREFIX_PLACEHOLDERtools/video-to-prompt.html">Video to Prompt</a>
                    <a href="PREFIX_PLACEHOLDERtools/youtube-suite.html">YouTube Creator Suite</a>
                    <a href="PREFIX_PLACEHOLDERtools/ai-humanizer.html">AI Humanizer</a>
                    <a href="PREFIX_PLACEHOLDERtools/tiktok-tools.html">TikTok Tools</a>
                    <a href="PREFIX_PLACEHOLDERtools/prompt-viral.html">Prompt Viral</a>
                </div>
                <div class="footer-column">
                    <h4>Company</h4>
                    <a href="PREFIX_PLACEHOLDERabout.html">About Us</a>
                    <a href="PREFIX_PLACEHOLDERcontact.html">Contact Us</a>
                    <a href="PREFIX_PLACEHOLDERpricing.html">Pricing</a>
                    <a href="PREFIX_PLACEHOLDERblog.html">Blog</a>
                </div>
                <div class="footer-column">
                    <h4>Legal & Support</h4>
                    <a href="PREFIX_PLACEHOLDERprivacy.html">Privacy Policy</a>
                    <a href="PREFIX_PLACEHOLDERterms.html">Terms of Service</a>
                    <a href="PREFIX_PLACEHOLDERdisclaimer.html">Disclaimer</a>
                    <a href="PREFIX_PLACEHOLDERfaq.html">FAQ</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Chafiktech Ai. All rights reserved.</p>
                <p style="margin-top:5px;font-size:0.8em;color:var(--text3)">Contact: tools@chafiktech.com | Website: www.chafiktech.com</p>
            </div>
        </div>
    </footer>
`;

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
    
    // Replace Brand names
    content = content.replace(/NexusAI/g, 'Chafiktech Ai');
    content = content.replace(/Nexus AI/g, 'Chafiktech Ai');
    content = content.replace(/Nexus/g, 'Chafiktech');
    
    // Replace emails (if any older ones existed)
    content = content.replace(/support@chafiktech.com/gi, 'tools@chafiktech.com');
    
    // Determine the prefix based on depth
    let prefix = '';
    const relativePath = path.relative(rootDir, file).replace(/\\/g, '/');
    if (relativePath.includes('/')) {
        const depth = relativePath.split('/').length - 1;
        prefix = '../'.repeat(depth);
    }

    const fileNavbar = navbarTemplate.replace(/PREFIX_PLACEHOLDER/g, prefix);
    const fileFooter = footerTemplate.replace(/PREFIX_PLACEHOLDER/g, prefix);
    
    // Replace Navbar block
    content = content.replace(/<!-- Navbar -->[\s\S]*?<\/nav>/i, fileNavbar);
    
    // The seo-article-generator.html has its navbar ending without <!-- Navbar --> prefix sometimes, so fallback regex
    if (!content.includes('Chafiktech Ai') && content.includes('<nav class="navbar"')) {
        content = content.replace(/<nav class="navbar"[\s\S]*?<\/nav>/i, fileNavbar);
    }
    
    // Replace Footer block
    content = content.replace(/<!-- Footer -->[\s\S]*?<\/footer>/i, fileFooter);
    if (!content.includes('Chafiktech Ai. All rights reserved') && content.includes('<footer')) {
         content = content.replace(/<footer class="footer[\s\S]*?<\/footer>/i, fileFooter);
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed:', file);
  } catch (e) {
    console.error('Error processing:', file, e);
  }
});

// Append CSS for dropdown
const cssPath = path.join(rootDir, 'css/style.css');
try {
  if (fs.existsSync(cssPath)) {
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    if (!cssContent.includes('.nav-dropdown')) {
      const dropdownCss = `
/* Navbar Dropdown styling */
.nav-dropdown {
    position: relative;
    display: inline-block;
}
.dropdown-content {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    background: var(--bg2);
    min-width: 240px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 10px 0;
    z-index: 1000;
}
.nav-dropdown:hover .dropdown-content {
    display: flex;
    flex-direction: column;
}
.dropdown-content a {
    color: var(--text);
    padding: 12px 20px;
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 500;
    transition: background 0.2s, padding-left 0.2s;
}
.dropdown-content a:hover {
    background: var(--glass2);
    padding-left: 24px;
    color: var(--indigo2);
}
`;
      fs.appendFileSync(cssPath, dropdownCss, 'utf8');
      console.log('Appended dropdown CSS to style.css');
    }
  }
} catch (e) {
  console.error('Error updating CSS:', e);
}
