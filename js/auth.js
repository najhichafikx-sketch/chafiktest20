/* ============================================================
   Chafiktech AI - User Authentication System
   ============================================================ */

const Auth = {
  API_BASE: window.location.origin,
  
  getToken() {
    return localStorage.getItem('user_token');
  },

  setToken(token) {
    localStorage.setItem('user_token', token);
  },

  logout() {
    localStorage.removeItem('user_token');
    window.location.href = '/login.html';
  },

  getHeaders() {
    const token = this.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async requireAuth() {
    const token = this.getToken();
    if (!token) {
      window.location.href = '/login.html';
      return null;
    }
    
    // Verify token validity
    try {
      const res = await fetch(`${this.API_BASE}/api/auth/me`, {
        headers: this.getHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        this.logout();
        return null;
      }
      const data = await res.json();
      return data.user;
    } catch (e) {
      console.error('Auth check failed', e);
      return null;
    }
  },

  async login(email, password) {
    const res = await fetch(`${this.API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      this.setToken(data.token);
    }
    return data;
  },

  async register(email, password) {
    const res = await fetch(`${this.API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      this.setToken(data.token);
    }
    return data;
  }
};

window.Auth = Auth;
