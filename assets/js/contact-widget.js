/* ============================================================
   contact-widget.js — WhatsApp / Viber toggle
   Beauty Atelier IN
   ============================================================ */

(function () {
    'use strict';

    function init() {
        var widget = document.querySelector('.contact-widget');
        var toggle = document.querySelector('.contact-widget__toggle');
        if (!widget || !toggle) return;

        toggle.addEventListener('click', function () {
            widget.classList.toggle('is-open');
        });

        /* Close when clicking outside */
        document.addEventListener('click', function (e) {
            if (!widget.contains(e.target)) {
                widget.classList.remove('is-open');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
