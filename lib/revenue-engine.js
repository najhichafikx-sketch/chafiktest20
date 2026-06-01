// Revenue Optimization Rule Engine
// Determines ad placement strategy based on page type, user behavior, and page category

const TOOL_PAGES = new Set([
  'seo-article', 'image-to-prompt', 'video-to-prompt', 'tiktok', 'youtube',
  'ai-humanizer', 'ad-copy', 'amazon-listing', 'product-description', 'etsy-listing',
  'landing-page', 'sales-copy', 'shopify-seo', 'product-title', 'review-response',
  'pricing', 'product-idea', 'product-image', 'digital-product', 'digital-name',
  'email-writer', 'dropshipping', 'prompt-article', 'prompt-viral'
]);

const HIGH_TRAFFIC_TOOLS = new Set([
  'seo-article', 'image-to-prompt', 'video-to-prompt', 'ai-humanizer', 'youtube', 'tiktok'
]);

const HIGH_ENGAGEMENT_TOOLS = new Set([
  'image-to-prompt', 'video-to-prompt', 'ai-humanizer', 'youtube'
]);

function getPageType(pathname) {
  if (!pathname) return 'unknown';
  if (pathname.startsWith('/tools/')) return 'tool';
  if (pathname.startsWith('/blog')) return 'blog';
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'content';
}

function getToolIdFromPath(pathname) {
  if (!pathname || !pathname.startsWith('/tools/')) return null;
  return pathname.replace('/tools/', '');
}

export function getAdStrategy(pathname, isReturningVisitor, sessionImpressionCount = 0) {
  const pageType = getPageType(pathname);
  const toolId = toolIdFromPath(pathname);

  const strategy = {
    showHeader: true,
    showFooter: true,
    showSidebar: false,
    showInTool: false,
    showContentTop: false,
    showContentBottom: false,
    showLoadingState: false,
    showMidResult: false,
    showPopup: false,
    intensity: 'normal' // 'low', 'normal', 'high', 'aggressive'
  };

  // Tool pages: high ad density
  if (pageType === 'tool') {
    strategy.showSidebar = true;
    strategy.showInTool = true;
    strategy.showContentTop = true;
    strategy.showContentBottom = true;
    strategy.showLoadingState = true;

    if (HIGH_TRAFFIC_TOOLS.has(toolId)) {
      strategy.intensity = 'high';
      strategy.showMidResult = true;
      strategy.showPopup = sessionImpressionCount < 2;
    } else if (HIGH_ENGAGEMENT_TOOLS.has(toolId)) {
      strategy.intensity = 'high';
      strategy.showMidResult = true;
    } else {
      strategy.intensity = 'normal';
    }
  }

  // Blog pages: sidebar + content ads
  if (pageType === 'blog') {
    strategy.showSidebar = true;
    strategy.showContentTop = true;
    strategy.showContentBottom = true;
    strategy.showInTool = false;
    strategy.intensity = 'normal';
  }

  // Home page: moderate ads
  if (pageType === 'home') {
    strategy.showHeader = true;
    strategy.showFooter = true;
    strategy.showPopup = !isReturningVisitor;
    strategy.intensity = 'low';
  }

  // Returning vs new visitor logic
  if (isReturningVisitor) {
    // Reduce popup and aggressive placements for returning users (better UX)
    strategy.showPopup = false;
    if (strategy.intensity === 'aggressive') strategy.intensity = 'high';
    if (strategy.intensity === 'high') strategy.intensity = 'normal';
  } else {
    // New visitors: slightly more ads
    if (strategy.intensity === 'normal') strategy.intensity = 'high';
    strategy.showPopup = !strategy.showPopup ? sessionImpressionCount < 1 : strategy.showPopup;
  }

  // Session impression capping
  if (sessionImpressionCount > 5) {
    strategy.showPopup = false;
    strategy.showMidResult = false;
    strategy.showLoadingState = false;
  }

  return strategy;
}

export function getMonetizationTier(toolId) {
  if (HIGH_TRAFFIC_TOOLS.has(toolId)) return 'high_traffic';
  if (HIGH_ENGAGEMENT_TOOLS.has(toolId)) return 'high_engagement';
  return 'standard';
}

function toolIdFromPath(pathname) {
  if (!pathname || !pathname.startsWith('/tools/')) return null;
  const id = pathname.replace('/tools/', '');
  return TOOL_PAGES.has(id) ? id : null;
}
