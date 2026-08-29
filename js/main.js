/* ══════════════════════════════════════════════════════════════
   web-portfolio — interactions (duplicate of bryllim.com)
   ══════════════════════════════════════════════════════════════ */

/* ── Base path for section pages (projects/, stack/, …) ─────── */
const BASE = (document.body && document.body.dataset.base) || '';
function baseUrl(p) {
    return BASE ? BASE.replace(/\/+$/, '') + '/' + String(p).replace(/^\/+/, '') : p;
}

/* ── Theme: system / light / dark with circular reveal ──────── */
(function () {
    const KEY = 'theme';
    const root = document.documentElement;
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animT;
    function pref() { try { const v = localStorage.getItem(KEY); return (v === 'dark' || v === 'light' || v === 'system') ? v : 'light'; } catch (e) { return 'light'; } }
    function isDark(p) { return p === 'dark' || (p === 'system' && !!mq && mq.matches); }
    function setClass(p) {
        root.classList.toggle('dark', isDark(p));
        try {
            document.querySelectorAll('[data-theme-opt]').forEach(function (el) {
                el.classList.toggle('is-active', el.getAttribute('data-theme-opt') === p);
            });
        } catch (e) {}
    }
    function crossfade(p) {
        root.classList.add('theme-anim');
        setClass(p);
        clearTimeout(animT);
        animT = setTimeout(function () { root.classList.remove('theme-anim'); }, 520);
    }
    function reveal(p, x, y) {
        const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        const vt = root.__vt = document.startViewTransition(function () { setClass(p); });
        vt.ready.then(function () {
            root.animate(
                { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
                { duration: 540, easing: 'cubic-bezier(.32,.08,.24,1)', pseudoElement: '::view-transition-new(root)' }
            );
        }).catch(function () {});
    }
    window.setTheme = function (p, ev) {
        try { localStorage.setItem(KEY, p); } catch (e) {}
        if (isDark(p) === root.classList.contains('dark')) { setClass(p); return; }
        if (reduce || !document.startViewTransition) { crossfade(p); return; }
        const x = (ev && ev.clientX) || innerWidth, y = (ev && ev.clientY) || innerHeight;
        reveal(p, x, y);
    };
    setClass(pref());
    if (mq) mq.addEventListener('change', function () { if (pref() === 'system') crossfade('system'); });
    document.addEventListener('DOMContentLoaded', function () { setClass(pref()); });
})();

/* ── Tiny interface sounds (WebAudio) ───────────────────────── */
window.siteSound = (function () {
    let ctx = null;
    let enabled = true; /* default ON; stored choice wins once toggled */
    try {
        const stored = localStorage.getItem('siteSound');
        if (stored !== null) enabled = stored === '1';
    } catch (e) {}

    function ensure() {
        try {
            if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
        } catch (e) {}
    }

    function start(name) {
        if (!ctx || ctx.state !== 'running') return;
        const t = ctx.currentTime + 0.02;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = name === 'success' ? 740 : name === 'droplet' ? 520 : 420;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.09, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 0.1);
    }

    function play(name) {
        if (!enabled) return;
        ensure();
        if (!ctx) return;
        if (ctx.state === 'running') { start(name); return; }
        /* Not running yet — resume first, then schedule once it's live. */
        try { ctx.resume().then(function () { start(name); }).catch(function () {}); }
        catch (e) {}
    }

    /* Fully unlock the audio output on the very first user gesture. A short
       silent buffer is the most reliable cross-browser way to satisfy
       autoplay policies (Chrome/Safari/iOS) and stops clicks from being
       intermittently silent. */
    function unlock() {
        ensure();
        if (!ctx) return;
        if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
        try {
            const buf = ctx.createBuffer(1, 1, 22050);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            src.start(0);
        } catch (e) {}
    }
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });

    document.addEventListener('click', function (e) {
        if (!enabled) return;
        if (e.target.closest('a, button, .deck-card, [role="button"]')) play('click');
    });

    /* Nav links are real page navigations; the AudioContext is destroyed on
       unload, which cuts the click sound. Play it, then defer navigation so
       the tone is audible. Scoped to the nav bars to avoid side effects. */
    function isCrossPageNav(a) {
        const href = a.getAttribute('href') || '';
        if (href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('javascript:') === 0) return false;
        let url;
        try { url = new URL(href, location.href); } catch (e) { return false; }
        if (url.origin !== location.origin) return false;
        const here = location.pathname.replace(/index\.html$/, '');
        if (url.pathname.replace(/index\.html$/, '') === here && url.hash === '') return false;
        return true;
    }
    function bindNavSound(navEl) {
        if (!navEl) return;
        navEl.addEventListener('click', function (e) {
            if (!enabled) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const a = e.target.closest('a[href]');
            if (!a) return;
            if (a.target && a.target !== '_self') return;
            if (!isCrossPageNav(a)) return;
            e.preventDefault();
            e.stopPropagation();
            play('click');
            const dest = a.href;
            setTimeout(function () { window.location.href = dest; }, 120);
        });
    }
    bindNavSound(document.querySelector('nav'));
    bindNavSound(document.getElementById('mobileNav'));

    return {
        play,
        get enabled() { return enabled; },
        setEnabled(v) {
            enabled = v;
            if (v) ensure();
            try { localStorage.setItem('siteSound', v ? '1' : '0'); } catch (e) {}
        }
    };
})();
(function () {
    const btn = document.querySelector('[data-sound-toggle]');
    if (!btn) return;
    const on = btn.querySelector('[data-sound-on]');
    const off = btn.querySelector('[data-sound-off]');
    function sync() {
        const next = siteSound.enabled;
        btn.setAttribute('aria-pressed', String(next));
        btn.setAttribute('title', next ? 'Sounds on' : 'Sounds off');
        btn.setAttribute('aria-label', next ? 'Disable interface sounds' : 'Enable interface sounds');
        on.classList.toggle('hidden', !next);
        off.classList.toggle('hidden', next);
    }
    sync();
    btn.addEventListener('click', () => {
        siteSound.setEnabled(!siteSound.enabled);
        sync();
    });
})();

/* ── Mobile nav ─────────────────────────────────────────────── */
function openMobileNav() {
    const m = document.getElementById('mobileNav');
    m.classList.remove('hidden');
    m.classList.add('flex');
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => m.classList.add('is-open'));
}
function closeMobileNav() {
    const m = document.getElementById('mobileNav');
    m.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
}

/* ── Modal (email + lightbox) ───────────────────────────────── */
const modal = document.getElementById('modal');
function openModal(name) {
    const panel = modal.querySelector('[data-panel="' + name + '"]');
    if (!panel) return;
    modal.querySelectorAll('[data-panel]').forEach(p => { if (p !== panel) p.classList.add('hidden'); });
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    panel.classList.remove('hidden');
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => {
        modal.querySelector('[data-modal-backdrop]').classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95');
    });
}
function closeModal() {
    modal.querySelector('[data-modal-backdrop]').classList.add('opacity-0');
    modal.querySelectorAll('[data-panel]').forEach(p => p.classList.add('opacity-0', 'scale-95'));
    document.documentElement.style.overflow = '';
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        modal.querySelectorAll('[data-panel]').forEach(p => p.classList.add('hidden'));
    }, 200);
}
function copyEmail(event) {
    event.stopPropagation();
    const btn = event.currentTarget;
    const email = 'engr.markjosephsilang@gmail.com';
    const flash = (text) => {
        btn.textContent = text;
        siteSound.play(text === 'Copied' ? 'success' : 'droplet');
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    };
    const legacyCopy = () => {
        try {
            const ta = document.createElement('textarea');
            ta.value = email;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus(); ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch (e) { return false; }
    };
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email)
            .then(() => flash('Copied'))
            .catch(() => flash(legacyCopy() ? 'Copied' : 'Failed'));
    } else {
        flash(legacyCopy() ? 'Copied' : 'Failed');
    }
}

/* ── Lightbox (projects + certificates) ─────────────────────── */
const LB_DATA = {
    dewy: {
        eyebrow: 'project 01 — robotics · AI', title: 'DEWY',
        desc: 'An AI-powered study companion bot for preschool children — built on a Raspberry Pi with voice interaction.',
        tags: ['Raspberry Pi', 'AI', 'Robotics'],
        images: ['assets/images/dewy/1.jpg', 'assets/images/dewy/2.jpg', 'assets/images/dewy/3.jpg', 'assets/images/dewy/4.jpg']
    },
    liwanav: {
        eyebrow: 'project 02 — iot · embedded', title: 'LIWANAV',
        desc: 'GPS-powered stopover notification system with voice-guided announcements — ESP32-based.',
        tags: ['ESP32', 'IoT', 'Web'],
        images: ['assets/images/liwanav/1.jpg', 'assets/images/liwanav/2.jpg']
    },
    'cert-bootcamp': {
        eyebrow: 'certificate — verified', title: 'AI Learning Series: I.T. Boot Camp',
        desc: 'Intensive training covering foundational networking, systems administration, and hardware diagnostics at STI College Batangas.',
        tags: ['STI College Batangas'],
        images: ['assets/images/it-bootcamp-cert.png']
    },
    'cert-ymih': {
        eyebrow: 'certificate — verified', title: 'Youth Can Make It Happen: Academic Roadshow',
        desc: 'Recognized for demonstrated leadership capabilities and active community service engagement within institutional programs.',
        tags: ['Leadership', 'Community Service'],
        images: ['assets/images/ymih-cert.jpg']
    },
    'cert-java': {
        eyebrow: 'certificate — verified', title: 'Java Fundamentals',
        desc: 'Award of course completion from Oracle Academy — satisfactory completion of all course work (19 June 2024).',
        tags: ['Oracle Academy'],
        images: ['assets/images/java-fundamentals-cert.png'],
        doc: 'assets/docs/Java Fundamentals.pdf'
    },
    'cert-solidedge': {
        eyebrow: 'certificate — verified', title: 'Solid Edge Associate Level Certification',
        desc: 'Passed the Siemens Digital Industries Software certification exam requirements — Solid Edge Associate Level (27 November 2025).',
        tags: ['Siemens', 'Associate Level'],
        images: ['assets/images/solid-edge-cert.png'],
        doc: 'assets/docs/Solid Edge Certification.pdf'
    },
    'cert-redhat': {
        eyebrow: 'certificate — verified', title: 'Red Hat System Administration I',
        desc: 'Completed Red Hat System Administration I (RH124) — 40 credit hours of hands-on Linux system administration training. Verifiable via Credly (Aug 2026).',
        tags: ['Red Hat', 'RH124'],
        images: ['assets/images/redhat-rh124-cert.png'],
        doc: 'assets/docs/Red Hat System Administration I.pdf'
    }
};
let lbKey = null, lbIdx = 0;
function openLightbox(key, idx) {
    const d = LB_DATA[key];
    if (!d) return;
    lbKey = key; lbIdx = idx || 0;
    document.getElementById('lbEyebrow').textContent = d.eyebrow;
    document.getElementById('lbTitle').textContent = d.title;
    document.getElementById('lbDesc').textContent = d.desc;
    const tagsEl = document.getElementById('lbTags');
    tagsEl.innerHTML = '';
    d.tags.forEach(t => {
        const s = document.createElement('span');
        s.className = 'border border-gray-300 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-gray-500';
        s.textContent = t;
        tagsEl.appendChild(s);
    });
    const link = document.getElementById('lbLink');
    if (key.startsWith('cert-')) {
        link.href = baseUrl(d.doc || 'assets/docs/CV.pdf');
        link.target = '_blank';
        link.textContent = d.doc ? 'view certificate pdf ↗' : 'view cv ↗';
    } else {
        link.href = '#projects';
        link.target = '';
        link.textContent = '';
    }
    lbRender();
    openModal('lightbox');
}
function lbRender() {
    const d = LB_DATA[lbKey];
    const img = document.getElementById('lbImg');
    img.src = baseUrl(d.images[lbIdx]);
    img.alt = d.title + (d.images.length > 1 ? ' — photo ' + (lbIdx + 1) : '');
    document.getElementById('lbPrev').style.display = d.images.length > 1 ? 'inline-flex' : 'none';
    document.getElementById('lbNext').style.display = d.images.length > 1 ? 'inline-flex' : 'none';
}
function lbStep(dir) {
    const d = LB_DATA[lbKey];
    lbIdx = (lbIdx + dir + d.images.length) % d.images.length;
    lbRender();
    siteSound.play('droplet');
}

/* ── Spotlight deck ─────────────────────────────────────────── */
function activateCard(card) {
    if (card.classList.contains('is-center')) return;
    const deck = card.closest('[data-deck]');
    const cards = [...deck.querySelectorAll('.deck-card')];
    const ni = cards.indexOf(card);
    if (ni === -1) return;
    cards.forEach((c, i) => {
        const rel = (i - ni + cards.length) % cards.length;
        c.classList.remove('is-center', 'is-left', 'is-right', 'is-far-right');
        let p;
        if (rel === 0) p = 'is-center';
        else if (cards.length <= 3) p = rel === 1 ? 'is-right' : 'is-left';
        else if (rel === 1) p = 'is-right';
        else if (rel === cards.length - 1) p = 'is-left';
        else p = 'is-far-right';
        c.classList.add(p);
    });
    siteSound.play('droplet');
}

/* ── Page-enter reveal (scroll-aware) ───────────────────────── */
(function () {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');
    if (!motionQuery.matches) return;

    function isExcluded(element) {
        return !!element.closest([
            'body > nav', 'body > header', '#mobileNav',
            '[role="dialog"]', '[aria-hidden="true"]', '[x-cloak]'
        ].join(','));
    }
    function isVisualSurface(element) {
        const classes = typeof element.className === 'string' ? element.className : '';
        return /(^|\s)(border|rounded|shadow|group|deck-card|post-card|shop-card)(-|\s|$)/.test(classes)
            || /(^|\s)bg-[^\s]+/.test(classes);
    }
    function shouldExpand(element, root) {
        if (element === root) return true;
        if (element.matches('[data-page-enter-item], .reveal')) return false;
        if (element.querySelector('.reveal, [data-page-enter-item]')) return true;
        if (isVisualSurface(element)) return false;
        const tag = element.tagName;
        if (['MAIN', 'SECTION', 'HEADER', 'FOOTER', 'FORM', 'NAV'].includes(tag)) return true;
        if (tag === 'ARTICLE') return !isVisualSurface(element);
        if (tag === 'UL' || tag === 'OL') return true;
        if (tag === 'DIV') return element.children.length > 0;
        return false;
    }
    function collect(root) {
        const items = [];
        function visit(element) {
            if (!(element instanceof HTMLElement) || isExcluded(element)) return;
            if (['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT'].includes(element.tagName)) return;
            if (element.hidden || element.classList.contains('hidden')) return;
            if (shouldExpand(element, root)) {
                Array.from(element.children).forEach(visit);
                return;
            }
            items.push(element);
        }
        visit(root);
        return items;
    }
    function initPageEntrance() {
        const roots = Array.from(document.querySelectorAll('main, body > div[class*="lg:pl-56"]'))
            .filter((root) => !isExcluded(root))
            .filter((root, index, all) => !all.some((other, otherIndex) => otherIndex !== index && other.contains(root)));
        const items = Array.from(new Set(roots.flatMap(collect)));
        if (!items.length) return;
        items.forEach((item) => item.classList.add('page-enter-item'));
        function play(item, delay) {
            item.style.setProperty('--page-enter-delay', delay + 'ms');
            item.classList.add('is-page-entered');
            const finish = (event) => {
                if (event.target !== item || event.animationName !== 'pageEnterFadeUp') return;
                item.classList.add('has-page-entered');
                item.classList.remove('page-enter-item', 'is-page-entered');
                item.style.removeProperty('--page-enter-delay');
                item.removeEventListener('animationend', finish);
            };
            item.addEventListener('animationend', finish);
        }
        if (!('IntersectionObserver' in window)) {
            items.forEach((item, index) => play(item, Math.min(index, 7) * 40));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            const entering = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            entering.forEach((entry, index) => {
                play(entry.target, Math.min(index, 7) * 40);
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -4% 0px', threshold: 0.04 });
        items.forEach((item) => observer.observe(item));
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageEntrance, { once: true });
    } else {
        initPageEntrance();
    }
})();

/* ── Contact form (formspree) ───────────────────────────────── */
function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const btn = document.getElementById('contactSubmit');
    const status = document.getElementById('contactStatus');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.textContent = '';
    fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
    }).then(r => {
        if (r.ok) {
            status.textContent = 'thanks — message sent!';
            siteSound.play('success');
            form.reset();
        } else {
            throw new Error('bad response');
        }
    }).catch(() => {
        status.textContent = 'that failed — email me instead!';
    }).finally(() => {
        btn.disabled = false;
        btn.textContent = 'Send message';
        setTimeout(() => { status.textContent = ''; }, 4000);
    });
}

/* ── Highlight the nav item for the current page ────────────── */
function setActiveNav() {
  const here = location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
  document.querySelectorAll('nav a[href], #mobileNav a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript')) return;
    let target;
    try { target = new URL(href, location.href).pathname.replace(/index\.html$/, '').replace(/\/+$/, '') || '/'; }
    catch (e) { return; }
    if (target === here) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}
document.addEventListener('DOMContentLoaded', setActiveNav);

/* ── Global keyboard shortcuts & Escape handling ────────────── */
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const m = document.getElementById('mobileNav');
    if (m && !m.classList.contains('hidden')) { closeMobileNav(); return; }
    if (modal && !modal.classList.contains('hidden')) { closeModal(); return; }
});
