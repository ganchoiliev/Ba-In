/* atelier.js — behaviour for the .at-* design system. Vanilla, no dependencies.
   Navigation, booking links and native page controls also work with JavaScript off. */
(function () {
    'use strict';

    var doc = document, body = doc.body;

    /* ---- header hairline once the page has moved ---- */
    var header = doc.getElementById('at-header');
    if (header) {
        var stuck = false;
        var onScroll = function () {
            var s = window.scrollY > 8;
            if (s !== stuck) { stuck = s; header.classList.toggle('is-stuck', s); }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ---- drawer ---- */
    var burger = doc.getElementById('at-burger');
    var drawer = doc.getElementById('at-drawer');
    if (burger && drawer) {
        var setOpen = function (open) {
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
            drawer.classList.toggle('is-open', open);
            drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
            if ('inert' in drawer) drawer.inert = !open;
            body.classList.toggle('at-nav-open', open);
            body.classList.toggle('at-locked', open);
        };
        setOpen(false);
        burger.addEventListener('click', function () {
            setOpen(burger.getAttribute('aria-expanded') !== 'true');
        });
        drawer.addEventListener('click', function (e) {
            if (e.target.closest && e.target.closest('a')) setOpen(false);
        });
        doc.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
                setOpen(false);
                burger.focus();
            }
        });
        // Close the disclosure when keyboard focus moves to another control.
        doc.addEventListener('focusin', function (e) {
            if (burger.getAttribute('aria-expanded') !== 'true') return;
            if (!drawer.contains(e.target) && !(header && header.contains(e.target))) setOpen(false);
        });
        var mq = window.matchMedia('(min-width: 1120px)');
        var onMq = function () { if (mq.matches) setOpen(false); };
        if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
    }

    /* ---- mobile booking bar ----
       Shown once the first booking button has scrolled away, hidden again while
       the page's own booking buttons ([data-at-bar-stop]) are on screen: two
       identical buttons stacked is noise. Pages without a [data-at-bar-start]
       show it after 400px. */
    var bar = doc.getElementById('at-bar');
    if (bar) {
        body.classList.add('at-has-bar');
        var past = false, atBooking = false;
        var render = function () {
            var on = past && !atBooking;
            bar.classList.toggle('is-on', on);
            bar.toggleAttribute('inert', !on);
            body.classList.toggle('at-bar-on', on);
            // before the first scroll the chat button would sit on the hero's own
            // buttons on a small phone, so it waits until the hero has gone
            body.classList.toggle('at-top', !past);
        };
        var start = doc.querySelector('[data-at-bar-start]');
        var stop = doc.querySelector('[data-at-bar-stop]');
        if ('IntersectionObserver' in window && start) {
            new IntersectionObserver(function (es) {
                es.forEach(function (e) { past = !e.isIntersecting && e.boundingClientRect.top < 0; });
                render();
            }).observe(start);
        } else {
            window.addEventListener('scroll', function () { past = window.scrollY > 400; render(); }, { passive: true });
            past = window.scrollY > 400;
        }
        if ('IntersectionObserver' in window && stop) {
            new IntersectionObserver(function (es) {
                es.forEach(function (e) { atBooking = e.isIntersecting; });
                render();
            }, { rootMargin: '0px 0px -72px 0px' }).observe(stop);
        }
        render();
    }

    /* ---- homepage price groups ----
       The first group is open in the HTML. On a wide screen there is room for
       all of them, and a closed list there is just an empty black field. */
    if (window.matchMedia('(min-width: 900px)').matches) {
        doc.querySelectorAll('.at-service-menu__group').forEach(function (d) { d.open = true; });
    }

    /* ---- footer year ---- */
    doc.querySelectorAll('.at-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
