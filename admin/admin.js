/**
 * Blog Admin Dashboard — Client Logic (PRO Edition)
 * Beauty Atelier IN
 * 
 * Features: Quill WYSIWYG, Scheduling, Tags, Search/Sort,
 * Bulk Actions, Calendar, SEO Score, Diff Preview, Analytics
 */

// ─── Config ─────────────────────────────────
const SUPABASE_URL = 'https://hovzlyvvvmmvgzbdmkyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdnpseXZ2dm1tdmd6YmRta3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjgzNDIsImV4cCI6MjA4ODY0NDM0Mn0.EdP9Ozwh2HSgH7XZetPwwobdFu5ytVanLR1QXV7oI8E';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── State ──────────────────────────────────
let posts = [];
let currentFilter = 'all';
let currentDraftId = null;
let currentSort = 'newest';
let searchQuery = '';
let selectedPosts = new Set();
let quillEditor = null;
let calendarDate = new Date();
let currentView = 'grid'; // 'grid' | 'calendar'
let originalPostSnapshot = null; // for diff

// ─── Auth-aware Supabase REST helpers ───────
async function getAccessToken() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        showToast('Сесията е изтекла. Моля, влезте отново.', true);
        logout();
        throw new Error('No active session');
    }
    return session.access_token;
}

async function supabaseGet(table, query = '') {
    const token = await getAccessToken();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error(`Supabase GET error: ${res.status}`);
    return res.json();
}

async function supabasePatch(table, id, data) {
    const token = await getAccessToken();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Supabase PATCH error: ${res.status}`);
    return res.json();
}

async function supabasePost(table, data) {
    const token = await getAccessToken();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Supabase POST error: ${res.status}`);
    return res.json();
}

async function supabaseDelete(table, id) {
    const token = await getAccessToken();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error(`Supabase DELETE error: ${res.status}`);
}

async function callEdgeFunction(name, body = {}) {
    const token = await getAccessToken();
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Edge function error: ${res.status}`);
    return data;
}

// ─── Auth ───────────────────────────────────
const authGate = document.getElementById('auth-gate');
const dashboard = document.getElementById('dashboard');
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');

async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        authGate.style.display = 'none';
        dashboard.style.display = 'block';
        loadPosts();
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    authGate.style.display = '';
    dashboard.style.display = 'none';
    authError.style.display = 'none';
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-password').value;
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: pass,
    });

    if (error) {
        authError.style.display = 'block';
        authError.textContent = 'Грешен имейл или парола';
    } else {
        authGate.style.display = 'none';
        dashboard.style.display = 'block';
        loadPosts();
    }
});

document.getElementById('btn-logout').addEventListener('click', logout);

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        authGate.style.display = '';
        dashboard.style.display = 'none';
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
        posts = await supabaseGet('blog_drafts', 'select=*&order=created_at.desc');
        renderStats();
        renderAnalytics();
        renderPosts();
        if (currentView === 'calendar') renderCalendar();
        clearSelection();
    } catch (err) {
        showToast('Грешка при зареждане: ' + err.message, true);
    }
}

// ─── Stats ──────────────────────────────────
function renderStats() {
    const drafts = posts.filter(p => p.status === 'draft').length;
    const approved = posts.filter(p => p.status === 'approved').length;
    const scheduled = posts.filter(p => p.status === 'scheduled').length;
    const published = posts.filter(p => p.status === 'published').length;

    document.getElementById('stat-drafts').textContent = drafts;
    document.getElementById('stat-approved').textContent = approved;
    document.getElementById('stat-scheduled').textContent = scheduled;
    document.getElementById('stat-published').textContent = published;
    document.getElementById('stat-total').textContent = posts.length;
}

// ─── Analytics ──────────────────────────────
function renderAnalytics() {
    const publishedPosts = posts.filter(p => p.status === 'published');
    const totalViews = posts.reduce((sum, p) => sum + (p.view_count || 0), 0);
    const avgViews = publishedPosts.length > 0 ? Math.round(totalViews / publishedPosts.length) : 0;
    const bestPost = publishedPosts.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))[0];

    document.getElementById('analytics-total-views').textContent = totalViews.toLocaleString();
    document.getElementById('analytics-avg-views').textContent = avgViews.toLocaleString();
    document.getElementById('analytics-best-post').textContent = bestPost ? (bestPost.title.length > 30 ? bestPost.title.substring(0, 30) + '…' : bestPost.title) : '—';
}

document.getElementById('btn-toggle-analytics').addEventListener('click', () => {
    const panel = document.getElementById('analytics-panel');
    const body = document.getElementById('analytics-body');
    const isOpen = panel.classList.toggle('is-open');
    body.hidden = !isOpen;
});

// ─── Search & Sort ──────────────────────────
function getFilteredSortedPosts() {
    let filtered = currentFilter === 'all' ? [...posts] : posts.filter(p => p.status === currentFilter);

    // Search
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(q) ||
            (p.category && p.category.toLowerCase().includes(q)) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
        );
    }

    // Sort
    switch (currentSort) {
        case 'newest': filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
        case 'oldest': filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
        case 'title-az': filtered.sort((a, b) => a.title.localeCompare(b.title, 'bg')); break;
        case 'title-za': filtered.sort((a, b) => b.title.localeCompare(a.title, 'bg')); break;
        case 'views': filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0)); break;
    }

    return filtered;
}

let searchDebounce = null;
document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
        searchQuery = e.target.value.trim();
        renderPosts();
    }, 300);
});

document.getElementById('sort-select').addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderPosts();
});

// ─── Render Post Cards ──────────────────────
const STATUS_LABELS = {
    draft: 'Чернова',
    approved: 'Одобрен',
    scheduled: 'Планиран',
    published: 'Публикуван',
};

function renderPosts() {
    const grid = document.getElementById('posts-grid');
    const empty = document.getElementById('empty-state');
    const filtered = getFilteredSortedPosts();

    if (filtered.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    grid.innerHTML = filtered.map(post => {
        const isSelected = selectedPosts.has(post.id);
        const tagsHtml = (post.tags && post.tags.length > 0)
            ? `<div class="post-card__tags">${post.tags.slice(0, 3).map(t => `<span class="post-card__tag">${t}</span>`).join('')}${post.tags.length > 3 ? `<span class="post-card__tag post-card__tag--more">+${post.tags.length - 3}</span>` : ''}</div>`
            : '';
        const scheduledHtml = post.status === 'scheduled' && post.scheduled_at
            ? `<span class="post-card__scheduled">🕐 ${new Date(post.scheduled_at).toLocaleString('bg-BG', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>`
            : '';
        const viewsHtml = post.status === 'published' && post.view_count != null
            ? `<span class="post-card__views">👁 ${post.view_count}</span>`
            : '';

        return `
        <div class="post-card ${isSelected ? 'post-card--selected' : ''}" data-id="${post.id}">
            <label class="post-card__checkbox" onclick="event.stopPropagation()">
                <input type="checkbox" ${isSelected ? 'checked' : ''} data-select-id="${post.id}">
            </label>
            <img class="post-card__hero" 
                 src="${post.hero_image_url || '../assets/images/blog/lp-1-1.webp'}" 
                 alt="${post.title}"
                 onerror="this.src='../assets/images/blog/lp-1-1.webp'">
            <div class="post-card__body">
                <span class="post-card__badge post-card__badge--${post.status}">
                    ${STATUS_LABELS[post.status] || post.status}
                </span>
                <h3 class="post-card__title">${post.title}</h3>
                <p class="post-card__excerpt">${post.excerpt || ''}</p>
                ${tagsHtml}
                <div class="post-card__footer">
                    <span class="post-card__category">${post.category || ''}</span>
                    <div class="post-card__footer-right">
                        ${viewsHtml}
                        ${scheduledHtml}
                        <span class="post-card__date">${new Date(post.created_at).toLocaleDateString('bg-BG')}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    }).join('');

    // Card click handlers
    grid.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', () => openModal(card.dataset.id));
    });

    // Checkbox handlers
    grid.querySelectorAll('[data-select-id]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const id = e.target.dataset.selectId;
            if (e.target.checked) {
                selectedPosts.add(id);
            } else {
                selectedPosts.delete(id);
            }
            updateBulkBar();
            // Update card visual
            const card = e.target.closest('.post-card');
            card.classList.toggle('post-card--selected', e.target.checked);
        });
    });
}

// ─── Bulk Actions ───────────────────────────
function updateBulkBar() {
    const bar = document.getElementById('bulk-bar');
    const count = document.getElementById('bulk-count');
    if (selectedPosts.size > 0) {
        bar.hidden = false;
        count.textContent = `${selectedPosts.size} избрани`;
    } else {
        bar.hidden = true;
    }
}

function clearSelection() {
    selectedPosts.clear();
    updateBulkBar();
}

document.getElementById('bulk-select-all').addEventListener('change', (e) => {
    const filtered = getFilteredSortedPosts();
    if (e.target.checked) {
        filtered.forEach(p => selectedPosts.add(p.id));
    } else {
        selectedPosts.clear();
    }
    renderPosts();
    updateBulkBar();
});

document.getElementById('bulk-delete').addEventListener('click', async () => {
    if (selectedPosts.size === 0) return;
    if (!confirm(`Сигурни ли сте, че искате да изтриете ${selectedPosts.size} поста?`)) return;
    showLoading(`Изтриване на ${selectedPosts.size} поста...`);
    try {
        for (const id of selectedPosts) {
            const post = posts.find(p => p.id === id);
            if (post && post.status === 'published') {
                await callEdgeFunction('update-published-post', { action: 'delete', draft_id: id });
            } else {
                await supabaseDelete('blog_drafts', id);
            }
        }
        showToast(`${selectedPosts.size} поста изтрити`);
        clearSelection();
        await loadPosts();
    } catch (err) {
        showToast('Грешка: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

document.getElementById('bulk-set-draft').addEventListener('click', async () => {
    if (selectedPosts.size === 0) return;
    showLoading('Промяна на статус...');
    try {
        for (const id of selectedPosts) {
            await supabasePatch('blog_drafts', id, { status: 'draft' });
        }
        showToast(`${selectedPosts.size} поста върнати в чернови`);
        clearSelection();
        await loadPosts();
    } catch (err) {
        showToast('Грешка: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

document.getElementById('bulk-approve').addEventListener('click', async () => {
    if (selectedPosts.size === 0) return;
    showLoading('Одобряване...');
    try {
        for (const id of selectedPosts) {
            await supabasePatch('blog_drafts', id, { status: 'approved' });
        }
        showToast(`${selectedPosts.size} поста одобрени`);
        clearSelection();
        await loadPosts();
    } catch (err) {
        showToast('Грешка: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

// ─── Filter Tabs ────────────────────────────
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelector('.filter-tab.active').classList.remove('active');
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        renderPosts();
    });
});

// ─── View Toggle (Grid / Calendar) ──────────
document.getElementById('btn-view-grid').addEventListener('click', () => {
    currentView = 'grid';
    document.getElementById('btn-view-grid').classList.add('active');
    document.getElementById('btn-view-calendar').classList.remove('active');
    document.getElementById('posts-grid').hidden = false;
    document.getElementById('calendar-view').hidden = true;
    document.getElementById('empty-state').hidden = true;
    renderPosts();
});

document.getElementById('btn-view-calendar').addEventListener('click', () => {
    currentView = 'calendar';
    document.getElementById('btn-view-calendar').classList.add('active');
    document.getElementById('btn-view-grid').classList.remove('active');
    document.getElementById('posts-grid').hidden = true;
    document.getElementById('empty-state').hidden = true;
    document.getElementById('calendar-view').hidden = false;
    renderCalendar();
});

// ─── Calendar ───────────────────────────────
const MONTH_NAMES_BG = ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'];

function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    document.getElementById('cal-month-label').textContent = `${MONTH_NAMES_BG[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    let startDow = firstDay.getDay(); // 0=Sun
    startDow = startDow === 0 ? 6 : startDow - 1; // Convert to Mon=0

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Get posts for this month
    const monthPosts = posts.filter(p => {
        const d = p.scheduled_at ? new Date(p.scheduled_at) : new Date(p.created_at);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    let html = '';
    // Empty cells for days before month start
    for (let i = 0; i < startDow; i++) {
        html += '<div class="cal-day cal-day--empty"></div>';
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
        const dayPosts = monthPosts.filter(p => {
            const d = p.scheduled_at ? new Date(p.scheduled_at) : new Date(p.created_at);
            return d.getDate() === day;
        });
        const dotsHtml = dayPosts.map(p => `<span class="cal-dot cal-dot--${p.status}" title="${p.title}"></span>`).join('');
        html += `
            <div class="cal-day ${isToday ? 'cal-day--today' : ''} ${dayPosts.length > 0 ? 'cal-day--has-posts' : ''}" data-day="${day}">
                <span class="cal-day__number">${day}</span>
                <div class="cal-day__dots">${dotsHtml}</div>
                ${dayPosts.length > 0 ? `<span class="cal-day__count">${dayPosts.length}</span>` : ''}
            </div>
        `;
    }

    document.getElementById('cal-days').innerHTML = html;

    // Click on day with posts
    document.querySelectorAll('.cal-day--has-posts').forEach(cell => {
        cell.addEventListener('click', () => {
            const day = parseInt(cell.dataset.day);
            const dayPosts = monthPosts.filter(p => {
                const d = p.scheduled_at ? new Date(p.scheduled_at) : new Date(p.created_at);
                return d.getDate() === day;
            });
            if (dayPosts.length === 1) {
                openModal(dayPosts[0].id);
            } else {
                // Show filtered view of that day
                showToast(`${day} ${MONTH_NAMES_BG[month]}: ${dayPosts.map(p => p.title).join(', ')}`);
            }
        });
    });
}

document.getElementById('cal-prev').addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('cal-next').addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
});

// ─── Quill Editor ───────────────────────────
function initQuill() {
    if (quillEditor) return;
    quillEditor = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: 'Напишете съдържанието тук...',
        modules: {
            toolbar: [
                [{ 'header': [2, 3, 4, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                [{ 'align': [] }],
                ['clean']
            ]
        }
    });
}

function syncQuillToTextarea() {
    if (!quillEditor) return;
    const html = quillEditor.root.innerHTML;
    document.getElementById('modal-edit-content').value = (html === '<p><br></p>') ? '' : html;
}

// ─── SEO Score ──────────────────────────────
function updateSEO() {
    const title = document.getElementById('modal-edit-title').value;
    const metaDesc = document.getElementById('modal-edit-meta-desc').value;
    const keywords = document.getElementById('modal-edit-keywords').value;
    const excerpt = document.getElementById('modal-edit-excerpt').value;

    // Character counts
    const titleCount = document.getElementById('title-char-count');
    const metaCount = document.getElementById('meta-char-count');

    titleCount.textContent = `${title.length}/60`;
    titleCount.className = 'char-count' + (title.length <= 60 ? ' char-count--good' : title.length <= 70 ? ' char-count--warn' : ' char-count--bad');

    metaCount.textContent = `${metaDesc.length}/160`;
    metaCount.className = 'char-count' + (metaDesc.length >= 120 && metaDesc.length <= 160 ? ' char-count--good' : metaDesc.length > 0 && metaDesc.length < 120 ? ' char-count--warn' : metaDesc.length > 160 ? ' char-count--bad' : '');

    // SEO Score
    let score = 0;
    const checks = [];

    // Title length (30pts)
    if (title.length > 0 && title.length <= 60) {
        score += 30;
        checks.push({ ok: true, text: `Заглавие: ${title.length} символа ✓ (идеално ≤60)` });
    } else if (title.length > 60 && title.length <= 70) {
        score += 15;
        checks.push({ ok: false, text: `Заглавие: ${title.length} символа ⚠ (малко дълго, идеално ≤60)` });
    } else if (title.length > 70) {
        score += 0;
        checks.push({ ok: false, text: `Заглавие: ${title.length} символа ✗ (твърде дълго, ще бъде отрязано)` });
    } else {
        checks.push({ ok: false, text: 'Заглавие: липсва' });
    }

    // Meta description (25pts)
    if (metaDesc.length >= 120 && metaDesc.length <= 160) {
        score += 25;
        checks.push({ ok: true, text: `Мета описание: ${metaDesc.length} символа ✓ (идеално 120-160)` });
    } else if (metaDesc.length > 0 && metaDesc.length < 120) {
        score += 10;
        checks.push({ ok: false, text: `Мета описание: ${metaDesc.length} символа ⚠ (твърде кратко, идеално 120-160)` });
    } else if (metaDesc.length > 160) {
        score += 10;
        checks.push({ ok: false, text: `Мета описание: ${metaDesc.length} символа ⚠ (ще бъде отрязано, идеално ≤160)` });
    } else {
        checks.push({ ok: false, text: 'Мета описание: липсва' });
    }

    // Keywords (20pts)
    if (keywords.length > 0) {
        score += 10;
        const kwList = keywords.split(',').map(k => k.trim().toLowerCase());
        const titleLower = title.toLowerCase();
        const kwInTitle = kwList.some(kw => kw.length > 2 && titleLower.includes(kw));
        if (kwInTitle) {
            score += 10;
            checks.push({ ok: true, text: 'Ключова дума присъства в заглавието ✓' });
        } else {
            checks.push({ ok: false, text: 'Ключова дума не присъства в заглавието ⚠' });
        }
    } else {
        checks.push({ ok: false, text: 'Ключови думи: липсват' });
    }

    // Excerpt (15pts)
    if (excerpt.length > 0) {
        score += 15;
        checks.push({ ok: true, text: 'Извадка: попълнена ✓' });
    } else {
        checks.push({ ok: false, text: 'Извадка: липсва' });
    }

    // Content (10pts)
    syncQuillToTextarea();
    const content = document.getElementById('modal-edit-content').value;
    if (content.length > 100) {
        score += 10;
        checks.push({ ok: true, text: 'Съдържание: достатъчно дълго ✓' });
    } else if (content.length > 0) {
        score += 5;
        checks.push({ ok: false, text: 'Съдържание: твърде кратко ⚠' });
    } else {
        checks.push({ ok: false, text: 'Съдържание: липсва' });
    }

    // Update UI
    document.getElementById('seo-score').textContent = `${score}/100`;
    document.getElementById('seo-score').className = 'seo-panel__score' + (score >= 70 ? ' seo-panel__score--good' : score >= 40 ? ' seo-panel__score--warn' : ' seo-panel__score--bad');

    const meterFill = document.getElementById('seo-meter-fill');
    meterFill.style.width = `${score}%`;
    meterFill.className = 'seo-panel__meter-fill' + (score >= 70 ? ' seo-panel__meter-fill--good' : score >= 40 ? ' seo-panel__meter-fill--warn' : ' seo-panel__meter-fill--bad');

    document.getElementById('seo-checks').innerHTML = checks.map(c =>
        `<div class="seo-check ${c.ok ? 'seo-check--pass' : 'seo-check--fail'}">${c.text}</div>`
    ).join('');

    // SERP Preview
    document.getElementById('serp-title').textContent = title || 'Заглавие на поста';
    document.getElementById('serp-desc').textContent = metaDesc || 'Няма мета описание...';
    const post = posts.find(p => p.id === currentDraftId);
    if (post) {
        document.getElementById('serp-url').textContent = `beautyatelier.bg › blog › ${post.slug}`;
    }
}

// ─── Tags Chip Input ────────────────────────
let currentTags = [];

function renderTagChips() {
    const container = document.getElementById('tags-chips');
    container.innerHTML = currentTags.map((tag, i) =>
        `<span class="tag-chip">${tag}<button class="tag-chip__remove" data-tag-index="${i}" type="button">×</button></span>`
    ).join('');

    container.querySelectorAll('.tag-chip__remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentTags.splice(parseInt(btn.dataset.tagIndex), 1);
            renderTagChips();
        });
    });
}

document.getElementById('tags-input-field').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const val = e.target.value.trim();
        if (val && !currentTags.includes(val)) {
            currentTags.push(val);
            renderTagChips();
        }
        e.target.value = '';
    }
    if (e.key === 'Backspace' && e.target.value === '' && currentTags.length > 0) {
        currentTags.pop();
        renderTagChips();
    }
});

// ─── Modal ──────────────────────────────────
const modal = document.getElementById('detail-modal');

function openModal(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    currentDraftId = id;

    // Snapshot for diff comparison
    originalPostSnapshot = {
        title: post.title,
        meta_description: post.meta_description || '',
        keywords: post.keywords || '',
        excerpt: post.excerpt || '',
        content_html: post.content_html || '',
        hero_image_url: post.hero_image_url || '',
        category: post.category || 'skincare',
        tags: post.tags ? [...post.tags] : [],
    };

    // Status badge
    const badge = document.getElementById('modal-status');
    badge.textContent = STATUS_LABELS[post.status] || post.status;
    badge.className = `modal__status-badge post-card__badge--${post.status}`;

    // Header
    document.getElementById('modal-title').textContent = post.title;
    document.getElementById('modal-meta').textContent = `${post.category || ''} • ${new Date(post.created_at).toLocaleDateString('bg-BG')} • ${post.slug}`;

    // Hero
    const heroImg = document.getElementById('modal-hero-img');
    heroImg.src = post.hero_image_url || '../assets/images/blog/lp-1-1.webp';
    heroImg.alt = post.title;
    document.getElementById('modal-edit-hero-url').value = post.hero_image_url || '';

    // Edit fields
    document.getElementById('modal-edit-title').value = post.title;
    document.getElementById('modal-edit-meta-desc').value = post.meta_description || '';
    document.getElementById('modal-edit-keywords').value = post.keywords || '';
    document.getElementById('modal-edit-excerpt').value = post.excerpt || '';
    document.getElementById('modal-edit-content').value = post.content_html || '';

    // Category
    document.getElementById('modal-edit-category').value = post.category || 'skincare';

    // Scheduled date
    if (post.scheduled_at) {
        const d = new Date(post.scheduled_at);
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.getElementById('modal-edit-scheduled').value = local;
    } else {
        document.getElementById('modal-edit-scheduled').value = '';
    }

    // Tags
    currentTags = post.tags ? [...post.tags] : [];
    renderTagChips();

    // Quill editor
    initQuill();
    quillEditor.root.innerHTML = post.content_html || '';

    // Preview
    document.getElementById('content-preview').style.display = 'none';

    // Button visibility based on status
    document.getElementById('btn-approve').style.display = (post.status === 'draft' || post.status === 'scheduled') ? '' : 'none';
    document.getElementById('btn-publish').style.display = (post.status === 'approved' || post.status === 'scheduled') ? '' : 'none';
    document.getElementById('btn-schedule').style.display = (post.status === 'draft' || post.status === 'approved') ? '' : 'none';
    document.getElementById('btn-save').style.display = post.status !== 'published' ? '' : 'none';
    document.getElementById('btn-update-live').style.display = post.status === 'published' ? '' : 'none';
    document.getElementById('btn-delete').style.display = '';

    // All fields always editable
    const inputs = modal.querySelectorAll('.modal__input, .modal__textarea, .modal__select');
    inputs.forEach(input => { input.disabled = false; });

    // Load version history
    loadVersions(id);
    const historyPanel = document.getElementById('version-history');
    historyPanel.classList.remove('is-open');
    document.getElementById('version-list').hidden = true;

    // SEO
    updateSEO();

    modal.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.remove('is-visible');
    currentDraftId = null;
    originalPostSnapshot = null;
    document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click', closeModal);
modal.querySelector('.modal__backdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('diff-modal').classList.contains('is-visible')) {
            closeDiffModal();
        } else if (modal.classList.contains('is-visible')) {
            closeModal();
        }
    }
});

// SEO updates on input
['modal-edit-title', 'modal-edit-meta-desc', 'modal-edit-keywords', 'modal-edit-excerpt'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateSEO);
});

// ─── Preview Toggle ─────────────────────────
document.getElementById('btn-toggle-preview').addEventListener('click', () => {
    const preview = document.getElementById('content-preview');
    syncQuillToTextarea();
    const content = document.getElementById('modal-edit-content').value;
    if (preview.style.display === 'none' || !preview.style.display) {
        preview.innerHTML = content;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
});

// ─── Get Current Form Data ──────────────────
function getCurrentFormData() {
    syncQuillToTextarea();
    return {
        title: document.getElementById('modal-edit-title').value,
        meta_description: document.getElementById('modal-edit-meta-desc').value,
        keywords: document.getElementById('modal-edit-keywords').value,
        excerpt: document.getElementById('modal-edit-excerpt').value,
        content_html: document.getElementById('modal-edit-content').value,
        hero_image_url: document.getElementById('modal-edit-hero-url').value,
        category: document.getElementById('modal-edit-category').value,
        tags: [...currentTags],
    };
}

// ─── Save ───────────────────────────────────
document.getElementById('btn-save').addEventListener('click', async () => {
    if (!currentDraftId) return;
    showLoading('Запазване...');
    try {
        const data = getCurrentFormData();
        await saveVersion(currentDraftId, 'Запазване');
        await supabasePatch('blog_drafts', currentDraftId, data);
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
    showLoading('Одобряване...');
    try {
        const data = getCurrentFormData();
        await saveVersion(currentDraftId, 'Преди одобрение');
        await supabasePatch('blog_drafts', currentDraftId, { ...data, status: 'approved' });
        showToast('Постът е одобрен! Готов за публикуване.');
        await loadPosts();
        closeModal();
    } catch (err) {
        showToast('Грешка: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

// ─── Schedule ───────────────────────────────
document.getElementById('btn-schedule').addEventListener('click', async () => {
    if (!currentDraftId) return;
    const scheduledInput = document.getElementById('modal-edit-scheduled').value;
    if (!scheduledInput) {
        showToast('Моля, изберете дата и час за публикуване.', true);
        document.getElementById('modal-edit-scheduled').focus();
        return;
    }
    const scheduledAt = new Date(scheduledInput).toISOString();
    showLoading('Планиране...');
    try {
        const data = getCurrentFormData();
        await saveVersion(currentDraftId, 'Планиране');
        await supabasePatch('blog_drafts', currentDraftId, {
            ...data,
            status: 'scheduled',
            scheduled_at: scheduledAt,
        });
        showToast(`Планирано за ${new Date(scheduledAt).toLocaleString('bg-BG')}`);
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
        const data = getCurrentFormData();
        await saveVersion(currentDraftId, 'Преди публикуване');
        // Save form data first
        await supabasePatch('blog_drafts', currentDraftId, data);
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
    const post = posts.find(p => p.id === currentDraftId);
    const isPublished = post && post.status === 'published';

    const msg = isPublished
        ? 'ВНИМАНИЕ: Това ще изтрие поста от живия сайт (GitHub), Supabase и hero изображението. Това е необратимо! Продължи?'
        : 'Сигурни ли сте, че искате да изтриете тази чернова?';

    if (!confirm(msg)) return;

    showLoading(isPublished ? 'Изтриване от живия сайт... (10-15 секунди)' : 'Изтриване...');
    try {
        const result = await callEdgeFunction('update-published-post', { action: 'delete', draft_id: currentDraftId });
        showToast(result.message || 'Изтрито успешно');
        await loadPosts();
        closeModal();
    } catch (err) {
        showToast('Грешка при изтриване: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

// ─── Change Diff & Update Live ──────────────
function buildDiff() {
    if (!originalPostSnapshot) return null;
    const current = getCurrentFormData();
    const changes = [];

    const FIELD_LABELS = {
        title: 'Заглавие',
        meta_description: 'Мета описание',
        keywords: 'Ключови думи',
        excerpt: 'Извадка',
        content_html: 'Съдържание',
        hero_image_url: 'Hero Image',
        category: 'Категория',
        tags: 'Тагове',
    };

    for (const key of Object.keys(FIELD_LABELS)) {
        const oldVal = key === 'tags' ? (originalPostSnapshot[key] || []).join(', ') : (originalPostSnapshot[key] || '');
        const newVal = key === 'tags' ? (current[key] || []).join(', ') : (current[key] || '');
        if (oldVal !== newVal) {
            changes.push({
                field: FIELD_LABELS[key],
                oldVal: key === 'content_html' ? `(${oldVal.length} символа)` : (oldVal.length > 120 ? oldVal.substring(0, 120) + '…' : oldVal),
                newVal: key === 'content_html' ? `(${newVal.length} символа)` : (newVal.length > 120 ? newVal.substring(0, 120) + '…' : newVal),
            });
        }
    }

    return changes;
}

function openDiffModal(changes) {
    const diffBody = document.getElementById('diff-body');
    if (changes.length === 0) {
        diffBody.innerHTML = '<div class="diff-empty">Няма промени за обновяване.</div>';
        document.getElementById('diff-confirm').style.display = 'none';
    } else {
        diffBody.innerHTML = changes.map(c => `
            <div class="diff-entry">
                <div class="diff-entry__field">${c.field}</div>
                <div class="diff-entry__old"><span class="diff-label">Преди:</span> ${c.oldVal || '<em>празно</em>'}</div>
                <div class="diff-entry__new"><span class="diff-label">След:</span> ${c.newVal || '<em>празно</em>'}</div>
            </div>
        `).join('');
        document.getElementById('diff-confirm').style.display = '';
    }

    document.getElementById('diff-modal').classList.add('is-visible');
}

function closeDiffModal() {
    document.getElementById('diff-modal').classList.remove('is-visible');
}

document.getElementById('diff-modal-close').addEventListener('click', closeDiffModal);
document.getElementById('diff-modal-backdrop').addEventListener('click', closeDiffModal);
document.getElementById('diff-cancel').addEventListener('click', closeDiffModal);

document.getElementById('btn-update-live').addEventListener('click', () => {
    if (!currentDraftId) return;
    syncQuillToTextarea();
    const changes = buildDiff();
    if (changes.length === 0) {
        showToast('Няма промени за обновяване.', false);
        return;
    }
    openDiffModal(changes);
});

document.getElementById('diff-confirm').addEventListener('click', async () => {
    closeDiffModal();
    if (!currentDraftId) return;

    showLoading('Запазване и обновяване на живия сайт... (10-15 секунди)');
    try {
        const data = getCurrentFormData();
        await saveVersion(currentDraftId, 'Преди обновяване на живо');
        await supabasePatch('blog_drafts', currentDraftId, data);
        const result = await callEdgeFunction('update-published-post', { action: 'update', draft_id: currentDraftId });
        showToast(`Обновено! ${result.url}`);
        await loadPosts();
        closeModal();
    } catch (err) {
        showToast('Грешка при обновяване: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

// ─── Toggle AI Prompt Panel ─────────────────
document.getElementById('btn-toggle-ai-prompt').addEventListener('click', () => {
    const panel = document.getElementById('ai-prompt-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});

// ─── Generate Hero with Custom Prompt ───────
document.getElementById('btn-generate-ai-image').addEventListener('click', async () => {
    if (!currentDraftId) return;
    const prompt = document.getElementById('ai-image-prompt').value.trim();
    if (!prompt) {
        showToast('Моля, въведете описание на изображението.', true);
        return;
    }

    showLoading('Генериране на изображение с DALL·E 3... (15-30 секунди)');
    try {
        const result = await callEdgeFunction('update-published-post', { 
            action: 'regenerate-hero', 
            draft_id: currentDraftId,
            custom_prompt: prompt
        });
        document.getElementById('modal-hero-img').src = result.hero_image_url;
        document.getElementById('modal-edit-hero-url').value = result.hero_image_url;
        showToast('Изображението е генерирано! Натиснете "Обнови на Живо" за да го публикувате.');
        await loadPosts();
    } catch (err) {
        showToast('Грешка при генериране: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

// ─── Regenerate Hero (auto prompt from title) ─
document.getElementById('btn-regenerate-hero').addEventListener('click', async () => {
    if (!currentDraftId) return;
    if (!confirm('Това ще генерира ново AI изображение автоматично от заглавието. Продължи?')) return;

    showLoading('Генериране на ново hero изображение... (15-30 секунди)');
    try {
        const result = await callEdgeFunction('update-published-post', { action: 'regenerate-hero', draft_id: currentDraftId });
        document.getElementById('modal-hero-img').src = result.hero_image_url;
        document.getElementById('modal-edit-hero-url').value = result.hero_image_url;
        showToast('Нов hero image генериран! Натиснете "Обнови на Живо" за да го публикувате.');
        await loadPosts();
    } catch (err) {
        showToast('Грешка при генериране: ' + err.message, true);
    } finally {
        hideLoading();
    }
});

// ─── Hero URL live preview ──────────────────
document.getElementById('modal-edit-hero-url').addEventListener('change', () => {
    const url = document.getElementById('modal-edit-hero-url').value;
    if (url) {
        document.getElementById('modal-hero-img').src = url;
    }
});

// ─── Manual Hero Image Upload ───────────────
document.querySelector('label[for="hero-file-upload"]').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('hero-file-upload').click();
});

document.getElementById('hero-file-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!currentDraftId) return;

    const post = posts.find(p => p.id === currentDraftId);
    if (!post) return;

    showLoading('Качване на изображение...');
    try {
        const token = await getAccessToken();
        const fileName = `${post.slug}-hero.${file.name.split('.').pop()}`;

        const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/blog-images/${fileName}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`,
                'x-upsert': 'true',
            },
            body: file,
        });

        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw new Error('Upload failed: ' + errText);
        }

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/blog-images/${fileName}`;

        document.getElementById('modal-hero-img').src = publicUrl;
        document.getElementById('modal-edit-hero-url').value = publicUrl;
        await supabasePatch('blog_drafts', currentDraftId, { hero_image_url: publicUrl });

        showToast('Изображението е качено! Натиснете "Обнови на Живо" за да го публикувате.');
        await loadPosts();
    } catch (err) {
        showToast('Грешка при качване: ' + err.message, true);
    } finally {
        hideLoading();
        e.target.value = '';
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

// ─── Version History ────────────────────────
async function saveVersion(draftId, label = 'Запазване') {
    const post = posts.find(p => p.id === draftId);
    if (!post) return;
    try {
        await supabasePost('blog_draft_versions', {
            draft_id: draftId,
            title: post.title,
            meta_description: post.meta_description,
            keywords: post.keywords,
            excerpt: post.excerpt,
            content_html: post.content_html,
            hero_image_url: post.hero_image_url,
            version_label: label,
        });
        await pruneVersions(draftId);
    } catch (err) {
        console.warn('Version snapshot failed:', err);
    }
}

async function loadVersions(draftId) {
    try {
        const token = await getAccessToken();
        const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_draft_versions?draft_id=eq.${draftId}&order=saved_at.desc&limit=20`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!res.ok) throw new Error('Failed to load versions');
        const versions = await res.json();
        renderVersions(versions);
    } catch (err) {
        console.warn('Failed to load versions:', err);
        renderVersions([]);
    }
}

function renderVersions(versions) {
    const list = document.getElementById('version-list');
    const empty = document.getElementById('version-empty');
    const count = document.getElementById('version-count');

    count.textContent = versions.length;

    if (versions.length === 0) {
        empty.style.display = '';
        list.querySelectorAll('.version-entry').forEach(el => el.remove());
        return;
    }

    empty.style.display = 'none';
    list.querySelectorAll('.version-entry').forEach(el => el.remove());

    versions.forEach(v => {
        const entry = document.createElement('div');
        entry.className = 'version-entry';
        const time = new Date(v.saved_at).toLocaleString('bg-BG', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const titleSnippet = v.title ? (v.title.length > 50 ? v.title.substring(0, 50) + '…' : v.title) : '';
        entry.innerHTML = `
            <div class="version-entry__info">
                <span class="version-entry__time">${time}</span>
                <span class="version-entry__label">${v.version_label || 'Запазване'}</span>
                ${titleSnippet ? `<span class="version-entry__title-preview">"${titleSnippet}"</span>` : ''}
            </div>
            <button class="version-entry__restore" data-version-id="${v.id}">Възстанови</button>
        `;
        entry.querySelector('.version-entry__restore').addEventListener('click', (e) => {
            e.stopPropagation();
            restoreVersion(v);
        });
        list.appendChild(entry);
    });
}

function restoreVersion(version) {
    if (!confirm('Това ще възстанови полетата от тази версия. Промените НЕ се запазват автоматично — прегледайте и натиснете "Запази".')) return;

    document.getElementById('modal-edit-title').value = version.title || '';
    document.getElementById('modal-edit-meta-desc').value = version.meta_description || '';
    document.getElementById('modal-edit-keywords').value = version.keywords || '';
    document.getElementById('modal-edit-excerpt').value = version.excerpt || '';
    document.getElementById('modal-edit-content').value = version.content_html || '';
    if (quillEditor) {
        quillEditor.root.innerHTML = version.content_html || '';
    }
    if (version.hero_image_url) {
        document.getElementById('modal-edit-hero-url').value = version.hero_image_url;
        document.getElementById('modal-hero-img').src = version.hero_image_url;
    }
    updateSEO();
    showToast('Версията е възстановена. Прегледайте и запазете.');
}

async function pruneVersions(draftId) {
    try {
        const token = await getAccessToken();
        const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_draft_versions?draft_id=eq.${draftId}&order=saved_at.desc&offset=20&select=id`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!res.ok) return;
        const old = await res.json();
        for (const v of old) {
            await fetch(`${SUPABASE_URL}/rest/v1/blog_draft_versions?id=eq.${v.id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${token}`,
                },
            });
        }
    } catch (err) {
        console.warn('Version prune failed:', err);
    }
}

// History panel toggle
document.getElementById('btn-toggle-history').addEventListener('click', () => {
    const panel = document.getElementById('version-history');
    const list = document.getElementById('version-list');
    const isOpen = panel.classList.toggle('is-open');
    list.hidden = !isOpen;
});

// ─── Init ───────────────────────────────────
checkAuth();
