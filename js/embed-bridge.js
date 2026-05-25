/* ============================================
   SEDBM2026 — Embed Bridge
   Loaded inside iframe child pages. Reports
   content height to the parent shell and routes
   internal link clicks back to the parent so the
   shared navbar/footer stay in place.
   ============================================ */
(function () {
    if (window.parent === window) return; // Opened standalone, do nothing.

    var INTERNAL_PAGES = {
        'home.html': 1,
        'history.html': 1,
        'scientific-committee.html': 1,
        'keynote-speakers.html': 1,
        'call-for-paper.html': 1,
        'submission.html': 1,
        'publication.html': 1,
        'proceedings.html': 1,
        'programme.html': 1,
        'venue.html': 1,
        'registration.html': 1,
        'index.html': 1
    };

    function measureHeight() {
        return Math.max(
            document.body ? document.body.scrollHeight : 0,
            document.documentElement ? document.documentElement.scrollHeight : 0
        );
    }

    var lastHeight = 0;
    function postHeight() {
        var h = measureHeight();
        if (h && h !== lastHeight) {
            lastHeight = h;
            parent.postMessage({ type: 'sedbm-height', height: h }, '*');
        }
    }

    function postNavigate(page, hash) {
        parent.postMessage({
            type: 'sedbm-navigate',
            page: page,
            hash: hash || ''
        }, '*');
    }

    document.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a') : null;
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href) return;
        if (a.target === '_blank') return;
        if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return;
        if (href.charAt(0) === '#') return; // in-page anchor handled locally

        var parts = href.split('#');
        var pagePart = parts[0].split('/').pop();
        var hashPart = parts[1] || '';

        if (INTERNAL_PAGES[pagePart]) {
            e.preventDefault();
            if (pagePart === 'index.html') pagePart = 'home.html';
            postNavigate(pagePart, hashPart);
        }
    }, true);

    function init() {
        postHeight();
        if (typeof ResizeObserver !== 'undefined') {
            try { new ResizeObserver(postHeight).observe(document.body); } catch (e) {}
        }
        window.addEventListener('resize', postHeight);
        // Catch late-loading images / fonts / animations.
        [100, 400, 900, 1800, 3500].forEach(function (ms) {
            setTimeout(postHeight, ms);
        });
        // Notify parent that we're ready.
        parent.postMessage({ type: 'sedbm-ready' }, '*');
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 0);
    } else {
        window.addEventListener('DOMContentLoaded', init);
    }
    window.addEventListener('load', postHeight);
})();
