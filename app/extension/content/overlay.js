/* global chrome */
(function() {
  'use strict';

  const OVERLAY_ID = 'temu-shopping-lists-overlay';

  function isProductPage() {
    const path = window.location.pathname.toLowerCase();
    return path.includes('/product') || /^\/[^/]+\/product\//.test(path) || /^\/product\//.test(path);
  }

  function getCurrentUrl() {
    return window.location.href;
  }

  function createOverlayButton() {
    if (document.getElementById(OVERLAY_ID)) {
      return;
    }

    const button = document.createElement('button');
    button.id = OVERLAY_ID;
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
        <path d="M5 5.5C5 3.567 6.567 2 8.5 2h3c1.933 0 3.5 1.567 3.5 3.5v3c0 1.933-1.567 3.5-3.5 3.5h-3c-1.933 0-3.5-1.567-3.5-3.5v-3z" stroke="currentColor" stroke-width="1.5"/>
        <path d="M5.5 11.5C5.5 13.433 7.067 15 9 15h6c1.933 0 3.5-1.567 3.5-3.5v-6" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      Ajouter à mes listes
    `;
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 44px;
      padding: 0 16px;
      border: none;
      border-radius: 22px;
      background: #f97316;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
      transition: transform 150ms ease;
    `;
    button.addEventListener('mouseenter', () => button.style.transform = 'scale(1.02)');
    button.addEventListener('mouseleave', () => button.style.transform = 'scale(1)');
    button.addEventListener('click', () => {
      window.postMessage({
        type: 'TEMULISTS_OPEN_OVERLAY',
        url: getCurrentUrl()
      }, '*');
    });

    document.body.appendChild(button);
  }

  function injectStyles() {
    if (document.getElementById('temu-extension-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'temu-extension-styles';
    style.textContent = `
      #${OVERLAY_ID}:hover {
        filter: brightness(1.05);
      }
      #${OVERLAY_ID}:active {
        transform: scale(0.98);
      }
    `;
    document.head.appendChild(style);
  }

  function onUrlChange() {
    if (isProductPage()) {
      createOverlayButton();
    } else {
      const existing = document.getElementById(OVERLAY_ID);
      if (existing) {
        existing.remove();
      }
    }
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        injectStyles();
        onUrlChange();
      });
    } else {
      injectStyles();
      onUrlChange();
    }
  }

  const observer = new MutationObserver(onUrlChange);
  observer.observe(document, { subtree: true, childList: true });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'PING') {
      sendResponse({ ok: true, available: true });
      return true;
    }
    if (message.type === 'OVERLAY_OPEN') {
      window.postMessage({
        type: 'TEMULISTS_OPEN_OVERLAY',
        url: getCurrentUrl()
      }, '*');
      sendResponse({ ok: true, available: true });
      return true;
    }
    if (message.type === 'CAPTURE_URL') {
      sendResponse({ ok: true, available: true, url: getCurrentUrl() });
      return true;
    }
    sendResponse({ ok: false, available: false, error: 'unknown_message_type' });
    return true;
  });

  init();
})();
