/* ==========================================
   NAFIJ RAHAMAN - Portfolio JavaScript
   Animations, Typing Effect, Interactivity
========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initPreloader();
    initTypewriter();
    initCustomCursor();
    initNavigation();
    initScrollEffects();
    initAnimations();
});

// ==========================================
// Preloader with Sound
// ==========================================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const loadSound = document.getElementById('loadSound');
    
    // Attempt muted autoplay (allowed by browsers), then unmute on first user gesture.
    let audioStarted = false;
    let mutedAutoplayPlayed = false;

    const setAudioStarted = () => {
        audioStarted = true;
        const btn = document.getElementById('audioEnableBtn');
        if (btn) {
            btn.classList.remove('show');
            btn.setAttribute('aria-hidden', 'true');
        }
        document.removeEventListener('click', enableSoundFallback);
        document.removeEventListener('touchstart', enableSoundFallback);
    };

    const playHtmlAudio = (muted = false) => {
        return new Promise((resolve, reject) => {
            if (!loadSound) return reject('no-audio-element');
            try {
                loadSound.loop = false;
                loadSound.muted = muted;
                loadSound.volume = 1.0;
                loadSound.currentTime = 0;
                const p = loadSound.play();
                if (p !== undefined) {
                    p.then(() => resolve(true)).catch(err => reject(err));
                } else {
                    resolve(true);
                }
            } catch (e) { reject(e); }
        });
    };

    const tryWebAudioFallback = async () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) throw new Error('no WebAudio');
            const ctx = new AudioContext();
            if (ctx.state === 'suspended') {
                try { await ctx.resume(); } catch (e) {}
            }
            const resp = await fetch('nafijthepro.mp3');
            const ab = await resp.arrayBuffer();
            const buffer = await ctx.decodeAudioData(ab);
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            src.connect(ctx.destination);
            src.loop = false;
            src.start(0);
            setAudioStarted();
            setTimeout(() => { try { src.stop(); } catch (_) {} }, (buffer.duration + 0.5) * 1000);
            return true;
        } catch (err) {
            console.log('WebAudio fallback failed', err);
            return false;
        }
    };

    // First try muted autoplay — this is allowed on most browsers.
    setTimeout(() => {
        playHtmlAudio(true).then(() => {
            mutedAutoplayPlayed = true;
            // keep it silent for now; wait for user gesture to unmute and replay audible
        }).catch(async () => {
            // If muted autoplay also blocked, try WebAudio fallback (may also be blocked until gesture)
            const ok = await tryWebAudioFallback();
            if (!ok) {
                const btn = document.getElementById('audioEnableBtn');
                if (btn) btn.classList.add('show');
            } else setAudioStarted();
        });
    }, 1000);

    // Hide preloader on page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = 'visible';
        }, 2000);
    });

    const enableSoundFallback = async () => {
        if (audioStarted) return;
        try {
            await playHtmlAudio(false);
            setAudioStarted();
            return;
        } catch (_) {
            const ok = await tryWebAudioFallback();
            if (ok) return;
        }
        const btn = document.getElementById('audioEnableBtn');
        if (btn) btn.classList.add('show');
    };

    document.addEventListener('click', enableSoundFallback);
    document.addEventListener('touchstart', enableSoundFallback);
    document.addEventListener('mousemove', enableSoundFallback, { once: true });

    // Enable button handler
    const audioBtn = document.getElementById('audioEnableBtn');
    if (audioBtn) {
        audioBtn.addEventListener('click', async () => {
            if (audioStarted) { audioBtn.classList.remove('show'); return; }
            try {
                await playHtmlAudio(false);
                setAudioStarted();
            } catch (_) {
                const ok = await tryWebAudioFallback();
                if (!ok) console.log('User button failed to start audio');
            }
        });
    }
}

// ==========================================
// Typewriter Effect
// ==========================================
function initTypewriter() {
    const lines = [
        { id: 'typeLine1', text: 'HELLO, I\'M', delay: 500 },
        { id: 'typeLine2', text: 'NAFIJ RAHAMAN', delay: 1500 },
        { id: 'typeLine3', text: 'FULL STACK DEVELOPER', delay: 3000 }
    ];

    lines.forEach(line => {
        const element = document.getElementById(line.id);
        if (element) {
            setTimeout(() => {
                typeText(element, line.text);
            }, line.delay);
        }
    });
}

function typeText(element, text, index = 0) {
    if (index < text.length) {
        element.textContent += text.charAt(index);
        setTimeout(() => typeText(element, text, index + 1), 50 + Math.random() * 30);
    }
}

// ==========================================
// Custom Cursor
// ==========================================
function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');
    
    if (!cursor || !follower) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .project-card, .skill-card, .social-card');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            follower.classList.add('active');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            follower.classList.remove('active');
        });
    });

    // Smooth animation loop
    function animateCursor() {
        const ease = 0.15;
        const followerEase = 0.1;
        
        cursorX += (mouseX - cursorX) * ease;
        cursorY += (mouseY - cursorY) * ease;
        
        followerX += (mouseX - followerX) * followerEase;
        followerY += (mouseY - followerY) * followerEase;
        
        cursor.style.left = cursorX - 4 + 'px';
        cursor.style.top = cursorY - 4 + 'px';
        
        follower.style.left = followerX - 20 + 'px';
        follower.style.top = followerY - 20 + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
}

// ==========================================
// Navigation
// ==========================================
function initNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll behavior
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Update active nav on scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ==========================================
// Scroll Effects
// ==========================================
function initScrollEffects() {
    // Parallax effect for glows
    const glows = document.querySelectorAll('.glow');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        glows.forEach((glow, index) => {
            const speed = 0.3 + (index * 0.1);
            glow.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Smooth reveal for sections
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.skill-card, .project-card, .social-card').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ==========================================
// Additional Animations
// ==========================================
function initAnimations() {
    // Floating badges animation enhancement
    const badges = document.querySelectorAll('.floating-badge');
    
    badges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.3}s`;
    });

    // Stats counter animation
    const statNums = document.querySelectorAll('.stat-num');
    
    const animateValue = (element, end, duration) => {
        const text = element.textContent;
        if (text === '∞') return; // Skip infinity symbol
        
        const num = parseInt(text);
        if (isNaN(num)) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.textContent = Math.floor(progress * num) + '+';
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        element.textContent = '0+';
        window.requestAnimationFrame(step);
    };

    // Trigger counter animation when visible
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target.textContent;
                if (text !== '∞') {
                    const num = parseInt(text);
                    if (!isNaN(num)) {
                        animateValue(entry.target, num, 1500);
                    }
                }
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNums.forEach(stat => statsObserver.observe(stat));

    // Terminal typing effect
    const terminalCursor = document.querySelector('.cursor-blink');
    if (terminalCursor) {
        setInterval(() => {
            terminalCursor.style.opacity = terminalCursor.style.opacity === '0' ? '1' : '0';
        }, 500);
    }

    // Project cards tilt effect
    if (window.matchMedia('(pointer: fine)').matches) {
        const cards = document.querySelectorAll('.project-card, .skill-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading animation to images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
        
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s ease';
        }
    });
}

// ==========================================
// Utility Functions
// ==========================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Console easter egg
console.log('%c👋 Hey there, curious developer!', 'font-size: 20px; font-weight: bold; color: #00ff88;');
console.log('%cBuilt with ❤️ by Nafij Rahaman', 'font-size: 14px; color: #a0a0a0;');
console.log('%cCheck out my work: nafijrahaman.me', 'font-size: 12px; color: #666;');
