$dirPath = "c:\xampp\htdocs\ba-in"
$htmlFiles = Get-ChildItem -Path $dirPath -Filter "*.html"

$sidebarOldRegex = '(?s)<li class="sidebar__posts__item">\s+<div class="sidebar__posts__image">\s+<img src="assets/images/blog/lp-1-2.jpg" alt="5 грешки при микроблейдинга">\s+</div><div class="sidebar__posts__content">\s+<div class="sidebar__posts__meta"><a href="about.html">\s+<span class="sidebar__posts__meta__icon">\s+<i class="icon-user"></i>\s+</span>от И. Николаева</a></div><h4 class="sidebar__posts__title"><a href="microblading-5mistakes.html">5 грешки при микроблейдинга</a>\s+</h4></div></li>'

$sidebarNew = @"
<li class="sidebar__posts__item">
                                            <div class="sidebar__posts__image">
                                                <img src="assets/images/blog/1.jpg" alt="Как да избереш правилната процедура за лице">
                                            </div><div class="sidebar__posts__content">
                                                <div class="sidebar__posts__meta"><a href="about.html">
                                                        <span class="sidebar__posts__meta__icon">
                                                            <i class="icon-user"></i>
                                                        </span>от И. Николаева</a></div><h4 class="sidebar__posts__title"><a href="choosing-right-facial.html">Правилната процедура..</a>
                                                </h4></div></li>
"@

$footerOldRegex = '(?s)<li class="footer-widget__posts__item">\s+<div class="footer-widget__posts__image">\s+<img src="assets/images/blog/footer-rp-1-1.jpg\??v?=?[0-9]*" alt="[КПо].*?">\s+</div><div class="footer-widget__posts__content">\s+<div class="footer-widget__posts__meta">\s+<a href="about.html">\s+<span class="footer-widget__posts__meta__icon">\s+<i class="icon-user"></i>\s+</span>от И. Николаева\s+</a>\s+</div><h4 class="footer-widget__posts__title">\s+<a href="microblading-for-all-ages.html">Хармонично Излъчване</a>\s+</h4></div></li>'

$footerNew = @"
<li class="footer-widget__posts__item">
                                    <div class="footer-widget__posts__image">
                                        <img src="assets/images/blog/1.jpg" alt="Правилната процедура за лице">
                                    </div><div class="footer-widget__posts__content">
                                        <div class="footer-widget__posts__meta">
                                            <a href="about.html">
                                                <span class="footer-widget__posts__meta__icon">
                                                    <i class="icon-user"></i>
                                                </span>от И. Николаева
                                            </a>

                                        </div><h4 class="footer-widget__posts__title">
                                            <a href="choosing-right-facial.html">Правилна процедура</a>
                                        </h4></div></li>
"@

foreach ($file in $htmlFiles) {
    $content = Get-Content -Raw -Encoding UTF8 $file.FullName
    $newContent = $content -replace $sidebarOldRegex, $sidebarNew
    $newContent = $newContent -replace $footerOldRegex, $footerNew

    if ($newContent -cne $content) {
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        Write-Host "Updated sidebars/footers in $($file.Name)"
    }
}
