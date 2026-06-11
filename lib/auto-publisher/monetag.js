// lib/auto-publisher/monetag.js
// Smart Monetag ad injection at high-CTR positions

const ZONES = {
  banner: process.env.MONETAG_BANNER_ZONE || '29505513',
  inArticle: process.env.MONETAG_IN_ARTICLE_ZONE || '11103150',
  sidebar: process.env.MONETAG_SIDEBAR_ZONE || '29505514',
  popunder: process.env.MONETAG_POPUNDER_ZONE || '29505515',
  interstitial: process.env.MONETAG_INTERSTITIAL_ZONE || '29505516'
};

/**
 * Inject Monetag ad slots into article HTML at optimal positions
 */
export function injectMonetagAds(html) {
  let result = html;

  // 1. In-article ad after 2nd paragraph (highest engagement zone)
  result = injectAfterParagraph(result, 2, getInArticleAd());

  // 2. Banner ad before FAQ section
  result = result.replace(
    /(<h2[^>]*>.*?(?:FAQ|Frequently Asked|Common Questions).*?<\/h2>)/i,
    `${getBannerAd()}\n$1`
  );

  // 3. Interstitial mid-content (after 3rd H2)
  result = injectAfterH2(result, 3, getInterstitialAd());

  return result;
}

function injectAfterParagraph(html, n, adHtml) {
  const paragraphs = html.match(/<p>.*?<\/p>/gs) || [];
  if (paragraphs.length < n) return html;

  let count = 0;
  return html.replace(/<\/p>/g, (match) => {
    count++;
    if (count === n) {
      return `</p>\n${adHtml}`;
    }
    return match;
  });
}

function injectAfterH2(html, n, adHtml) {
  let count = 0;
  return html.replace(/<\/h2>/g, (match) => {
    count++;
    if (count === n) {
      return `</h2>\n${adHtml}`;
    }
    return match;
  });
}

function getInArticleAd() {
  return `
<div class="monetag-slot monetag-in-article" data-zone="${ZONES.inArticle}">
  <ins class="mrg-tag" data-zone="${ZONES.inArticle}" style="display:block;margin:24px 0;text-align:center;"></ins>
  <script>(MRGtag = window.MRGtag || []).push({});</script>
</div>`.trim();
}

function getBannerAd() {
  return `
<div class="monetag-slot monetag-banner" data-zone="${ZONES.banner}">
  <ins class="mrg-tag" data-zone="${ZONES.banner}" style="display:block;margin:20px 0;text-align:center;"></ins>
  <script>(MRGtag = window.MRGtag || []).push({});</script>
</div>`.trim();
}

function getInterstitialAd() {
  return `
<div class="monetag-slot monetag-interstitial" data-zone="${ZONES.interstitial}">
  <ins class="mrg-tag" data-zone="${ZONES.interstitial}" style="display:block;margin:24px 0;text-align:center;"></ins>
</div>`.trim();
}
