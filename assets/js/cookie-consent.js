/* ============================================================
   cookie-consent.js — GDPR Cookie Banner for Beauty Atelier IN
   GA-4 ID: G-4DSP9HGYMB
   ============================================================ */

(function () {
    'use strict';

    var GA_ID = 'G-4DSP9HGYMB';
    var STORAGE_KEY = 'ba_cookie_consent';

    /* Disable GA if previously declined */
    if (localStorage.getItem(STORAGE_KEY) === 'declined') {
        window['ga-disable-' + GA_ID] = true;
    }

    function accept() {
        localStorage.setItem(STORAGE_KEY, 'accepted');
        hideBanner();
        /* Re-enable GA if it was blocked */
        window['ga-disable-' + GA_ID] = false;
    }

    function decline() {
        localStorage.setItem(STORAGE_KEY, 'declined');
        window['ga-disable-' + GA_ID] = true;
        hideBanner();
    }

    function hideBanner() {
        var el = document.getElementById('cookie-banner');
        if (el) {
            el.classList.remove('is-visible');
            /* Remove from DOM after transition */
            setTimeout(function () { el.style.display = 'none'; }, 400);
        }
    }

    function showBanner() {
        var el = document.getElementById('cookie-banner');
        if (el) el.classList.add('is-visible');
    }

    function init() {
        var consent = localStorage.getItem(STORAGE_KEY);
        if (!consent) showBanner();

        var acceptBtn = document.getElementById('cookie-accept');
        var declineBtn = document.getElementById('cookie-decline');
        if (acceptBtn) acceptBtn.addEventListener('click', accept);
        if (declineBtn) declineBtn.addEventListener('click', decline);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
