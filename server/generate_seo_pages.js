const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const tools = [
  { slug: 'ai-humanizer', name: 'AI Content Detector & Humanizer' },
  { slug: 'digital-product-creator', name: 'Digital Product Creator' },
  { slug: 'image-to-prompt', name: 'Image to Prompt Generator' },
  { slug: 'prompt-article', name: 'Article Prompt Generator' },
  { slug: 'prompt-viral', name: 'Viral Prompt Generator' },
  { slug: 'seo-article-generator', name: 'SEO Article Generator' },
  { slug: 'tiktok-tools', name: 'AI TikTok Creator Suite' },
  { slug: 'video-to-prompt', name: 'Video to Prompt' },
  { slug: 'youtube-suite', name: 'AI YouTube Creator Suite' }
];

const guidesDir = path.join(__dirname, '../public_html/guides');

const template = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}} | Ultimate Guide & Tool</title>
  <meta name="description" content="Comprehensive guide on how to use {{TITLE}} to maximize your results. Step-by-step instructions, benefits, and practical examples.">
  <link rel="stylesheet" href="../index.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --text2: #cbd5e1;
      --text3: #94a3b8;
      --primary: #8b5cf6;
      --grad: linear-gradient(135deg, #8b5cf6, #ec4899);
    }
    [data-theme="light"] {
      --bg: #f8fafc;
      --surface: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text2: #334155;
      --text3: #64748b;
    }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; margin:0; padding:0; line-height: 1.6; }
    
    .saas-nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: var(--surface); border-bottom: 1px solid var(--border); }
    .logo-area { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--text); font-weight: 700; font-size: 1.25rem; }
    .nav-actions { display: flex; gap: 1rem; align-items: center; }
    .nav-btn { background: var(--surface); color: var(--text); border: 1px solid var(--border); padding: 8px 16px; border-radius: 8px; cursor: pointer; text-decoration: none; }
    
    .hero { max-width: 900px; margin: 40px auto; padding: 0 20px; text-align: center; }
    .hero-img { width: 100%; max-width: 800px; height: 400px; background: #334155 url('https://placehold.co/800x400/1e293b/8b5cf6?text={{TITLE}}+Tool') center/cover; border-radius: 16px; margin-bottom: 30px; border: 1px solid var(--border); }
    .cta-btn { display: inline-block; padding: 16px 32px; background: var(--grad); color: #fff; font-size: 1.25rem; font-weight: 700; border-radius: 12px; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 8px 25px rgba(139,92,246,0.4); margin-bottom: 40px; }
    .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(139,92,246,0.6); }
    
    .article-content { max-width: 800px; margin: 0 auto 60px; padding: 0 20px; font-size: 1.1rem; color: var(--text2); }
    .article-content h1, .article-content h2, .article-content h3 { color: var(--text); margin-top: 40px; }
    .article-content h1 { font-size: 2.5rem; text-align: center; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .article-content h2 { font-size: 1.8rem; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
    .article-content ul, .article-content ol { margin-left: 20px; }
    .article-content li { margin-bottom: 10px; }
    .article-content p { margin-bottom: 20px; }
    
    .related-tools { max-width: 1000px; margin: 0 auto 60px; padding: 0 20px; }
    .related-tools h2 { text-align: center; margin-bottom: 30px; font-size: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; text-align: center; text-decoration: none; color: var(--text); transition: 0.2s; }
    .card:hover { transform: translateY(-5px); border-color: var(--primary); }
    .card-img { width: 100%; height: 120px; background: #334155; border-radius: 8px; margin-bottom: 16px; object-fit: cover; }
    
    .bottom-cta { text-align: center; padding: 60px 20px; background: var(--surface); border-top: 1px solid var(--border); }
  </style>
</head>
<body>

  <nav class="saas-nav">
    <a href="../index.html" class="logo-area">🚀 AI Suite</a>
    <div class="nav-actions">
      <button class="nav-btn" id="theme-btn">☀️</button>
      <a href="../index.html" class="nav-btn">All Tools</a>
    </div>
  </nav>

  <div class="hero">
    <div class="hero-img"></div>
    <a href="../tools/{{SLUG}}.html" class="cta-btn" id="tool-led">🚀 Launch {{TITLE}}</a>
  </div>

  <main class="article-content">
    {{ARTICLE_HTML}}
  </main>

  <section class="related-tools">
    <h2>Explore Related AI Tools</h2>
    <div class="grid">
      {{RELATED_HTML}}
    </div>
  </section>

  <div class="bottom-cta">
    <h2>Ready to transform your workflow?</h2>
    <p style="color: var(--text2); margin-bottom: 30px;">Access all our powerful AI tools in one place.</p>
    <a href="../index.html" class="cta-btn" style="font-size:1rem; padding:12px 24px;">Back to All Tools</a>
  </div>

  <script>
    const themeBtn = document.getElementById('theme-btn');
    themeBtn.addEventListener('click', () => {
      const isLight = document.documentElement.dataset.theme === 'light';
      document.documentElement.dataset.theme = isLight ? 'dark' : 'light';
      themeBtn.textContent = isLight ? '☀️' : '🌙';
    });
  </script>
</body>
</html>`;

function getRandomTools(excludeSlug) {
  const others = tools.filter(t => t.slug !== excludeSlug);
  // shuffle and take 4
  const shuffled = others.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
}

async function generateArticle(tool) {
  console.log('Generating article for:', tool.name);
  
  const prompt = `Write a comprehensive, professional 1000-word SEO-optimized article about an AI tool named "${tool.name}". 
The article should be formatted entirely in clean HTML (just the inner body tags, no html/body/head/markdown backticks wrappers).
Include:
- <h1> tag at the top with a catchy SEO title for the tool.
- <h2> tags for sections: Introduction, Why It's Important, Step-by-Step Guide on How to Use It, Key Benefits, Practical Examples/Use Cases, and Conclusion.
- Use <h3> tags where necessary.
- Use <ul>/<ol> for lists to make it readable.
- The tone should be engaging, professional, like a top-tier SaaS blog. Ensure it feels like a real, deep guide (approx 1000 words). Do not include any images inside the HTML. Just text and formatting.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
    });
    
    let html = response.choices[0].message.content.trim();
    // Remove markdown backticks if any
    html = html.replace(/^\`\`\`html/i, '').replace(/^\`\`\`/i, '').replace(/\`\`\`$/i, '').trim();
    return html;
  } catch (err) {
    console.error('Error with OpenAI API:', err.message);
    return '<h1>Error generating article</h1><p>Please try again later.</p>';
  }
}

async function run() {
  if (!fs.existsSync(guidesDir)) {
    fs.mkdirSync(guidesDir, { recursive: true });
  }

  for (const tool of tools) {
    const articleHtml = await generateArticle(tool);
    
    // Generate Related Tools HTML
    const related = getRandomTools(tool.slug);
    let relatedHtml = '';
    for (const rt of related) {
      relatedHtml += `
        <a href="${rt.slug}.html" class="card">
          <img src="https://placehold.co/400x200/1e293b/8b5cf6?text=${encodeURIComponent(rt.name)}" alt="${rt.name}" class="card-img">
          <h3 style="margin:0; font-size:1.1rem;">${rt.name}</h3>
        </a>`;
    }

    // Replace template vars
    let finalHtml = template
      .replace(/{{TITLE}}/g, tool.name)
      .replace(/{{SLUG}}/g, tool.slug)
      .replace('{{ARTICLE_HTML}}', articleHtml)
      .replace('{{RELATED_HTML}}', relatedHtml);
      
    fs.writeFileSync(path.join(guidesDir, `${tool.slug}.html`), finalHtml, 'utf8');
    console.log('Saved:', `${tool.slug}.html`);
  }
  
  console.log('✅ All SEO pages generated successfully!');
}

run();
