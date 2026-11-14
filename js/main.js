/* ObrazySimona.cz - chovani stranky, uz bez jQuery.
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
 * stranka nepouziva zadne Bootstrap komponenty (zadny data-toggle).
 *
 * Od 14. 11. 2026 je pryc i jquery-3.3.1.min.js (86,9 kB). Zadu to vydrzi:
 * lightGallery 3 jQuery od verze 2 nepouziva, Swiper 4 si nosi vlastni Dom7
 * a na AOS staci globala AOS. Zbylo par DOM volani, ktera stranka zvladne
 * sama - klon navigace do offcanvas panelu, prepinani tridy pri kliknuti na
 * nabidku, zavreni pri kliknuti mimo panel a pri zmene sirky okna, rok v
 * paticce. Prepsano 1:1 vcetne drobnosti, na ktere byl web zvykly: panel se po
 * kliknuti mimo zavre, ale .active na tlacitku zustava; klon navigace ma prepisanou
 * tridu na site-nav-wrap; skript sam ceka na DOMContentLoaded.
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

(function () {
    "use strict";

    // Skript stoji na konci tela, takze ve chvili spusteni jeste neni dokument
    // docteny. To same co delal jQuery(document).ready: dokud probiha
    // parsovani, pockame na DOMContentLoaded; kdyz uz je docteno, spustime hned.
    var ready = function (fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    };

    // Delegace: handler visi na rodici a vola se jen pro odpovidajici potomky -
    // umi to i jQuery $('root').on('click', 'potomek', ...). 'this' je element, na
    // ktery selektor sedl (jako u jQuery), a k volani dojde jen tehdy, kdyz je ten
    // element uvnitr rodice, na kterem handler visi.
    var delegated = function (root, selector, fn) {
        return function (e) {
            var start = e.target;
            if (!start || !start.closest) {
                return null;
            }
            var matched = start.closest(selector);
            if (!matched || !root.contains(matched)) {
                return null;
            }
            return fn.call(matched, e, matched);
        };
    };

    /* --- mobilni menu: zkopirovat navigaci do offcanvas panelu --- */
    var siteMenuClone = function () {
        var bodies = document.querySelectorAll('.site-mobile-menu-body');

        document.querySelectorAll('.js-clone-nav').forEach(function (source) {
            Array.prototype.forEach.call(bodies, function (body) {
                var copy = source.cloneNode(true);
                // puvodni kod (jQuery .attr('class', ...)) prepisal class cele,
                // takze klon zustava bez bootstrapovych trid (d-none, mx-auto)
                copy.className = 'site-nav-wrap';
                body.appendChild(copy);
            });
        });

        // Sipky podmenu tu byly, dokud navigace neobsahovala .has-children.
        // Menu ma dva odkazy a zadne podmenu, proto tu neni ani Bootstrap
        // collapse, ktery je potreboval. Kdyby se podmenu nekdy pridaly, je
        // treba doplnit obe casti - skript i osetreni v css/style.css.

        window.addEventListener('resize', function () {
            // $(window).width() vracel innerWidth, takze same
            if (window.innerWidth > 768 && document.body.classList.contains('offcanvas-menu')) {
                document.body.classList.remove('offcanvas-menu');
            }
        });

        // klik na jehokoli .js-menu-toggle (otvirac i zavirac v panelu) panel
        // prehodi; .active dostane prave ten element, na ktery bylo sahnuto
        document.body.addEventListener('click', delegated(document.body, '.js-menu-toggle', function (e, toggle) {
            e.preventDefault();
            if (document.body.classList.contains('offcanvas-menu')) {
                document.body.classList.remove('offcanvas-menu');
                toggle.classList.remove('active');
            } else {
                document.body.classList.add('offcanvas-menu');
                toggle.classList.add('active');
            }
        }));

        // klik mimo panel menu zavre; .active na tlacitku zustava - nedelal to
        // ani puvodni kod (panel v DOM zustava, jen se z telesa odebere trida)
        document.addEventListener('mouseup', function (e) {
            var target = e.target;
            var panels = document.querySelectorAll('.site-mobile-menu');
            for (var i = 0; i < panels.length; i++) {
                if (panels[i] === target || panels[i].contains(target)) {
                    return;
                }
            }
            document.body.classList.remove('offcanvas-menu');
        });
    };

    /* --- karusel maleb nahore --- */
    var swiperSetting = function () {
        if (!document.querySelector('.swiper-container')) {
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

    /* --- galerie: klik na malbu otevre velky snimek ------------------
     * lightGallery 3.0 (UMD build, bez jQuery). Nastaveni vraci chovani
     * verze 1.6.11, kterou web mel dosud:
     *   speed 600, backdropDuration 150, hideBarsDelay 6000, preload 1
     *                  . . . puvodni defaulty: stejne dlouhy prechod,
     *                        stejne rychly najezd pozadi, lista se po 6 s
     *                        necinnosti schova (nahledy zustavaji)
     *   mousewheel     . . . kolo mysi v lightboxu listkuje - v3 to umi
     *                        same, jquery.mousewheel uz tedy neni treba
     *   toolbarOverflow: false a mobileSettings: {}
     *                  . . . na mobilu se ikony radi na druhy radek jako
     *                        dosud; ziadna se neschovava do "Vice moznosti"
     *                        a na dotyk se nezahodi
     *   showZoomInOutIcons: true
     *                  . . . trojice tlacitek zoom (priblizit, oddalit,
     *                        skutecnou velikost); default v3 ma jediny
     *                        prepinal, ktery meni ikonu podle stavu
     *   hashDriver: 'history' + customSlideName: true
     *                  . . . deep-link #lg=1&slide=<slug> se do adresy pise
     *                        pres history.replaceState, tedy jako dosud; od
     *                        14. 11. 2026 je v adrese misto cisla slug malby,
     *                        aby odkaz vydrzel i po presunuti v galerii
     *   data-share-url na kazdem nahledu
     *                  . . . WhatsApp, e-mail, Facebook, X i „Kopírovat
     *                        odkaz“ pouzivaji adresu stranky malby
     *                        /galerie/<slug>.html, ne aktualni adresu s
     *                        fragmentem — roboti fragment nevidi a karta by
     *                        bez vlastni adresy nemohla mit vlastni nahled
     * Navic, ale neviditelne: Tab se toci uvnitr dialogu, pribyvaji oznamy
     * pro ctenare obrazovky a pri "prefers-reduced-motion" v3 prechody sama
     * vypina (stejne tak vyse vypina AOS).
     *
     * Zmenene jsou zamerne cile sdileni: Facebook a X zustavaji, Google+
     * je mrtvy projekt a Pinterest na ceskem trhu nic nedava. Mist ne
     * WhatsApp (nejpouzivanejsi zpravak tady), e-mail a kopirovani
     * odkazu. Instagram v nabidce neni - webove sdileni odkazu na nej
     * neexistuje (odkaz se do Instagramu neprenese), jeho roli proto
     * predbira WhatsApp.
     */
    var gallerySetting = function () {
        var el = document.getElementById('lightgallery');
        if (!el) {
            return;
        }

        var SITE = 'ObrazySimona.cz';

        // lightGallery prispiva do adresy #lg=1&slide=<slug> (customSlideName),
        // ale to neni to, co se posila svetu: karta v Telegramu i WhatsAppu se
        // postavi podle adresy BEZ fragmentu, a tou je stranka malby
        // /galerie/<slug>.html. Otevre ji prohlizec, neni-li JavaScript vypnuty,
        // do galerie na tentoz snimek.
        var shareUrl = function (item) {
            return (item && item.shareUrl) || window.location.href;
        };
        // alt v <img> je nazev malby - jediny cisty titulek, ktery item ma
        var shareTitle = function (item) {
            return item.alt || '';
        };

        /* ikony pro vlastni cile: Material Icons (Apache-2.0) pro e-mail a
           odkaz, znackovou cestu WhatsApp dodavaji Simple Icons (CC0) */
        var ICON = {
            whatsapp: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.83 9.83 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>',
            mail: '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
            link: '<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>'
        };
        var shareIcon = function (name) {
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" ' +
                'height="20" fill="currentColor" aria-hidden="true" focusable="false">' +
                ICON[name] + '</svg>';
        };
        // polozka nabidky ma tvar, ktery v3 pouziva pro sve vlastni cile
        var shareItem = function (type, label, icon) {
            return '<li><a class="lg-share-' + type + '" rel="noopener" target="_blank">' +
                '<span class="lg-icon">' + shareIcon(icon) + '</span>' +
                '<span class="lg-dropdown-text">' + label + '</span></a></li>';
        };

        /* kopirovani odkazu: schranka chce HTTPS (GitHub Pages ji ma) a v
           lokalnim http:// preview se vraci na starsi cestu pres textarea */
        var copyFallback = function (text) {
            var area = document.createElement('textarea');
            area.value = text;
            area.setAttribute('readonly', '');
            area.style.position = 'fixed';
            area.style.top = '-1000px';
            document.body.appendChild(area);
            area.select();
            var ok = false;
            try {
                ok = document.execCommand('copy');
            } catch (err) {
                ok = false;
            }
            document.body.removeChild(area);
            return ok;
        };
        var copyLink = function (text, done) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(
                    function () { done(true); },
                    function () { done(copyFallback(text)); }
                );
                return;
            }
            done(copyFallback(text));
        };
        var confirmCopied = function (link) {
            var label = link.querySelector('.lg-dropdown-text');
            if (!label) {
                return;
            }
            label.textContent = 'Zkopírováno ✓';
            window.setTimeout(function () {
                label.textContent = 'Kopírovat odkaz';
            }, 1600);
        };
        // "Kopírovat odkaz" neni odkaz, ale kopie - starost o ni je na nas
        document.addEventListener('click', function (e) {
            var link = e.target && e.target.closest ? e.target.closest('.lg-share-copy') : null;
            if (!link) {
                return;
            }
            e.preventDefault();
            copyLink(link.href, function (ok) {
                if (ok) {
                    confirmCopied(link);
                }
            });
        });

        var gallery = lightGallery(el, {
            // lightGallery 3 je GPL-3.0 nebo komercni licence. Pro vlastnicke
            // stranky bez GPL se kupuje klic LIG-... (lightgalleryjs.com/license)
            // a pise se sem; placeholder jen tlumi hlasku v konzoli.
            licenseKey: '0000-0000-000-0000',

            // ikony se do toolbaru pridavaji v tomhle poradi a pluji doprava,
            // takze posledni pridana je uplne vlevo - vysledek jako u 1.6.11
            plugins: [lgHash, lgThumbnail, lgAutoplay, lgFullscreen, lgZoom, lgShare],

            speed: 600,
            backdropDuration: 150,
            hideBarsDelay: 6000,
            preload: 1,
            mousewheel: true,
            toolbarOverflow: false,
            mobileSettings: {},
            showZoomInOutIcons: true,
            hashDriver: 'history',

            // Malba se v adrese jmenuje svojim vlastnim slugem (data-slide-name
            // na nahledu), ne cislem poradi: #lg=1&slide=zlaty-retrivr. Cislo
            // by prestavalo platit pri kazdem presunu v galerii, cimz by
            // ztraty starsich odkazu neuslo predesit. Plugin take umi cisla
            // (viz pojistka nize), ale vzdycky prepisuje na slug.
            customSlideName: true,

            // obraz saha az dolu, presahuje ho popisek a nahledy - jak to
            // delala 1.6.11 (v3 default nechava obraz vysoucet nad ne).
            // Navic tim je tlacitko pro schovani nahledu, ktere 1.6.11 mela
            // (vpravo dole), zase na svete - v3 ho bez prekryvani nenabizi.
            allowMediaOverlap: true,
            toggleThumb: true,

            // na dotyk by v3 defaultne otevirala systemovou nabidku sdileni;
            // drzime tu samou nabidku jako na pocitaci (prepnout: true)
            preferNativeShare: false,

            // Facebook a X maju vestavenou ikonu znacky, Pinterest vypnuty
            pinterest: false,
            additionalShareOptions: [
                {
                    selector: '.lg-share-whatsapp',
                    generateLink: function (item) {
                        return 'https://api.whatsapp.com/send?text=' +
                            encodeURIComponent(shareTitle(item) + ' — ' + SITE + ' ' + shareUrl(item));
                    },
                    dropdownHTML: shareItem('whatsapp', 'WhatsApp', 'whatsapp')
                },
                {
                    selector: '.lg-share-mail',
                    generateLink: function (item) {
                        return 'mailto:?subject=' +
                            encodeURIComponent(shareTitle(item) + ' — ' + SITE) +
                            '&body=' + encodeURIComponent(shareTitle(item) + '\n' + shareUrl(item) + '\n');
                    },
                    dropdownHTML: shareItem('mail', 'E-mail', 'mail')
                },
                {
                    selector: '.lg-share-copy',
                    generateLink: shareUrl,
                    dropdownHTML: shareItem('copy', 'Kopírovat odkaz', 'link')
                }
            ],

            // veskere popisky lightboxu v cestine (v3 je dava do aria-label)
            strings: {
                closeGallery: 'Zavřít galerii',
                previousSlide: 'Předchozí malba',
                nextSlide: 'Další malba',
                download: 'Stáhnout obrázek',
                share: 'Sdílet',
                moreOptions: 'Více možností',
                toggleAutoplay: 'Spustit nebo pozastavit promítání',
                toggleFullscreen: 'Celá obrazovka',
                toggleThumbnails: 'Přepnout náhledy',
                zoomIn: 'Přiblížit',
                zoomOut: 'Oddálit',
                viewActualSize: 'Skutečná velikost',
                galleryLabel: 'Galerie maleb',
                slideAnnouncement: 'Malba {index} z {total}',
                mediaLoadingFailed: 'Nepodařilo se načíst obrázek.'
            }
        });

        /* Pojistka pro drive sdilene adresy. Dokud galerie psala do adresy
           cislo, mohl nekdo mit v historie #lg=1&slide=6. Plugin s customSlideName
           v takovem pripade nenajde jmeno a spadl by na prvni malbu; to je
           sice prezitelne, ale u ciste ciselneho udaje to neni nutne —
           dokazeme ho prevest na poradi. Predava se jen veci, ktere plugin
           skutecne expose (vsechny jsou vlastni objektu, takze opatrne). */
        var hashPlugin = gallery.hashPlugin || (gallery.plugins || []).filter(function (pl) {
            return pl && typeof pl.getIndexFromUrl === 'function';
        })[0];
        if (hashPlugin && !hashPlugin.__obrazysimonaNumberGuard) {
            hashPlugin.__obrazysimonaNumberGuard = true;
            var originalIndex = hashPlugin.getIndexFromUrl.bind(hashPlugin);
            hashPlugin.getIndexFromUrl = function (hash) {
                if (hash === undefined && hashPlugin.driver) {
                    hash = hashPlugin.driver.getHash();
                }
                var index = originalIndex(hash);
                if (index === 0 && typeof hash === 'string') {
                    var arg = hash.split('&slide=')[1];
                    if (arg !== undefined && /^\d+$/.test(arg)) {
                        var n = parseInt(arg, 10);
                        if (n >= 0 && n < gallery.galleryItems.length) index = n;
                    }
                }
                return index;
            };
        }

        // X odkaz bere text z item.tweetText; bez nej by byl prazdny
        gallery.galleryItems.forEach(function (item) {
            if (!item.tweetText && item.alt) {
                item.tweetText = item.alt + ' — ' + SITE;
            }
        });
    };

    ready(function () {
        siteMenuClone();
        swiperSetting();
        gallerySetting();

        /* --- paticka: aktualni rok. Nahrazuje document.write, ktery v markupu
               byl — stranka bez nej funguje i pod prisnym CSP. --- */
        var rok = document.getElementById('rok');
        if (rok) {
            rok.textContent = String(new Date().getFullYear());
        }
    });
})();
