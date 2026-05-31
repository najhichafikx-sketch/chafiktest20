const fs = require('fs');

const navbarTemplate = `
    <!-- Navbar -->
    <nav class="navbar" id="navbar">
        <div class="container nav-inner">
            <a href="index.html" class="nav-logo">
                <div class="nav-logo-icon">⚡</div>
                Chafiktech Ai
            </a>
            <div class="nav-links">
                <a href="index.html" class="nav-link">Home</a>
                <div class="nav-dropdown">
                    <a href="#" class="nav-link" style="cursor:pointer;">Tools ▾</a>
                    <div class="dropdown-content">
                        <a href="tools/seo-article-generator.html">SEO Article Generator</a>
                        <a href="tools/video-to-prompt.html">Video to Prompt</a>
                        <a href="tools/tiktok-tools.html">TikTok AI Tools</a>
                        <a href="tools/prompt-viral.html">Prompt Viral</a>
                        <a href="tools/youtube-suite.html">YouTube Suite</a>
                        <a href="tools/ai-humanizer.html">AI Humanizer</a>
                        <a href="tools/digital-product-creator.html">Digital Product Creator</a>
                        <a href="tools/prompt-article.html">Article Prompt</a>
                    </div>
                </div>
                <a href="ecommerce.html" class="nav-link">Store</a>
                <a href="pricing.html" class="nav-link">Pricing</a>
                <a href="about.html" class="nav-link">About</a>
                <a href="contact.html" class="nav-link">Contact</a>
            </div>
            <div class="nav-actions">
                <button class="theme-toggle theme-btn" id="theme-toggle" aria-label="Toggle theme">🌙</button>
                <a href="login.html" class="btn btn-secondary btn-sm">Log In</a>
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
                    <a href="index.html" class="nav-logo">
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
                    <a href="tools/seo-article-generator.html">SEO Article Generator</a>
                    <a href="tools/video-to-prompt.html">Video to Prompt</a>
                    <a href="tools/youtube-suite.html">YouTube Creator Suite</a>
                    <a href="tools/ai-humanizer.html">AI Humanizer</a>
                    <a href="tools/tiktok-tools.html">TikTok Tools</a>
                    <a href="tools/prompt-viral.html">Prompt Viral</a>
                </div>
                <div class="footer-column">
                    <h4>Company</h4>
                    <a href="about.html">About Us</a>
                    <a href="contact.html">Contact Us</a>
                    <a href="pricing.html">Pricing</a>
                    <a href="blog.html">Blog</a>
                </div>
                <div class="footer-column">
                    <h4>Legal & Support</h4>
                    <a href="privacy.html">Privacy Policy</a>
                    <a href="terms.html">Terms of Service</a>
                    <a href="disclaimer.html">Disclaimer</a>
                    <a href="faq.html">FAQ</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Chafiktech Ai. All rights reserved.</p>
                <p style="margin-top:5px;font-size:0.8em;color:var(--text3)">Contact: tools@chafiktech.com | Website: www.chafiktech.com</p>
            </div>
        </div>
    </footer>
`;

const getBaseHtml = (title, subtitle, content) => `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Chafiktech Ai</title>
    <meta name="robots" content="index, follow">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <style>
        .page-content { max-width: 800px; margin: 0 auto; padding-bottom: 60px; font-size: 1.05rem; line-height: 1.8; color: var(--text2); }
        .page-content h2 { color: var(--text); font-family: var(--font-display); font-size: 1.8rem; margin: 40px 0 15px; }
        .page-content h3 { color: var(--text); font-size: 1.3rem; margin: 25px 0 10px; }
        .page-content p { margin-bottom: 20px; }
        .page-content ul { margin-bottom: 20px; padding-left: 20px; }
        .page-content li { margin-bottom: 8px; }
        .page-content a { color: var(--indigo); text-decoration: none; }
        .page-content a:hover { text-decoration: underline; }
        .contact-form { background: var(--glass); padding: 30px; border-radius: var(--r2); border: 1px solid var(--border); margin-top:30px; }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-weight: 600; margin-bottom: 8px; color: var(--text); }
        .form-input, .form-textarea { width: 100%; padding: 12px; background: rgba(0,0,0,0.2); border: 1px solid var(--border2); border-radius: var(--r); color: var(--text); }
        [data-theme="light"] .form-input, [data-theme="light"] .form-textarea { background: rgba(255,255,255,0.8); border-color: rgba(0,0,0,0.12); }
    </style>
</head>
<body class="bg-mesh">
${navbarTemplate}
    <header class="page-header reveal">
        <div class="container">
            <h1>${title}</h1>
            <p>${subtitle}</p>
        </div>
    </header>
    <section class="section pt-0">
        <div class="container page-content reveal">
${content}
        </div>
    </section>
${footerTemplate}
    <script src="js/app.js"></script>
</body>
</html>`;

const pages = {
    'privacy.html': {
        title: 'Privacy Policy',
        subtitle: 'How we collect, use, and protect your data.',
        content: `
            <p>Last updated: May 30, 2026</p>
            <p>At <strong>Chafiktech Ai</strong> (accessible from www.chafiktech.com), one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Chafiktech Ai and how we use it.</p>
            
            <h2>Consent</h2>
            <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>

            <h2>Information We Collect</h2>
            <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
            <p>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</p>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect in various ways, including to:</p>
            <ul>
                <li>Provide, operate, and maintain our website</li>
                <li>Improve, personalize, and expand our website</li>
                <li>Understand and analyze how you use our website</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you for customer service, updates, and marketing</li>
            </ul>

            <h2>Google DoubleClick DART Cookie</h2>
            <p>Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.chafiktech.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank">https://policies.google.com/technologies/ads</a></p>

            <h2>Log Files</h2>
            <p>Chafiktech Ai follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</p>
        `
    },
    'terms.html': {
        title: 'Terms of Service',
        subtitle: 'Rules and guidelines for using our website.',
        content: `
            <p>Welcome to Chafiktech Ai!</p>
            <p>These terms and conditions outline the rules and regulations for the use of Chafiktech Ai's Website, located at www.chafiktech.com.</p>
            <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Chafiktech Ai if you do not agree to take all of the terms and conditions stated on this page.</p>

            <h2>License</h2>
            <p>Unless otherwise stated, Chafiktech Ai and/or its licensors own the intellectual property rights for all material on Chafiktech Ai. All intellectual property rights are reserved. You may access this from Chafiktech Ai for your own personal use subjected to restrictions set in these terms and conditions.</p>
            <p>You must not:</p>
            <ul>
                <li>Republish material from Chafiktech Ai</li>
                <li>Sell, rent or sub-license material from Chafiktech Ai</li>
                <li>Reproduce, duplicate or copy material from Chafiktech Ai</li>
            </ul>

            <h2>User Generated Content</h2>
            <p>Parts of this website offer an opportunity for users to generate content using our AI tools. Chafiktech Ai does not filter, edit, publish or review the generated outputs prior to their presence on the website. To the extent permitted by applicable laws, Chafiktech Ai shall not be liable for the generated content or for any liability, damages or expenses caused and/or suffered as a result of any use of the tools on this website.</p>

            <h2>Disclaimer</h2>
            <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will limit or exclude our or your liability for fraud or fraudulent misrepresentation.</p>
        `
    },
    'disclaimer.html': {
        title: 'Disclaimer',
        subtitle: 'Earnings and liability disclosure.',
        content: `
            <h2>General Information</h2>
            <p>The information provided by <strong>Chafiktech Ai</strong> ("we," "us," or "our") on www.chafiktech.com (the "Site") is for general informational and educational purposes only. All information on the Site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.</p>

            <h2>Earnings Disclaimer</h2>
            <p>We make every effort to ensure that we accurately represent our products and services and their potential for income. Earning and Income statements made by our company and its customers are estimates of what we think you can possibly earn. There is no guarantee that you will make these levels of income and you accept the risk that the earnings and income statements differ by individual.</p>
            <p>As with any business, your results may vary, and will be based on your individual capacity, business experience, expertise, and level of desire.</p>

            <h2>External Links Disclaimer</h2>
            <p>The Site may contain (or you may be sent through the Site) links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability or completeness by us.</p>
            
            <h2>AI-Generated Content Disclaimer</h2>
            <p>Chafiktech Ai provides tools that utilize Artificial Intelligence to generate text, video prompts, and other content. The generated outputs are predictions based on patterns in data and should not be considered factual, legal, or professional advice. You are solely responsible for reviewing, fact-checking, and editing any content generated by our tools before publishing it.</p>
        `
    },
    'faq.html': {
        title: 'Frequently Asked Questions',
        subtitle: 'Answers to the most common questions about Chafiktech Ai.',
        content: `
            <h2>What is Chafiktech Ai?</h2>
            <p>Chafiktech Ai is a suite of AI-powered tools designed specifically for content creators, bloggers, and marketers. We provide tools to generate SEO-optimized articles, YouTube scripts, TikTok ideas, and much more.</p>

            <h2>Are the generated articles really AdSense friendly?</h2>
            <p>Yes. Our SEO Article Generator is specifically tuned to produce human-like, high-quality, and structurally sound content that adheres to Google's helpful content guidelines, making it highly suitable for AdSense approval when combined with a good website structure.</p>

            <h2>Is the content plagiarism-free?</h2>
            <p>Absolutely. The AI generates unique content every single time based on your specific prompts and parameters. We recommend running it through a standard plagiarism checker if you want absolute peace of mind, but the outputs are inherently original.</p>

            <h2>Do I need to enter my own API Keys?</h2>
            <p>No. Chafiktech Ai handles all the backend API infrastructure. You simply use our clean, user-friendly interface without worrying about complex setups or managing developer keys.</p>

            <h2>Can I upgrade or downgrade my plan?</h2>
            <p>Yes, you can change your subscription plan at any time from your dashboard. Changes will be prorated automatically.</p>
        `
    },
    'about.html': {
        title: 'About Us',
        subtitle: 'Our mission to empower content creators.',
        content: `
            <h2>Who We Are</h2>
            <p>Welcome to <strong>Chafiktech Ai</strong>. We are a team of passionate developers, SEO specialists, and content marketers dedicated to bridging the gap between advanced Artificial Intelligence and everyday content creation.</p>
            
            <h2>Our Mission</h2>
            <p>Our mission is simple: <strong>To empower creators.</strong> Whether you are running a niche blog, building a YouTube empire, or going viral on TikTok, we believe that AI should be an accessible, easy-to-use partner in your creative process.</p>
            
            <h2>Why Chafiktech Ai?</h2>
            <p>While there are many AI tools on the market, most are generic. We built Chafiktech Ai specifically for the modern creator. Our tools are optimized for SEO ranking, high CTR (Click-Through Rates), and audience retention. We handle the technical AI complexities so you can focus on what matters most: growing your audience.</p>

            <h2>Contact Us</h2>
            <p>We are always looking to improve and love hearing from our community. Feel free to reach out to us at <a href="mailto:tools@chafiktech.com">tools@chafiktech.com</a>.</p>
        `
    },
    'contact.html': {
        title: 'Contact Us',
        subtitle: 'We would love to hear from you.',
        content: `
            <p>Have a question, need support, or want to suggest a new feature? Fill out the form below or email us directly at <strong><a href="mailto:tools@chafiktech.com">tools@chafiktech.com</a></strong>.</p>
            
            <div class="contact-form">
                <form onsubmit="event.preventDefault(); alert('Thank you for contacting us! We will get back to you shortly.');">
                    <div class="form-group">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input" placeholder="Your name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Subject</label>
                        <input type="text" class="form-input" placeholder="How can we help?" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Message</label>
                        <textarea class="form-textarea" rows="6" placeholder="Write your message here..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">Send Message</button>
                </form>
            </div>
        `
    }
};

for (const [filename, data] of Object.entries(pages)) {
    const html = getBaseHtml(data.title, data.subtitle, data.content);
    fs.writeFileSync(filename, html, 'utf8');
    console.log('Created:', filename);
}
