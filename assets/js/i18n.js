/* =============================================================
   i18n.js — Language switcher engine for Beauty Atelier IN
   Reads TRANSLATIONS from translations.js (must load first).
   ============================================================= */

(function () {
    'use strict';

    var STORAGE_KEY = 'ba_lang';
    var DEFAULT_LANG = 'bg';

    /* ---------- helpers ---------- */

    function getLang() {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    }

    function saveLang(lang) {
        localStorage.setItem(STORAGE_KEY, lang);
    }

    function applyLang(lang) {
        var t = (typeof TRANSLATIONS !== 'undefined') ? TRANSLATIONS[lang] : null;
        if (!t) return;

        /* 1. <html lang=""> */
        document.documentElement.lang = lang;

        /* 2. <title data-i18n="key"> */
        var titleEl = document.querySelector('title[data-i18n]');
        if (titleEl && t[titleEl.getAttribute('data-i18n')]) {
            document.title = t[titleEl.getAttribute('data-i18n')];
        }

        /* 3. <meta name="description" data-i18n-content="key"> */
        var metaDesc = document.querySelector('meta[name="description"][data-i18n-content]');
        if (metaDesc && t[metaDesc.getAttribute('data-i18n-content')]) {
            metaDesc.setAttribute('content', t[metaDesc.getAttribute('data-i18n-content')]);
        }

        /* 4. data-i18n → textContent (safe, no HTML) */
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            if (el.tagName === 'TITLE') return; // already handled above
            var key = el.getAttribute('data-i18n');
            if (t[key] !== undefined) el.textContent = t[key];
        });

        /* 5. data-i18n-html → innerHTML (trusted source only) */
        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-html');
            if (t[key] !== undefined) el.innerHTML = t[key];
        });

        /* 6. data-i18n-ph → placeholder attribute */
        document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-ph');
            if (t[key] !== undefined) el.placeholder = t[key];
        });

        /* 7. data-i18n-aria → aria-label attribute */
        document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-aria');
            if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
        });

        /* 8. Update toggle button active state */
        document.querySelectorAll('.lang-toggle__option').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });
    }

    function switchLang(newLang) {
        /* Brief opacity dip for smooth feel */
        document.body.classList.add('lang-switching');
        setTimeout(function () {
            saveLang(newLang);
            applyLang(newLang);
            document.body.classList.remove('lang-switching');
        }, 120);
    }

    function init() {
        /* Wire up toggle buttons */
        document.querySelectorAll('.lang-toggle__option').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var newLang = btn.getAttribute('data-lang');
                if (newLang !== getLang()) switchLang(newLang);
            });
        });

        /* Apply stored language on load */
        applyLang(getLang());
    }

    /* Run after DOM is ready */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
