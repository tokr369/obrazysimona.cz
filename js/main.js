/* ObrazySimona.cz - chovani stranky.
 *
 * Nechava jen to, co markup skutecne pouziva:
 *   AOS            animace pri scrollu (data-* na castech stranky)
 *   mobilni menu   .js-clone-nav / .site-mobile-menu (offcanvas)
 *   Swiper         karusel nahore (.swiper-container) - jen index.html
 *   lightGallery   velky snimek galerie (#lightgallery) - jen index.html
 *
 * Puvodni sablona (Colorlib) natahovala take owl carousel, magnific popup,
 * datepicker, countdown, jquery-ui slider a stellar parallax. Zadny z techto
 * elementu v markupu neni, takze skripty ani styly nejsou potreba.
 */

AOS.init({
    duration: 800,
    easing: 'slide',
    once: true
});

jQuery(document).ready(function ($) {
    "use strict";

    /* --- mobilni menu: zkopirovat navigaci do offcanvas panelu --- */
    var siteMenuClone = function () {

        $('.js-clone-nav').each(function () {
            var $this = $(this);
            $this.clone().attr('class', 'site-nav-wrap').appendTo('.site-mobile-menu-body');
        });

        // sipky podmenu - uplatni se, az bude navigace obsahovat .has-children
        setTimeout(function () {
            var counter = 0;
            $('.site-mobile-menu .has-children').each(function () {
                var $this = $(this);

                $this.prepend('<span class="arrow-collapse collapsed">');

                $this.find('.arrow-collapse').attr({
                    'data-toggle': 'collapse',
                    'data-target': '#collapseItem' + counter
                });

                $this.find('> ul').attr({
                    'class': 'collapse',
                    'id': 'collapseItem' + counter
                });

                counter++;
            });
        }, 1000);

        $('body').on('click', '.arrow-collapse', function (e) {
            var $this = $(this);
            if ($this.closest('li').find('.collapse').hasClass('show')) {
                $this.removeClass('active');
            } else {
                $this.addClass('active');
            }
            e.preventDefault();
        });

        $(window).resize(function () {
            if ($(this).width() > 768 && $('body').hasClass('offcanvas-menu')) {
                $('body').removeClass('offcanvas-menu');
            }
        });

        $('body').on('click', '.js-menu-toggle', function (e) {
            var $this = $(this);
            e.preventDefault();

            if ($('body').hasClass('offcanvas-menu')) {
                $('body').removeClass('offcanvas-menu');
                $this.removeClass('active');
            } else {
                $('body').addClass('offcanvas-menu');
                $this.addClass('active');
            }
        });

        // klik mimo panel menu zavre
        $(document).mouseup(function (e) {
            var container = $(".site-mobile-menu");
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                if ($('body').hasClass('offcanvas-menu')) {
                    $('body').removeClass('offcanvas-menu');
                }
            }
        });
    };
    siteMenuClone();

    /* --- karusel maleb nahore --- */
    var swiperSetting = function () {
        if ($('.swiper-container').length === 0) {
            return;
        }
        new Swiper('.swiper-container', {
            pagination: { el: '.swiper-pagination' },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            freeMode: true,
            spaceBetween: 20,
            mousewheel: true,
            slidesPerView: 3,
            breakpoints: {
                668: { slidesPerView: 1 },
                1024: { slidesPerView: 2 }
            }
        });
    };
    swiperSetting();

    /* --- galerie: klik na malbu otevre velky snimek --- */
    var gallerySetting = function () {
        if ($('#lightgallery').length === 0) {
            return;
        }
        $('#lightgallery').lightGallery();
    };
    gallerySetting();
});
