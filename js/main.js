/* ============================================
   SEDBM2025 — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ---- Navbar scroll effect ----
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    function handleScroll() {
        const scrollY = window.scrollY;

        // Compact mode: hide top bar and move navbar up on scroll
        if (scrollY > 50) {
            document.body.classList.add('nav-compact');
        } else {
            document.body.classList.remove('nav-compact');
        }

        // Navbar color: add scrolled class for white bg (only on pages without default scrolled)
        if (scrollY > 80) {
            navbar.classList.add('scrolled');
        } else if (!navbar.dataset.alwaysScrolled) {
            navbar.classList.remove('scrolled');
        }

        // Back to top button
        if (backToTop) {
            if (scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    }

    // Mark pages that start with scrolled class so we don't remove it
    if (navbar.classList.contains('scrolled')) {
        navbar.dataset.alwaysScrolled = 'true';
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // ---- Mobile nav toggle ----
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a regular nav link (not dropdown toggles)
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            if (!link.closest('.nav-dropdown') || link.parentElement.tagName === 'LI' && !link.parentElement.classList.contains('nav-dropdown')) {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            }
        });

        // Close menu when clicking dropdown sub-links
        navMenu.querySelectorAll('.dropdown-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Mobile dropdown toggle
        navMenu.querySelectorAll('.nav-dropdown > .nav-link').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    const parent = toggle.parentElement;
                    // Close other open dropdowns
                    navMenu.querySelectorAll('.nav-dropdown.open').forEach(dd => {
                        if (dd !== parent) dd.classList.remove('open');
                    });
                    parent.classList.toggle('open');
                }
            });
        });
    }

    // ---- Active nav link on scroll ----
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    function updateActiveLink() {
        const scrollY = window.scrollY + 120;
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);

    // ---- Countdown Timer ----
    const conferenceDate = new Date('2025-11-13T09:00:00+07:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = conferenceDate - now;

        const days = Math.max(0, Math.floor(distance / (1000 * 60 * 60 * 24)));
        const hours = Math.max(0, Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        const minutes = Math.max(0, Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
        const seconds = Math.max(0, Math.floor((distance % (1000 * 60)) / 1000));

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ---- Particle effect in hero ----
    const particlesContainer = document.getElementById('particles');

    if (particlesContainer) {
        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.width = particle.style.height = (Math.random() * 4 + 2) + 'px';
            particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 10) + 's';
            particle.style.opacity = Math.random() * 0.3 + 0.1;
            particlesContainer.appendChild(particle);
        }
    }

    // ---- Simple AOS (Animate on Scroll) ----
    const aosElements = document.querySelectorAll('[data-aos]');

    function checkAOS() {
        const windowHeight = window.innerHeight;
        const triggerOffset = 60;

        aosElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const delay = parseInt(el.getAttribute('data-aos-delay')) || 0;

            if (rect.top < windowHeight - triggerOffset) {
                setTimeout(() => {
                    el.classList.add('aos-animate');
                }, delay);
            }
        });
    }

    window.addEventListener('scroll', checkAOS);
    window.addEventListener('resize', checkAOS);
    // Initial check with slight delay for page load
    setTimeout(checkAOS, 100);

    // ---- Counter Animation ----
    const counters = document.querySelectorAll('.stat-number[data-count]');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;

        const statsBar = document.querySelector('.stats-bar');
        if (!statsBar) return;

        const rect = statsBar.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            countersAnimated = true;
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 1500;
                const startTime = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
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

    window.addEventListener('scroll', animateCounters);
    setTimeout(animateCounters, 200);

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
