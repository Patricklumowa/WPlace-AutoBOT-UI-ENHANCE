// WPlace Account Switcher - No Refresh Required
// This bookmarklet allows switching accounts by updating cookies and reinitializing the page state

javascript:(function() {
  
  // Account Switcher Configuration
  const ACCOUNTS = {
    'Account 1': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIwNDE5ODEsInNlc3Npb25JZCI6IjNZNE9NcU1HeEdKQVE5VngyR0JPR0VsXzBuMENKazYtWVNGamZNNGJQVEk9IiwiaXNzIjoid3BsYWNlIiwiZXhwIjoxNzU4MTU3MzQ5LCJpYXQiOjE3NTU1NjUzNDl9.kmmeX0QwoBS0Tu0uvXcP3xEgzJWatxSSelW-4A1FT8U',
    'Account 2': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIwOTg4NDMsInNlc3Npb25JZCI6Ik9fNm5DakxBcjQycWwxZWdSU2pSQk82Q1Y5NU9BTjBJQTRjRkJ5alFTdHM9IiwiaXNzIjoid3BsYWNlIiwiZXhwIjoxNzU4MTMzNjE3LCJpYXQiOjE3NTU1NDE2MTd9.SvS3Kiu23uKmpmzFk-_namRdsENOExDzJ1HnEudmv1w', 
    'Account 3': 'your_j_cookie_value_3_here'
    // Add more accounts as needed
  };

  // Create Account Switcher UI
  function createAccountSwitcher() {
    // Remove existing switcher if present
    const existing = document.getElementById('wplace-account-switcher');
    if (existing) existing.remove();

    const switcher = document.createElement('div');
    switcher.id = 'wplace-account-switcher';
    switcher.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: 'Segoe UI', sans-serif;
      color: white;
      min-width: 250px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
    `;

    switcher.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">
          <i class="fas fa-user-cog" style="margin-right: 8px;"></i>
          Account Switcher
        </h3>
        <button id="close-switcher" style="
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 12px;
        ">✕</button>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 8px; font-size: 13px; opacity: 0.9;">
          Current Account: <span id="current-account" style="font-weight: bold; color: #4facfe;">Loading...</span>
        </label>
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 8px; font-size: 13px;">Switch to:</label>
        <select id="account-select" style="
          width: 100%;
          padding: 8px 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          color: white;
          font-size: 13px;
          outline: none;
        ">
          <option value="">Select Account...</option>
          ${Object.keys(ACCOUNTS).map(name => 
            `<option value="${name}" style="background: #2d3748; color: white;">${name}</option>`
          ).join('')}
        </select>
      </div>

      <button id="switch-account" style="
        width: 100%;
        padding: 10px;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        border: none;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 10px;
      " disabled>
        <i class="fas fa-sync-alt" style="margin-right: 6px;"></i>
        Switch Account
      </button>

      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
        <label style="display: block; margin-bottom: 8px; font-size: 12px; opacity: 0.8;">Quick Add Cookie:</label>
        <div style="display: flex; gap: 6px;">
          <input type="text" id="cookie-input" placeholder="Paste J cookie value..." style="
            flex: 1;
            padding: 6px 8px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 4px;
            color: white;
            font-size: 11px;
            outline: none;
          ">
          <button id="apply-cookie" style="
            padding: 6px 10px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 4px;
            color: white;
            font-size: 11px;
            cursor: pointer;
          ">Apply</button>
        </div>
      </div>

      <div id="status-message" style="
        margin-top: 10px;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        text-align: center;
        display: none;
      "></div>
    `;

    document.body.appendChild(switcher);
    return switcher;
  }

  // Get current account info
  function getCurrentAccount() {
    const jCookie = getCookie('J');
    if (!jCookie) return 'Not logged in';
    
    // Try to find matching account name
    for (const [name, cookie] of Object.entries(ACCOUNTS)) {
      if (cookie === jCookie) return name;
    }
    
    return 'Unknown Account';
  }

  // Cookie management functions
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function setCookie(name, value, days = 30) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    const domain = window.location.hostname;
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=.${domain}`;
  }

  // Show status message
  function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    if (!statusEl) return;

    const colors = {
      success: 'background: rgba(39, 174, 96, 0.2); color: #27ae60; border: 1px solid rgba(39, 174, 96, 0.3);',
      error: 'background: rgba(231, 76, 60, 0.2); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3);',
      info: 'background: rgba(52, 152, 219, 0.2); color: #3498db; border: 1px solid rgba(52, 152, 219, 0.3);'
    };

    statusEl.style.cssText += colors[type];
    statusEl.textContent = message;
    statusEl.style.display = 'block';

    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }

  // Reinitialize page without refresh
  function reinitializePage() {
    try {
      // Clear any cached user data
      if (typeof window.user !== 'undefined') {
        window.user = null;
      }
      
      // Trigger any authentication refresh functions
      if (typeof window.refreshAuth === 'function') {
        window.refreshAuth();
      }
      
      // Reload user info components
      const userElements = document.querySelectorAll('[data-user-info], .user-info, #user-display');
      userElements.forEach(el => {
        if (el.refresh && typeof el.refresh === 'function') {
          el.refresh();
        }
      });

      // Dispatch custom event for other scripts to listen to
      window.dispatchEvent(new CustomEvent('accountSwitched', {
        detail: { timestamp: Date.now() }
      }));

      // Force update any React/Vue components if present
      if (window.React && window.React.render) {
        // Trigger React re-render
        const reactRoot = document.querySelector('[data-reactroot]');
        if (reactRoot) {
          reactRoot.dispatchEvent(new Event('forceUpdate'));
        }
      }

      showStatus('Account switched successfully!', 'success');
      
    } catch (error) {
      console.warn('Some page components could not be refreshed:', error);
      showStatus('Account switched, some components may need manual refresh', 'info');
    }
  }

  // Switch account function
  function switchAccount(accountName) {
    if (!ACCOUNTS[accountName]) {
      showStatus('Account not found!', 'error');
      return;
    }

    try {
      // Set the new J cookie
      setCookie('J', ACCOUNTS[accountName]);
      
      // Update current account display
      document.getElementById('current-account').textContent = accountName;
      
      // Reinitialize page state
      setTimeout(() => {
        reinitializePage();
      }, 100);

    } catch (error) {
      console.error('Error switching account:', error);
      showStatus('Failed to switch account!', 'error');
    }
  }

  // Apply cookie directly
  function applyCookie(cookieValue) {
    if (!cookieValue.trim()) {
      showStatus('Please enter a cookie value!', 'error');
      return;
    }

    try {
      setCookie('J', cookieValue.trim());
      document.getElementById('current-account').textContent = 'Custom Account';
      
      setTimeout(() => {
        reinitializePage();
      }, 100);

    } catch (error) {
      console.error('Error applying cookie:', error);
      showStatus('Failed to apply cookie!', 'error');
    }
  }

  // Initialize the switcher
  function init() {
    const switcher = createAccountSwitcher();
    
    // Update current account display
    document.getElementById('current-account').textContent = getCurrentAccount();

    // Event listeners
    document.getElementById('close-switcher').addEventListener('click', () => {
      switcher.remove();
    });

    const accountSelect = document.getElementById('account-select');
    const switchBtn = document.getElementById('switch-account');
    
    accountSelect.addEventListener('change', () => {
      switchBtn.disabled = !accountSelect.value;
    });

    switchBtn.addEventListener('click', () => {
      if (accountSelect.value) {
        switchAccount(accountSelect.value);
      }
    });

    document.getElementById('apply-cookie').addEventListener('click', () => {
      const cookieInput = document.getElementById('cookie-input');
      applyCookie(cookieInput.value);
      cookieInput.value = '';
    });

    // Allow Enter key in cookie input
    document.getElementById('cookie-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('apply-cookie').click();
      }
    });

    // Auto-close on outside click
    document.addEventListener('click', (e) => {
      if (!switcher.contains(e.target)) {
        setTimeout(() => switcher.remove(), 100);
      }
    });

    // Prevent switcher from closing when clicking inside
    switcher.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Start the account switcher
  init();

})();
