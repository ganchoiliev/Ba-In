import re

with open("microblading-5mistakes.html", "r", encoding="utf-8") as f:
    html = f.read()

# Replace Title
html = re.sub(r'<title>5 грешки при микроблейдинг, които да избягвате \| Beauty Atelier IN</title>', 
              '<title>Как да избереш правилната процедура за лице (без да се подлъжеш по трендовете) | Beauty Atelier IN</title>', html)

# Replace Description & Keywords
html = re.sub(r'content="Научете кои са най-честите грешки при микроблейдинг и как да ги избегнете. Съвети от професионалистите в Beauty Atelier IN - Силистра."',
              'content="Как да избереш правилната процедура за лице (без да се подлъжеш по трендовете). Научете 5 ключови принципа за сияйна и здрава кожа от Beauty Atelier IN - Силистра."', html)

html = re.sub(r'content="грешки микроблейдинг, съвети микроблейдинг, перманентен грим грешки, beauty atelier in съвети, грижа за вежди"',
              'content="процедура за лице, съвети за кожа, beauty atelier in, избор на терапия, естествени резултати"', html)

# Replace Page header title
html = re.sub(r'<h1 class="page-header__title">5 грешки при микроблейдинг</h1>',
              '<h1 class="page-header__title">Как да избереш процедура за лице</h1>', html)

# Breadcrumbs
html = re.sub(r'<li><span>5 грешки при микроблейдинг</span></li>',
              '<li><span>Как да избереш процедура за лице</span></li>', html)

# Blog content replacements
# Date
html = re.sub(r'<span class="blog-card-four__date__day">10</span>', '<span class="blog-card-four__date__day">01</span>', html)
html = re.sub(r'<span class="blog-card-four__date__month">Дек</span>', '<span class="blog-card-four__date__month">Март</span>', html)

# Main Title
html = re.sub(r'<h3 class="blog-card-four__title">5 грешки при микроблейдинг, които могат да развалят резултата</h3>',
              '<h3 class="blog-card-four__title">Как да избереш правилната процедура за лице (без да се подлъжеш по трендовете)</h3>', html)

# First image
html = re.sub(r'<img src="assets/images/blog/blog-d-5-1.jpg" alt="Грешки при микроблейдинг - какво да избягваме">',
              '<img src="assets/images/blog/1.jpg" alt="Лоша или добра инвестиция е процедурата за лице">', html)

# Inner content block 1
content_block_1 = """<p class="blog-card-four__text">В света на естетиката и козметиката трендовете се сменят със скоростта на светлината. Една седмица всички говорят за определена процедура за лице, а на следващата – за нова техника, която обещава „незабавни и магически резултати“.</p>
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
<p class="blog-card-four__text">Постигането на тази хармония изисква експертен и строго индивидуален подход, а не копиране на видяното в интернет пространството.</p>"""

html = re.sub(r'<div class="blog-card-four__content__inner">.*?</div></div></div><div class="blog-details__inner">',
              f'<div class="blog-card-four__content__inner">\n{content_block_1}\n</div></div></div><div class="blog-details__inner">', html, flags=re.DOTALL)

# Inner images
html = re.sub(r'<img src="assets/images/blog/blog-d-5-2.jpg" alt="Правилна форма на веждите">',
              '<img src="assets/images/blog/2.jpg" alt="Анализ на състоянието на кожата">', html)
html = re.sub(r'<img src="assets/images/blog/blog-d-5-3.jpg" alt="Грижа след микроблейдинг">',
              '<img src="assets/images/blog/3.jpg" alt="Индивидуален подход и грижа">', html)

# Inner content block 2
content_block_2 = """
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
"""

html = re.sub(r'<div class="blog-details__inner__content wow fadeInUp" data-wow-duration="1500ms">.*?</div></div><div class="blog-details__meta wow fadeInUp" data-wow-duration="1500ms">',
              f'<div class="blog-details__inner__content wow fadeInUp" data-wow-duration="1500ms">\n{content_block_2}\n</div></div><div class="blog-details__meta wow fadeInUp" data-wow-duration="1500ms">',
              html, flags=re.DOTALL)

# Tags & Categories
html = re.sub(r'<a href="javascript:void\(0\)" class="blog-details__categories__btn mediox-btn"><span>микроблейдинг</span></a>',
              '<a href="javascript:void(0)" class="blog-details__categories__btn mediox-btn"><span>грижа за кожата</span></a>', html)


with open("choosing-right-facial.html", "w", encoding="utf-8") as f:
    f.write(html)
