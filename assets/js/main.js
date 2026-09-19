/* ==========================================================================
   RAQEEM — editorial redesign
   Vanilla JavaScript. No dependencies except the vendored Lenis smooth
   scroll library (optional; the site works without it).
   ========================================================================== */

(function () {
    'use strict';

    /* ------------------------------------------------------------------
       CONFIG
    ------------------------------------------------------------------ */

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    var DATA = (window.RAQEEM_PORTFOLIO && window.RAQEEM_PORTFOLIO.categories) || [];
    var byId = {};
    DATA.forEach(function (c) { byId[c.id] = c; });

    /* ------------------------------------------------------------------
       SMALL HELPERS
    ------------------------------------------------------------------ */

    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

    function make(tag, cls) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        return n;
    }

    function makeImg(src, alt, w, h, eager) {
        var i = document.createElement('img');
        if (src) i.src = src;
        i.alt = alt || '';
        if (w) i.width = w;
        if (h) i.height = h;
        i.loading = eager ? 'eager' : 'lazy';
        i.decoding = 'async';
        return i;
    }

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function randInt(n) { return Math.floor(Math.random() * n); }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function samePair(a, b, p) { return !!p && ((a === p[0] && b === p[1]) || (a === p[1] && b === p[0])); }

    function ctrlBtn(arrow, label) {
        var b = make('button', 'ctrl');
        b.type = 'button';
        b.setAttribute('aria-label', label);
        var s = make('span', 'ctrl__arrow');
        s.textContent = arrow;
        b.appendChild(s);
        return b;
    }

    function workLabel(n) {
        if (n === 1) return 'عمل واحد';
        if (n === 2) return 'عملان';
        if (n >= 3 && n <= 10) return n + ' أعمال';
        return n + ' عملًا';
    }

    /* ------------------------------------------------------------------
       SECTOR META — one monoline icon family + art-direction intro copy
    ------------------------------------------------------------------ */

    var ICON_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

    var SECTOR_META = {
        law: {
            icon: ICON_OPEN + '<path d="M12 3v17"/><path d="M5 6.5h14"/><path d="M9.5 20h5"/><path d="M5 6.5V12"/><path d="M2 12q3 3.6 6 0"/><path d="M19 6.5V12"/><path d="M16 12q3 3.6 6 0"/></svg>',
            intro: 'الاتصال البصري القانوني يحتاج إلى هيبة بلا مبالغة، ووضوح بلا جمود. نضبط الـArt Direction والـVisual Hierarchy واختيار الصورة بما يعكس الثقة والخبرة، مع الحفاظ على شخصية المكتب وطبيعة خطابه القانوني.'
        },
        ads: {
            icon: ICON_OPEN + '<circle cx="10.5" cy="12.5" r="6.5"/><circle cx="10.5" cy="12.5" r="2.3"/><path d="M10.5 12.5 19 4"/><path d="M14.6 3.6H19.4V8.4"/></svg>',
            intro: 'الإعلان الجيد ليس تكوينًا جميلًا حول المنتج. نبدأ من الرسالة والجمهور والـPositioning، ثم نبني الـConcept والـArt Direction ونوجّه الصورة والـTypography لصناعة Key Visual يلفت الانتباه ويقود العين نحو ما نريد قوله.'
        },
        reels: {
            icon: ICON_OPEN + '<rect x="4.5" y="5" width="15" height="14" rx="2.6"/><path d="M10.4 9.3 15.2 12l-4.8 2.7z"/></svg>',
            intro: 'الثواني الأولى تبدأ قبل تشغيل الفيديو. نبني الصورة المصغرة حول الـVisual Hook، ونضبط الـHierarchy والتباين والتعبير البصري لتُفهم الفكرة في لحظة وتنافس داخل بيئة مزدحمة بالمحتوى.'
        },
        medical: {
            icon: ICON_OPEN + '<path d="M12 5.5v13"/><path d="M5.5 12h13"/></svg>',
            intro: 'في القطاع الطبي، الثقة تسبق الجمال. نبني الـArt Direction حول المصداقية والوضوح، ونوازن بين الصورة والـTypography والـVisual Hierarchy لصناعة حضور مهني يحافظ على هوية الطبيب أو المنشأة ويجعل المعلومة أسهل في الفهم.'
        },
        personal: {
            icon: ICON_OPEN + '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="10" r="2.5"/><path d="M7.4 17.4c1.1-2.3 2.8-3.5 4.6-3.5s3.5 1.2 4.6 3.5"/></svg>',
            intro: 'البراند الشخصي لا يُبنى بقالب جاهز؛ بل من الشخصية والخبرة والجمهور الذي نخاطبه. نترجم ذلك إلى Visual Language متّسقة تجعل المحتوى معروفًا بصاحبه حتى قبل قراءة الاسم.'
        },
        carousels: {
            icon: ICON_OPEN + '<rect x="8.5" y="5" width="11" height="14" rx="2"/><path d="M5.4 8.2v9.6"/><path d="M2.6 10.2v5.6"/></svg>',
            intro: 'نتعامل مع الكاروسيل كتجربة بصرية متسلسلة، لا كصفحات منفصلة. يبدأ من Hook واضح، ثم نستخدم الـVisual Hierarchy والإيقاع والـArt Direction لقيادة العين وخلق دافع طبيعي للانتقال من سلايد إلى آخر.'
        }
    };

    // Keep each mixed-language term as ONE isolated unit so the Arabic "الـ"
    // prefix can never detach from its Latin term in the rendered sentence.
    // e.g. "الـArt Direction", "الـTypography", "الـVisual Hierarchy".
    function bidiText(s) {
        var RE = /(الـ)([A-Za-z][A-Za-z]*(?: [A-Za-z][A-Za-z]*)*)|([A-Za-z][A-Za-z]*(?: [A-Za-z][A-Za-z]*)*)/g;
        return String(s).replace(RE, function (m, prefix, prefixedTerm, latinTerm) {
            if (prefix) {
                return '<bdi class="lx">' + prefix + '<span dir="ltr">' + prefixedTerm + '</span></bdi>';
            }
            return '<bdi class="lx" dir="ltr">' + latinTerm + '</bdi>';
        });
    }

    // Apply the same isolation to static (non-generated) mixed-language copy.
    function applyBidi() {
        $$('[data-bidi]').forEach(function (el) {
            el.innerHTML = bidiText(el.textContent);
        });
    }

    function sectorIcon(id) {
        var meta = SECTOR_META[id];
        if (!meta || !meta.icon) return null;
        var span = make('span', 'sector-icon');
        span.setAttribute('aria-hidden', 'true');
        span.innerHTML = meta.icon;
        return span;
    }

    function buildSectorIntro(cat, countText) {
        var meta = SECTOR_META[cat.id] || {};
        var header = make('header', 'sector-intro');
        if (meta.icon) {
            var icon = make('span', 'sector-intro__icon');
            icon.setAttribute('aria-hidden', 'true');
            icon.innerHTML = meta.icon;
            header.appendChild(icon);
        }
        var title = make('h2', 'sector-intro__title');
        title.textContent = cat.title;
        header.appendChild(title);
        if (meta.intro) {
            var desc = make('p', 'sector-intro__desc');
            desc.innerHTML = bidiText(meta.intro);
            header.appendChild(desc);
        }
        var count = make('span', 'sector-intro__count');
        count.textContent = countText;
        header.appendChild(count);
        return header;
    }

    /* ------------------------------------------------------------------
       SMOOTH SCROLL (Lenis, optional)
    ------------------------------------------------------------------ */

    var lenis = null;

    function initSmoothScroll() {
        if (reduceMotion || typeof window.Lenis === 'undefined') return;
        lenis = new window.Lenis({
            lerp: 0.1,
            wheelMultiplier: 1,
            smoothWheel: true,
            syncTouch: false,
            autoRaf: false
        });
        var lenisRaf = function (time) {
            lenis.raf(time);
            window.requestAnimationFrame(lenisRaf);
        };
        window.requestAnimationFrame(lenisRaf);
    }

    function scrollToHash(hash) {
        var target = document.querySelector(hash);
        if (!target) return;
        if (lenis) {
            lenis.scrollTo(target, { offset: -76, duration: 1.1 });
        } else {
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
    }

    /* ------------------------------------------------------------------
       NAVIGATION + MENU
    ------------------------------------------------------------------ */

    var navEl, menuEl, menuBtn;
    var menuOpen = false;

    function initNav() {
        navEl = $('#nav');
        menuEl = $('#menuOverlay');
        menuBtn = $('#menuBtn');
        if (!navEl || !menuEl || !menuBtn) return;

        var onScroll = function () {
            var y = window.pageYOffset || document.documentElement.scrollTop;
            navEl.classList.toggle('is-scrolled', y > 24);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        menuBtn.addEventListener('click', function () {
            menuOpen ? closeMenu() : openMenu();
        });
    }

    function openMenu() {
        menuOpen = true;
        menuEl.classList.add('is-open');
        menuEl.setAttribute('aria-hidden', 'false');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open', 'is-locked');
        if (lenis) lenis.stop();
    }

    function closeMenu() {
        if (!menuOpen) return;
        menuOpen = false;
        menuEl.classList.remove('is-open');
        menuEl.setAttribute('aria-hidden', 'true');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        if (!overlay.open) {
            document.body.classList.remove('is-locked');
            if (lenis) lenis.start();
        }
    }

    // Menu link stagger delays
    function initMenuStagger() {
        $$('.menu__link').forEach(function (link, i) {
            link.style.setProperty('--i', i);
        });
    }

    /* ------------------------------------------------------------------
       ANCHOR LINKS
    ------------------------------------------------------------------ */

    function initAnchors() {
        document.addEventListener('click', function (e) {
            var a = e.target.closest('a[href^="#"]');
            if (!a) return;
            var href = a.getAttribute('href');
            if (!href || href === '#') return;
            if (href.indexOf('#work/') === 0) return; // handled by overlay
            e.preventDefault();
            closeMenu();
            scrollToHash(href);
            history.pushState(null, '', href);
        });
    }

    /* ------------------------------------------------------------------
       LINE REVEALS
    ------------------------------------------------------------------ */

    function initLineDelays() {
        $$('.hero__title, .about__statement').forEach(function (group) {
            $$('.line__i', group).forEach(function (line, i) {
                line.style.setProperty('--d', (i * 0.075) + 's');
            });
        });
        // Hero reveals on load
        var hero = $('.hero');
        if (hero) window.requestAnimationFrame(function () { hero.classList.add('is-visible'); });
    }

    /* ------------------------------------------------------------------
       SCROLL REVEAL OBSERVER
    ------------------------------------------------------------------ */

    var revealObserver = null;

    function initReveal() {
        var targets = $$('.reveal, .reveal-img, .about__statement');

        if (reduceMotion || !('IntersectionObserver' in window)) {
            targets.forEach(function (t) { t.classList.add('is-visible'); });
            return;
        }

        revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

        targets.forEach(function (t) { revealObserver.observe(t); });
    }

    /* ------------------------------------------------------------------
       PROJECT STACK
    ------------------------------------------------------------------ */

    // Touch focus interaction: evaluated inside the existing scroll frame
    // (no extra loop). Only the stack whose CENTER is nearest the middle of
    // the viewport's central zone stays open. Positions are cached, so no
    // layout reads happen per frame.
    var activeTouchStack = null;
    var touchStacks = [];
    var touchCache = [];
    var touchCacheDirty = true;

    function registerTouchStack(el, activate, deactivate) {
        touchStacks.push({ el: el, activate: activate, deactivate: deactivate });
        touchCacheDirty = true;
    }

    function cacheTouchStacks() {
        var sy = window.pageYOffset || document.documentElement.scrollTop;
        touchCache = touchStacks.map(function (entry) {
            var r = entry.el.getBoundingClientRect();
            return { entry: entry, top: r.top + sy, h: r.height };
        });
        touchCacheDirty = false;
    }

    function updateTouchFocus() {
        if (reduceMotion || finePointer || !touchStacks.length) return;
        if (overlay && overlay.open) {
            if (activeTouchStack) {
                activeTouchStack.deactivate();
                activeTouchStack = null;
            }
            return;
        }
        if (touchCacheDirty) cacheTouchStacks();

        var vh = window.innerHeight;
        var bandTop = vh * 0.30;
        var bandBottom = vh * 0.70;
        var middle = vh / 2;
        var sy = window.pageYOffset || document.documentElement.scrollTop;
        var best = null;
        var bestDist = Infinity;
        var i;

        for (i = 0; i < touchCache.length; i++) {
            var item = touchCache[i];
            var center = item.top + item.h / 2 - sy;
            if (center < bandTop || center > bandBottom) continue;
            var dist = Math.abs(center - middle);
            if (dist < bestDist) { bestDist = dist; best = item.entry; }
        }

        if (best === activeTouchStack) return;

        // Hysteresis: keep the current stack unless a new one is clearly
        // closer to the centre — avoids flicker around the threshold.
        if (activeTouchStack && best) {
            for (i = 0; i < touchCache.length; i++) {
                if (touchCache[i].entry !== activeTouchStack) continue;
                var ac = touchCache[i].top + touchCache[i].h / 2 - sy;
                if (ac >= bandTop && ac <= bandBottom && bestDist > Math.abs(ac - middle) - vh * 0.06) return;
                break;
            }
        }

        if (activeTouchStack) activeTouchStack.deactivate();
        activeTouchStack = best;
        if (best) best.activate();
    }

    // Reference ratio for the overview grid (4:5). Each stack is scaled to that
    // height so mixed 4:5 / 9:16 artwork keeps its own ratio and never crops.
    var REF_RATIO = 0.8;

    function makeStack(opts) {
        var stack = make('div', 'stack');
        var arW = opts.arW || 4;
        var arH = opts.arH || 5;
        stack.style.setProperty('--ar', arW + ' / ' + arH);
        stack.style.setProperty('--w-scale', Math.min(1, (arW / arH) / REF_RATIO).toFixed(4));

        var leafA = make('figure', 'stack__leaf stack__leaf--a');
        var leafB = make('figure', 'stack__leaf stack__leaf--b');
        var main = make('figure', 'stack__main');

        var imgA = makeImg('', '', null, null, false);
        var imgB = makeImg('', '', null, null, false);
        leafA.appendChild(imgA);
        leafB.appendChild(imgB);

        main.appendChild(makeImg(opts.main.src, opts.main.alt, opts.main.w, opts.main.h, opts.eager));

        if (opts.explore) {
            // Explore cue lives INSIDE the artwork (bottom fade), never below it.
            var explore = make('span', 'stack__explore');
            explore.setAttribute('aria-hidden', 'true');
            var exploreTxt = make('span', 'stack__explore-txt');
            exploreTxt.textContent = 'استكشف المشروع ↗';
            explore.appendChild(exploreTxt);
            main.appendChild(explore);
        }

        stack.appendChild(leafA);
        stack.appendChild(leafB);
        stack.appendChild(main);

        var pool = opts.pool || null;
        var fixed = opts.fixed || null;
        var last = null;

        function applyLeaf(imgEl, obj) {
            if (!obj) return;
            imgEl.src = obj.src;
            if (obj.w) imgEl.width = obj.w;
            if (obj.h) imgEl.height = obj.h;
        }

        function setPair() {
            if (!pool || pool.length < 2) return;
            var ai, bi, tries = 0;
            do {
                ai = randInt(pool.length);
                bi = randInt(pool.length);
                tries++;
            } while ((ai === bi || samePair(ai, bi, last)) && tries < 16);
            if (ai === bi) return;
            last = [ai, bi];
            applyLeaf(imgA, pool[ai]);
            applyLeaf(imgB, pool[bi]);
        }

        function applyFixed() {
            if (!fixed) return;
            applyLeaf(imgA, fixed[0]);
            applyLeaf(imgB, fixed[1]);
        }

        if (finePointer) {
            // Desktop: preload a small pair on approach, then pick a new
            // random pair once per mouseenter (never during the animation).
            if ('IntersectionObserver' in window) {
                var preloadIO = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (!entry.isIntersecting) return;
                        if (pool && pool.length > 1) setPair();
                        else if (fixed) applyFixed();
                        preloadIO.disconnect();
                    });
                }, { rootMargin: '250px 0px' });
                preloadIO.observe(stack);
            } else {
                if (pool && pool.length > 1) setPair(); else if (fixed) applyFixed();
            }

            stack.addEventListener('mouseenter', function () {
                if (pool && pool.length > 1) setPair();
                stack.classList.add('is-hover');
            });
            stack.addEventListener('mouseleave', function () {
                stack.classList.remove('is-hover');
            });
        } else if (!reduceMotion && opts.focus) {
            // Touch: closed by default; opened only by updateTouchFocus()
            // when the cover's centre reaches the central focus band.
            registerTouchStack(stack,
                function () {
                    if (pool && pool.length > 1) setPair();
                    else if (fixed) applyFixed();
                    stack.classList.add('is-hover');
                },
                function () {
                    stack.classList.remove('is-hover');
                }
            );
        }

        return stack;
    }

    /* ------------------------------------------------------------------
       SELECTED WORK
    ------------------------------------------------------------------ */

    function initWork() {
        var list = $('#workList');
        if (!list) return;
        list.innerHTML = '';

        DATA.forEach(function (cat) {
            var item = make('article', 'work-item');
            var link = make('a', 'work-item__link');
            link.href = '#work/' + cat.id;
            link.setAttribute('aria-label', 'فتح أعمال ' + cat.title);

            var stackOpts = {
                arW: cat.cover.w,
                arH: cat.cover.h,
                main: { src: cat.cover.src, w: cat.cover.w, h: cat.cover.h, alt: cat.title },
                eager: false,
                focus: true,
                explore: true
            };
            if (cat.type === 'carousel') {
                stackOpts.fixed = [cat.supportLeft, cat.supportRight];
            } else {
                stackOpts.pool = cat.works.slice();
            }
            link.appendChild(makeStack(stackOpts));

            var info = make('div', 'work-item__info');
            var title = make('h3', 'work-item__title');
            var titleIcon = sectorIcon(cat.id);
            if (titleIcon) title.appendChild(titleIcon);
            title.appendChild(document.createTextNode(cat.title));
            var meta = make('span', 'work-item__meta');
            meta.textContent = cat.type === 'carousel' ? cat.projects.length + ' مشروع' : workLabel(cat.works.length);
            info.appendChild(title);
            info.appendChild(meta);

            link.appendChild(info);
            item.appendChild(link);
            list.appendChild(item);
        });

        // Positions for the mobile focus cache are refreshed on resize/load
        window.addEventListener('resize', function () { touchCacheDirty = true; });
        window.addEventListener('load', function () { touchCacheDirty = true; });
        window.setTimeout(function () { touchCacheDirty = true; }, 700);
    }

    /* ------------------------------------------------------------------
       PROCESS — a scroll-travelled roadmap
    ------------------------------------------------------------------ */

    var processSection = null;
    var processWorld = null;
    var roadmapDesktop = null;
    var roadmapMobile = null;
    var roadClipRectDesktop = null;
    var roadClipRectMobile = null;
    var dotsDesktopWrap = null;
    var dotsMobileWrap = null;
    var processStages = [];
    var processDotsDesktop = [];
    var processDotsMobile = [];
    var processIndex = -1;
    var processPinned = false;
    var processRail = null;
    var processRailTicks = null;
    var cameraTable = null;
    var mobileTable = null;
    var stagePoints = [];

    // Where each stage sits along the path (fraction of total path length).
    // The road reaches point i exactly when progress passes threshold i.
    var PROCESS_THRESHOLDS = [0, 0.25, 0.5, 0.75, 1];
    // Five different real advertising designs (indices into the ads works)
    var PROCESS_ART_PICKS = [0, 3, 6, 8, 13];
    var CAMERA_SAMPLES = 240;

    // Travel / dwell timeline: [scroll weight, pathFrom, pathTo].
    // A segment with from === to is a genuine plateau (camera holds still).
    var PROCESS_TIMELINE = [
        [0.30, 0.00, 0.00], // hold at 01
        [0.70, 0.00, 0.25], // travel 01 -> 02
        [0.30, 0.25, 0.25], // hold at 02
        [0.70, 0.25, 0.50], // travel 02 -> 03
        [0.30, 0.50, 0.50], // hold at 03
        [0.70, 0.50, 0.75], // travel 03 -> 04
        [0.30, 0.75, 0.75], // hold at 04
        [0.70, 0.75, 1.00], // travel 04 -> 05
        [0.30, 1.00, 1.00]  // hold at 05 (settle)
    ];
    var PROCESS_TIMELINE_TOTAL = (function () {
        var t = 0;
        for (var i = 0; i < PROCESS_TIMELINE.length; i++) t += PROCESS_TIMELINE[i][0];
        return t;
    })();

    function smoothstep(t) { return t * t * (3 - 2 * t); }

    // Map raw scroll progress (0..1) to path progress with real plateaus.
    function mapProcessProgress(u) {
        var x = clamp(u, 0, 1) * PROCESS_TIMELINE_TOTAL;
        var acc = 0;
        for (var i = 0; i < PROCESS_TIMELINE.length; i++) {
            var w = PROCESS_TIMELINE[i][0];
            if (x <= acc + w || i === PROCESS_TIMELINE.length - 1) {
                var t = w > 0 ? clamp((x - acc) / w, 0, 1) : 1;
                var a = PROCESS_TIMELINE[i][1];
                var b = PROCESS_TIMELINE[i][2];
                if (a === b) return a; // true hold
                return a + (b - a) * smoothstep(t);
            }
            acc += w;
        }
        return 1;
    }

    function stageIndexAt(frac) {
        var idx = 0;
        for (var i = 0; i < PROCESS_THRESHOLDS.length; i++) {
            if (frac >= PROCESS_THRESHOLDS[i] - 0.0005) idx = i;
        }
        return idx;
    }

    function initProcess() {
        processSection = document.getElementById('process');
        if (!processSection) return;
        processWorld = document.getElementById('processWorld');
        roadmapDesktop = document.getElementById('roadmapProgress');
        roadmapMobile = document.getElementById('roadmapProgressMobile');
        roadClipRectDesktop = document.getElementById('roadClipRectDesktop');
        roadClipRectMobile = document.getElementById('roadClipRectMobile');
        dotsDesktopWrap = document.getElementById('roadmapDotsDesktop');
        dotsMobileWrap = document.getElementById('roadmapDotsMobile');
        processStages = $$('.pstage', processSection);
        processRail = document.getElementById('processRail');
        processRailTicks = document.getElementById('processRailTicks');

        buildProcessRailTicks();
        populateProcessArt();
        updateProcessMode();
        window.addEventListener('resize', updateProcessMode);
    }

    function populateProcessArt() {
        var ads = byId['ads'];
        if (!ads || !ads.works) return;
        var arts = $$('.pstage__art', processSection);
        arts.forEach(function (fig, i) {
            var work = ads.works[PROCESS_ART_PICKS[i] % ads.works.length];
            if (!work) return;
            fig.appendChild(makeImg(work.src, 'عمل من أعمال رقيم', work.w, work.h, false));
        });
    }

    function updateProcessMode() {
        if (!processSection) return;
        // Pin wherever there is enough room; natural flow only on narrow screens
        var pinned = window.matchMedia('(min-width: 900px)').matches && !reduceMotion;
        processPinned = pinned;
        processSection.classList.toggle('process--pinned', pinned);
        buildProcessWorld();
        processIndex = -1;
        updateProcess();
    }

    function buildProcessWorld() {
        if (dotsDesktopWrap) dotsDesktopWrap.innerHTML = '';
        if (dotsMobileWrap) dotsMobileWrap.innerHTML = '';
        processDotsDesktop = [];
        processDotsMobile = [];
        cameraTable = null;
        mobileTable = null;
        stagePoints = [];
        for (var s = 0; s < processStages.length; s++) processStages[s].style.opacity = '';
        // Fully-open clip by default (reduced motion / first paint)
        if (roadClipRectDesktop) roadClipRectDesktop.setAttribute('height', '2000');
        if (roadClipRectMobile) roadClipRectMobile.setAttribute('height', '2000');
        if (reduceMotion) return;

        if (processPinned && roadmapDesktop) buildDesktopWorld();
        else if (roadmapMobile) buildMobileRail();
    }

    function pathLength(pathEl) {
        pathEl.getBoundingClientRect(); // force geometry resolution
        var len = 0;
        try { len = pathEl.getTotalLength(); } catch (e) { len = 0; }
        return len;
    }

    // Sample a path into a lookup table so per-frame work is cheap
    function samplePath(pathEl, samples) {
        var len = pathLength(pathEl);
        if (!len) return null;
        var table = [];
        for (var k = 0; k <= samples; k++) {
            var pt = pathEl.getPointAtLength((k / samples) * len);
            table.push({ x: pt.x, y: pt.y });
        }
        table._len = len;
        return table;
    }

    function tableAt(table, p) {
        if (!table || table.length < 2) return null;
        var N = table.length - 1;
        var pos = clamp(p, 0, 1) * N;
        var i0 = Math.floor(pos);
        var i1 = Math.min(N, i0 + 1);
        var t = pos - i0;
        var A = table[i0], B = table[i1];
        return { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t };
    }

    // Desktop world: camera track + every stage/dot at its own road coordinate
    function buildDesktopWorld() {
        cameraTable = samplePath(roadmapDesktop, CAMERA_SAMPLES);
        if (!cameraTable) return;
        var len = cameraTable._len;
        for (var i = 0; i < processStages.length; i++) {
            var pt = roadmapDesktop.getPointAtLength(PROCESS_THRESHOLDS[i] * len);
            stagePoints.push(pt);
            var el = processStages[i];
            el.style.left = pt.x + 'vw';
            el.style.top = pt.y + 'vh';
            // Content sits on the side AWAY from the road curve, so the road
            // never cuts through the text/artwork.
            el.classList.toggle('pstage--left', pt.x < 50);
            el.classList.toggle('pstage--right', pt.x >= 50);
            var dot = make('span', 'rdot');
            dot.style.left = pt.x + 'vw';
            dot.style.top = pt.y + 'vh';
            dotsDesktopWrap.appendChild(dot);
            processDotsDesktop.push(dot);
        }
    }

    // Mobile rail: crisp HTML dots over the vertical path
    function buildMobileRail() {
        mobileTable = samplePath(roadmapMobile, CAMERA_SAMPLES);
        if (!mobileTable) return;
        var len = mobileTable._len;
        for (var i = 0; i < processStages.length; i++) {
            var pt = roadmapMobile.getPointAtLength(PROCESS_THRESHOLDS[i] * len);
            var dot = make('span', 'rdot');
            dot.style.left = (pt.x / 40 * 100) + '%';
            dot.style.top = (pt.y / 1000 * 100) + '%';
            dotsMobileWrap.appendChild(dot);
            processDotsMobile.push(dot);
        }
    }

    // The journey consumes 5 segment-lengths of scroll; the section is a little
    // taller so the final destination settles before the pin releases.
    function processJourneyPx(vh) {
        var raw = getComputedStyle(processSection).getPropertyValue('--process-seg');
        var segVh = parseFloat(raw) || 100; // e.g. "100vh" -> 100
        return 5 * (segVh / 100) * vh;
    }

    function setDotsState(nodes, idx) {
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].classList.toggle('is-reached', i <= idx);
            nodes[i].classList.toggle('is-active', i === idx);
        }
    }

    // Decorative ticks marking where each stage hold begins on the raw rail.
    function buildProcessRailTicks() {
        if (!processRailTicks) return;
        var total = PROCESS_TIMELINE_TOTAL || 1;
        var acc = 0;
        for (var i = 0; i < PROCESS_TIMELINE.length; i++) {
            var seg = PROCESS_TIMELINE[i];
            if (seg[1] === seg[2]) {
                var tick = document.createElement('span');
                tick.className = 'process__rail-tick';
                tick.style.setProperty('--t', (acc / total).toFixed(4));
                processRailTicks.appendChild(tick);
            }
            acc += seg[0];
        }
    }

    // Rail tracks RAW section scroll progress (before mapProcessProgress), so it
    // keeps advancing even while the camera dwells at a stage.
    function updateProcessRail(u, rect, vh) {
        if (!processRail) return;
        processRail.style.setProperty('--p', u.toFixed(4));
        var visible = processPinned && rect.top <= 0 && rect.bottom > vh;
        if (processRail.classList.contains('is-visible') !== visible) {
            processRail.classList.toggle('is-visible', visible);
        }
    }

    function applyProcessState(idx) {
        for (var i = 0; i < processStages.length; i++) {
            processStages[i].classList.toggle('is-reached', i <= idx);
            processStages[i].classList.toggle('is-active', i === idx);
            processStages[i].classList.toggle('is-passed', i < idx);
        }
        setDotsState(processDotsDesktop, idx);
        setDotsState(processDotsMobile, idx);
    }

    function processProgress() {
        var vh = window.innerHeight;
        var rect = processSection.getBoundingClientRect();
        if (processPinned) {
            // Progress reaches 1 after the 5-stage journey; the remaining
            // section height is the end settle before unpinning.
            var journey = processJourneyPx(vh);
            if (journey > 0) return clamp(-rect.top / journey, 0, 1);
            return rect.top <= 0 ? 1 : 0;
        }
        // Natural flow: 0 at section top, 1 at its final screen.
        var range = rect.height - vh;
        if (range > 0) return clamp(-rect.top / range, 0, 1);
        return clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    }

    function updateProcess() {
        if (!processSection || reduceMotion) return;
        var vh = window.innerHeight;
        var rect = processSection.getBoundingClientRect();
        if (rect.bottom < -vh * 0.5 || rect.top > vh * 2) {
            if (processRail) processRail.classList.remove('is-visible');
            return;
        }

        var u = processProgress();
        updateProcessRail(u, rect, vh);

        if (processPinned) {
            // Raw scroll -> path progress with genuine holds at each stage
            var pf = mapProcessProgress(u);

            var idx = stageIndexAt(pf);
            if (idx !== processIndex) {
                processIndex = idx;
                applyProcessState(idx);
            }

            // Camera locked onto the current path head (centre of the viewport)
            var cp = cameraTable ? tableAt(cameraTable, pf) : null;
            if (cp) {
                var vw = window.innerWidth;
                var tx = vw * (0.5 - cp.x / 100);
                var ty = vh * (0.5 - cp.y / 100);
                processWorld.style.transform =
                    'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0)';
                // Only the travelled road (up to the head) is revealed
                if (roadClipRectDesktop) roadClipRectDesktop.setAttribute('height', String(cp.y + 20));
                // Fade each stage by its distance from the camera so content
                // dissolves before reaching the heading or a hard edge
                for (var s = 0; s < processStages.length; s++) {
                    var d = Math.abs(stagePoints[s].y - cp.y);
                    var op = (s <= idx) ? clamp((38 - d) / 16, 0, 1) : 0;
                    processStages[s].style.opacity = op.toFixed(3);
                }
            }
        } else {
            var idx2 = stageIndexAt(u);
            if (idx2 !== processIndex) {
                processIndex = idx2;
                applyProcessState(idx2);
            }
            // Natural flow: reveal the vertical rail up to its head
            if (roadmapMobile) {
                var mp = mobileTable ? tableAt(mobileTable, u) : null;
                if (roadClipRectMobile && mp) roadClipRectMobile.setAttribute('height', String(mp.y + 20));
            }
        }
    }

    /* ------------------------------------------------------------------
       VIEWPORT FRAME — touch focus + pinned roadmap sharing one rAF
    ------------------------------------------------------------------ */

    var frameQueued = false;

    function initMotion() {
        var queue = function () {
            if (frameQueued) return;
            frameQueued = true;
            window.requestAnimationFrame(runFrame);
        };
        window.addEventListener('scroll', queue, { passive: true });
        window.addEventListener('resize', queue);
        if (lenis) lenis.on('scroll', queue);
        queue();
    }

    function runFrame() {
        frameQueued = false;

        // Touch stack focus — reuses this existing frame, no extra loop
        updateTouchFocus();

        // Pinned process roadmap — reuses this existing frame
        updateProcess();
    }

    /* ------------------------------------------------------------------
       PROJECT OVERLAY
    ------------------------------------------------------------------ */

    var overlay = { open: false, cat: null, level: null, projectIndex: null, cleanup: null, relayout: null };
    var projectEl, projectBody, projectTitle, projectCounter, projectBack, projectClose, projectProgress;
    var dragMoved = false;

    function initOverlay() {
        projectEl = $('#project');
        projectBody = $('#projectBody');
        projectTitle = $('#projectTitle');
        projectCounter = $('#projectCounter');
        projectBack = $('#projectBack');
        projectClose = $('#projectClose');
        projectProgress = $('#projectProgress');
        if (!projectEl) return;

        projectBack.addEventListener('click', function () {
            if (overlay.level === 'carousel') {
                if (history.state && history.state.rq) history.back();
                else handleHash('#work/' + overlay.cat.id, false);
            } else {
                closeProject();
            }
        });

        projectClose.addEventListener('click', closeProject);

        document.addEventListener('keydown', function (e) {
            if (!overlay.open) return;
            if (e.key === 'Escape') closeProject();
        });

        // Delegated click for project links
        document.addEventListener('click', function (e) {
            var a = e.target.closest('a[href^="#work/"]');
            if (!a) return;
            e.preventDefault();
            if (dragMoved) return;
            var stack = a.querySelector('.stack') || a;
            var r = stack.getBoundingClientRect();
            projectEl.style.setProperty('--ox', ((r.left + r.width / 2) / window.innerWidth * 100).toFixed(2) + '%');
            projectEl.style.setProperty('--oy', ((r.top + r.height / 2) / window.innerHeight * 100).toFixed(2) + '%');
            handleHash(a.getAttribute('href'), true);
        });

        window.addEventListener('popstate', function () {
            handleHash(location.hash, false);
        });

        var resizeTimer = null;
        window.addEventListener('resize', function () {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(function () {
                if (overlay.relayout) overlay.relayout();
            }, 150);
        });
    }

    function handleHash(hash, push) {
        var m = /^#work\/([^/]+)(?:\/(\d+))?$/.exec(hash || '');
        if (!m) { closeProject(); return; }

        var cat = byId[m[1]];
        if (!cat) { closeProject(); return; }

        if (push) history.pushState({ rq: true }, '', hash);

        if (!overlay.open || overlay.cat !== cat) openProject(cat);

        if (cat.type === 'carousel') {
            if (m[2] !== undefined) buildCarouselView(cat, parseInt(m[2], 10));
            else buildCarouselList(cat);
        } else {
            buildGallery(cat);
        }
    }

    function openProject(cat) {
        overlay.open = true;
        overlay.cat = cat;
        projectEl.classList.add('is-open');
        projectEl.setAttribute('aria-hidden', 'false');
        document.body.classList.add('is-locked');
        if (lenis) lenis.stop();
        projectEl.scrollTop = 0;
        updateTouchFocus();
    }

    function closeProject() {
        if (!overlay.open) return;
        clearView();
        overlay.open = false;
        overlay.cat = null;
        overlay.level = null;
        overlay.projectIndex = null;
        projectEl.classList.remove('is-open');
        projectEl.setAttribute('aria-hidden', 'true');
        if (!menuOpen) {
            document.body.classList.remove('is-locked');
            if (lenis) lenis.start();
        }
        cleanupDrag();
        updateTouchFocus();
    }

    function closeProjectViaHistory() {
        if (history.state && history.state.rq) history.back();
        else {
            history.pushState(null, '', location.pathname);
            closeProject();
        }
    }

    function clearView() {
        if (overlay.cleanup) { overlay.cleanup(); overlay.cleanup = null; }
        overlay.relayout = null;
        projectBody.innerHTML = '';
        projectProgress.style.width = '0%';
        dragMoved = false;
    }

    function setMeta(title, counter) {
        projectTitle.textContent = title || '';
        projectCounter.textContent = counter || '';
    }

    /* ------------------------------------------------------------------
       GALLERY (normal category)
    ------------------------------------------------------------------ */

    function buildGallery(cat) {
        clearView();
        overlay.level = 'gallery';

        // The cover (`واجهة`) is always the first artwork; then the works.
        var items = [cat.cover].concat(cat.works);
        setMeta(cat.title, workLabel(items.length));

        var gallery = make('div', 'gallery');
        var viewport = make('div', 'gallery__viewport');
        var track = make('div', 'gallery__track');
        var slides = [];

        items.forEach(function (w, i) {
            var slide = make('figure', 'gallery__slide');
            var alt = i === 0 ? (cat.title + ' — الواجهة') : (cat.title + ' — عمل ' + i);
            var im = makeImg(w.src, alt, w.w, w.h, i < 3);
            if (i === 0) im.fetchPriority = 'high';
            slide.appendChild(im);
            track.appendChild(slide);
            slides.push(slide);
        });

        viewport.appendChild(track);

        var nav = make('div', 'gallery__nav');
        var count = make('span', 'gallery__count');
        var prev = ctrlBtn('←', 'السابق');
        var next = ctrlBtn('→', 'التالي');
        nav.appendChild(prev);
        nav.appendChild(next);

        gallery.appendChild(viewport);
        gallery.appendChild(count);
        gallery.appendChild(nav);
        projectBody.appendChild(buildSectorIntro(cat, workLabel(items.length)));
        projectBody.appendChild(gallery);

        var index = 0;
        var translate = 0;
        var baseLeft = [];
        var baseWidth = [];
        var trackWidth = 0;
        var dragCleanup = null;

        // Measure each slide's natural position (transform cleared) so the
        // left-to-right alignment is exact regardless of RTL context.
        function measure() {
            track.style.transform = 'none';
            translate = 0;
            baseLeft = [];
            baseWidth = [];
            slides.forEach(function (s) {
                var r = s.getBoundingClientRect();
                baseLeft.push(r.left);
                baseWidth.push(r.width);
            });
            trackWidth = track.scrollWidth;
        }

        function stepPx() {
            if (slides.length < 2) return baseWidth[0] || 320;
            return Math.max(1, Math.abs(baseLeft[1] - baseLeft[0]));
        }

        function visibleCount() {
            return Math.max(1, Math.round(viewport.clientWidth / stepPx()));
        }

        function maxIndex() {
            return Math.max(0, slides.length - visibleCount());
        }

        function align(i) {
            if (!baseLeft.length) measure();
            index = clamp(i, 0, maxIndex());
            // LTR gallery: bring slide `index` to the first slide's start
            // position, never scrolling past the end of the track.
            var desired = baseLeft[0] - baseLeft[index];
            var minTranslate = Math.min(0, viewport.clientWidth - trackWidth);
            translate = clamp(desired, minTranslate, 0);
            track.style.transform = 'translateX(' + translate + 'px)';
            count.textContent = pad(index + 1) + ' / ' + pad(slides.length);
            prev.disabled = index <= 0;
            next.disabled = index >= maxIndex();
        }

        function go(delta) { align(index + delta * visibleCount()); }

        prev.addEventListener('click', function () { go(-1); });
        next.addEventListener('click', function () { go(1); });

        overlay.relayout = function () { measure(); align(index); };

        dragCleanup = makeDraggable(viewport, track, {
            getTranslate: function () { return translate; },
            onMove: function (dx, startT) {
                track.style.transform = 'translateX(' + (startT + dx) + 'px)';
            },
            onEnd: function (dx) {
                var delta = Math.round(dx / stepPx());
                align(index - delta);
            }
        });

        var keyHandler = function (e) {
            if (!overlay.open) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
        };
        document.addEventListener('keydown', keyHandler);

        overlay.cleanup = function () {
            if (dragCleanup) dragCleanup();
            document.removeEventListener('keydown', keyHandler);
        };

        align(0);
    }

    /* ------------------------------------------------------------------
       CAROUSEL CATEGORY — nested project list
    ------------------------------------------------------------------ */

    function buildCarouselList(cat) {
        clearView();
        overlay.level = 'carousel-list';
        setMeta(cat.title, cat.projects.length + ' مشروع');

        var wrap = make('div', 'carousel-list');
        var grid = make('div', 'carousel-list__grid');

        cat.projects.forEach(function (proj, idx) {
            var card = make('div', 'carousel-card');
            var a = make('a', 'carousel-card__link');
            a.href = '#work/' + cat.id + '/' + idx;
            a.style.display = 'block';
            a.setAttribute('aria-label', 'فتح مشروع ' + proj.title);

            var pool = proj.slides.filter(function (s) { return s.src !== proj.cover.src; });
            a.appendChild(makeStack({
                arW: proj.cover.w,
                arH: proj.cover.h,
                main: { src: proj.cover.src, w: proj.cover.w, h: proj.cover.h, alt: proj.title },
                pool: pool,
                eager: false
            }));

            var info = make('div', 'carousel-card__info');
            var t = make('h3', 'carousel-card__title');
            t.textContent = proj.title;
            var m = make('span', 'carousel-card__meta');
            m.textContent = pad(proj.slides.length) + ' شرائح';
            info.appendChild(t);
            info.appendChild(m);

            a.appendChild(info);
            card.appendChild(a);
            grid.appendChild(card);
        });

        wrap.appendChild(buildSectorIntro(cat, cat.projects.length + ' مشروع'));
        wrap.appendChild(grid);
        projectBody.appendChild(wrap);
    }

    /* ------------------------------------------------------------------
       CAROUSEL VIEWER — one slide at a time
    ------------------------------------------------------------------ */

    function buildCarouselView(cat, idx) {
        var proj = cat.projects[idx];
        if (!proj) { buildCarouselList(cat); return; }

        clearView();
        overlay.level = 'carousel';
        overlay.projectIndex = idx;

        var car = make('div', 'carousel');
        var viewport = make('div', 'carousel__viewport');
        var track = make('div', 'carousel__track');
        var slides = [];

        proj.slides.forEach(function (s, i) {
            var slide = make('figure', 'carousel__slide');
            slide.appendChild(makeImg(s.src, proj.title + ' — ' + (i + 1), s.w, s.h, i < 2));
            track.appendChild(slide);
            slides.push(slide);
        });

        viewport.appendChild(track);

        var nav = make('div', 'carousel__nav');
        var prev = ctrlBtn('←', 'السابق');
        var count = make('span', 'carousel__count');
        var next = ctrlBtn('→', 'التالي');
        nav.appendChild(prev);
        nav.appendChild(count);
        nav.appendChild(next);

        car.appendChild(viewport);
        car.appendChild(nav);
        projectBody.appendChild(car);

        var index = 0;
        var translate = 0;
        var baseLeft = [];
        var baseWidth = [];
        var trackWidth = 0;
        var dragCleanup = null;

        function measure() {
            track.style.transform = 'none';
            translate = 0;
            baseLeft = [];
            baseWidth = [];
            slides.forEach(function (s) {
                var r = s.getBoundingClientRect();
                baseLeft.push(r.left);
                baseWidth.push(r.width);
            });
            trackWidth = track.scrollWidth;
        }

        function stepPx() {
            if (slides.length < 2) return baseWidth[0] || viewport.clientWidth;
            return Math.max(1, Math.abs(baseLeft[1] - baseLeft[0]));
        }

        // Arrows are positioned purely by CSS relative to the stable viewer,
        // so they never move when slides/artwork change.
        function align(i) {
            if (!baseLeft.length) measure();
            index = clamp(i, 0, slides.length - 1);
            // One slide at a time, ordered left-to-right.
            var desired = viewport.clientWidth / 2 - (baseLeft[index] + baseWidth[index] / 2);
            var minTranslate = Math.min(0, viewport.clientWidth - trackWidth);
            translate = clamp(desired, minTranslate, 0);
            track.style.transform = 'translateX(' + translate + 'px)';
            count.textContent = pad(index + 1) + ' / ' + pad(slides.length);
            projectProgress.style.width = ((index + 1) / slides.length * 100) + '%';
            projectCounter.textContent = pad(index + 1) + ' / ' + pad(slides.length);
            prev.disabled = index <= 0;
            next.disabled = index >= slides.length - 1;
        }

        prev.addEventListener('click', function () { align(index - 1); });
        next.addEventListener('click', function () { align(index + 1); });

        overlay.relayout = function () { measure(); align(index); };

        dragCleanup = makeDraggable(viewport, track, {
            getTranslate: function () { return translate; },
            onMove: function (dx, startT) {
                track.style.transform = 'translateX(' + (startT + dx) + 'px)';
            },
            onEnd: function (dx) {
                var delta = Math.round(dx / stepPx());
                align(index - delta);
            }
        });

        var keyHandler = function (e) {
            if (!overlay.open) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); align(index + 1); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); align(index - 1); }
        };
        document.addEventListener('keydown', keyHandler);

        overlay.cleanup = function () {
            if (dragCleanup) dragCleanup();
            document.removeEventListener('keydown', keyHandler);
        };

        align(0);
    }

    /* ------------------------------------------------------------------
       DRAGGABLE TRACK
    ------------------------------------------------------------------ */

    function makeDraggable(viewport, track, opts) {
        var startX = 0;
        var dragging = false;
        var moved = false;
        var startT = 0;

        function down(e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            dragging = true;
            moved = false;
            startX = e.clientX;
            startT = opts.getTranslate();
            track.classList.add('is-dragging');
            if (viewport.setPointerCapture) {
                try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
            }
        }

        function move(e) {
            if (!dragging) return;
            var dx = e.clientX - startX;
            if (Math.abs(dx) > 5) moved = true;
            opts.onMove(dx, startT);
        }

        function up(e) {
            if (!dragging) return;
            dragging = false;
            track.classList.remove('is-dragging');
            var dx = (typeof e.clientX === 'number' ? e.clientX : startX) - startX;
            opts.onEnd(moved ? dx : 0);
            if (moved) {
                dragMoved = true;
                window.setTimeout(function () { dragMoved = false; }, 60);
            }
        }

        viewport.addEventListener('pointerdown', down);
        viewport.addEventListener('pointermove', move);
        viewport.addEventListener('pointerup', up);
        viewport.addEventListener('pointercancel', up);
        viewport.addEventListener('pointerleave', up);

        return function cleanup() {
            viewport.removeEventListener('pointerdown', down);
            viewport.removeEventListener('pointermove', move);
            viewport.removeEventListener('pointerup', up);
            viewport.removeEventListener('pointercancel', up);
            viewport.removeEventListener('pointerleave', up);
        };
    }

    function cleanupDrag() {
        dragMoved = false;
    }

    /* ------------------------------------------------------------------
       YEAR
    ------------------------------------------------------------------ */

    function initYear() {
        var y = $('#year');
        if (y) y.textContent = new Date().getFullYear();
    }

    /* ------------------------------------------------------------------
       INIT
    ------------------------------------------------------------------ */

    function init() {
        applyBidi();
        initSmoothScroll();
        initNav();
        initMenuStagger();
        initAnchors();
        initLineDelays();
        initReveal();
        initWork();
        initProcess();
        initOverlay();
        initMotion();
        initYear();
        handleHash(location.hash, false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
