// ai-chat.js v2.2 — Beauty Atelier IN
document.addEventListener('DOMContentLoaded', () => {
    // SVGs
    const iconBot = `<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5a7 7 0 0 1 7-7h1V5.73A2 2 0 1 1 12 2zm-3 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>`;
    const iconUser = `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
    const iconChat = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;
    const iconClose = `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>`;
    const iconSend = `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;

    // Inject HTML Structure
    const chatContainer = document.createElement('div');
    chatContainer.innerHTML = `
        <!-- FAB -->
        <button id="ai-chat-fab" aria-label="Open AI Chat">
            ${iconChat}
        </button>

        <!-- Chat Window -->
        <div id="ai-chat-window" class="ai-chat-hidden">
            <div class="ai-chat-header">
                <div class="ai-chat-header-info">
                    <div class="ai-chat-avatar">
                        ${iconBot}
                    </div>
                    <div class="ai-chat-title">
                        <h3>Beauty Atelier Асистент</h3>
                        <p><span class="ai-chat-status-dot"></span> На линия</p>
                    </div>
                </div>
                <button class="ai-chat-close" id="ai-chat-close-btn" aria-label="Close">
                    ${iconClose}
                </button>
            </div>
            
            <div class="ai-chat-messages" id="ai-chat-messages">
                <!-- Initial Message -->
                <div class="ai-message ai-role-assistant">
                    <div class="ai-message-avatar">${iconBot}</div>
                    <div class="ai-message-bubble">
                        Здравейте! Аз съм Вашият виртуален асистент към Beauty Atelier IN. Как мога да Ви помогна днес? (напр. цени, процедури, запазване на час)
                    </div>
                </div>
            </div>

            <div class="ai-chat-input-area">
                <form class="ai-chat-form" id="ai-chat-form">
                    <input type="text" class="ai-chat-input" id="ai-chat-input" placeholder="Напишете съобщение..." autocomplete="off">
                    <button type="submit" class="ai-chat-submit" id="ai-chat-submit">
                        ${iconSend}
                    </button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(chatContainer);

    // Elements
    const fab = document.getElementById('ai-chat-fab');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-close-btn');
    const messagesContainer = document.getElementById('ai-chat-messages');
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const submitBtn = document.getElementById('ai-chat-submit');

    // State
    let conversationHistory = [
        { role: 'assistant', content: 'Здравейте! Аз съм Вашият виртуален асистент към Beauty Atelier IN. Как мога да Ви помогна днес?' }
    ];
    let isLoading = false;

    // Toggle Window
    fab.addEventListener('click', () => {
        chatWindow.classList.remove('ai-chat-hidden');
        fab.classList.add('ai-chat-hidden');
        chatInput.focus();
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('ai-chat-hidden');
        fab.classList.remove('ai-chat-hidden');
    });

    // Handle Input
    chatInput.addEventListener('input', () => {
        submitBtn.disabled = chatInput.value.trim() === '' || isLoading;
    });

    // Add Message to UI
    function addMessage(role, content) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-message ai-role-${role}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'ai-message-avatar';
        avatarDiv.innerHTML = role === 'user' ? iconUser : iconBot;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'ai-message-bubble';

        bubbleDiv.innerHTML = formatMessage(content);

        msgDiv.appendChild(avatarDiv);
        msgDiv.appendChild(bubbleDiv);
        messagesContainer.appendChild(msgDiv);

        scrollToBottom();
    }

    // Convert plain text to rich HTML with clickable links
    function formatMessage(text) {
        // 0. Strip any HTML tags the AI may have accidentally generated
        text = text.replace(/<[^>]*>/g, '');
        // Also remove orphaned maps.google.com URLs and trailing attribute junk that survive broken partial tags
        text = text.replace(/https?:\/\/maps\.google\.com\S*"[^"]*/gi, '');
        text = text.replace(/\s*(?:target|rel|style)="[^"]*"/gi, '');


        // 1. Escape HTML to prevent XSS
        let safe = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // 2. Bold: **text**
        safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 3. Emails → mailto: links (before URL regex so they don't get double-matched)
        safe = safe.replace(
            /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g,
            '<a href="mailto:$1" style="color:var(--chat-primary);text-decoration:underline;">$1</a>'
        );

        // 4. Phone numbers → tel: links
        safe = safe.replace(
            /(\+359[\s\d]{9,13}|0\d[\s\-]?\d{3}[\s\-]?\d{4})/g,
            (match) => {
                const digits = match.replace(/[\s\-]/g, '');
                return `<a href="tel:${digits}" style="color:var(--chat-primary);text-decoration:underline;">${match}</a>`;
            }
        );

        // 5. URLs → clickable links (BEFORE address so we don't re-wrap the Google Maps URL we'll insert next)
        safe = safe.replace(
            /(https?:\/\/[^\s<"]+?)(?=[.,!?]*(?:\s|$|<))/g,
            (url) => {
                const label = url.replace('https://ba-in.com', 'ba-in.com');
                return `<a href="${url}" target="_blank" rel="noopener" style="color:var(--chat-primary);text-decoration:underline;">${label}</a>`;
            }
        );

        // 6. Newlines → <br>
        safe = safe.replace(/\n/g, '<br>');

        return safe;
    }



    // Typing indicator
    function showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message ai-role-assistant';
        typingDiv.id = 'ai-chat-typing-indicator';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'ai-message-avatar';
        avatarDiv.innerHTML = iconBot;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'ai-chat-typing';
        bubbleDiv.innerHTML = '<span class="ai-chat-dot"></span><span class="ai-chat-dot"></span><span class="ai-chat-dot"></span>';

        typingDiv.appendChild(avatarDiv);
        typingDiv.appendChild(bubbleDiv);
        messagesContainer.appendChild(typingDiv);

        scrollToBottom();
    }

    function hideTyping() {
        const indicator = document.getElementById('ai-chat-typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Form Submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text || isLoading) return;

        // Reset input
        chatInput.value = '';
        submitBtn.disabled = true;

        // Add user message
        addMessage('user', text);
        conversationHistory.push({ role: 'user', content: text });

        // Lock state
        isLoading = true;
        showTyping();

        try {
            // Call PHP Proxy
            const response = await fetch('api/chat.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: conversationHistory })
            });

            const rawText = await response.text();
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (parseErr) {
                throw new Error('Server returned non-JSON response: ' + rawText.substring(0, 300));
            }

            if (!response.ok) {
                throw new Error(data.error || 'Възникна грешка в сървъра.');
            }

            const aiResponse = data.message;
            conversationHistory.push({ role: 'assistant', content: aiResponse });

            hideTyping();
            addMessage('assistant', aiResponse);

        } catch (error) {
            console.error('AI Chat Error:', error);
            hideTyping();
            addMessage('assistant', 'Съжалявам, възникна грешка при свързването: ' + error.message + ' Моля, опитайте малко по-късно или се обадете на тел: +359 89 339 8390.');
            // Remove the failed user message from history so they can try again if wanted
            conversationHistory.pop();
        } finally {
            isLoading = false;
            // Focus back on input if on desktop
            if (window.innerWidth > 480) {
                chatInput.focus();
            }
        }
    });

});
