(function () {
    'use strict';

    const nav = document.querySelector('.at-price-nav');
    if (!nav) return;

    const toggle = nav.querySelector('.at-price-nav__toggle');
    const list = nav.querySelector('ul');
    const links = Array.from(list.querySelectorAll('a'));
    const sections = links.map(link => document.getElementById(link.hash.slice(1)));
    const mobile = window.matchMedia('(max-width: 799px)');
    const header = document.getElementById('at-header');

    function setOpen(open) {
        toggle.setAttribute('aria-expanded', String(open));
        list.hidden = mobile.matches && !open;
    }

    function respond() {
        toggle.hidden = !mobile.matches;
        setOpen(false);
    }

    function updateCurrent() {
        const threshold = (header ? header.offsetHeight : 0) + (mobile.matches ? toggle.offsetHeight : 0) + 24;
        let current = 0;
        sections.forEach((section, index) => {
            if (section.getBoundingClientRect().top <= threshold) current = index;
        });
        links.forEach((link, index) => {
            if (index === current) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }

    // Keep the navigation as ordinary anchor links until the mobile disclosure is ready.
    nav.classList.add('is-enhanced');
    respond();
    updateCurrent();

    toggle.addEventListener('click', () => setOpen(list.hidden));
    list.addEventListener('click', event => {
        if (mobile.matches && event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', event => {
        if (mobile.matches && !nav.contains(event.target)) setOpen(false);
    });
    nav.addEventListener('focusout', event => {
        if (mobile.matches && !nav.contains(event.relatedTarget)) setOpen(false);
    });
    nav.addEventListener('keydown', event => {
        if (event.key === 'Escape' && mobile.matches && !list.hidden) {
            setOpen(false);
            toggle.focus();
        }
    });
    if (mobile.addEventListener) mobile.addEventListener('change', respond);
    else mobile.addListener(respond);

    let scheduled = false;
    function scheduleCurrent() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            updateCurrent();
            scheduled = false;
        });
    }

    window.addEventListener('scroll', scheduleCurrent, {passive: true});
    window.addEventListener('resize', scheduleCurrent);
})();
