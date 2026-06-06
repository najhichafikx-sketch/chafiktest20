export const TEMPLATES = [
  { id: 'saas', name: 'SaaS Product', icon: '💼' },
  { id: 'mobile', name: 'Mobile App', icon: '📱' },
  { id: 'agency', name: 'Agency', icon: '🏢' },
  { id: 'event', name: 'Event', icon: '🎉' },
  { id: 'coming', name: 'Coming Soon', icon: '⏰' },
  { id: 'portfolio', name: 'Portfolio', icon: '🎨' },
];

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getLangDir(lang) {
  if (lang === 'ar') return { lang: 'ar', dir: 'rtl' };
  if (lang === 'fr') return { lang: 'fr', dir: 'ltr' };
  return { lang: 'en', dir: 'ltr' };
}

const BASE_CSS = (color) => `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;line-height:1.6;background:#fff}
.container{max-width:1200px;margin:0 auto;padding:0 24px}
.btn-p{display:inline-block;padding:16px 36px;background:${color};color:#fff !important;text-decoration:none;border-radius:10px;font-weight:700;font-size:1.05rem;border:none;cursor:pointer;transition:all .2s;box-shadow:0 4px 14px ${color}55}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 25px ${color}88}
.btn-o{display:inline-block;padding:16px 36px;background:transparent;color:${color};text-decoration:none;border-radius:10px;font-weight:700;font-size:1.05rem;border:2px solid ${color};cursor:pointer;transition:all .2s}
section{padding:80px 0}
.hero{text-align:center;padding:120px 0 80px}
.hero h1{font-size:3.5rem;font-weight:800;margin-bottom:24px;line-height:1.1;letter-spacing:-.02em;color:#0f172a}
.hero p{font-size:1.25rem;color:#475569;margin-bottom:40px;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.6}
.stitle{text-align:center;font-size:2.25rem;font-weight:800;margin-bottom:48px;letter-spacing:-.01em;color:#0f172a}
.g3{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px}
.card{padding:32px;border-radius:14px;background:#f8fafc;text-align:center;transition:transform .2s}
.card:hover{transform:translateY(-4px)}
.card h3{font-size:1.25rem;margin:16px 0 8px;color:#0f172a}
.card p{color:#475569;font-size:.95rem}
.cta{text-align:center;background:${color};color:#fff;padding:100px 0}
.cta h2{font-size:2.5rem;margin-bottom:20px;font-weight:800}
.cta p{font-size:1.15rem;margin-bottom:36px;opacity:.95}
.cta .btn-p{background:#fff;color:${color} !important}
.foot{text-align:center;padding:40px 0;color:#64748b;font-size:.9rem;border-top:1px solid #e2e8f0}
@media(max-width:768px){
  .hero h1{font-size:2.2rem}
  .hero p{font-size:1.05rem}
  section{padding:60px 0}
  .hero{padding:80px 0 60px}
  .stitle{font-size:1.75rem}
  .cta h2{font-size:1.75rem}
}
`;

function wrapHTML(title, body, color, lang, dir) {
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="description" content="${escapeHTML(title)}">
<title>${escapeHTML(title)}</title>
<style>${BASE_CSS(color)}</style>
</head>
<body>
${body}
<div class="foot"><div class="container">© ${new Date().getFullYear()} ${escapeHTML(title)}. All rights reserved.</div></div>
</body>
</html>`;
}

function saasTemplate(d) {
  const { name, headline, description, ctaText, ctaUrl, color } = d;
  return wrapHTML(name, `
<section class="hero">
  <div class="container">
    <h1>${escapeHTML(headline || name)}</h1>
    <p>${escapeHTML(description || 'The all-in-one platform that helps your business grow faster.')}</p>
    <a href="${escapeHTML(ctaUrl || '#')}" class="btn-p">${escapeHTML(ctaText || 'Get Started')}</a>
  </div>
</section>
<section style="background:#f8fafc">
  <div class="container">
    <h2 class="stitle">Why Choose ${escapeHTML(name)}?</h2>
    <div class="g3">
      <div class="card"><div style="font-size:2.5rem">⚡</div><h3>Lightning Fast</h3><p>Built for speed with sub-second response times across the globe.</p></div>
      <div class="card"><div style="font-size:2.5rem">🔒</div><h3>Secure by Default</h3><p>Enterprise-grade security with end-to-end encryption and SOC2 compliance.</p></div>
      <div class="card"><div style="font-size:2.5rem">📈</div><h3>Scalable</h3><p>Grow from startup to enterprise without changing your workflow.</p></div>
    </div>
  </div>
</section>
<section>
  <div class="container">
    <h2 class="stitle">Simple, Transparent Pricing</h2>
    <div class="g3">
      <div class="card"><h3>Starter</h3><div style="font-size:2rem;font-weight:800;margin:16px 0;color:#0f172a">$9<span style="font-size:1rem;color:#64748b">/mo</span></div><p>Perfect for individuals.</p><a href="${escapeHTML(ctaUrl || '#')}" class="btn-o" style="margin-top:16px">Choose</a></div>
      <div class="card" style="border:2px solid ${color}"><h3>Pro</h3><div style="font-size:2rem;font-weight:800;margin:16px 0;color:${color}">$29<span style="font-size:1rem;color:#64748b">/mo</span></div><p>For growing teams.</p><a href="${escapeHTML(ctaUrl || '#')}" class="btn-p" style="margin-top:16px">Choose</a></div>
      <div class="card"><h3>Enterprise</h3><div style="font-size:2rem;font-weight:800;margin:16px 0;color:#0f172a">Custom</div><p>For large organizations.</p><a href="${escapeHTML(ctaUrl || '#')}" class="btn-o" style="margin-top:16px">Contact</a></div>
    </div>
  </div>
</section>
<section class="cta">
  <div class="container">
    <h2>Ready to Transform Your Business?</h2>
    <p>Join thousands of teams already using ${escapeHTML(name)}.</p>
    <a href="${escapeHTML(ctaUrl || '#')}" class="btn-p">${escapeHTML(ctaText || 'Get Started')}</a>
  </div>
</section>
`, color, d.lang, d.dir);
}

function mobileTemplate(d) {
  const { name, headline, description, ctaText, ctaUrl, color } = d;
  return wrapHTML(name, `
<section class="hero">
  <div class="container">
    <h1>${escapeHTML(headline || name)}</h1>
    <p>${escapeHTML(description || 'The smartest way to manage everything from your phone.')}</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
      <a href="${escapeHTML(ctaUrl || '#')}" class="btn-p">📱 ${escapeHTML(ctaText || 'Download Now')}</a>
      <a href="${escapeHTML(ctaUrl || '#')}" class="btn-o">Learn More</a>
    </div>
  </div>
</section>
<section style="background:#f8fafc">
  <div class="container">
    <h2 class="stitle">Features You'll Love</h2>
    <div class="g3">
      <div class="card"><div style="font-size:2.5rem">🎯</div><h3>Smart Tracking</h3><p>Track everything that matters with intelligent insights.</p></div>
      <div class="card"><div style="font-size:2.5rem">🔔</div><h3>Real-time Alerts</h3><p>Never miss what matters with instant push notifications.</p></div>
      <div class="card"><div style="font-size:2.5rem">☁️</div><h3>Cloud Sync</h3><p>Your data follows you across all your devices seamlessly.</p></div>
    </div>
  </div>
</section>
<section>
  <div class="container" style="text-align:center">
    <h2 class="stitle">Get ${escapeHTML(name)} Today</h2>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:32px">
      <a href="${escapeHTML(ctaUrl || '#')}" style="display:inline-block;padding:14px 28px;background:#000;color:#fff !important;border-radius:10px;text-decoration:none;font-weight:600">🍎 App Store</a>
      <a href="${escapeHTML(ctaUrl || '#')}" style="display:inline-block;padding:14px 28px;background:#000;color:#fff !important;border-radius:10px;text-decoration:none;font-weight:600">▶️ Google Play</a>
    </div>
  </div>
</section>
<section class="cta">
  <div class="container">
    <h2>Join 1M+ Happy Users</h2>
    <p>${escapeHTML(name)} is trusted by millions worldwide.</p>
    <a href="${escapeHTML(ctaUrl || '#')}" class="btn-p">${escapeHTML(ctaText || 'Download Free')}</a>
  </div>
</section>
`, color, d.lang, d.dir);
}

function agencyTemplate(d) {
  const { name, headline, description, ctaText, ctaUrl, color } = d;
  return wrapHTML(name, `
<section class="hero">
  <div class="container">
    <h1>${escapeHTML(headline || name)}</h1>
    <p>${escapeHTML(description || 'We craft digital experiences that drive real business results.')}</p>
    <a href="${escapeHTML(ctaUrl || '#')}" class="btn-p">${escapeHTML(ctaText || 'Start a Project')}</a>
  </div>
</section>
<section>
  <div class="container">
    <h2 class="stitle">What We Do</h2>
    <div class="g3">
      <div class="card"><div style="font-size:2.5rem">🎨</div><h3>Brand Design</h3><p>Logos, identities, and visual systems that tell your story.</p></div>
      <div class="card"><div style="font-size:2.5rem">💻</div><h3>Web Development</h3><p>Custom websites and web apps built for performance.</p></div>
      <div class="card"><div style="font-size:2.5rem">📱</div><h3>Mobile Apps</h3><p>iOS and Android apps that users love to use.</p></div>
    </div>
  </div>
</section>
<section style="background:#f8fafc">
  <div class="container">
    <h2 class="stitle">Selected Work</h2>
    <div class="g3">
      <div style="height:200px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${color},${color}cc);color:#fff;border-radius:14px;font-size:1.5rem;font-weight:700">Project 01</div>
      <div style="height:200px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a1a,#334155);color:#fff;border-radius:14px;font-size:1.5rem;font-weight:700">Project 02</div>
      <div style="height:200px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;border-radius:14px;font-size:1.5rem;font-weight:700">Project 03</div>
    </div>
  </div>
</section>
<section class="cta">
  <div class="container">
    <h2>Let's Build Something Great</h2>
    <p>Tell us about your project and we'll get back within 24 hours.</p>
    <a href="${escapeHTML(ctaUrl || '#')}" class="btn-p">${escapeHTML(ctaText || 'Get in Touch')}</a>
  </div>
</section>
`, color, d.lang, d.dir);
}

function eventTemplate(d) {
  const { name, headline, description, ctaText, ctaUrl, color } = d;
  return wrapHTML(name, `
<section class="hero" style="background:linear-gradient(135deg,${color},${color}dd);color:#fff;padding:140px 0 100px">
  <div class="container">
    <div style="display:inline-block;padding:8px 20px;background:rgba(255,255,255,.2);border-radius:30px;margin-bottom:24px;font-size:.9rem;font-weight:600">📅 Coming Up</div>
    <h1 style="color:#fff">${escapeHTML(headline || name)}</h1>
    <p style="color:rgba(255,255,255,.92)">${escapeHTML(description || 'Join us for an unforgettable experience.')}</p>
    <a href="${escapeHTML(ctaUrl || '#')}" class="btn-p" style="background:#fff;color:${color} !important">${escapeHTML(ctaText || 'Register Now')}</a>
  </div>
</section>
<section>
  <div class="container">
    <h2 class="stitle">Featured Speakers</h2>
    <div class="g3">
      <div class="card"><div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,${color},${color}aa);margin:0 auto 16px"></div><h3>Speaker One</h3><p>Industry expert and thought leader.</p></div>
      <div class="card"><div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#8b5cf6);margin:0 auto 16px"></div><h3>Speaker Two</h3><p>Renowned innovator and author.</p></div>
      <div class="card"><div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#06b6d4,#3b82f6);margin:0 auto 16px"></div><h3>Speaker Three</h3><p>Visionary entrepreneur and speaker.</p></div>
    </div>
  </div>
</section>
<section style="background:#f8fafc">
  <div class="container" style="max-width:720px">
    <h2 class="stitle">Schedule</h2>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;gap:24px;padding:20px;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.06)"><div style="font-weight:800;color:${color};min-width:80px">09:00</div><div><h3 style="color:#0f172a">Opening Keynote</h3><p style="color:#475569">Welcome and introduction to the event.</p></div></div>
      <div style="display:flex;gap:24px;padding:20px;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.06)"><div style="font-weight:800;color:${color};min-width:80px">10:30</div><div><h3 style="color:#0f172a">Panel Discussion</h3><p style="color:#475569">Industry leaders share their insights.</p></div></div>
      <div style="display:flex;gap:24px;padding:20px;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.06)"><div style="font-weight:800;color:${color};min-width:80px">14:00</div><div><h3 style="color:#0f172a">Workshops</h3><p style="color:#475569">Hands-on sessions and networking.</p></div></div>
    </div>
  </div>
</section>
<section class="cta">
  <div class="container">
    <h2>Don't Miss Out</h2>
    <p>Limited seats available. Register today to secure your spot.</p>
    <a href="${escapeHTML(ctaUrl || '#')}" class="btn-p">${escapeHTML(ctaText || 'Register Now')}</a>
  </div>
</section>
`, color, d.lang, d.dir);
}

function comingTemplate(d) {
  const { name, headline, description, ctaText, ctaUrl, color } = d;
  return wrapHTML(name, `
<section class="hero" style="min-height:100vh;display:flex;align-items:center;background:linear-gradient(135deg,${color}22,${color}44);padding:80px 0">
  <div class="container" style="text-align:center">
    <div style="font-size:4rem;margin-bottom:24px">🚀</div>
    <h1>${escapeHTML(headline || 'Something Amazing is Coming')}</h1>
    <p>${escapeHTML(description || name + ' is launching soon. Be the first to know.')}</p>
    <div style="display:flex;gap:16px;justify-content:center;margin:40px 0;flex-wrap:wrap">
      <div style="min-width:80px;padding:16px;background:#fff;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.08)"><div id="cd-d" style="font-size:2.5rem;font-weight:800;color:${color}">00</div><div style="font-size:.8rem;color:#64748b;text-transform:uppercase;letter-spacing:1px">Days</div></div>
      <div style="min-width:80px;padding:16px;background:#fff;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.08)"><div id="cd-h" style="font-size:2.5rem;font-weight:800;color:${color}">00</div><div style="font-size:.8rem;color:#64748b;text-transform:uppercase;letter-spacing:1px">Hours</div></div>
      <div style="min-width:80px;padding:16px;background:#fff;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.08)"><div id="cd-m" style="font-size:2.5rem;font-weight:800;color:${color}">00</div><div style="font-size:.8rem;color:#64748b;text-transform:uppercase;letter-spacing:1px">Minutes</div></div>
      <div style="min-width:80px;padding:16px;background:#fff;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.08)"><div id="cd-s" style="font-size:2.5rem;font-weight:800;color:${color}">00</div><div style="font-size:.8rem;color:#64748b;text-transform:uppercase;letter-spacing:1px">Seconds</div></div>
    </div>
    <form onsubmit="event.preventDefault();alert('Thanks! We will notify you when we launch.')" style="display:flex;gap:8px;max-width:480px;margin:0 auto;flex-wrap:wrap;justify-content:center">
      <input type="email" placeholder="Enter your email" required style="flex:1;min-width:240px;padding:14px 20px;border:2px solid #e2e8f0;border-radius:10px;font-size:1rem;outline:none">
      <button type="submit" class="btn-p">${escapeHTML(ctaText || 'Notify Me')}</button>
    </form>
  </div>
</section>
<script>
(function(){
  var target = new Date();
  target.setDate(target.getDate() + 30);
  function pad(n){return n < 10 ? '0' + n : n;}
  function update(){
    var diff = target - new Date();
    if(diff < 0) diff = 0;
    var el;
    el = document.getElementById('cd-d'); if(el) el.textContent = pad(Math.floor(diff / 86400000));
    el = document.getElementById('cd-h'); if(el) el.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    el = document.getElementById('cd-m'); if(el) el.textContent = pad(Math.floor((diff % 3600000) / 60000));
    el = document.getElementById('cd-s'); if(el) el.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  update();
  setInterval(update, 1000);
})();
</script>
`, color, d.lang, d.dir);
}

function portfolioTemplate(d) {
  const { name, headline, description, ctaText, ctaUrl, color } = d;
  return wrapHTML(name, `
<section class="hero">
  <div class="container">
    <h1>${escapeHTML(headline || name)}</h1>
    <p>${escapeHTML(description || 'Designer & developer crafting beautiful digital experiences.')}</p>
  </div>
</section>
<section>
  <div class="container">
    <h2 class="stitle">Selected Projects</h2>
    <div class="g3">
      <div style="height:240px;display:flex;align-items:flex-end;padding:0;overflow:hidden;background:linear-gradient(135deg,${color},${color}cc);border-radius:14px"><div style="padding:20px;color:#fff;width:100%;background:linear-gradient(to top,rgba(0,0,0,.6),transparent)"><h3 style="color:#fff;margin:0">Project Alpha</h3><p style="color:rgba(255,255,255,.92);margin:4px 0 0;font-size:.85rem">Web Design</p></div></div>
      <div style="height:240px;display:flex;align-items:flex-end;padding:0;overflow:hidden;background:linear-gradient(135deg,#1a1a1a,#334155);border-radius:14px"><div style="padding:20px;color:#fff;width:100%;background:linear-gradient(to top,rgba(0,0,0,.6),transparent)"><h3 style="color:#fff;margin:0">Project Beta</h3><p style="color:rgba(255,255,255,.92);margin:4px 0 0;font-size:.85rem">Branding</p></div></div>
      <div style="height:240px;display:flex;align-items:flex-end;padding:0;overflow:hidden;background:linear-gradient(135deg,#ec4899,#8b5cf6);border-radius:14px"><div style="padding:20px;color:#fff;width:100%;background:linear-gradient(to top,rgba(0,0,0,.6),transparent)"><h3 style="color:#fff;margin:0">Project Gamma</h3><p style="color:rgba(255,255,255,.92);margin:4px 0 0;font-size:.85rem">Mobile App</p></div></div>
      <div style="height:240px;display:flex;align-items:flex-end;padding:0;overflow:hidden;background:linear-gradient(135deg,#06b6d4,#3b82f6);border-radius:14px"><div style="padding:20px;color:#fff;width:100%;background:linear-gradient(to top,rgba(0,0,0,.6),transparent)"><h3 style="color:#fff;margin:0">Project Delta</h3><p style="color:rgba(255,255,255,.92);margin:4px 0 0;font-size:.85rem">Web App</p></div></div>
      <div style="height:240px;display:flex;align-items:flex-end;padding:0;overflow:hidden;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:14px"><div style="padding:20px;color:#fff;width:100%;background:linear-gradient(to top,rgba(0,0,0,.6),transparent)"><h3 style="color:#fff;margin:0">Project Epsilon</h3><p style="color:rgba(255,255,255,.92);margin:4px 0 0;font-size:.85rem">E-commerce</p></div></div>
      <div style="height:240px;display:flex;align-items:flex-end;padding:0;overflow:hidden;background:linear-gradient(135deg,#10b981,#06b6d4);border-radius:14px"><div style="padding:20px;color:#fff;width:100%;background:linear-gradient(to top,rgba(0,0,0,.6),transparent)"><h3 style="color:#fff;margin:0">Project Zeta</h3><p style="color:rgba(255,255,255,.92);margin:4px 0 0;font-size:.85rem">SaaS Platform</p></div></div>
    </div>
  </div>
</section>
<section style="background:#f8fafc">
  <div class="container" style="max-width:720px;text-align:center">
    <h2 class="stitle">About Me</h2>
    <p style="font-size:1.1rem;color:#475569;line-height:1.8">${escapeHTML(description || 'I am a passionate designer and developer with over 8 years of experience creating digital products that people love. I believe in the power of great design to transform businesses.')}</p>
  </div>
</section>
<section class="cta">
  <div class="container">
    <h2>Let's Work Together</h2>
    <p>Have a project in mind? I'd love to hear about it.</p>
    <a href="${escapeHTML(ctaUrl || '#')}" class="btn-p">${escapeHTML(ctaText || 'Get in Touch')}</a>
  </div>
</section>
`, color, d.lang, d.dir);
}

const GENERATORS = {
  saas: saasTemplate,
  mobile: mobileTemplate,
  agency: agencyTemplate,
  event: eventTemplate,
  coming: comingTemplate,
  portfolio: portfolioTemplate,
};

export function generateLandingPage(data) {
  const { lang, dir } = getLangDir(data.language);
  const fullData = { ...data, lang, dir };
  const generator = GENERATORS[data.template] || saasTemplate;
  return generator(fullData);
}

export function getDefaultFormData() {
  return {
    template: 'saas',
    name: 'Your Product',
    headline: 'The Smarter Way to Build Your Business',
    description: 'A powerful platform that helps you grow faster, work smarter, and achieve more in less time.',
    ctaText: 'Get Started',
    ctaUrl: '#',
    color: '#6366f1',
    language: 'en',
  };
}
