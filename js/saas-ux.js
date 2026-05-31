/* ============================================================
   Chafiktech AI - Global SaaS UX System
   Handles: AI Requests, Loading State, 5s Minimum Delay,
   Button Protection, Smooth Result Display,
   AdManager Integration, Guest Access
   ============================================================ */

'use strict';

(function () {

  // ----------------------------------------------------------------
  // CONFIGURATION
  // ----------------------------------------------------------------
  const SAAS_CONFIG = {
    API_BASE: window.location.origin, // Automatically uses same server
    MIN_LOADING_MS: 5000,             // Default minimum loading display
    LOADING_MSG: 'AI is generating your result...',
  };

  // ----------------------------------------------------------------
  // USER STATE DETECTION
  // Detects if user is guest, registered, premium, or admin
  // ----------------------------------------------------------------
  let _currentUserState = null;

  async function detectUserState() {
    if (_currentUserState) return _currentUserState;

    const token = localStorage.getItem('user_token');

    if (!token) {
      _currentUserState = { type: 'guest', plan: 'free', dailyGenerations: 0 };
      return _currentUserState;
    }

    // Try to validate token
    try {
      const res = await fetch(`${SAAS_CONFIG.API_BASE}/api/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        // Token invalid - treat as guest
        _currentUserState = { type: 'guest', plan: 'free', dailyGenerations: 0 };
        return _currentUserState;
      }

      const data = await res.json();
      if (data.success && data.user) {
        const plan = data.user.plan || 'free';
        let type = 'registered';
        if (plan === 'premium') type = 'premium';
        if (data.user.email === 'admin') type = 'admin';

        _currentUserState = {
          type,
          plan,
          dailyGenerations: data.user.daily_generations || 0
        };
        return _currentUserState;
      }
    } catch (e) {
      console.warn('[SaaS UX] Could not validate user token:', e.message);
    }

    _currentUserState = { type: 'guest', plan: 'free', dailyGenerations: 0 };
    return _currentUserState;
  }

  // Allow re-detection (e.g. after login)
  window.resetSaaSUserState = function() {
    _currentUserState = null;
  };

  // ----------------------------------------------------------------
  // GET LOADING DURATION BY USER TYPE
  // ----------------------------------------------------------------
  function getLoadingDuration(userType) {
    switch (userType) {
      case 'premium':
      case 'admin':
        return 1500;      // Fastest
      case 'registered':
        return 3000;      // Faster than guest
      case 'guest':
      default:
        return SAAS_CONFIG.MIN_LOADING_MS; // 5 seconds
    }
  }

  // ----------------------------------------------------------------
  // MAIN EXECUTION FUNCTION
  // Called from any tool: executeSaaSAction(buttonEl, toolId, inputEl, onSuccess)
  // ----------------------------------------------------------------
  window.executeSaaSAction = async function (buttonEl, toolId, inputEl, onSuccess, customPrompt) {
    const inputValue = inputEl ? (inputEl.value || inputEl.textContent || '').trim() : '';

    if (inputEl && !inputValue) {
      showGlobalToast('⚠️ Please enter a value first!', 'warn');
      return;
    }

    // Detect user state
    const userState = await detectUserState();

    // Initialize AdManager if available
    if (typeof AdManager !== 'undefined') {
      AdManager.init(userState);

      // Handle pre-generation ad flow
      const adResult = await AdManager.handlePreGeneration();
      console.log('[SaaS UX] Ad result:', adResult);
    }

    // Lock the button
    setButtonLoading(buttonEl, true);

    // Create an AbortController for the 30s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    // Use loading duration based on user type
    const loadingMs = getLoadingDuration(userState.type);

    // Start both timer and API request simultaneously
    const timerPromise = new Promise(resolve => setTimeout(resolve, loadingMs));
    const apiPromise = callGenerateAPI(toolId, inputValue, customPrompt, controller.signal);

    try {
      const [, apiResult] = await Promise.all([timerPromise, apiPromise]);
      
      clearTimeout(timeoutId);

      if (apiResult && apiResult.success) {
        window.lastGenerationId = apiResult.generationId;

        // Append conversion banner if AdManager is available
        let resultHtml = apiResult.html;
        if (typeof AdManager !== 'undefined') {
          resultHtml += AdManager.getConversionBannerHtml();
        }

        onSuccess(resultHtml, apiResult.source);
      } else {
        onSuccess(getErrorHtml(apiResult?.error || 'Unknown error'), 'error');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('[SaaS] Request failed:', err);
      
      let errMsg = err.message;
      if (err.name === 'AbortError') {
        errMsg = 'Request timed out (30 seconds). The server took too long to respond.';
        showGlobalToast('⏳ Request timed out. Please try again.', 'error');
      }
      onSuccess(getErrorHtml(errMsg), 'error');
    } finally {
      setButtonLoading(buttonEl, false);
    }
  };

  // ----------------------------------------------------------------
  // API CALL (now supports guest access)
  // ----------------------------------------------------------------
  async function callGenerateAPI(toolId, input, customPrompt, signal) {
    const token = localStorage.getItem('user_token');
    
    // Build headers - token is optional now
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${SAAS_CONFIG.API_BASE}/api/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ toolId, input, prompt: customPrompt || null }),
      signal
    });

    if (!response.ok) {
      if (response.status === 401) {
        // For guests, 401 might mean the server doesn't support guest mode yet
        // Don't redirect - just show error
        throw new Error('Authentication error. Please try again or create a free account.');
      }
      if (response.status === 403) {
        throw new Error('Insufficient credits. Please visit the dashboard to recharge or upgrade.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a minute before trying again.');
      }
      throw new Error(`Server error: ${response.status}`);
    }

    return response.json();
  }

  // ----------------------------------------------------------------
  // BUTTON LOADING STATE
  // ----------------------------------------------------------------
  function setButtonLoading(btn, isLoading) {
    if (!btn) return;

    if (isLoading) {
      btn._originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.setAttribute('data-saas-loading', 'true');
      btn.innerHTML = `
        <span class="saas-spinner"></span>
        <span>${SAAS_CONFIG.LOADING_MSG}</span>
      `;
    } else {
      btn.disabled = false;
      btn.removeAttribute('data-saas-loading');
      if (btn._originalHTML) btn.innerHTML = btn._originalHTML;
    }
  }

  // ----------------------------------------------------------------
  // ERROR HTML
  // ----------------------------------------------------------------
  function getErrorHtml(msg) {
    return `
      <div style="padding:24px;text-align:center;">
        <div style="font-size:2rem;margin-bottom:12px;">⚠️</div>
        <h3 style="color:#ef4444;margin-bottom:8px;">Generation Failed</h3>
        <p style="color:var(--text2,#888);font-size:0.9rem;">Error: ${msg}</p>
        <p style="color:var(--text2,#888);font-size:0.85rem;margin-top:8px;">
          Please check your API keys in Admin settings or try again.
        </p>
      </div>
    `;
  }

  // ----------------------------------------------------------------
  // GLOBAL TOAST (reuses existing showToast if available)
  // ----------------------------------------------------------------
  function showGlobalToast(message, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type === 'warn' ? 'info' : type);
    } else {
      alert(message);
    }
  }

  // ----------------------------------------------------------------
  // INJECT GLOBAL SPINNER CSS
  // ----------------------------------------------------------------
  (function injectSpinnerCSS() {
    if (document.getElementById('saas-ux-styles')) return;
    const style = document.createElement('style');
    style.id = 'saas-ux-styles';
    style.textContent = `
      /* --- SaaS UX Loading Spinner --- */
      .saas-spinner {
        display: inline-block;
        width: 18px;
        height: 18px;
        border: 3px solid rgba(255,255,255,0.35);
        border-top-color: #fff;
        border-radius: 50%;
        animation: saas-spin 0.75s linear infinite;
        flex-shrink: 0;
        margin-right: 8px;
        vertical-align: middle;
      }
      @keyframes saas-spin { to { transform: rotate(360deg); } }
      
      /* --- Disable button pointer during loading --- */
      button[data-saas-loading="true"] {
        cursor: not-allowed !important;
        opacity: 0.8 !important;
        pointer-events: none !important;
      }

      /* --- Progress bar for AI loading --- */
      .saas-progress-bar-wrap {
        width: 100%;
        background: rgba(255,255,255,0.08);
        border-radius: 99px;
        overflow: hidden;
        height: 6px;
        margin-top: 12px;
      }
      .saas-progress-bar {
        height: 100%;
        border-radius: 99px;
        background: linear-gradient(90deg, #6366f1, #a855f7, #00f2fe);
        background-size: 200% 100%;
        animation: saas-progress-pulse 2s ease-in-out infinite;
        width: 100%;
      }
      @keyframes saas-progress-pulse {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* --- Result Fade-in --- */
      .saas-result-fade {
        animation: saas-fade-in 0.5s ease forwards;
      }
      @keyframes saas-fade-in {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  })();

  console.log('[SaaS UX] Global loading system initialized. API Base:', SAAS_CONFIG.API_BASE);

  // ----------------------------------------------------------------
  // SAVE RESULT API
  // ----------------------------------------------------------------
  window.saveTkResult = async function(btn) {
    if (!window.lastGenerationId) {
      showGlobalToast('No result to save.', 'warn');
      return;
    }
    const token = localStorage.getItem('user_token');
    if(!token) {
      showGlobalToast('Create a free account to save results.', 'info');
      return;
    }
    
    btn.disabled = true;
    const oldText = btn.innerHTML;
    btn.textContent = 'Saving...';
    try {
      const res = await fetch(`${SAAS_CONFIG.API_BASE}/api/user/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ generation_id: window.lastGenerationId })
      });
      const data = await res.json();
      if(data.success) {
        showGlobalToast('💾 Saved successfully!', 'success');
        btn.textContent = 'Saved';
      } else {
        showGlobalToast('Error saving.', 'error');
        btn.innerHTML = oldText;
        btn.disabled = false;
      }
    } catch(e) {
      showGlobalToast('Network error.', 'error');
      btn.innerHTML = oldText;
      btn.disabled = false;
    }
  };

})();
