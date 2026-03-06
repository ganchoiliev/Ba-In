# Beauty Atelier IN 💅✨

**Beauty Atelier IN** is a modern, responsive website for a professional beauty salon located in Silistra, Bulgaria, specializing in high-end aesthetic procedures such as PhiBrows Microblading, Microneedling, Lash Lamination, Plasma Pen treatments, and Permanent Makeup Removal.

The platform provides clients with detailed information about services, pricing, blog guides, and an easy-to-use Appointment Booking system.

🌐 **Live Website:** [ba-in.com](https://ba-in.com)

---

## 🚀 Key Features & Recent Optimizations

The website has recently undergone a comprehensive audit and optimization pass to improve **Performance**, **Security**, **SEO**, and **User Experience**.

### 1. 🤖 AI Chatbot Assistant Integration
- **Upgraded Intelligence:** The custom AI assistant is now powered by the faster and more cost-effective `gpt-4o-mini` model.
- **Improved Context:** Adjusted system instructions to provide a more natural conversational tone in Bulgarian and eliminated repetitive contact info spam.
- **Enhanced UI/UX:** The chat widget was re-positioned to the right side of the screen, and the "Scroll to Top" button was moved to the left to prevent clicking overlaps.
- **Mobile Responsive:** The chat floating action button (FAB) now scales down gracefully on mobile devices (<= 480px).

### 2. ⚡ Performance & Asset Optimization
- **Eliminated Dead Weight:** Removed `tiny-slider` (which was loaded on every page but never used) and `slick-carousel` (removed from all sub-pages, kept only on the homepage). This successfully saved multiple unnecessary CSS/JS HTTP requests per page.
- **FontAwesome Deduplication:** Removed a redundant CDN link for FontAwesome on the homepage, relying on the single local vendor version.
- **CSS Cleanup:** Found and extracted lingering inline debug `<style>` blocks that were copy-pasted across all HTML files, moving the active rules permanently into the core `mediox.css` stylesheet.

### 3. 🛡️ Security
- **Spam Bot Protection:** The PHP appointment booking form (`sendemail.php`) now includes a hidden "honeypot" field that silently traps automated spam bots before they can submit the form.
- **Email Validation:** Added strict `filter_var` server-side validation to ensure sender emails are properly formatted before attempting to dispatch booked appointments.

### 4. 🔍 SEO (Search Engine Optimization)
- **Canonical Tags:** Added missing `<link rel="canonical">` tags to every HTML page, helping Google easily understand the master version of pages and preventing duplicate content indexing errors.
- **Alt Text:** Fixed template placeholder `alt` texts on critical images (like the Appointment page logo) to proper descriptions ("Beauty Atelier IN logo").

### 5. 🌐 Bilingual BG/EN Language Support (i18n)
- **Custom i18n Engine:** Built a lightweight language switcher (`assets/js/i18n.js`) that reads from a central `translations.js` file and applies translations via `data-i18n`, `data-i18n-html`, `data-i18n-ph`, and `data-i18n-aria` HTML attributes — no external libraries required.
- **Full Site Coverage:** All 25 pages now have the BG|EN toggle wired up. Translated content covers: navigation, footer, hero sections, about page, contact form, appointment booking form, pricing cards, FAQ (10 Q&A pairs), blog listing cards, and shared UI elements.
- **Persistent Preference:** The selected language is saved to `localStorage` so it persists across page loads and visits.
- **Bootstrap Select Sync:** Added automatic `selectpicker('refresh')` call after every language switch so appointment form dropdowns visually update correctly.
- **Removed Duplicate Toggle:** Eliminated a redundant BG|EN button that appeared inside the mobile hamburger drawer on all pages, keeping only the clean topbar toggle.

### 6. 📞 Contact Widget Repositioning
- **Fixed Overlap with AI Chat FAB:** The WhatsApp/Viber floating widget was hidden behind the AI chat button on desktop. Repositioned it to stack directly above the AI chat FAB (`bottom: 96px`) so both are always visible and accessible.
- **Mobile Responsive:** Added separate breakpoints so the widget sits at the correct height on tablet (≤768px) and mobile (≤480px) screens, accounting for the smaller FAB size on small screens.

### 7. ⭐ Google Reviews CTA
- **Reviews Strip:** Added a "Leave a Google Review" call-to-action section on the homepage and about page, featuring the Google "G" logo, 5-star rating display, and a styled gold button linking to the Google Business review page.

---

## 🛠️ Built With
- **HTML5 / CSS3**
- **JavaScript (Vanilla & jQuery)**
- **PHP** (Email handling & OpenAI API proxy)
- **Bootstrap**
- **Owl Carousel & Slick** (Sliders/Carousels)
- **OpenAI API** (`gpt-4o-mini` for the chat assistant)
- **Vercel / Hostinger**

## 📬 Contact
For salon inquiries or to book an appointment:
- **Phone:** +359 89 339 8390
- **Email:** info@ba-in.com
- **Address:** ул. "Отец Паисий" 27, 7500 Силистра, България
