/* atelier.js — behaviour for the .at-* design system. Vanilla, no dependencies.
   Everything degrades to a working page without it: the nav links, the booking
   links and the results reel (native horizontal scroll) all work with JS off. */
(function () {
    'use strict';

    var doc = document, root = doc.documentElement, body = doc.body;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- current page ---- */
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    doc.querySelectorAll('.at-nav a, .at-drawer__nav a').forEach(function (a) {
        var href = (a.getAttribute('href') || '').toLowerCase();
        if (href === here) a.setAttribute('aria-current', 'page');
    });

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
        // keep focus inside the open drawer + the header that carries its close button
        doc.addEventListener('focusin', function (e) {
            if (burger.getAttribute('aria-expanded') !== 'true') return;
            if (!drawer.contains(e.target) && !(header && header.contains(e.target))) burger.focus();
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
            body.classList.toggle('at-bar-on', on);
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

    /* ---- results reel: buttons are an enhancement over native scroll ---- */
    doc.querySelectorAll('[data-at-reel]').forEach(function (reel) {
        var track = reel.querySelector('.at-reel__track');
        var scope = reel.closest('section') || reel;
        var prev = scope.querySelector('[data-at-reel-prev]');
        var next = scope.querySelector('[data-at-reel-next]');
        if (!track || !prev || !next) return;
        var step = function () {
            var card = track.querySelector('.at-shot');
            return card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16) : 320;
        };
        var sync = function () {
            prev.disabled = track.scrollLeft < 8;
            next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
        };
        prev.addEventListener('click', function () { track.scrollBy({ left: -step() * 2, behavior: reduce ? 'auto' : 'smooth' }); });
        next.addEventListener('click', function () { track.scrollBy({ left: step() * 2, behavior: reduce ? 'auto' : 'smooth' }); });
        track.addEventListener('scroll', sync, { passive: true });
        window.addEventListener('resize', sync);
        sync();
    });

    /* ---- footer year ---- */
    doc.querySelectorAll('.at-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
