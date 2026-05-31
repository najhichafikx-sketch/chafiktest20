/* ============================================
   AI SaaS Platform - Main JavaScript
   Handles: Navbar, Theme, Mobile Menu, FAQ,
   Scroll Reveal, Toasts, Dashboard
   ============================================ */

'use strict';

// ---------- DOM Ready ----------
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initThemeToggle();
  initMobileMenu();
  initScrollReveal();
  initFAQ();
  initSmoothScroll();
  initDashboardSidebar();
  initCopyButtons();
  initToolPages();
  initBlogSearch();
  initPricingToggle();
});

// ---------- Navbar Scroll Effect ----------
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Run on load
}

// ---------- Theme Toggle (Dark/Light) ----------
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(toggleBtn, savedTheme);

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(toggleBtn, next);
  });
}

function updateThemeIcon(btn, theme) {
  btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}

// ---------- Mobile Menu ----------
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu on link click
  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ---------- Scroll Reveal Animation ----------
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

// ---------- FAQ Accordion ----------
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(other => {
        other.classList.remove('active');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = '0';
      });

      // Open clicked
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// ---------- Smooth Scroll ----------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ---------- Dashboard Sidebar ----------
function initDashboardSidebar() {
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (!sidebarToggle || !sidebar) return;

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  // Close sidebar on clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024 &&
        sidebar.classList.contains('active') &&
        !sidebar.contains(e.target) &&
        !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove('active');
    }
  });
}

// ---------- Copy to Clipboard ----------
function initCopyButtons() {
  document.querySelectorAll('.api-key-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const keyBox = btn.closest('.api-key-box');
      const keyValue = keyBox?.querySelector('.api-key-value');
      if (keyValue) {
        navigator.clipboard.writeText(keyValue.textContent.trim()).then(() => {
          showToast('API key copied to clipboard!', 'success');
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        });
      }
    });
  });
}

// ---------- Tool Pages (Upload & Generate) ----------
function initToolPages() {
  // Upload zone click
  const uploadZone = document.querySelector('.upload-zone');
  if (uploadZone) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*,image/*,audio/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = 'var(--neon-purple)';
      uploadZone.style.background = 'rgba(99, 102, 241, 0.05)';
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.style.borderColor = '';
      uploadZone.style.background = '';
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.style.borderColor = '';
      uploadZone.style.background = '';
      if (e.dataTransfer.files.length) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) {
        handleFileUpload(fileInput.files[0]);
      }
    });
  }

  // Generate button
  const generateBtn = document.querySelector('.generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', handleGenerate);
  }
}

function handleFileUpload(file) {
  const uploadZone = document.querySelector('.upload-zone');
  if (!uploadZone) return;

  uploadZone.innerHTML = `
    <div class="upload-zone-icon">✅</div>
    <h3>${file.name}</h3>
    <p>${(file.size / (1024 * 1024)).toFixed(2)} MB • ${file.type}</p>
  `;
  showToast(`File "${file.name}" uploaded successfully!`, 'success');
}

function handleGenerate() {
  const btn = document.querySelector('.generate-btn');
  const results = document.querySelector('.results-section');
  if (!btn || !results) return;

  // Show loading state
  const originalText = btn.textContent;
  btn.innerHTML = '<span class="loading-spinner" style="display:inline-block;width:20px;height:20px;margin-right:8px;vertical-align:middle;"></span> Generating...';
  btn.disabled = true;

  // Simulate AI generation
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;

    results.innerHTML = `
      <div class="results-header">
        <h3>✨ Generated Results</h3>
        <button class="btn btn-sm btn-secondary" onclick="copyResults()">📋 Copy</button>
      </div>
      <div style="padding: var(--space-md); background: var(--bg-tertiary); border-radius: var(--radius-md); margin-top: var(--space-md);">
        <p style="font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.8;">
          A cinematic wide-angle shot of a futuristic cityscape at twilight. Neon lights reflect off rain-slicked streets. 
          Flying vehicles traverse between towering skyscrapers adorned with holographic advertisements. The atmosphere is 
          cyberpunk with a warm amber and cool cyan color palette. Shot on ARRI Alexa, anamorphic lens, 4K resolution, 
          shallow depth of field with bokeh lights in the background.
        </p>
      </div>
      <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);flex-wrap:wrap;">
        <span class="section-badge">🎬 Cinematic</span>
        <span class="section-badge">🌃 Cyberpunk</span>
        <span class="section-badge">📸 4K</span>
        <span class="section-badge">🎨 Neon</span>
      </div>
    `;
    showToast('Results generated successfully!', 'success');
  }, 2500);
}

function copyResults() {
  const resultsText = document.querySelector('.results-section p');
  if (resultsText) {
    navigator.clipboard.writeText(resultsText.textContent.trim()).then(() => {
      showToast('Results copied to clipboard!', 'success');
    });
  }
}

// ---------- Blog Search ----------
function initBlogSearch() {
  const searchInput = document.querySelector('.blog-search input');
  const blogCards = document.querySelectorAll('.blog-card');
  if (!searchInput || !blogCards.length) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    blogCards.forEach(card => {
      const title = card.querySelector('.blog-card-title')?.textContent.toLowerCase() || '';
      const excerpt = card.querySelector('.blog-card-excerpt')?.textContent.toLowerCase() || '';
      const match = title.includes(query) || excerpt.includes(query);
      card.style.display = match ? '' : 'none';
    });
  });

  // Category filter
  const categoryBtns = document.querySelectorAll('.blog-category');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const category = btn.textContent.trim().toLowerCase();
      blogCards.forEach(card => {
        if (category === 'all') {
          card.style.display = '';
        } else {
          const tag = card.querySelector('.blog-card-tag')?.textContent.toLowerCase() || '';
          card.style.display = tag.includes(category) ? '' : 'none';
        }
      });
    });
  });
}

// ---------- Pricing Toggle (monthly/yearly) ----------
function initPricingToggle() {
  const toggle = document.querySelector('.pricing-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('yearly');
    const isYearly = toggle.classList.contains('yearly');
    
    document.querySelectorAll('.pricing-value').forEach(el => {
      const monthly = el.dataset.monthly;
      const yearly = el.dataset.yearly;
      if (monthly && yearly) {
        el.textContent = isYearly ? yearly : monthly;
      }
    });

    document.querySelectorAll('.pricing-period').forEach(el => {
      el.textContent = isYearly ? '/year' : '/month';
    });
  });
}

// ---------- Toast System ----------
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---------- Counter Animation ----------
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.count);
    const suffix = counter.dataset.suffix || '';
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = Math.floor(start + (target - start) * eased);
      counter.textContent = current.toLocaleString() + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  });
}

// Trigger counter animation when hero stats are visible
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  observer.observe(heroStats);
}

// ---------- Expose functions globally ----------
window.copyResults = copyResults;
window.showToast = showToast;
