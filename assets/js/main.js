/* ==========================================================================
   RAGEEM — Digital Marketing Agency
   Main Script
   Author : Raqeem Team
   Vanilla JavaScript — no dependencies
   ========================================================================== */

(function () {
    'use strict';

    /* ------------------------------------------------------------------
       1. HELPERS
    ------------------------------------------------------------------ */

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    /* ------------------------------------------------------------------
       2. PRELOADER
    ------------------------------------------------------------------ */

    function initPreloader() {
        var preloader = document.getElementById('preloader');
        if (!preloader) return;

        if (reduceMotion) {
            preloader.classList.add('is-hidden');
            preloader.remove();
            return;
        }

        window.addEventListener('load', function () {
            setTimeout(function () {
                preloader.classList.add('is-hidden');
                setTimeout(function () {
                    if (preloader.parentNode) {
                        preloader.parentNode.removeChild(preloader);
                    }
                }, 700);
            }, 500);
        });

        // Safety fallback: hide preloader after max 4s
        setTimeout(function () {
            if (preloader.classList.contains('is-hidden')) return;
            preloader.classList.add('is-hidden');
            setTimeout(function () {
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 700);
        }, 4000);
    }

    /* ------------------------------------------------------------------
       3. SCROLL PROGRESS BAR
    ------------------------------------------------------------------ */

    function initScrollProgress() {
        var bar = document.getElementById('scrollProgress');
        if (!bar) return;

        var update = function () {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            var progress = height > 0 ? scrollTop / height : 0;
            bar.style.transform = 'scaleX(' + progress + ')';
        };

        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    /* ------------------------------------------------------------------
       4. CUSTOM CURSOR (dot + follow ring + hover labels)
    ------------------------------------------------------------------ */

    function initCursor() {
        var cursor = document.getElementById('cursor');
        var follow = document.getElementById('cursorFollow');
        var isFine = window.matchMedia('(pointer: fine)').matches;
        if (!cursor || !follow || reduceMotion || !isFine) return;

        var label = follow.querySelector('.cursor-follow__label');
        var targetX = 0;
        var targetY = 0;
        var curX = 0;
        var curY = 0;
        var visible = false;
        var hoverEl = null;
        var running = false;

        // Interactive targets — show hover state
        var interactiveSelector =
            'a, button, .service-card, .why-card, .strategy-card, .testimonial-card, .accordion__trigger, .contact-item__link';

        function show() {
            visible = true;
            cursor.classList.add('is-visible');
            follow.classList.add('is-visible');
            if (!running) {
                running = true;
                requestAnimationFrame(loop);
            }
        }

        function hide() {
            visible = false;
            cursor.classList.remove('is-visible');
            follow.classList.remove('is-visible');
        }

        document.addEventListener('mousemove', function (e) {
            targetX = e.clientX;
            targetY = e.clientY;

            if (!visible) {
                curX = targetX;
                curY = targetY;
                show();
            }

            // Immediate dot position (GPU-accelerated)
            cursor.style.transform =
                'translate3d(' + targetX + 'px, ' + targetY + 'px, 0) translate(-50%, -50%)';
        }, { passive: true });

        document.addEventListener('mouseleave', hide);

        // Hover state delegation
        document.addEventListener('mouseover', function (e) {
            var el = e.target.closest(interactiveSelector);
            if (el && el !== hoverEl) {
                hoverEl = el;
                var customLabel = el.getAttribute('data-cursor-label');
                if (customLabel) {
                    label.textContent = customLabel;
                    follow.classList.add('has-label');
                } else {
                    follow.classList.add('is-hover');
                }
            }
        });

        document.addEventListener('mouseout', function (e) {
            var el = e.target.closest(interactiveSelector);
            if (el && el === hoverEl) {
                hoverEl = null;
                follow.classList.remove('is-hover', 'has-label');
                label.textContent = '';
            }
        });

        // Smooth follow — only runs while the cursor is active
        function loop() {
            curX += (targetX - curX) * 0.22;
            curY += (targetY - curY) * 0.22;
            follow.style.transform =
                'translate3d(' + curX + 'px, ' + curY + 'px, 0) translate(-50%, -50%)';
            if (visible) {
                requestAnimationFrame(loop);
            } else {
                running = false;
            }
        }
    }

    /* ------------------------------------------------------------------
       5. NAVBAR — scroll state, mobile menu, active link
    ------------------------------------------------------------------ */

    function initNavbar() {
        var header = document.getElementById('siteHeader');
        var toggle = document.getElementById('navToggle');
        var menu = document.getElementById('navMenu');
        var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

        if (!header || !toggle || !menu) return;

        // Scroll state
        var onScroll = function () {
            header.classList.toggle('is-scrolled', window.pageYOffset > 30);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        // Mobile menu toggle
        toggle.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('is-open');
            toggle.classList.toggle('is-open', isOpen);
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close menu on link click
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('is-open');
                toggle.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Active section highlight (scroll-spy)
        var sections = [];
        navLinks.forEach(function (link) {
            var id = link.getAttribute('href');
            if (id && id.charAt(0) === '#') {
                var section = document.querySelector(id);
                if (section) sections.push(section);
            }
        });

        var spyObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (link) {
                    link.classList.toggle(
                        'is-active',
                        link.getAttribute('href') === '#' + entry.target.id
                    );
                });
            });
        }, { rootMargin: '-40% 0px -55% 0px' });

        sections.forEach(function (section) {
            spyObserver.observe(section);
        });
    }

    /* ------------------------------------------------------------------
       6. SCROLL REVEAL
    ------------------------------------------------------------------ */

    function initReveal() {
        var elements = document.querySelectorAll('.reveal');
        if (reduceMotion) {
            elements.forEach(function (el) {
                el.classList.add('is-revealed');
            });
            return;
        }

        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        elements.forEach(function (el) {
            revealObserver.observe(el);
        });
    }

    /* ------------------------------------------------------------------
       7. PARALLAX FLOATING SHAPES
    ------------------------------------------------------------------ */

    function initParallax() {
        var shapes = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
        if (reduceMotion || !window.matchMedia('(pointer: fine)').matches || shapes.length === 0) return;

        var progress = { x: 0, y: 0 };

        window.addEventListener('mousemove', function (e) {
            var nx = (e.clientX / window.innerWidth) - 0.5;
            var ny = (e.clientY / window.innerHeight) - 0.5;
            progress.x += (nx - progress.x) * 0.05;
            progress.y += (ny - progress.y) * 0.05;

            shapes.forEach(function (shape) {
                var depth = parseFloat(shape.getAttribute('data-parallax')) || 0.3;
                // Uses the separate `translate` property so it composes
                // with the CSS `floatY` animation on `transform`.
                shape.style.translate =
                    (progress.x * depth * 40) + 'px ' + (progress.y * depth * 40) + 'px';
            });
        }, { passive: true });
    }

    /* ------------------------------------------------------------------
       8. MAGNETIC BUTTONS
    ------------------------------------------------------------------ */

    function initMagnetic() {
        var items = Array.prototype.slice.call(document.querySelectorAll('[data-magnetic]'));
        if (reduceMotion || !window.matchMedia('(pointer: fine)').matches || items.length === 0) return;

        items.forEach(function (item) {
            var strength = 24;

            item.addEventListener('mousemove', function (e) {
                var rect = item.getBoundingClientRect();
                var relX = e.clientX - rect.left - rect.width / 2;
                var relY = e.clientY - rect.top - rect.height / 2;
                item.style.transform =
                    'translate(' + (relX / rect.width) * strength + 'px, ' + (relY / rect.height) * strength + 'px)';
            });

            item.addEventListener('mouseleave', function () {
                item.style.transform = 'translate(0, 0)';
            });
        });
    }

    /* ------------------------------------------------------------------
       9. COUNTERS
    ------------------------------------------------------------------ */

    function initCounters() {
        var counters = document.querySelectorAll('[data-counter]');
        if (counters.length === 0) return;

        function animateCounter(el) {
            var target = parseInt(el.getAttribute('data-counter'), 10);
            if (isNaN(target)) return;
            if (reduceMotion) {
                el.textContent = target;
                return;
            }

            var duration = 1800;
            var start = null;

            function step(timestamp) {
                if (!start) start = timestamp;
                var progress = Math.min((timestamp - start) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(eased * target);
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    el.textContent = target;
                }
            }

            requestAnimationFrame(step);
        }

        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function (el) {
            counterObserver.observe(el);
        });
    }

    /* ------------------------------------------------------------------
       10. TESTIMONIALS CARDS
        (Static grid — cards animate via scroll reveal)
    ------------------------------------------------------------------ */

    /* ------------------------------------------------------------------
       11. FAQ ACCORDION
    ------------------------------------------------------------------ */

    function initAccordion() {
        var items = Array.prototype.slice.call(document.querySelectorAll('.accordion__item'));
        if (items.length === 0) return;

        items.forEach(function (item) {
            var trigger = item.querySelector('.accordion__trigger');
            var panel = item.querySelector('.accordion__panel');

            if (!trigger || !panel) return;

            trigger.addEventListener('click', function () {
                var isOpen = item.classList.contains('is-open');

                // Close all
                items.forEach(function (other) {
                    var otherPanel = other.querySelector('.accordion__panel');
                    other.classList.remove('is-open');
                    other.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
                    if (otherPanel) otherPanel.style.maxHeight = '0px';
                });

                // Open clicked
                if (!isOpen) {
                    item.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                }
            });
        });
    }

    /* ------------------------------------------------------------------
       12. BACK TO TOP
    ------------------------------------------------------------------ */

    function initBackToTop() {
        var btn = document.getElementById('backToTop');
        if (!btn) return;

        var onScroll = function () {
            btn.classList.toggle('is-visible', window.pageYOffset > 600);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    /* ------------------------------------------------------------------
       12. SCRAMBLE TEXT (rotating hero eyebrow phrases)
    ------------------------------------------------------------------ */

    function initScrambleText() {
        var el = document.getElementById('scrambleText');
        if (!el) return;

        var phrases = [
            'وكالة تسويق رقمي متخصصة',
            'نصنع حضورًا رقميًا لا يُنسى',
            'متخصصون في الهوية البصرية',
            'شريكك الاستراتيجي للنمو',
            'تصميم يليق بطموحك',
            'إبداع مدروس بنتائج ملموسة'
        ];

        var chaosChars = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي0123456789';
        var phraseIndex = 0;
        var frame = 0;
        var resolved = 0;
        var state = 'idle'; // idle | scrambling | settling
        var rafId = null;
        var timerId = null;
        var startTime = 0;

        function randomChar() {
            return chaosChars.charAt(Math.floor(Math.random() * chaosChars.length));
        }

        function scrambleFrame(now) {
            var target = phrases[phraseIndex];

            // Speed through scrambled state then settle character-by-character
            var scrambleDur = 700;
            var settleDur = 650;

            if (now - startTime < scrambleDur) {
                // Full scramble
                var output = '';
                for (var i = 0; i < target.length; i++) {
                    output += randomChar();
                }
                el.textContent = output;
            } else {
                var settled = Math.min(target.length, resolved + 1);
                var output2 = '';
                for (var j = 0; j < target.length; j++) {
                    output2 += j < settled ? target.charAt(j) : randomChar();
                }
                el.textContent = output2;
                if (settled >= target.length) {
                    state = 'settled';
                    frame = 0;
                    return; // stop rAF, wait for next phrase
                }
                resolved = settled;
            }

            frame += 1;
            rafId = requestAnimationFrame(scrambleFrame);
        }

        function beginScramble() {
            resolved = 0;
            state = 'scrambling';
            startTime = performance.now();
            rafId = requestAnimationFrame(scrambleFrame);
        }

        function cycle() {
            phraseIndex = (phraseIndex + 1) % phrases.length;
            beginScramble();
            timerId = setTimeout(cycle, 2600);
        }

        if (reduceMotion) {
            // Static text, no animation
            return;
        }

        timerId = setTimeout(cycle, 2600);
    }

    /* ------------------------------------------------------------------
       13. FOOTER YEAR
    ------------------------------------------------------------------ */

    function initYear() {
        var yearEl = document.getElementById('year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }

    /* ------------------------------------------------------------------
       INIT
    ------------------------------------------------------------------ */

    onReady(function () {
        initPreloader();
        initScrollProgress();
        initCursor();
        initNavbar();
        initReveal();
        initParallax();
        initMagnetic();
        initCounters();
        initAccordion();
        initScrambleText();
        initBackToTop();
        initYear();
    });
})();
