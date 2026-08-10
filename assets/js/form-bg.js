/**
 * form-bg.js — Bulgarian validation and a real success state for the three
 * booking forms (index.html, appointment.html, contact.html).
 *
 * WHAT WAS WRONG
 * mediox.js calls jQuery Validate on `.contact-form-validated` with English
 * defaults, so a Bulgarian woman who fumbled the booking form for a permanent
 * facial procedure was told "This field is required." — in English, at a
 * measured 2.32:1 contrast. Its submitHandler appended the raw PHP response to
 * a `.result` div below the fold and never cleared it, so repeat submissions
 * stacked; on success the text inputs cleared but the two <select>s kept their
 * values, leaving the form looking half-sent.
 *
 * WHAT THIS DOES
 *  - Bulgarian messages. $.validator.messages is read at validation time, so
 *    overriding it here reaches the validators mediox.js already constructed.
 *  - Rules that match how this business is actually contacted: name plus a
 *    phone number. Email becomes optional (still format-checked when filled)
 *    and the free-text message stops being mandatory. Nobody should have to
 *    compose a paragraph before they can ask for a slot.
 *    assets/inc/sendemail.php was changed to match — it now accepts a booking
 *    with a phone number and no email. Do not revert one without the other.
 *  - A submit path with a pending state, a single non-stacking result, and a
 *    success panel that replaces the form and takes focus.
 *
 * LOAD ORDER: must come after jquery.validate and after mediox.js, so the
 * validator instance exists and its settings can be adjusted.
 */
(function () {
    'use strict';

    var $ = window.jQuery;
    if (!$ || !$.fn || !$.fn.validate) return;

    var MESSAGES = {
        required: 'Моля, попълнете това поле.',
        email: 'Моля, въведете валиден имейл адрес.',
        minlength: $.validator.format('Въведете поне {0} символа.'),
        maxlength: $.validator.format('Не повече от {0} символа.'),
        number: 'Моля, въведете число.',
        digits: 'Моля, използвайте само цифри.'
    };

    var TEXT = {
        phoneRequired: 'Моля, въведете телефон, за да се свържем с вас.',
        phoneShort: 'Телефонният номер изглежда твърде кратък.',
        sending: 'Изпращане…',
        failed: 'Съобщението не можа да бъде изпратено. Моля, опитайте отново или ни се обадете на +359 89 339 8390.',
        successTitle: 'Благодарим ви!',
        successBody: 'Получихме запитването ви. Ще се свържем с вас, за да потвърдим удобен час.',
        successMeta: 'Ако бързате, обадете се на +359 89 339 8390.'
    };

    $.extend($.validator.messages, MESSAGES);

    function fieldsOf($form) {
        return {
            phone: $form.find('[name="phone"]'),
            email: $form.find('[name="email"]'),
            message: $form.find('[name="message"]')
        };
    }

    function showSuccess($form) {
        var $panel = $(
            '<div class="form-success" role="status" tabindex="-1">' +
            '<p class="form-success__title"></p>' +
            '<p class="form-success__body"></p>' +
            '<p class="form-success__meta"></p>' +
            '</div>'
        );
        // .text() rather than .html() — the panel is ours, but the habit keeps
        // any future server-supplied string from becoming markup.
        $panel.find('.form-success__title').text(TEXT.successTitle);
        $panel.find('.form-success__body').text(TEXT.successBody);
        $panel.find('.form-success__meta').text(TEXT.successMeta);

        $form.attr('hidden', 'hidden').before($panel);
        // Focus moves so the confirmation is announced and so the visitor is
        // not left staring at the space where the form used to be.
        $panel[0].focus();
        if ($panel[0].scrollIntoView) {
            $panel[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }

    function showFailure($form) {
        var $box = $form.find('.form-sendfail');
        if (!$box.length) {
            $box = $('<p class="form-sendfail" role="alert"></p>');
            $form.find('button[type="submit"]').closest('.form-one__control').prepend($box);
        }
        $box.text(TEXT.failed);
    }

    function wire(form) {
        var $form = $(form);
        var validator = $form.data('validator');
        if (!validator || $form.data('bgWired')) return;
        $form.data('bgWired', true);

        var f = fieldsOf($form);

        if (f.phone.length) {
            f.phone.rules('add', {
                required: true,
                minlength: 6,
                messages: { required: TEXT.phoneRequired, minlength: TEXT.phoneShort }
            });
        }
        if (f.email.length) f.email.rules('remove', 'required');
        if (f.message.length) f.message.rules('remove', 'required');

        // Errors as spans, not <label for>. The old <label class="error"
        // for="name"> pointed at ids that did not exist and competed with the
        // real field labels for the accessible name.
        validator.settings.errorElement = 'span';
        validator.settings.errorClass = 'form-error';
        validator.settings.validClass = 'form-valid';
        validator.settings.focusInvalid = true;

        validator.settings.submitHandler = function (el) {
            var $f = $(el);
            if ($f.data('sending')) return false;

            var $btn = $f.find('button[type="submit"]');
            var $label = $btn.find('span').first();
            var original = $label.text();

            $f.data('sending', true);
            $btn.prop('disabled', true).attr('aria-busy', 'true');
            $label.text(TEXT.sending);
            $f.find('.form-sendfail').remove();

            $.post($f.attr('action'), $f.serialize())
                .done(function (response) {
                    // sendemail.php answers 200 for both outcomes and signals
                    // the result in the markup it echoes, so the body is the
                    // only reliable signal.
                    if (String(response).indexOf('success') !== -1) showSuccess($f);
                    else showFailure($f);
                })
                .fail(function () { showFailure($f); })
                .always(function () {
                    $f.data('sending', false);
                    $btn.prop('disabled', false).removeAttr('aria-busy');
                    $label.text(original);
                });

            return false;
        };
    }

    function init() {
        $('.contact-form-validated').each(function () { wire(this); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
