/* =============================================================
   translations.js — Beauty Atelier IN
   All BG + EN strings for the i18n system.
   Keys prefixed with "shared." apply to every page.
   Keys prefixed with "index." apply only to index.html, etc.
   ============================================================= */

const TRANSLATIONS = {

    /* ===================== BULGARIAN ===================== */
    bg: {

        /* ---- Shared: Topbar ---- */
        'shared.topbar.address': 'Силистра център, ул. "Отец Паисий" 27, 7500 Силистра, България',

        /* ---- Shared: Navigation ---- */
        'shared.nav.home':       'Начало',
        'shared.nav.procedures': 'Процедури',
        'shared.nav.pricing':    'Ценоразпис',
        'shared.nav.about':      'За нас',
        'shared.nav.faq':        'ЧЗВ',
        'shared.nav.blog':       'Блог',
        'shared.nav.contact':    'Контакти',

        /* ---- Shared: Header call / CTA ---- */
        'shared.header.call_label': 'Звънни ни',
        'shared.header.book_btn':   'Запази час',

        /* ---- Shared: Sidebar ---- */
        'shared.sidebar.about_text':        'С внимание към всеки детайл и индивидуален подход към всеки клиент, ние създаваме не просто визия, а самочувствие. Довери се на сертифициран професионалист с опит!',
        'shared.sidebar.newsletter_label':  'новини и промоции',

        /* ---- Shared: Footer ---- */
        'shared.footer.tagline':            'Мястото, където красотата среща прецизността!',
        'shared.footer.contact_us':         'свържи се с нас',
        'shared.footer.procedures_title':   'Нашите <span>Процедури</span>',
        'shared.footer.quick_links_title':  'Бързи <span>връзки</span>',
        'shared.footer.blog_title':         'блог & <span>новини</span>',
        'shared.footer.address_label':      'Адрес',
        'shared.footer.email_label':        'Изпрати ни имейл',
        'shared.footer.call_label':         'Звънни ни',
        'shared.footer.by_author':          'от И. Николаева',
        'shared.footer.blog1_title':        'Правилна процедура',
        'shared.footer.blog2_title':        'Красотата & Вдъхновението',

        /* Footer procedure links */
        'shared.footer.proc.microblading':   'Микроблейдинг',
        'shared.footer.proc.microneedling':  'Микронидлинг',
        'shared.footer.proc.lashes':         'Миглопластика',
        'shared.footer.proc.plasma':         'Плазма пен',
        'shared.footer.proc.lamination':     'Ламиниране',
        'shared.footer.proc.piercing':       'Пробиване на уши',
        'shared.footer.proc.perm_removal':   'Премахване на перманентен грим',

        /* Footer quick links */
        'shared.footer.link.about':        'За нас',
        'shared.footer.link.pricing':      'Ценоразпис',
        'shared.footer.link.blog':         'Блог',
        'shared.footer.link.appointment':  'Запази час',
        'shared.footer.link.faq':          'Често Задавани Въпроси',
        'shared.footer.link.contact':      'Контакти',

        /* ---- Shared: Scroll to top ---- */
        'shared.scroll_top': 'Начало',

        /* ---- Shared: Aria labels ---- */
        'shared.aria.open_sidebar':     'Отвори странично меню',
        'shared.aria.open_mobile_nav':  'Отвори мобилно меню',
        'shared.aria.watch_video':      'Гледайте видео за нас',
        'shared.aria.lang_switch':      'Смени езика',

        /* ---- Shared: Form fields ---- */
        'shared.form.name_ph':          'Име*',
        'shared.form.email_ph':         'Имейл*',
        'shared.form.phone_ph':         'Телефонен номер',
        'shared.form.date_ph':          'Изберете дата*',
        'shared.form.service_default':  'Изберете процедура',
        'shared.form.microblading':     'Микроблейдинг',
        'shared.form.microneedling':    'Микронидлинг',
        'shared.form.lashes':           'Миглопластика',
        'shared.form.plasma':           'Плазма пен',
        'shared.form.lamination':       'Ламиниране',
        'shared.form.piercing':         'Пробиване на уши',
        'shared.form.perm_removal':     'Премахване на перманентен грим',
        'shared.form.doctor_default':   'Вашият специалист',
        'shared.form.message_ph':       'Пишете тук...',
        'shared.form.submit':           'Запази час',

        /* ========================================================
           INDEX.HTML — page-specific strings
           ======================================================== */

        /* Page meta */
        'index.title':     'Beauty Atelier IN | Микроблейдинг, Ламиниране и Естетика Силистра',
        'index.meta_desc': 'Специализиран център за PhiBrows микроблейдинг в Силистра. Предлагаме професионален микронидлинг, ламиниране на мигли и естетични процедури. Доверете се на сертифициран опит.',

        /* Hero slides */
        'index.hero1.title': 'Професионален <br><span class="main-slider-three__title__shape">Микроблейдинг</span> в Силистра',
        'index.hero2.title': 'Индивидуален подход <br>към <span class="main-slider-three__title__shape">всеки</span> клиент',
        'index.hero3.title': 'Сертифициран <br>Beauty Artist<span class="main-slider-three__title__shape"></span>',
        'index.hero4.title': 'Стерилна <br>Работна<span class="main-slider-three__title__shape"> среда</span>',
        'index.hero.btn_book':       'Запази час',
        'index.hero.btn_procedures': 'Процедури',
        'index.hero.btn_about':      'За нас',
        'index.hero.btn_blog':       'Блог',

        /* About section */
        'index.about.tagline':     'Сертифициран специалист',
        'index.about.title':       'Миглопластика <br>и естетични процедури',
        'index.about.sm_title':    'Открий най-доброто за твоята красота',
        'index.about.text':        'С внимание към всеки детайл и индивидуален подход, ние създаваме не просто визия, а самочувствие. Специализирани сме в микроблейдинг и <strong>ламиниране на вежди и мигли</strong> в Силистра. Доверете се на сертифициран професионалист!',
        'index.about.list.microblading':  'Микроблейдинг',
        'index.about.list.microneedling': 'Микронидлинг',
        'index.about.list.lashes':        'Миглопластика',
        'index.about.list.piercing':      'Пробиване на уши',
        'index.about.list.plasma':        'Плазма пен',
        'index.about.list.lamination':    'Ламиниране',
        'index.about.list.perm_removal':  'Премахване на перманентен грим',
        'index.about.btn_learn_more':     'Научи повече',

        /* Services section */
        'index.services.tagline':   'Открий най-доброто за твоята красота',
        'index.services.title':     'нашите процедури',
        'index.services.text':      'Мястото, където красотата среща прецизността. Предлагаме професионални услуги за вежди, мигли, кожа и перманентен грим - с внимание и индивидуален подход.',
        'index.services.microblading':   'Микроблейдинг',
        'index.services.microneedling':  'Микронидлинг',
        'index.services.lashes':         'Миглопластика',
        'index.services.plasma':         'Плазма пен',
        'index.services.piercing':       'Пробиване на уши',
        'index.services.perm_removal':   'Премахване на перманентен грим',
        'index.services.lamination':     'Ламиниране на вежди и мигли',

        /* Funfacts */
        'index.funfact.clients':     'Клиенти',
        'index.funfact.procedures':  'Процедури',
        'index.funfact.services':    'Видове услуги',
        'index.funfact.experience':  'Години опит',

        /* Why choose us */
        'index.why.tagline':        'Перфектният резултат започва с професионален подход.',
        'index.why.title':          'Фокус върху<br>естествената красота',
        'index.why.item1_title':    'Професионализъм & Сертифицирани Техники',
        'index.why.item1_text':     'Работя със световно признати методи като PhiBrows и Bold Brows, което гарантира прецизност, симетрия и естествен завършек на всяка процедура.',
        'index.why.item2_title':    'Висококачествени Продукти и Медицинска Хигиена',
        'index.why.item2_text':     'Работя само с професионални пигменти, сертифицирани консумативи и стерилни инструменти, за да осигуря напълно безопасна процедура.',
        'index.why.item3_title':    'Индивидуален Подход към Всеки Клиент',
        'index.why.item3_text':     'Всяко лице е уникално. Затова правя персонална консултация, анализирам чертите и подбирам най-подходящата техника, за да подчертая естествената красота.',

        /* FAQ section */
        'index.faq.title':   'Често задавани <br>въпроси',
        'index.faq.q1':      'Микроблейдингът боли ли?',
        'index.faq.a1':      'Болката е минимална, т.е. самата процедура се извършва в най-горния слой на кожата – епидермиса.',
        'index.faq.q2':      'Колко време се задържа микроблейдинг „косъм по косъм" върху кожата?',
        'index.faq.a2':      'При нормална до суха кожа, резултатът се задържа около 1,5/2 години. При по-пореста и мазна кожа, резултатът се задържа до 1-1,5 година и при него се налага по-честа поддръжка.',
        'index.faq.q3':      'Може ли да се прави през лятото микроблейдинг?',
        'index.faq.a3':      'Може, да! После грижата за веждите е една и съща през всеки сезон, само лятото препоръчваме да се мажат по-често със слънцезащита и кремове със защита за пигмент.',

        /* Process steps */
        'index.process.tagline':      'От първата консултация до перфектния резултат – всичко е ясно и лесно.',
        'index.process.title':        'Как протича процедурата при нас',
        'index.process.step1_title':  'Изберете процедура',
        'index.process.step1_text':   'Избирате желаната услуга. Ако се колебаете, ще ви помогнем да изберете най-подходящото за вас.',
        'index.process.step2_title':  'Запишете час',
        'index.process.step2_text':   'Свързвате се и потвърждаваме удобен ден и час за консултация или процедура.',
        'index.process.step3_title':  'Консултация и планиране',
        'index.process.step3_text':   'На място обсъждаме вашите желания и очаквания, анализираме и изготвяме персонален план за работа.',
        'index.process.step4_title':  'Процедура и поддръжка',
        'index.process.step4_text':   'Извършваме процедурата при стриктна хигиена и с висококачествени продукти.',

        /* Appointment form section */
        'index.appointment.title': 'Запази час',

        /* Testimonials section */
        'index.testimonials.tagline': 'Какво Казват Нашите Клиенти',
        'index.testimonials.title':   'Нашите Клиенти <br>Споделят',
        'index.testimonials.t2_quote': 'Атмосферата е уютна, безупречно чиста и изпълнена с положителна енергия. Кара те да се чувстваш добре дошъл от самото начало, а отношението е толкова персонализирано, че с удоволствие се връщаш отново.',
        'index.testimonials.t3_quote': 'Каквото и да кажа няма да е достатъчно за да изразя колко доволна останах! Удивена съм! Благодаря за невероятната трансформация! Възхищавам се на професионализма и изключителното внимание към клиента! Благодаря ти отново!',

        /* Blog section */
        'index.blog.tagline':   'последни новини',
        'index.blog.title':     'Блог & новини',
        'index.blog.month.march':    'Март',
        'index.blog.month.dec':      'Декември',
        'index.blog.month.jan':      'Януари',
        'index.blog.by_author1':     'от И. Николаева',
        'index.blog.by_author2':     'И. Николаева',
        'index.blog.post1_title':    'Как да избереш процедура за лице (без трендове)',
        'index.blog.post2_title':    'Тайната на Естествената Красота: Как Професионалните Процедури',
        'index.blog.post3_title':    'Microblading - Естествени и прецизни вежди за хармонично излъчване',
        'index.blog.post4_title':    'Всичко, което трябва да знаете за микроблейдинга – пълно ръководство',
        'index.blog.post5_title':    'Следпроцедурна грижа: Как да удължите трайността на микроблейдинга',
    },

    /* ===================== ENGLISH ===================== */
    en: {

        /* ---- Shared: Topbar ---- */
        'shared.topbar.address': 'City centre, 27 Otets Paisiy St, 7500 Silistra, Bulgaria',

        /* ---- Shared: Navigation ---- */
        'shared.nav.home':       'Home',
        'shared.nav.procedures': 'Procedures',
        'shared.nav.pricing':    'Pricing',
        'shared.nav.about':      'About Us',
        'shared.nav.faq':        'FAQ',
        'shared.nav.blog':       'Blog',
        'shared.nav.contact':    'Contact',

        /* ---- Shared: Header call / CTA ---- */
        'shared.header.call_label': 'Call Us',
        'shared.header.book_btn':   'Book Now',

        /* ---- Shared: Sidebar ---- */
        'shared.sidebar.about_text':        'With meticulous attention to detail and a personalised approach, we create more than just a look — we create confidence. Trust a certified professional with experience!',
        'shared.sidebar.newsletter_label':  'News & Promotions',

        /* ---- Shared: Footer ---- */
        'shared.footer.tagline':            'Where beauty meets precision!',
        'shared.footer.contact_us':         'Contact Us',
        'shared.footer.procedures_title':   'Our <span>Procedures</span>',
        'shared.footer.quick_links_title':  'Quick <span>Links</span>',
        'shared.footer.blog_title':         'Blog & <span>News</span>',
        'shared.footer.address_label':      'Address',
        'shared.footer.email_label':        'Send Us an Email',
        'shared.footer.call_label':         'Call Us',
        'shared.footer.by_author':          'by I. Nikolaeva',
        'shared.footer.blog1_title':        'The Right Procedure',
        'shared.footer.blog2_title':        'Beauty & Inspiration',

        /* Footer procedure links */
        'shared.footer.proc.microblading':   'Microblading',
        'shared.footer.proc.microneedling':  'Microneedling',
        'shared.footer.proc.lashes':         'Lash Extensions',
        'shared.footer.proc.plasma':         'Plasma Pen',
        'shared.footer.proc.lamination':     'Lamination',
        'shared.footer.proc.piercing':       'Ear Piercing',
        'shared.footer.proc.perm_removal':   'Permanent Makeup Removal',

        /* Footer quick links */
        'shared.footer.link.about':        'About Us',
        'shared.footer.link.pricing':      'Pricing',
        'shared.footer.link.blog':         'Blog',
        'shared.footer.link.appointment':  'Book Now',
        'shared.footer.link.faq':          'FAQ',
        'shared.footer.link.contact':      'Contact',

        /* ---- Shared: Scroll to top ---- */
        'shared.scroll_top': 'Top',

        /* ---- Shared: Aria labels ---- */
        'shared.aria.open_sidebar':     'Open sidebar menu',
        'shared.aria.open_mobile_nav':  'Open mobile menu',
        'shared.aria.watch_video':      'Watch our video',
        'shared.aria.lang_switch':      'Switch language',

        /* ---- Shared: Form fields ---- */
        'shared.form.name_ph':          'Name*',
        'shared.form.email_ph':         'Email*',
        'shared.form.phone_ph':         'Phone Number',
        'shared.form.date_ph':          'Select a Date*',
        'shared.form.service_default':  'Select a Treatment',
        'shared.form.microblading':     'Microblading',
        'shared.form.microneedling':    'Microneedling',
        'shared.form.lashes':           'Lash Extensions',
        'shared.form.plasma':           'Plasma Pen',
        'shared.form.lamination':       'Lamination',
        'shared.form.piercing':         'Ear Piercing',
        'shared.form.perm_removal':     'Permanent Makeup Removal',
        'shared.form.doctor_default':   'Your Specialist',
        'shared.form.message_ph':       'Write your message here...',
        'shared.form.submit':           'Book Now',

        /* ========================================================
           INDEX.HTML — page-specific strings
           ======================================================== */

        /* Page meta */
        'index.title':     'Beauty Atelier IN | Microblading, Lamination & Aesthetics Silistra',
        'index.meta_desc': 'Specialist centre for PhiBrows microblading in Silistra. Professional microneedling, lash lamination and aesthetic treatments. Trust certified expertise.',

        /* Hero slides */
        'index.hero1.title': 'Professional <br><span class="main-slider-three__title__shape">Microblading</span> in Silistra',
        'index.hero2.title': 'A personalised approach <br>for <span class="main-slider-three__title__shape">every</span> client',
        'index.hero3.title': 'Certified <br>Beauty Artist<span class="main-slider-three__title__shape"></span>',
        'index.hero4.title': 'Sterile <br>Working<span class="main-slider-three__title__shape"> Environment</span>',
        'index.hero.btn_book':       'Book Now',
        'index.hero.btn_procedures': 'Procedures',
        'index.hero.btn_about':      'About Us',
        'index.hero.btn_blog':       'Blog',

        /* About section */
        'index.about.tagline':     'Certified Specialist',
        'index.about.title':       'Lash Extensions<br>& Aesthetic Procedures',
        'index.about.sm_title':    'Discover the best for your beauty',
        'index.about.text':        'With meticulous attention to detail and a personalised approach, we create more than just a look — we create confidence. We specialise in microblading and <strong>eyebrow & lash lamination</strong> in Silistra. Trust a certified professional!',
        'index.about.list.microblading':  'Microblading',
        'index.about.list.microneedling': 'Microneedling',
        'index.about.list.lashes':        'Lash Extensions',
        'index.about.list.piercing':      'Ear Piercing',
        'index.about.list.plasma':        'Plasma Pen',
        'index.about.list.lamination':    'Lamination',
        'index.about.list.perm_removal':  'Permanent Makeup Removal',
        'index.about.btn_learn_more':     'Learn More',

        /* Services section */
        'index.services.tagline':   'Discover the best for your beauty',
        'index.services.title':     'Our Procedures',
        'index.services.text':      'Where beauty meets precision. We offer professional services for brows, lashes, skin and permanent makeup — with care and a personalised approach.',
        'index.services.microblading':   'Microblading',
        'index.services.microneedling':  'Microneedling',
        'index.services.lashes':         'Lash Extensions',
        'index.services.plasma':         'Plasma Pen',
        'index.services.piercing':       'Ear Piercing',
        'index.services.perm_removal':   'Permanent Makeup Removal',
        'index.services.lamination':     'Eyebrow & Lash Lamination',

        /* Funfacts */
        'index.funfact.clients':     'Clients',
        'index.funfact.procedures':  'Procedures',
        'index.funfact.services':    'Service Types',
        'index.funfact.experience':  'Years of Experience',

        /* Why choose us */
        'index.why.tagline':        'The perfect result starts with a professional approach.',
        'index.why.title':          'A Focus on<br>Natural Beauty',
        'index.why.item1_title':    'Professionalism & Certified Techniques',
        'index.why.item1_text':     'I work with globally recognised methods such as PhiBrows and Bold Brows, ensuring precision, symmetry and a natural finish with every procedure.',
        'index.why.item2_title':    'Premium Products & Medical-Grade Hygiene',
        'index.why.item2_text':     'I use only professional pigments, certified consumables and sterile instruments to ensure a completely safe procedure.',
        'index.why.item3_title':    'A Personalised Approach for Every Client',
        'index.why.item3_text':     'Every face is unique. That is why I carry out a personal consultation, analyse your features and select the most suitable technique to enhance your natural beauty.',

        /* FAQ section */
        'index.faq.title':   'Frequently Asked <br>Questions',
        'index.faq.q1':      'Is microblading painful?',
        'index.faq.a1':      'Pain is minimal, as the procedure is performed on the outermost layer of the skin — the epidermis.',
        'index.faq.q2':      'How long does hair-stroke microblading last?',
        'index.faq.a2':      'On normal to dry skin, results last approximately 1.5–2 years. On more porous or oily skin, results last up to 1–1.5 years and may require more frequent touch-ups.',
        'index.faq.q3':      'Can microblading be done in summer?',
        'index.faq.a3':      'Yes, absolutely! The aftercare routine is the same every season — in summer we simply recommend applying SPF and pigment-protecting creams more frequently.',

        /* Process steps */
        'index.process.tagline':      'From your first consultation to the perfect result — every step is clear and simple.',
        'index.process.title':        'How Your Treatment Works',
        'index.process.step1_title':  'Choose a Treatment',
        'index.process.step1_text':   "Select the service you'd like. If you're unsure, we'll help you find the best option for you.",
        'index.process.step2_title':  'Book an Appointment',
        'index.process.step2_text':   "Get in touch and we'll confirm a convenient date and time for your consultation or treatment.",
        'index.process.step3_title':  'Consultation & Planning',
        'index.process.step3_text':   'In person, we discuss your wishes and expectations, analyse your needs and create a personalised treatment plan.',
        'index.process.step4_title':  'Treatment & Aftercare',
        'index.process.step4_text':   'The treatment is carried out to the highest hygiene standards using premium-quality products.',

        /* Appointment form section */
        'index.appointment.title': 'Book an Appointment',

        /* Testimonials section */
        'index.testimonials.tagline': 'What Our Clients Say',
        'index.testimonials.title':   'Our Clients <br>Share',
        'index.testimonials.t2_quote': 'The atmosphere is cosy, spotlessly clean and full of positive energy. It makes you feel welcome from the very start, and the approach is so personalised that you happily come back again.',
        'index.testimonials.t3_quote': 'No words can fully express how happy I am with the result! I am amazed! Thank you for the incredible transformation! I admire the professionalism and exceptional attention to every client. Thank you again!',

        /* Blog section */
        'index.blog.tagline':   'latest news',
        'index.blog.title':     'Blog & News',
        'index.blog.month.march':    'March',
        'index.blog.month.dec':      'December',
        'index.blog.month.jan':      'January',
        'index.blog.by_author1':     'by I. Nikolaeva',
        'index.blog.by_author2':     'I. Nikolaeva',
        'index.blog.post1_title':    'How to Choose a Facial Procedure (Without Following Trends)',
        'index.blog.post2_title':    'The Secret of Natural Beauty: How Professional Treatments Make the Difference',
        'index.blog.post3_title':    'Microblading — Natural, Precise Brows for a Harmonious Look',
        'index.blog.post4_title':    'Everything You Need to Know About Microblading — The Complete Guide',
        'index.blog.post5_title':    'Post-Treatment Care: How to Extend the Longevity of Your Microblading',
    }
};
