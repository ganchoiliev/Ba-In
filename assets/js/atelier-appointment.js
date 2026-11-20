/* The enquiry still posts to sendemail.php when JavaScript is unavailable. */
(function () {
    'use strict';

    var form = document.getElementById('callback-form');
    if (!form || !window.URLSearchParams) return;

    var service = new URLSearchParams(window.location.search).get('service');
    var select = form.elements.services;
    if (service && select && !select.value) {
        var option = Array.from(select.options).find(function (item) {
            return item.dataset.service === service;
        });
        if (option) option.selected = true;
    }

    if (!window.fetch || !window.FormData) return;

    var button = form.querySelector('[type="submit"]');
    var failure = document.getElementById('callback-failure');
    var success = document.getElementById('callback-success');
    var checkedFields = [form.elements.name, form.elements.phone, form.elements.email];
    form.noValidate = true;

    function validate(field) {
        var valid = field.validity.valid;
        if (field.name === 'name') valid = field.value.trim() !== '';
        if (field.name === 'phone') valid = field.value.replace(/\D/g, '').length >= 6;

        var error = document.getElementById(field.id + '-error');
        error.hidden = valid;
        if (valid) {
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');
        } else {
            field.setAttribute('aria-invalid', 'true');
            field.setAttribute('aria-describedby', error.id);
        }
        return valid;
    }

    checkedFields.forEach(function (field) {
        field.addEventListener('input', function () {
            if (field.hasAttribute('aria-invalid')) validate(field);
        });
    });

    function setPending(pending) {
        button.disabled = pending;
        form.setAttribute('aria-busy', String(pending));
        button.querySelector('[data-submit-label]').hidden = pending;
        button.querySelector('[data-pending-label]').hidden = !pending;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (button.disabled) return;
        failure.hidden = true;
        var invalid = checkedFields.filter(function (field) { return !validate(field); });
        if (invalid.length) {
            invalid[0].focus();
            return;
        }

        setPending(true);
        try {
            var response = await fetch(form.action, {
                method: 'POST',
                body: new URLSearchParams(new FormData(form))
            });
            // The endpoint returns HTTP 200 even on mail failure.
            var result = document.createElement('template');
            result.innerHTML = await response.text();
            if (!response.ok || !result.content.querySelector('.inner.success')) {
                failure.hidden = false;
                return;
            }
        } catch (error) {
            failure.hidden = false;
            return;
        } finally {
            setPending(false);
        }

        form.hidden = true;
        success.hidden = false;
        success.focus();
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'generate_lead', {
                event_category: 'booking',
                // Preserve the historical GA4 label across the redesign.
                event_label: 'appointment-one appointment-one--page section-space-bottom',
                page_path: window.location.pathname
            });
        }
    });
})();
