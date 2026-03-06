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
