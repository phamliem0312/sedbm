/* ============================================
   SEDBM2026 — Main JavaScript
   - initShell(): persistent UI (runs once)
   - initPageContent(): per-page content (runs
     on every SPA navigation via fetch router)
   ============================================ */

let countdownInterval = null;
let countersAnimated = false;
let aosCheckBound = false;
let smoothScrollBound = false;
let partnerSliderResizeBound = false;
let partnerSliderResizeTimer = null;
let partnerSliderInitializing = false;

/* ──────────────────────────────────────────────
   SHELL (runs once on first DOMContentLoaded)
   ────────────────────────────────────────────── */
function initShell() {
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    function handleScroll() {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            document.body.classList.add('nav-compact');
        } else {
            document.body.classList.remove('nav-compact');
        }

        if (navbar) {
            if (scrollY > 80) {
                navbar.classList.add('scrolled');
            } else if (!navbar.dataset.alwaysScrolled) {
                navbar.classList.remove('scrolled');
            }
        }

        if (backToTop) {
            if (scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    }

    if (navbar?.classList.contains('scrolled')) {
        navbar.dataset.alwaysScrolled = 'true';
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // ---- Mobile nav toggle ----
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navClose = document.getElementById('navClose');

    function closeMenu() {
        if (navToggle) navToggle.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        if (navClose) {
            navClose.addEventListener('click', closeMenu);
        }

        navMenu.addEventListener('click', (e) => {
            if (e.target === navMenu) closeMenu();
        });

        navMenu.querySelectorAll('.nav-link').forEach(link => {
            if (!link.closest('.nav-dropdown') || (link.parentElement.tagName === 'LI' && !link.parentElement.classList.contains('nav-dropdown'))) {
                link.addEventListener('click', closeMenu);
            }
        });

        navMenu.querySelectorAll('.dropdown-menu a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        navMenu.querySelectorAll('.nav-dropdown > .nav-link').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    const parent = toggle.parentElement;
                    navMenu.querySelectorAll('.nav-dropdown.open').forEach(dd => {
                        if (dd !== parent) dd.classList.remove('open');
                    });
                    parent.classList.toggle('open');
                }
            });
        });
    }

    // ---- Smooth scroll for in-page anchors (delegated) ----
    if (!smoothScrollBound) {
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a[href^="#"]');
            if (!a) return;
            const href = a.getAttribute('href');
            if (!href || href === '#') return;
            // Skip router hash links like #contact.html or #home.html|anchor
            if (/\.html/i.test(href)) return;
            const id = href.slice(1);
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
        smoothScrollBound = true;
    }

    // ---- AOS scroll/resize triggers (bound once) ----
    if (!aosCheckBound) {
        window.addEventListener('scroll', runAOSCheck);
        window.addEventListener('resize', runAOSCheck);
        window.addEventListener('scroll', runCounterAnimation);
        aosCheckBound = true;
    }

    if (!partnerSliderResizeBound) {
        window.addEventListener('resize', () => {
            if (partnerSliderResizeTimer) {
                clearTimeout(partnerSliderResizeTimer);
            }
            partnerSliderResizeTimer = setTimeout(() => {
                partnerSliderResizeTimer = null;
                initPartnersMobileSlider();
            }, 150);
        });
        partnerSliderResizeBound = true;
    }
}

/* ──────────────────────────────────────────────
   PAGE CONTENT (runs after each fetch navigation)
   ────────────────────────────────────────────── */
function initPageContent() {
    if (partnerSliderResizeTimer) {
        clearTimeout(partnerSliderResizeTimer);
        partnerSliderResizeTimer = null;
    }

    initCountdown();
    initParticles();
    initPartnersMobileSlider();
    countersAnimated = false;
    setTimeout(runAOSCheck, 100);
    setTimeout(runCounterAnimation, 200);
}

function initCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl && !hoursEl && !minutesEl && !secondsEl) return;

    const conferenceDate = new Date('2026-11-12T09:00:00+07:00').getTime();

    function update() {
        const now = Date.now();
        const distance = conferenceDate - now;

        const days = Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24)));
        const hours = Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        const minutes = Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
        const seconds = Math.max(0, Math.floor((distance % (1000 * 60)) / 1000));

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    countdownInterval = setInterval(update, 1000);
}

function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer || particlesContainer.children.length > 0) return;

    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = particle.style.height = (Math.random() * 4 + 2) + 'px';
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        particle.style.opacity = String(Math.random() * 0.3 + 0.1);
        particlesContainer.appendChild(particle);
    }
}

function trimPartnerClones(partnersGrid, originalCount) {
    while (partnersGrid.children.length > originalCount) {
        const trailingCard = partnersGrid.lastElementChild;
        if (!trailingCard) break;
        trailingCard.remove();
    }
}

function hasExpectedPartnerCardCount(partnersGrid, originalCount) {
    const expectedWithClones = originalCount * 2;
    const currentCount = partnersGrid.children.length;
    return currentCount === originalCount || currentCount === expectedWithClones;
}

function initPartnersMobileSlider() {
    if (partnerSliderInitializing) return;
    partnerSliderInitializing = true;

    try {
        const partnersGrid = document.querySelector('.partners-grid');
        if (!partnersGrid) return;

        // Keep this value aligned with CSS @media (max-width: 768px).
        const MOBILE_BREAKPOINT = 768;
        // Approximate speed to keep card names readable on smaller screens.
        const PIXELS_PER_SECOND = 42;

        if (!partnersGrid.dataset.originalCount) {
            partnersGrid.dataset.originalCount = String(partnersGrid.children.length);
        }

        const originalCount = Number.parseInt(partnersGrid.dataset.originalCount, 10);
        const shouldEnableSlider = window.innerWidth <= MOBILE_BREAKPOINT;

        if (!shouldEnableSlider) {
            trimPartnerClones(partnersGrid, originalCount);
            partnersGrid.classList.remove('is-mobile-slider', 'is-slider-running');
            partnersGrid.style.removeProperty('--partners-scroll-distance');
            partnersGrid.style.removeProperty('--partners-scroll-duration');
            return;
        }

        if (!hasExpectedPartnerCardCount(partnersGrid, originalCount)) {
            trimPartnerClones(partnersGrid, originalCount);
        }

        if (partnersGrid.children.length === originalCount) {
            const originalCards = Array.from(partnersGrid.children).slice(0, originalCount);
            originalCards.forEach((card) => {
                const clone = card.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                partnersGrid.appendChild(clone);
            });
        }

        partnersGrid.classList.add('is-mobile-slider');
        partnersGrid.classList.remove('is-slider-running');

        const scrollDistance = Math.round(partnersGrid.scrollWidth / 2);
        const durationSeconds = Math.max(scrollDistance / PIXELS_PER_SECOND, 18);

        partnersGrid.style.setProperty('--partners-scroll-distance', `${scrollDistance}px`);
        partnersGrid.style.setProperty('--partners-scroll-duration', `${durationSeconds.toFixed(2)}s`);
        partnersGrid.classList.add('is-slider-running');
    } finally {
        partnerSliderInitializing = false;
    }
}

function runAOSCheck() {
    const aosElements = document.querySelectorAll('[data-aos]:not(.aos-animate)');
    const windowHeight = window.innerHeight;
    const triggerOffset = 60;

    aosElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const delay = parseInt(el.getAttribute('data-aos-delay')) || 0;

        if (rect.top < windowHeight - triggerOffset) {
            setTimeout(() => el.classList.add('aos-animate'), delay);
        }
    });
}

function runCounterAnimation() {
    if (countersAnimated) return;

    const statsBar = document.querySelector('.stats-bar');
    if (!statsBar) return;

    const rect = statsBar.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        countersAnimated = true;
        const counters = document.querySelectorAll('.stat-number[data-count]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 1500;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.round(target * eased);
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target;
                }
            }
            requestAnimationFrame(update);
        });
    }
}

/* Expose for the router to call after each navigation */
globalThis.SEDBM_PAGE_INIT = initPageContent;

/* Boot */
document.addEventListener('DOMContentLoaded', () => {
    initShell();
    initPageContent();
});
