$content = Get-Content -Raw -Encoding UTF8 "c:\xampp\htdocs\ba-in\index.html"

# We replace only the first occurrence for beauty-inspiring.html (the slider item)
$itemRegex = '(?s)<div class="item">\s*<div class="blog-card-two blog-card-two--home3 wow fadeInUp" data-wow-duration=''1500ms''\s*data-wow-delay=''000ms''>.*?</div><!-- /.item -->'

$newItem = @"
                    <div class="item">
                        <div class="blog-card-two blog-card-two--home3 wow fadeInUp" data-wow-duration='1500ms'
                            data-wow-delay='000ms'>
                            <div class="blog-card-two__image">
                                <a href="choosing-right-facial.html" class="blog-card-two__image__item">
                                    <img src="assets/images/blog/1.jpg"
                                        alt="Как да избереш правилната процедура за лице">
                                    <img src="assets/images/blog/1.jpg"
                                        alt="Как да избереш правилната процедура за лице">
                                </a><!-- /.blog-card-two__image__item -->
                                <div class="blog-card-two__date">
                                    <span class="blog-card-two__date__day">01</span>
                                    <span class="blog-card-two__date__month">Март</span>
                                </div><!-- /.blog-card-two__date -->
                            </div><!-- /.blog-card-two__image -->
                            <div class="blog-card-two__content">
                                <ul class="list-unstyled blog-card-two__meta">
                                    <li>
                                        <a href="about.html">
                                            <span class="blog-card-two__meta__icon">
                                                <i class="icon-user"></i>
                                            </span>
                                            от И. Николаева
                                        </a>
                                    </li>
                                    <li>

                                    </li>
                                </ul><!-- /.list-unstyled blog-card-two__meta -->
                                <h3 class="blog-card-two__title"><a href="choosing-right-facial.html">Как да избереш процедура за лице (без трендове)</a></h3>
                                <!-- /.blog-card-two__title -->
                                <a href="choosing-right-facial.html" class="blog-card-two__btn">
                                    <span class="icon-double-arrow"></span>
                                </a><!-- /.blog-card-two__btn -->
                            </div><!-- /.blog-card-two__content -->
                        </div><!-- /.blog-card-two -->
                    </div><!-- /.item -->
"@

$content = $content -replace $itemRegex, $newItem

Set-Content "c:\xampp\htdocs\ba-in\index.html" -Value $content -Encoding UTF8
