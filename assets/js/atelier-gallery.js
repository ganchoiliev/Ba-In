/* The links open the original media even without JavaScript. */
(function () {
    'use strict';
    const grid = document.getElementById('galleryGrid');
    const select = document.getElementById('galleryFilter');
    const more = document.getElementById('galleryLoadMore');
    const dialog = document.getElementById('galleryViewer');
    const media = document.getElementById('galleryMedia');
    const caption = document.getElementById('galleryCaption');
    const links = Array.from(grid.querySelectorAll('.at-photo'));
    const batch = 12;
    let filtered = [];
    let visible = 0;
    let current = 0;

    function updateGrid() {
        const subset = new Set(filtered.slice(0, visible));
        links.forEach(link => { link.hidden = !subset.has(link); });
        document.getElementById('galleryShown').textContent = visible;
        document.getElementById('galleryTotal').textContent = filtered.length;
        more.hidden = visible >= filtered.length;
    }

    function updateOptionLabels() {
        for (const option of select.options) {
            option.label = option.textContent + ' · ' + option.dataset.count;
        }
    }
    updateOptionLabels();
    new MutationObserver(updateOptionLabels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    function loadFilter() {
        if (dialog.open) dialog.close();
        current = 0;
        const fragment = location.hash.slice(1);
        const category = Array.from(select.options).some(option => option.value === fragment) ? fragment : 'all';
        select.value = category;
        filtered = links.filter(link => category === 'all' || category === link.dataset.category ||
            (category === 'videos' && link.dataset.kind === 'video'));
        visible = Math.min(batch, filtered.length);
        updateGrid();
    }

    select.addEventListener('change', () => {
        const url = new URL(location.href);
        url.hash = select.value === 'all' ? '' : select.value;
        history.pushState(null, '', url);
        loadFilter();
    });
    window.addEventListener('popstate', loadFilter);
    window.addEventListener('hashchange', loadFilter);
    more.addEventListener('click', () => {
        const firstNew = filtered[visible];
        visible = Math.min(visible + batch, filtered.length);
        updateGrid();
        if (firstNew) firstNew.focus();
    });

    loadFilter();
    select.closest('.at-gallery__control').hidden = false;
    more.closest('.at-gallery__paging').hidden = false;
    if (typeof dialog.showModal !== 'function') return;

    function clearMedia() {
        const oldVideo = media.querySelector('video');
        if (oldVideo) {
            oldVideo.pause();
            oldVideo.removeAttribute('src');
            oldVideo.load();
        }
        media.replaceChildren();
    }

    function showMedia(index) {
        clearMedia();
        current = (index + filtered.length) % filtered.length;
        const link = filtered[current];
        const isVideo = link.dataset.kind === 'video';
        const item = document.createElement(isVideo ? 'video' : 'img');
        if (isVideo) {
            item.controls = true;
            item.playsInline = true;
            item.poster = link.querySelector('img').src;
        } else {
            item.alt = '';
        }
        item.src = link.href;
        item.setAttribute('aria-labelledby', caption.id);
        media.append(item);
        if (isVideo) item.play().catch(() => { /* Native controls remain available. */ });
        const text = link.querySelector('.at-photo__caption');
        caption.classList.toggle('at-photo__caption--translated', text.classList.contains('at-photo__caption--translated'));
        caption.replaceChildren(...Array.from(text.children, span => span.cloneNode(true)));
        document.getElementById('galleryPosition').textContent = (current + 1) + ' / ' + filtered.length;
        document.querySelector('.at-viewer__nav').hidden = filtered.length === 1;
    }

    grid.addEventListener('click', event => {
        const link = event.target.closest('.at-photo');
        if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const index = filtered.indexOf(link);
        if (index < 0) return;
        event.preventDefault();
        showMedia(index);
        dialog.showModal();
    });
    document.getElementById('galleryClose').addEventListener('click', () => dialog.close());
    document.getElementById('galleryPrev').addEventListener('click', () => showMedia(current - 1));
    document.getElementById('galleryNext').addEventListener('click', () => showMedia(current + 1));
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', event => {
        if (event.target.tagName === 'VIDEO') return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            showMedia(current + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });
    dialog.addEventListener('close', () => {
        clearMedia();
        if (current >= visible) {
            visible = Math.min(filtered.length, Math.ceil((current + 1) / batch) * batch);
            updateGrid();
        }
        if (filtered[current]) filtered[current].focus();
    });

    // Keep pinch zoom and native video seeking available.
    let gesture;
    media.addEventListener('touchstart', event => {
        gesture = event.touches.length === 1 && !event.target.closest('video') ? event.touches[0] : null;
    }, { passive: true });
    media.addEventListener('touchcancel', () => { gesture = null; });
    media.addEventListener('touchend', event => {
        if (!gesture || event.touches.length) return;
        const x = event.changedTouches[0].clientX - gesture.clientX;
        const y = event.changedTouches[0].clientY - gesture.clientY;
        gesture = null;
        if (Math.abs(x) > 60 && Math.abs(x) > Math.abs(y) * 1.5) showMedia(current + (x < 0 ? 1 : -1));
        else if (y > 100 && y > Math.abs(x) * 1.5) dialog.close();
    }, { passive: true });
})();
