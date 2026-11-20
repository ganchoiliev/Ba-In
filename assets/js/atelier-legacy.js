/* atelier-legacy.js — behaviour for pages that keep the old content markup
   (blog index, articles, FAQ). Replaces the jQuery theme script and the two
   inline scripts those pages used to carry. Vanilla, no dependencies. */
(function () {
    'use strict';
    var doc = document;

    /* ---- Q&A blocks: one open at a time within a list ---- */
    doc.querySelectorAll('.proc-faq__question').forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.addEventListener('click', function () {
            var item = btn.closest('.proc-faq__item');
            if (!item) return;
            var list = item.parentNode;
            var wasOpen = item.classList.contains('is-open');
            list.querySelectorAll('.proc-faq__item.is-open').forEach(function (el) {
                el.classList.remove('is-open');
                var q = el.querySelector('.proc-faq__question');
                if (q) q.setAttribute('aria-expanded', 'false');
            });
            if (!wasOpen) {
                item.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ---- blog index: category filter and search ---- */
    var cards = doc.querySelectorAll('#blog-cards-container > [data-category]');
    if (cards.length) {
        var filters = doc.querySelectorAll('#category-filter a[data-filter]');
        var show = function (test) {
            cards.forEach(function (card) { card.style.display = test(card) ? '' : 'none'; });
        };
        var setActive = function (link) {
            filters.forEach(function (l) {
                l.classList.toggle('active', l === link);
                l.setAttribute('aria-pressed', l === link ? 'true' : 'false');
            });
        };
        filters.forEach(function (link) {
            // counts come from the cards on the page, so they stay right when a post is added
            var f = link.getAttribute('data-filter'), count = link.querySelector('.at-count'), n = 0;
            cards.forEach(function (card) {
                if (f === 'all' || (card.getAttribute('data-category') || '').split(' ').indexOf(f) !== -1) n++;
            });
            if (count) count.textContent = '(' + n + ')';
            link.setAttribute('role', 'button');
            link.setAttribute('aria-pressed', link.classList.contains('active') ? 'true' : 'false');
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var f = link.getAttribute('data-filter');
                setActive(link);
                show(function (card) {
                    return f === 'all' || (card.getAttribute('data-category') || '').split(' ').indexOf(f) !== -1;
                });
            });
        });
        var form = doc.getElementById('blog-search-form');
        var input = doc.getElementById('blog-search-input');
        if (form && input) {
            var search = function () {
                var q = input.value.toLowerCase().trim();
                setActive(doc.querySelector('#category-filter a[data-filter="all"]'));
                show(function (card) {
                    return !q || card.textContent.toLowerCase().indexOf(q) !== -1;
                });
            };
            form.addEventListener('submit', function (e) { e.preventDefault(); search(); });
            input.addEventListener('input', search);
        }
    }
})();
