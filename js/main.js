/* ObrazySimona.cz - chovani stranky.
 *
 * Nechava jen to, co markup skutecne pouziva:
 *   AOS            animace pri scrollu (data-* na castech stranky)
 *   mobilni menu   .js-clone-nav / .site-mobile-menu (offcanvas)
 *   Swiper         karusel nahore (.swiper-container) - jen index.html
 *   lightGallery   velky snimek galerie (#lightgallery) - jen index.html
 *   #rok           rok v paticce (bez document.write)
 *
 * Puvodni sablona (Colorlib) natahovala take owl carousel, magnific popup,
 * datepicker, countdown, jquery-ui slider a stellar parallax. Zadny z techto
 * elementu v markupu neni, takze skripty ani styly nejsou potreba. Od
 * listopadu 2026 zmizely i bootstrap.min.js, popper.min.js a jquery-migrate:
 * stranka nepouziva zadne Bootstrap komponenty (zadny data-toggle) a jQuery
 * 3.3.1 nepotrebuje zalatu pro stare API.
 */

AOS.init({
    duration: 800,
    easing: 'slide',
    once: true,
    // Kdo si preje vynechat animace ve systemu, nema dostavat animace na webu.
    disable: function () {
        return window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
});

jQuery(document).ready(function ($) {
    "use strict";

    /* --- mobilni menu: zkopirovat navigaci do offcanvas panelu --- */
    var siteMenuClone = function () {

        $('.js-clone-nav').each(function () {
            var $this = $(this);
            $this.clone().attr('class', 'site-nav-wrap').appendTo('.site-mobile-menu-body');
        });

        // Sipky podmenu tu byly, dokud navigace neobsahovala .has-children.
        // Menu ma dva odkazy a zadne podmenu, proto tu neni ani Bootstrap
        // collapse, ktery je potreboval. Kdyby se podmenu nekdy pridala,
        // je treba vratit obe casti - skript i osetreni v css/style.css.

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

    /* --- paticka: aktualni rok. Nahrazuje document.write, ktery v markupu
           byl — stranka bez nej funguje i pod prisnym CSP. --- */
    $('#rok').text(new Date().getFullYear());
});
