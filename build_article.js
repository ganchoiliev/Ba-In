const fs = require('fs');
const path = require('path');

const srcPath = 'c:/xampp/htdocs/ba-in/microblading-5mistakes.html';
const destPath = 'c:/xampp/htdocs/ba-in/choosing-right-facial.html';

let html = fs.readFileSync(srcPath, 'utf-8');

// Replace Title
html = html.replace(/<title>5 грешки при микроблейдинг, които да избягвате \| Beauty Atelier IN<\/title>/g,
    '<title>Как да избереш правилната процедура за лице (без да се подлъжеш по трендовете) | Beauty Atelier IN</title>');

// Replace Description & Keywords
html = html.replace(/content="Научете кои са най-честите грешки при микроблейдинг и как да ги избегнете\. Съвети от професионалистите в Beauty Atelier IN - Силистра\."/g,
    'content="Как да избереш правилната процедура за лице (без да се подлъжеш по трендовете). Научете 5 ключови принципа за сияйна и здрава кожа от Beauty Atelier IN - Силистра."');

html = html.replace(/content="грешки микроблейдинг, съвети микроблейдинг, перманентен грим грешки, beauty atelier in съвети, грижа за вежди"/g,
    'content="процедура за лице, съвети за кожа, beauty atelier in, избор на терапия, естествени резултати"');

// Replace Page header title
html = html.replace(/<h1 class="page-header__title">5 грешки при микроблейдинг<\/h1>/g,
    '<h1 class="page-header__title">Как да избереш процедура за лице</h1>');

// Breadcrumbs
html = html.replace(/<li><span>5 грешки при микроблейдинг<\/span><\/li>/g,
    '<li><span>Как да избереш процедура за лице</span></li>');

// Blog content replacements
// Date
html = html.replace(/<span class="blog-card-four__date__day">10<\/span>/g, '<span class="blog-card-four__date__day">01</span>');
html = html.replace(/<span class="blog-card-four__date__month">Дек<\/span>/g, '<span class="blog-card-four__date__month">Март</span>');

// Main Title
html = html.replace(/<h3 class="blog-card-four__title">5 грешки при микроблейдинг, които могат да развалят резултата<\/h3>/g,
    '<h3 class="blog-card-four__title">Как да избереш правилната процедура за лице (без да се подлъжеш по трендовете)</h3>');

// First image
html = html.replace(/<img src="assets\/images\/blog\/blog-d-5-1\.jpg" alt="Грешки при микроблейдинг - какво да избягваме">/g,
    '<img src="assets/images/blog/1.jpg" alt="Лоша или добра инвестиция е процедурата за лице">');

// Inner content block 1
const content_block_1 = `<p class="blog-card-four__text">В света на естетиката и козметиката трендовете се сменят със скоростта на светлината. Една седмица всички говорят за определена процедура за лице, а на следващата – за нова техника, която обещава „незабавни и магически резултати“.</p>
<p class="blog-card-four__text">Но истината е много по-проста: Кожата ти не следва трендове. Тя има свои уникални нужди. И най-доброто решение за твоята грижа за кожата невинаги е най-популярното в социалните мрежи.</p>
<p class="blog-card-four__text">Ето 5 ключови принципа, които ще ти помогнат да избереш правилната терапия и да постигнеш дълготрайна, сияйна и здрава кожа.</p>

<h4 class="blog-details__inner__title" style="margin-top: 20px;">1. Не всяка модерна процедура е подходяща за всеки</h4>
<p class="blog-card-four__text">Социалните мрежи постоянно показват зашеметяващи резултати „преди и след“, но често пропускат най-важното – типа кожа, предисторията на клиента и предварителната подготовка.</p>
<p class="blog-card-four__text">Една и съща козметична процедура може да бъде:</p>
<ul class="blog-details__inner__list">
    <li>Чудесна за мазна или акнеична кожа.</li>
    <li>Абсолютно неподходяща за чувствителна или реактивна кожа.</li>
    <li>Твърде агресивна, ако кожната ти бариера е вече нарушена.</li>
    <li>Напълно излишна, ако същинският козметичен проблем е от друго естество.</li>
</ul>
<p class="blog-card-four__text">Първата и най-голяма грешка, която много хора правят, е да избират процедура според нейната популярност, а не според реалното състояние на своята кожа.</p>

<h4 class="blog-details__inner__title" style="margin-top: 20px;">2. Започни с анализ, не с процедура</h4>
<p class="blog-card-four__text">Вместо да се питаш „Коя процедура за лице е най-добра в момента?“, много по-полезният въпрос е: „Какъв е основният проблем на кожата ми?“ Задай си следните въпроси:</p>
<ul class="blog-details__inner__list">
    <li>Усещам ли дехидратация, опъване или прекомерна сухота?</li>
    <li>Имам ли пигментация или неравномерен тен?</li>
    <li>Наблюдавам ли загуба на еластичност или просто изглеждам уморена?</li>
</ul>
<p class="blog-card-four__text">Когато заедно разберем първопричината, изборът става много по-ясен и точен. Понякога най-добрият резултат не идва от една-единствена „силна“ терапия, а от поетапен, внимателно изграден план за грижа за кожата.</p>

<h4 class="blog-details__inner__title" style="margin-top: 20px;">3. „Естествен резултат“ е стратегия, а не просто ефект</h4>
<p class="blog-card-four__text">Много хора търсят драматична промяна още след първото посещение в бюти салона. Но истината е, че дългосрочно най-красивият резултат е този, който изглежда напълно естествено. Какво означава естественият резултат на практика?</p>
<ul class="blog-details__inner__list">
    <li>Видимо подобрение, без така нареченото „променено изражение“.</li>
    <li>Свежест и отпочинал вид, без усещане за прекомерност.</li>
    <li>Пълна хармония с твоите индивидуални черти.</li>
</ul>
<p class="blog-card-four__text">Постигането на тази хармония изисква експертен и строго индивидуален подход, а не копиране на видяното в интернет пространството.</p>`;

html = html.replace(/<div class="blog-card-four__content__inner">[\s\S]*?<\/div><\/div><div class="blog-details__inner">/,
    `<div class="blog-card-four__content__inner">\n${content_block_1}\n</div></div></div><div class="blog-details__inner">`);

// Inner images
html = html.replace(/<img src="assets\/images\/blog\/blog-d-5-2\.jpg" alt="Правилна форма на веждите">/g,
    '<img src="assets/images/blog/2.jpg" alt="Анализ на състоянието на кожата">');
html = html.replace(/<img src="assets\/images\/blog\/blog-d-5-3\.jpg" alt="Грижа след микроблейдинг">/g,
    '<img src="assets/images/blog/3.jpg" alt="Индивидуален подход и грижа">');

// Inner content block 2
const content_block_2 = `
<h4 class="blog-details__inner__title" style="margin-top: 20px;">4. Подготовката е половината от успеха</h4>
<p class="blog-details__inner__text">Малко клиенти първоначално осъзнават колко важна всъщност е подготовката, преди да се подложат на дадена процедура. Здравата кожна бариера, правилната домашна грижа и реалистичните очаквания са нещата, които правят разликата между временен ефект и дълготраен, качествен резултат.</p>
<p class="blog-details__inner__text"><strong>Запомни:</strong> Красивата кожа не е резултат от една процедура. Тя е процес на постоянство и съвместна работа между теб и твоя специалист.</p>

<h4 class="blog-details__inner__title" style="margin-top: 20px;">5. Как да разпознаеш място, което мисли за теб, а не за трендовете</h4>
<p class="blog-details__inner__text">Когато избираш козметичен салон, на когото да се довериш, обърни внимание на следните неща. Задай си тези въпроси:</p>
<ul class="blog-details__inner__list">
    <li>Обясняват ли ми в детайли защо ми препоръчват конкретно нещо?</li>
    <li>Предлагат ли ми алтернативи, съобразени с моето време и възможности?</li>
    <li>Говорят ли с мен за последващата грижа вкъщи след процедурата?</li>
    <li>Отказвали ли са ми нещо, ако са преценили, че не е подходящо за мен?</li>
</ul>
<p class="blog-details__inner__text">Истинският професионалист в сферата на красотата знае, че понякога най-правилното и етично решение е просто да се каже „не“.</p>

<h4 class="blog-details__inner__title" style="margin-top: 20px;">Заключение</h4>
<p class="blog-details__inner__text">Изборът на процедура за лице никога не трябва да бъде импулсивен. Той трябва да бъде напълно информиран и осознат. Когато изместиш фокуса от трендовете към реалните нужди на своята кожа, резултатите са несравнимо по-спокойни, по-естествени и по-дълготрайни.</p>
<p class="blog-details__inner__text">А ако имаш въпроси или се колебаеш от какво се нуждае кожата ти – не се колебай да ни попиташ. <strong><a href="contact.html" style="color:var(--mediox-base);">Запази своя час за професионална консултация при нас.</a></strong> Защото информираният избор винаги е по-красивият избор!</p>

<div style="margin-top: 40px; text-align: center;">
    <a href="appointment.html" class="mediox-btn"><span>Запази час сега</span> <span class="mediox-btn__icon"><i class="icon-up-right-arrow"></i></span></a>
</div>
`;

html = html.replace(/<div class="blog-details__inner__content wow fadeInUp" data-wow-duration="1500ms">[\s\S]*?<\/div><\/div><div class="blog-details__meta wow fadeInUp" data-wow-duration="1500ms">/,
    `<div class="blog-details__inner__content wow fadeInUp" data-wow-duration="1500ms">\n${content_block_2}\n</div></div><div class="blog-details__meta wow fadeInUp" data-wow-duration="1500ms">`);

// Tags & Categories
html = html.replace(/<a href="javascript:void\(0\)" class="blog-details__categories__btn mediox-btn"><span>микроблейдинг<\/span><\/a>/g,
    '<a href="javascript:void(0)" class="blog-details__categories__btn mediox-btn"><span>грижа за кожата</span></a>');


fs.writeFileSync(destPath, html, 'utf-8');
console.log('Successfully wrote choosing-right-facial.html in UTF-8');
