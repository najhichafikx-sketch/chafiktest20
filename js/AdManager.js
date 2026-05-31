/* ============================================================
   AdManager - Reusable Ad Management Module
   Supports: Monetag, Adsterra, and future ad networks
   Provider-agnostic architecture for easy scaling
   ============================================================ */

'use strict';

const AdManager = (function () {

  // ----------------------------------------------------------------
  // CONFIGURATION
  // ----------------------------------------------------------------
  const CONFIG = {
    // Storage keys
    GUEST_GEN_KEY: 'chafik_guest_generations',
    REGISTERED_GEN_KEY: 'chafik_daily_generations',
    DAILY_DATE_KEY: 'chafik_daily_date',

    // Ad frequency rules
    GUEST_FREE_GENS: 1,        // First generation is free (index 0)
    REGISTERED_FREE_GENS: 5,   // Registered users get 5 free gens before ads
    REGISTERED_AD_INTERVAL: 3, // After free gens, show ad every 3rd generation

    // Ad providers - Direct Link URLs
    // Replace these with your actual Monetag / Adsterra direct link URLs
    providers: {
      monetag: {
        name: 'Monetag',
        enabled: true,
        directLinkUrl: '', // e.g., 'https://monetag.com/your-link-id'
        priority: 1
      },
      adsterra: {
        name: 'Adsterra',
        enabled: true,
        directLinkUrl: '', // e.g., 'https://www.profitabledisplaynetwork.com/your-link-id'
        priority: 2
      }
    },

    // Fallback behavior
    FALLBACK_ON_FAIL: true,  // If ad fails to open, skip and continue
    AD_TIMEOUT_MS: 3000,     // Max wait for ad to register as opened
  };

  // ----------------------------------------------------------------
  // STATE
  // ----------------------------------------------------------------
  let _userState = {
    type: 'guest',   // 'guest', 'registered', 'premium', 'admin'
    plan: 'free',
    dailyGenerations: 0,
  };

  let _initialized = false;

  // ----------------------------------------------------------------
  // INITIALIZATION
  // ----------------------------------------------------------------
  function init(userState) {
    if (userState) {
      _userState = { ..._userState, ...userState };
    }
    _initialized = true;
    console.log('[AdManager] Initialized. User type:', _userState.type);
  }

  // ----------------------------------------------------------------
  // USER STATE
  // ----------------------------------------------------------------
  function setUserState(state) {
    _userState = { ..._userState, ...state };
  }

  function getUserState() {
    return { ..._userState };
  }

  // ----------------------------------------------------------------
  // GENERATION COUNT TRACKING
  // ----------------------------------------------------------------
  function _getGuestGenerationCount() {
    try {
      return parseInt(localStorage.getItem(CONFIG.GUEST_GEN_KEY) || '0', 10);
    } catch (e) {
      return 0;
    }
  }

  function _incrementGuestGenerationCount() {
    try {
      const count = _getGuestGenerationCount() + 1;
      localStorage.setItem(CONFIG.GUEST_GEN_KEY, count.toString());
      return count;
    } catch (e) {
      return 1;
    }
  }

  function _getRegisteredDailyCount() {
    // Check if the stored date is today
    try {
      const today = new Date().toISOString().split('T')[0];
      const storedDate = localStorage.getItem(CONFIG.DAILY_DATE_KEY);
      if (storedDate !== today) {
        localStorage.setItem(CONFIG.DAILY_DATE_KEY, today);
        localStorage.setItem(CONFIG.REGISTERED_GEN_KEY, '0');
        return 0;
      }
      return parseInt(localStorage.getItem(CONFIG.REGISTERED_GEN_KEY) || '0', 10);
    } catch (e) {
      return 0;
    }
  }

  function _incrementRegisteredDailyCount() {
    try {
      const count = _getRegisteredDailyCount() + 1;
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(CONFIG.DAILY_DATE_KEY, today);
      localStorage.setItem(CONFIG.REGISTERED_GEN_KEY, count.toString());
      return count;
    } catch (e) {
      return 1;
    }
  }

  // ----------------------------------------------------------------
  // SHOULD SHOW AD LOGIC
  // ----------------------------------------------------------------
  function shouldShowAd() {
    return false;
  }

  // ----------------------------------------------------------------
  // AD PROVIDER SELECTION
  // ----------------------------------------------------------------
  function _getActiveProvider() {
    const providers = Object.values(CONFIG.providers)
      .filter(p => p.enabled && p.directLinkUrl)
      .sort((a, b) => a.priority - b.priority);

    if (providers.length === 0) return null;

    // Round-robin between available providers
    const index = _getGuestGenerationCount() % providers.length;
    return providers[index];
  }

  // ----------------------------------------------------------------
  // CONFIGURE PROVIDER
  // ----------------------------------------------------------------
  function setProvider(providerKey, config) {
    if (CONFIG.providers[providerKey]) {
      CONFIG.providers[providerKey] = {
        ...CONFIG.providers[providerKey],
        ...config
      };
    } else {
      // Add new provider
      CONFIG.providers[providerKey] = {
        name: providerKey,
        enabled: true,
        directLinkUrl: '',
        priority: Object.keys(CONFIG.providers).length + 1,
        ...config
      };
    }
    console.log(`[AdManager] Provider "${providerKey}" configured.`);
  }

  // ----------------------------------------------------------------
  // TRIGGER AD (Direct Link / New Tab)
  // ----------------------------------------------------------------
  function triggerAd() {
    return new Promise((resolve) => {
      const provider = _getActiveProvider();

      if (!provider) {
        console.log('[AdManager] No active ad provider configured. Skipping ad.');
        resolve({ shown: false, reason: 'no_provider' });
        return;
      }

      console.log(`[AdManager] Triggering ad via ${provider.name}: ${provider.directLinkUrl}`);

      try {
        // Open the ad in a new tab
        const adWindow = window.open(provider.directLinkUrl, '_blank');

        if (!adWindow) {
          // Popup was blocked
          console.warn('[AdManager] Ad popup blocked by browser.');
          if (CONFIG.FALLBACK_ON_FAIL) {
            resolve({ shown: false, reason: 'popup_blocked' });
          } else {
            resolve({ shown: false, reason: 'popup_blocked' });
          }
          return;
        }

        // Ad opened successfully
        resolve({ shown: true, provider: provider.name });

      } catch (err) {
        console.error('[AdManager] Error triggering ad:', err);
        if (CONFIG.FALLBACK_ON_FAIL) {
          resolve({ shown: false, reason: 'error', error: err.message });
        } else {
          resolve({ shown: false, reason: 'error', error: err.message });
        }
      }
    });
  }

  // ----------------------------------------------------------------
  // MAIN ENTRY: Handle ad flow before generation
  // Returns a Promise that resolves when generation should proceed
  // ----------------------------------------------------------------
  async function handlePreGeneration() {
    if (!_initialized) init();

    const needsAd = shouldShowAd();

    // Increment the count AFTER checking (so the check is for the current gen)
    if (_userState.type === 'guest') {
      _incrementGuestGenerationCount();
    } else if (_userState.type === 'registered') {
      _incrementRegisteredDailyCount();
    }

    if (!needsAd) {
      console.log('[AdManager] No ad required for this generation.');
      return { adShown: false, proceed: true };
    }

    console.log('[AdManager] Ad required. Triggering...');
    const result = await triggerAd();

    // Always proceed with generation regardless of ad outcome
    return {
      adShown: result.shown,
      proceed: true,
      adResult: result
    };
  }

  // ----------------------------------------------------------------
  // CONVERSION BANNER
  // Injects a non-intrusive upsell after successful generation
  // ----------------------------------------------------------------
  function getConversionBannerHtml() {
    return '';
  }

  // ----------------------------------------------------------------
  // PUBLIC API
  // ----------------------------------------------------------------
  return {
    init,
    setUserState,
    getUserState,
    shouldShowAd,
    triggerAd,
    handlePreGeneration,
    getConversionBannerHtml,
    setProvider,

    // Expose config for external setup
    get config() { return CONFIG; }
  };

})();

// Make globally available
window.AdManager = AdManager;
