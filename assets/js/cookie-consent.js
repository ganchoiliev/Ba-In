/* ============================================================
   cookie-consent.js — GDPR Cookie Consent with Google Consent Mode v2
   Beauty Atelier IN  |  GA-4 ID: G-4DSP9HGYMB
   ============================================================ */

(function () {
    'use strict';

    var GA_ID = 'G-4DSP9HGYMB';
    var STORAGE_KEY = 'ba_cookie_consent';
    var CONSENT_VERSION = 1;
    var CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 months

    /* ---------- helpers ---------- */

    function t(key, fallback) {
        var lang = (typeof localStorage !== 'undefined' && localStorage.getItem('ba_lang')) || 'bg';
        if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            return TRANSLATIONS[lang][key];
        }
        return fallback || key;
    }

    function getConsent() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            // Migrate old plain-string format ("accepted"/"declined")
            if (raw === 'accepted') {
                var migrated = { analytics: true, marketing: false, timestamp: new Date().toISOString(), version: CONSENT_VERSION };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
                return migrated;
            }
            if (raw === 'declined') {
                var migrated = { analytics: false, marketing: false, timestamp: new Date().toISOString(), version: CONSENT_VERSION };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
                return migrated;
            }
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function saveConsent(analytics, marketing) {
        var data = {
            analytics: !!analytics,
            marketing: !!marketing,
            timestamp: new Date().toISOString(),
            version: CONSENT_VERSION
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
    }

    function isConsentValid(data) {
        if (!data || typeof data.timestamp === 'undefined') return false;
        if (data.version !== CONSENT_VERSION) return false;
        var age = Date.now() - new Date(data.timestamp).getTime();
        return age < CONSENT_MAX_AGE_MS;
    }

    /* ---------- GA management ---------- */

    var gaLoaded = false;

    function loadGA() {
        if (gaLoaded) return;
        gaLoaded = true;
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);
        gtag('js', new Date());
        gtag('config', GA_ID);
    }

    function updateConsentState(analytics, marketing) {
        gtag('consent', 'update', {
            analytics_storage: analytics ? 'granted' : 'denied',
            ad_storage: marketing ? 'granted' : 'denied',
            ad_user_data: marketing ? 'granted' : 'denied',
            ad_personalization: marketing ? 'granted' : 'denied'
        });
    }

    function deleteGACookies() {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var name = cookies[i].split('=')[0].trim();
            if (name === '_ga' || name.indexOf('_ga_') === 0 || name === '_gid') {
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + location.hostname;
            }
        }
    }

    function applyConsent(data) {
        updateConsentState(data.analytics, data.marketing);
        if (data.analytics) {
            loadGA();
        } else {
            deleteGACookies();
        }
        if (!data.marketing) {
            deleteGACookies(); // also clears ad-related GA cookies
        }
    }

    /* ---------- banner DOM ---------- */

    var bannerEl = null;
    var modalEl = null;

    function createBanner() {
        // Main banner
        bannerEl = document.createElement('div');
        bannerEl.id = 'cookie-banner';
        bannerEl.className = 'cookie-banner';
        bannerEl.setAttribute('role', 'dialog');
        bannerEl.setAttribute('aria-label', 'Cookie consent');

        bannerEl.innerHTML =
            '<span class="cookie-banner__icon" aria-hidden="true">&#127850;</span>' +
            '<div class="cookie-banner__text">' +
                '<p>' + t('cookie.text', 'Използваме бисквитки за анализ на трафика (Google Analytics), за да подобряваме сайта.') + '</p>' +
                '&nbsp;<a href="Privacy-policy.html">' + t('cookie.learn_more', 'Поверителност') + '</a>' +
            '</div>' +
            '<div class="cookie-banner__actions">' +
                '<button class="cookie-btn cookie-btn--accept" id="cookie-accept-all">' + t('cookie.accept_all', 'Приемам всички') + '</button>' +
                '<button class="cookie-btn cookie-btn--decline" id="cookie-decline-all">' + t('cookie.decline_all', 'Отказвам всички') + '</button>' +
                '<button class="cookie-btn cookie-btn--customize" id="cookie-customize">' + t('cookie.customize', 'Настройки') + '</button>' +
            '</div>';

        document.body.appendChild(bannerEl);

        // Preferences modal
        modalEl = document.createElement('div');
        modalEl.id = 'cookie-modal';
        modalEl.className = 'cookie-modal';
        modalEl.setAttribute('role', 'dialog');
        modalEl.setAttribute('aria-label', 'Cookie preferences');

        modalEl.innerHTML =
            '<div class="cookie-modal__overlay"></div>' +
            '<div class="cookie-modal__panel">' +
                '<h3 class="cookie-modal__title">' + t('cookie.customize', 'Настройки') + '</h3>' +

                '<div class="cookie-category">' +
                    '<div class="cookie-category__header">' +
                        '<span class="cookie-category__title">' + t('cookie.necessary_title', 'Необходими') + '</span>' +
                        '<label class="cookie-toggle cookie-toggle--disabled"><input type="checkbox" checked disabled /><span class="cookie-toggle__slider"></span></label>' +
                    '</div>' +
                    '<p class="cookie-category__desc">' + t('cookie.necessary_desc', 'Основни бисквитки за работата на сайта. Не могат да бъдат изключени.') + '</p>' +
                '</div>' +

                '<div class="cookie-category">' +
                    '<div class="cookie-category__header">' +
                        '<span class="cookie-category__title">' + t('cookie.analytics_title', 'Аналитични') + '</span>' +
                        '<label class="cookie-toggle"><input type="checkbox" id="cookie-toggle-analytics" /><span class="cookie-toggle__slider"></span></label>' +
                    '</div>' +
                    '<p class="cookie-category__desc">' + t('cookie.analytics_desc', 'Google Analytics — анализ на трафика и подобряване на сайта.') + '</p>' +
                '</div>' +

                '<div class="cookie-category">' +
                    '<div class="cookie-category__header">' +
                        '<span class="cookie-category__title">' + t('cookie.marketing_title', 'Маркетингови') + '</span>' +
                        '<label class="cookie-toggle"><input type="checkbox" id="cookie-toggle-marketing" /><span class="cookie-toggle__slider"></span></label>' +
                    '</div>' +
                    '<p class="cookie-category__desc">' + t('cookie.marketing_desc', 'Рекламни бисквитки за персонализирани оферти.') + '</p>' +
                '</div>' +

                '<div class="cookie-modal__actions">' +
                    '<button class="cookie-btn cookie-btn--accept" id="cookie-save-prefs">' + t('cookie.save_preferences', 'Запази настройките') + '</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(modalEl);

        // Event listeners
        document.getElementById('cookie-accept-all').addEventListener('click', acceptAll);
        document.getElementById('cookie-decline-all').addEventListener('click', declineAll);
        document.getElementById('cookie-customize').addEventListener('click', showModal);
        document.getElementById('cookie-save-prefs').addEventListener('click', savePreferences);
        modalEl.querySelector('.cookie-modal__overlay').addEventListener('click', hideModal);
    }

    function showBanner() {
        if (!bannerEl) createBanner();
        bannerEl.classList.add('is-visible');
    }

    function hideBanner() {
        if (bannerEl) {
            bannerEl.classList.remove('is-visible');
            setTimeout(function () { bannerEl.style.display = 'none'; }, 400);
        }
    }

    function showModal() {
        if (!modalEl) createBanner();
        // Pre-populate toggles from stored consent
        var data = getConsent();
        var analyticsToggle = document.getElementById('cookie-toggle-analytics');
        var marketingToggle = document.getElementById('cookie-toggle-marketing');
        if (data && isConsentValid(data)) {
            analyticsToggle.checked = data.analytics;
            marketingToggle.checked = data.marketing;
        } else {
            analyticsToggle.checked = false;
            marketingToggle.checked = false;
        }
        modalEl.classList.add('is-visible');
    }

    function hideModal() {
        if (modalEl) modalEl.classList.remove('is-visible');
    }

    /* ---------- consent actions ---------- */

    function acceptAll() {
        var data = saveConsent(true, true);
        applyConsent(data);
        hideBanner();
        hideModal();
    }

    function declineAll() {
        var data = saveConsent(false, false);
        applyConsent(data);
        hideBanner();
        hideModal();
    }

    function savePreferences() {
        var analytics = document.getElementById('cookie-toggle-analytics').checked;
        var marketing = document.getElementById('cookie-toggle-marketing').checked;
        var data = saveConsent(analytics, marketing);
        applyConsent(data);
        hideBanner();
        hideModal();
    }

    /* ---------- public API ---------- */

    window.CookieConsent = {
        show: function () {
            showModal();
        },
        acceptAll: acceptAll,
        declineAll: declineAll
    };

    /* ---------- init ---------- */

    function init() {
        var data = getConsent();

        if (data && isConsentValid(data)) {
            applyConsent(data);
        } else {
            showBanner();
        }

        // Footer "Manage Cookies" link
        var manageLink = document.getElementById('manage-cookies');
        if (manageLink) {
            manageLink.addEventListener('click', function (e) {
                e.preventDefault();
                window.CookieConsent.show();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
