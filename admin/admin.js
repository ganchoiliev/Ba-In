/**
 * Blog Admin Dashboard — Client Logic
 * Beauty Atelier IN
 */

// ─── Config ─────────────────────────────────
const SUPABASE_URL = 'https://hovzlyvvvmmvgzbdmkyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdnpseXZ2dm1tdmd6YmRta3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjgzNDIsImV4cCI6MjA4ODY0NDM0Mn0.EdP9Ozwh2HSgH7XZetPwwobdFu5ytVanLR1QXV7oI8E';
const ADMIN_PASS_HASH = '5b9fe95f2cc09ae79d81c6cf730b9b11f233d46cda718fa7d41ce8d5c5c11b50c'; // sha256 of 'Nikol84!'

// ─── State ──────────────────────────────────
let posts = [];
let currentFilter = 'all';
let currentDraftId = null;

// ─── Supabase REST helpers ──────────────────
async function supabaseGet(table, query = '') {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}&order=created_at.desc`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
    });
    if (!res.ok) throw new Error(`Supabase GET error: ${res.status}`);
    return res.json();
}

async function supabasePatch(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Supabase PATCH error: ${res.status}`);
    return res.json();
}

async function supabaseDelete(table, id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
    });
    if (!res.ok) throw new Error(`Supabase DELETE error: ${res.status}`);
}

async function callEdgeFunction(name, body = {}) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Edge function error: ${res.status}`);
    return data;
}

// ─── SHA-256 helper ─────────────────────────
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Auth ───────────────────────────────────
const authGate = document.getElementById('auth-gate');
const dashboard = document.getElementById('dashboard');
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');

function checkAuth() {
    const authed = sessionStorage.getItem('blog-admin-auth');
    if (authed === 'true') {
        authGate.style.display = 'none';
        dashboard.style.display = 'block';
        loadPosts();
    }
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = document.getElementById('auth-password').value;
    const hash = await sha256(pass);
    if (hash === ADMIN_PASS_HASH) {
        sessionStorage.setItem('blog-admin-auth', 'true');
        authGate.style.display = 'none';
        dashboard.style.display = 'block';
        loadPosts();
    } else {
        authError.style.display = 'block';
        authError.textContent = 'Грешна парола';
    }
});

// ─── Toast ──────────────────────────────────
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toast-text');
    text.textContent = message;
    toast.className = isError ? 'toast toast--error is-visible' : 'toast is-visible';
    setTimeout(() => { toast.classList.remove('is-visible'); }, 4000);
}

// ─── Loading ────────────────────────────────
function showLoading(text = 'Зареждане...') {
    document.getElementById('loading-text').textContent = text;
    document.getElementById('loading-overlay').classList.add('is-visible');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('is-visible');
}

// ─── Load Posts ─────────────────────────────
async function loadPosts() {
    try {
        posts = await supabaseGet('blog_drafts', 'select=*');
        renderStats();
        renderPosts();
    } catch (err) {
        showToast('Грешка при зареждане: ' + err.message, true);
    }
}

// ─── Stats ──────────────────────────────────
function renderStats() {
    const drafts = posts.filter(p => p.status === 'draft').length;
    const approved = posts.filter(p => p.status === 'approved').length;
    const published = posts.filter(p => p.status === 'published').length;

    document.getElementById('stat-drafts').textContent = drafts;
    document.getElementById('stat-approved').textContent = approved;
    document.getElementById('stat-published').textContent = published;
    document.getElementById('stat-total').textContent = posts.length;
}

// ─── Render Post Cards ──────────────────────
function renderPosts() {
    const grid = document.getElementById('posts-grid');
    const empty = document.getElementById('empty-state');
    const filtered = currentFilter === 'all' ? posts : posts.filter(p => p.status === currentFilter);

    if (filtered.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    grid.innerHTML = filtered.map(post => `
        <div class="post-card" data-id="${post.id}">
            <img class="post-card__hero" 
                 src="${post.hero_image_url || '../assets/images/blog/lp-1-1.webp'}" 
                 alt="${post.title}"
                 onerror="this.src='../assets/images/blog/lp-1-1.webp'">
            <div class="post-card__body">
                <span class="post-card__badge post-card__badge--${post.status}">
                    ${post.status === 'draft' ? 'Чернова' : post.status === 'approved' ? 'Одобрен' : 'Публикуван'}
                </span>
                <h3 class="post-card__title">${post.title}</h3>
                <p class="post-card__excerpt">${post.excerpt || ''}</p>
                <div class="post-card__footer">
                    <span class="post-card__category">${post.category}</span>
                    <span class="post-card__date">${new Date(post.created_at).toLocaleDateString('bg-BG')}</span>
                </div>
            </div>
        </div>
    `).join('');

    // Add click handlers
    grid.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', () => openModal(card.dataset.id));
    });
}

// ─── Filter Tabs ────────────────────────────
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelector('.filter-tab.active').classList.remove('active');
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        renderPosts();
    });
});

// ─── Modal ──────────────────────────────────
const modal = document.getElementById('detail-modal');

function openModal(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    currentDraftId = id;

    // Status badge
    const badge = document.getElementById('modal-status');
    badge.textContent = post.status === 'draft' ? 'Чернова' : post.status === 'approved' ? 'Одобрен' : 'Публикуван';
    badge.className = `modal__status-badge post-card__badge--${post.status}`;

    // Header
    document.getElementById('modal-title').textContent = post.title;
    document.getElementById('modal-meta').textContent = `${post.category} • ${new Date(post.created_at).toLocaleDateString('bg-BG')} • ${post.slug}`;

    // Hero
    const heroImg = document.getElementById('modal-hero-img');
    heroImg.src = post.hero_image_url || '../assets/images/blog/lp-1-1.webp';
    heroImg.alt = post.title;

    // Edit fields
    document.getElementById('modal-edit-title').value = post.title;
    document.getElementById('modal-edit-meta-desc').value = post.meta_description || '';
    document.getElementById('modal-edit-keywords').value = post.keywords || '';
    document.getElementById('modal-edit-excerpt').value = post.excerpt || '';
    document.getElementById('modal-edit-content').value = post.content_html || '';

    // Preview
    document.getElementById('content-preview').style.display = 'none';

    // Button visibility based on status
    document.getElementById('btn-approve').style.display = post.status === 'draft' ? '' : 'none';
    document.getElementById('btn-publish').style.display = post.status === 'approved' ? '' : 'none';
    document.getElementById('btn-save').style.display = post.status === 'published' ? 'none' : '';
    document.getElementById('btn-delete').style.display = post.status === 'published' ? 'none' : '';

    // Disable editing for published
    const inputs = modal.querySelectorAll('.modal__input, .modal__textarea');
    inputs.forEach(input => {
        input.disabled = post.status === 'published';
    });

    modal.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('is-visible');
    currentDraftId = null;
    document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
modal.querySelector('.modal__backdrop').addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-visible')) closeModal();
});

// ─── Preview Toggle ─────────────────────────
document.getElementById('btn-toggle-preview').addEventListener('click', () => {
    const preview = document.getElementById('content-preview');
    const content = document.getElementById('modal-edit-content').value;
    if (preview.style.display === 'none' || !preview.style.display) {
        preview.innerHTML = content;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
});

// ─── Save ───────────────────────────────────
document.getElementById('btn-save').addEventListener('click', async () => {
    if (!currentDraftId) return;
    showLoading('Запазване...');
    try {
        await supabasePatch('blog_drafts', currentDraftId, {
            title: document.getElementById('modal-edit-title').value,
            meta_description: document.getElementById('modal-edit-meta-desc').value,
            keywords: document.getElementById('modal-edit-keywords').value,
            excerpt: document.getElementById('modal-edit-excerpt').value,
            content_html: document.getElementById('modal-edit-content').value,
        });
        showToast('Промените са запазени');
        await loadPosts();
        closeModal();
    } catch (err) {
        showToast('Грешка: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

// ─── Approve ────────────────────────────────
document.getElementById('btn-approve').addEventListener('click', async () => {
    if (!currentDraftId) return;
    // Save any edits first, then approve
    showLoading('Одобряване...');
    try {
        await supabasePatch('blog_drafts', currentDraftId, {
            title: document.getElementById('modal-edit-title').value,
            meta_description: document.getElementById('modal-edit-meta-desc').value,
            keywords: document.getElementById('modal-edit-keywords').value,
            excerpt: document.getElementById('modal-edit-excerpt').value,
            content_html: document.getElementById('modal-edit-content').value,
            status: 'approved',
        });
        showToast('Постът е одобрен! Готов за публикуване.');
        await loadPosts();
        closeModal();
    } catch (err) {
        showToast('Грешка: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

// ─── Publish ────────────────────────────────
document.getElementById('btn-publish').addEventListener('click', async () => {
    if (!currentDraftId) return;
    if (!confirm('Сигурни ли сте, че искате да публикувате този пост? Той ще бъде добавен на живия сайт.')) return;

    showLoading('Публикуване... (може да отнеме 10-15 секунди)');
    try {
        const result = await callEdgeFunction('publish-blog-post', { draft_id: currentDraftId });
        showToast(`Публикувано! ${result.url}`);
        await loadPosts();
        closeModal();
    } catch (err) {
        showToast('Грешка при публикуване: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

// ─── Delete ─────────────────────────────────
document.getElementById('btn-delete').addEventListener('click', async () => {
    if (!currentDraftId) return;
    if (!confirm('Сигурни ли сте, че искате да изтриете тази чернова?')) return;

    showLoading('Изтриване...');
    try {
        await supabaseDelete('blog_drafts', currentDraftId);
        showToast('Черновата е изтрита');
        await loadPosts();
        closeModal();
    } catch (err) {
        showToast('Грешка: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

// ─── Generate New ───────────────────────────
document.getElementById('btn-generate').addEventListener('click', async () => {
    showLoading('Генериране на нов пост с AI... (30-60 секунди)');
    try {
        const result = await callEdgeFunction('generate-blog-draft');
        showToast(`Нов пост създаден: "${result.draft.title}"`);
        await loadPosts();
    } catch (err) {
        showToast('Грешка при генериране: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

// ─── Refresh ────────────────────────────────
document.getElementById('btn-refresh').addEventListener('click', () => {
    loadPosts();
    showToast('Обновено');
});

// ─── Init ───────────────────────────────────
checkAuth();
