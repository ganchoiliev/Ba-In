/**
 * i18n.js — lazy bilingual layer for ba-in.com
 *
 * WHY THIS FILE CHANGED
 * translations.js is 145,735 bytes — the largest script on the site, larger
 * than jQuery. It used to load eagerly on all 36 pages, for every visitor.
 * Practically all of them read Bulgarian and never touch the toggle, and the
 * English layer is applied client-side so it has never been indexable either.
 * It is now fetched on demand: the first time someone asks for EN, or on load
 * if they chose EN on a previous visit. Bulgarian visitors pay zero bytes.
 *
 * INVARIANTS — do not break these:
 *  1. The page is NEVER hidden while a network request is in flight. The
 *     .lang-switching mask is `opacity: 0` with no transition, so applying it
 *     before the dictionary is in memory risks a blank page on a slow phone.
 *     It is applied only once TRANSLATIONS is resolved, making it a ~120ms
 *     paint transition rather than a network wait.
 *  2. A failed, blocked or slow fetch degrades to Bulgarian. Bulgarian is the
 *     HTML source language, so the untranslated page is the correct page —
 *     there is no broken state to fall into.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'ba_lang';
    var DEFAULT_LANG = 'bg';
    var FETCH_TIMEOUT_MS = 8000;
    var SWAP_MASK_MS = 120;

    // Resolve translations.js against this script's own URL rather than a
    // root-relative literal, so the loader survives being included from a
    // subdirectory (fibromi-blog/, laminirane/, notino/ ...).
    var selfSrc = document.currentScript && document.currentScript.src;
    var TRANSLATIONS_URL = selfSrc
        ? selfSrc.replace(/i18n\.js(\?.*)?$/, 'translations.js')
        : 'assets/js/translations.js';

    var pending = null;

    function readLang() {
        try {
            return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
        } catch (e) {
            return DEFAULT_LANG;
        }
    }

    function writeLang(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) { /* private mode — language just will not persist */ }
    }

    function haveTranslations() {
        return typeof TRANSLATIONS !== 'undefined' && !!TRANSLATIONS;
    }

    /** Injects translations.js at most once. Always resolves, never rejects. */
    function loadTranslations() {
        if (haveTranslations()) return Promise.resolve(true);
        if (pending) return pending;

        pending = new Promise(function (resolve) {
            var settled = false;
            function settle() {
                if (settled) return;
                settled = true;
                resolve(haveTranslations());
            }

            var el = document.createElement('script');
            el.src = TRANSLATIONS_URL;
            el.async = true;
            el.onload = settle;
            el.onerror = settle;
            // Belt and braces: a hung request must not leave the toggle dead.
            setTimeout(settle, FETCH_TIMEOUT_MS);
            document.head.appendChild(el);
        });

        return pending;
    }

    function markToggle(lang) {
        document.querySelectorAll('.lang-toggle__option').forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-lang') === lang);
        });
    }

    function apply(lang) {
        var dict = haveTranslations() ? TRANSLATIONS[lang] : null;
        if (!dict) return false;

        document.documentElement.lang = lang;

        var titleEl = document.querySelector('title[data-i18n]');
        if (titleEl) {
            var titleKey = titleEl.getAttribute('data-i18n');
            if (dict[titleKey]) document.title = dict[titleKey];
        }

        var descEl = document.querySelector('meta[name="description"][data-i18n-content]');
        if (descEl) {
            var descKey = descEl.getAttribute('data-i18n-content');
            if (dict[descKey]) descEl.setAttribute('content', dict[descKey]);
        }

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            if (el.tagName === 'TITLE') return;
            var v = dict[el.getAttribute('data-i18n')];
            if (v !== undefined) el.textContent = v;
        });
        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            var v = dict[el.getAttribute('data-i18n-html')];
            if (v !== undefined) el.innerHTML = v;
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
            var v = dict[el.getAttribute('data-i18n-ph')];
            if (v !== undefined) el.placeholder = v;
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
            var v = dict[el.getAttribute('data-i18n-aria')];
            if (v !== undefined) el.setAttribute('aria-label', v);
        });

        markToggle(lang);

        // bootstrap-select renders its own markup from the <option> text, so
        // it has to be told to re-read after a swap. Present on appointment
        // .html only; the guard keeps this a no-op everywhere else.
        var $ = window.jQuery;
        if ($ && $.fn && $.fn.selectpicker) {
            $('.selectpicker').selectpicker('refresh');
        }

        return true;
    }

    function switchTo(lang) {
        if (lang === readLang()) return;

        writeLang(lang);
        markToggle(lang); // instant feedback — do not make the user wait on IO

        loadTranslations().then(function (ok) {
            if (!ok) {
                // Network refused us. Bulgarian is already on screen and is a
                // valid end state, so revert the preference and say nothing.
                writeLang(DEFAULT_LANG);
                markToggle(DEFAULT_LANG);
                return;
            }
            document.body.classList.add('lang-switching');
            setTimeout(function () {
                apply(lang);
                document.body.classList.remove('lang-switching');
            }, SWAP_MASK_MS);
        });
    }

    function init() {
        document.querySelectorAll('.lang-toggle__option').forEach(function (el) {
            el.addEventListener('click', function () {
                switchTo(el.getAttribute('data-lang'));
            });
        });

        var lang = readLang();
        markToggle(lang);

        // The HTML source IS Bulgarian. BG needs no dictionary and therefore
        // no request. This early return is the entire saving.
        if (lang === DEFAULT_LANG) return;

        loadTranslations().then(function (ok) {
            if (ok) apply(lang);
            else writeLang(DEFAULT_LANG);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
