/**
 * Hero Slider Class - Handles the cinematic full-screen background slider
 */
class HeroSlider {
    constructor(slides) {
        console.log("HeroSlider: Initializing with slides:", slides);
        this.slides = slides;
        this.currentIndex = 0;
        this.isPlaying = true;
        this.duration = 8000; // 8 seconds per slide
        this.startTime = null;
        this.requestID = null;

        // Elements
        this.wrapper = document.getElementById('slides-wrapper');
        this.category = document.getElementById('slide-category');
        this.title = document.getElementById('slide-title');
        this.subtitle = document.getElementById('slide-subtitle');
        this.cta = document.getElementById('slide-cta');
        this.progressRing = document.getElementById('slider-progress-ring');
        this.playPauseBtn = document.getElementById('slider-play-pause');
        this.pauseIcon = document.getElementById('pause-icon');
        this.playIcon = document.getElementById('play-icon');
        this.nextTeaser = document.getElementById('next-teaser-title');
        this.followingTeaser = document.getElementById('following-teaser-title');
        this.teasers = document.querySelectorAll('.slider-nav-teaser');

        if (!this.wrapper) {
            console.error("HeroSlider: #slides-wrapper not found!");
            return;
        }

        window.heroSlider = this; // For global debugging
        this.init();
    }

    init() {
        console.log("HeroSlider: Starting UI setup...");
        this.renderSlides();
        this.updateContent(true); // first run immediate
        this.bindEvents();
        this.startAutoplay();
    }

    renderSlides() {
        if (!this.wrapper) return;
        this.wrapper.innerHTML = '';
        this.slides.forEach((slide, index) => {
            const div = document.createElement('div');
            // Ensure background covers and centers
            div.className = `absolute inset-0 transition-all duration-1000 ease-in-out transform-gpu scale-100 opacity-0 bg-cover bg-center`;
            div.style.backgroundImage = `url('${slide.image}')`;
            div.style.backgroundSize = 'cover';
            div.style.backgroundPosition = 'center';
            
            if (index === 0) {
                div.classList.add('opacity-100', 'scale-110');
            }
            this.wrapper.appendChild(div);
        });
        this.slideElements = this.wrapper.children;
    }

    updateContent(immediate = false) {
        const slide = this.slides[this.currentIndex];
        console.log(`HeroSlider: Switching to slide ${this.currentIndex}:`, slide.tag);
        
        // Staggered Fade effect for text
        const content = document.getElementById('active-slide-content');
        if (!content) return;

        if (!immediate) content.classList.remove('active');
        
        const updateText = () => {
            if (this.category) this.category.innerHTML = slide.tag;
            if (this.title) this.title.innerHTML = slide.title;
            if (this.subtitle) this.subtitle.innerHTML = slide.subtitle;
            if (this.cta) {
                this.cta.innerHTML = slide.cta;
                if (slide.link) this.cta.setAttribute('href', slide.link);
            }
            content.classList.add('active');
            this.updateTeasers();
        };

        if (immediate) {
            updateText();
        } else {
            setTimeout(updateText, 500);
        }

        // Background transition
        if (this.slideElements) {
            Array.from(this.slideElements).forEach((el, index) => {
                if (index === this.currentIndex) {
                    el.classList.add('opacity-100', 'scale-110');
                    el.classList.remove('opacity-0', 'scale-100');
                } else {
                    el.classList.remove('opacity-100', 'scale-110');
                    el.classList.add('opacity-0', 'scale-100');
                }
            });
        }
    }

    updateTeasers() {
        const nextIndex = (this.currentIndex + 1) % this.slides.length;
        const followingIndex = (this.currentIndex + 2) % this.slides.length;

        if (this.nextTeaser) this.nextTeaser.innerText = this.slides[nextIndex].tag || this.slides[nextIndex].title;
        if (this.followingTeaser) this.followingTeaser.innerText = this.slides[followingIndex].tag || this.slides[followingIndex].title;
    }

    bindEvents() {
        this.playPauseBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePlayPause();
        });
        
        this.teasers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = btn.getAttribute('data-slide-target');
                if (target === 'next') this.nextSlide();
                else if (target === 'following') {
                    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
                    this.nextSlide();
                }
            });
        });
    }

    startAutoplay() {
        this.startTime = Date.now();
        this.animate();
    }

    animate() {
        if (!this.isPlaying) return;

        const now = Date.now();
        const elapsed = now - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);

        // Update Progress Ring (301.6 is circumference of r=48)
        const offset = 301.6 * (1 - progress);
        if (this.progressRing) this.progressRing.style.strokeDashoffset = offset;

        if (progress >= 1) {
            this.nextSlide();
        } else {
            this.requestID = requestAnimationFrame(() => this.animate());
        }
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateContent();
        this.startTime = Date.now();
        if (this.isPlaying) {
            cancelAnimationFrame(this.requestID);
            this.animate();
        }
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        console.log("HeroSlider: Autoplay toggled:", this.isPlaying);
        this.pauseIcon?.classList.toggle('hidden', !this.isPlaying);
        this.playIcon?.classList.toggle('hidden', this.isPlaying);

        if (this.isPlaying) {
            this.startTime = Date.now() - (this.startTime ? (Date.now() - this.startTime) % this.duration : 0);
            this.animate();
        } else {
            cancelAnimationFrame(this.requestID);
        }
    }
}

/**
 * AEGIS Core Frontend Logic - Tailwind Redesign Version
 * 
 * This version uses Tailwind CSS utility classes exclusively for all dynamic 
 * element generation to match the Tailwind UI Plus aesthetic.
 */

/**
 * Loads JSON data and populates elements with matching data-i18n attributes.
 * @param {string} lang 'zh' or 'en'
 * @param {string} page 'home', 'about', etc.
 */
async function loadPageData(lang, page) {
  try {
    const basePath = window.location.pathname.includes('/en/') || window.location.pathname.includes('/services/') ? '../' : './';
    const jsonPath = `${basePath}data/site/${page}-${lang}.json`;

    const response = await fetch(jsonPath);
    if (!response.ok) throw new Error(`Failed to load ${jsonPath}`);
    const data = await response.json();

    populateDOM(data);
    
    // Update Document Meta
    if(data.meta) {
        document.title = data.meta.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if(metaDesc) metaDesc.setAttribute("content", data.meta.description);
    }

  } catch (error) {
    console.error("Error loading page data:", error);
  }
}

/**
 * Maps JSON object to DOM elements
 * @param {Object} data JSON data object
 */
function populateDOM(data) {
  // 1. Text content via data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const keys = el.getAttribute('data-i18n').split('.');
    let value = data;
    for (const key of keys) {
      if (value[key] === undefined) {
        value = undefined;
        break;
      }
      value = value[key];
    }
    
    if (value !== undefined) {
      if (el.tagName === 'A' && typeof value === 'object' && value.label) {
          el.innerHTML = value.label;
          if(value.url) el.setAttribute('href', value.url);
      }
      else if (typeof value === 'string') {
          el.innerHTML = value; 
      }
    }
  });

  // 2. Logo Wall (Marquee Style)
  if (data.logo_wall && data.logo_wall.logos) {
      const marqueeTrack = document.getElementById('logo-wall-marquee');
      if (marqueeTrack) {
          const content = data.logo_wall.logos.map(logoName => `
              <span class="text-2xl font-black tracking-tighter text-slate-300 hover:text-slate-500 transition-colors select-none whitespace-nowrap">${logoName}</span>
          `).join('');
          // Populate both original and duplicated for seamless marquee
          marqueeTrack.innerHTML = `
              <div class="flex items-center gap-16 px-8 shrink-0">${content}</div>
              <div class="flex items-center gap-16 px-8 shrink-0" aria-hidden="true">${content}</div>
          `;
      }
  }

    // 3. Metrics
    if (data.metrics && data.metrics.cards) {
        const metricsContainer = document.getElementById('metrics-grid');
        if (metricsContainer) {
            metricsContainer.innerHTML = '';
            data.metrics.cards.forEach((card, index) => {
                const div = document.createElement('div');
                // Center-aligned architectural style with gradient numbers
                div.className = 'stat-item p-12 lg:p-16 border-r border-b border-slate-200/60 flex flex-col items-center text-center justify-center reveal-up min-h-[320px] group transition-all duration-700';
                div.style.transitionDelay = `${index * 0.12}s`;
                div.innerHTML = `
                    <div class="stat-content relative z-10 flex flex-col items-center">
                        <dt class="text-xs font-black uppercase tracking-[0.2em] text-brand-600 mb-6 font-sans">${card.label}</dt>
                        <dd class="flex flex-col items-center gap-1">
                            <span class="metric-number font-serif font-black tracking-tighter leading-none text-gradient-tech" style="font-size:clamp(3.5rem,8vw,6.5rem)" data-target="${card.metric}">0</span>
                        </dd>
                        <dt class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-10">${card.source}</dt>
                    </div>
                `;
                metricsContainer.appendChild(div);
            });
            if (typeof initScrollReveal === 'function') initScrollReveal();
        }
        initNumberAnimation();
    }

    // 4. Steps / How it Works
    if (data.how_it_works && data.how_it_works.steps) {
        const stepsContainer = document.getElementById('how-it-works-grid');
        if (stepsContainer) {
            stepsContainer.innerHTML = '';
            data.how_it_works.steps.forEach((step, index) => {
                const div = document.createElement('div');
                // Individual Step Card: Borders, Padding, Centered, and Snappy Synchronized Hover Effect (No Lift)
                div.className = 'p-12 lg:p-24 border-r border-b border-white/10 flex flex-col items-center text-center justify-center reveal-up min-h-[450px] group transition-all duration-300 hover:bg-white/[0.04] hover:delay-0';
                div.style.transitionDelay = `${index * 0.12 + 0.1}s`;
                div.innerHTML = `
                    <div class="step-content relative z-10 flex flex-col items-center transition-all duration-300 group-hover:delay-0">
                        <div class="mb-14 flex items-center justify-center transition-all duration-300 group-hover:delay-0">
                            <span class="text-6xl font-black font-sans leading-none text-gradient-tech opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 group-hover:delay-0">0${index + 1}</span>
                        </div>
                        <h3 class="text-3xl font-bold mb-8 font-serif leading-tight text-gradient-tech transition-all duration-300 group-hover:delay-0" style="letter-spacing:-0.02em;">${step.title}</h3>
                        <p class="text-lg font-medium leading-relaxed text-slate-400 max-w-[320px] transition-all duration-300 group-hover:delay-0">${step.desc}</p>
                    </div>
                `;
                stepsContainer.appendChild(div);
            });
            if (typeof initScrollReveal === 'function') initScrollReveal();
        }
    }

    // Init Hero Slider if data exists
    if (data.hero && data.hero.slides) {
        new HeroSlider(data.hero.slides);
    }

    // Trigger initializers that depend on DOM
    initScrollReveal();
    initParallax();
    initServiceBackgroundSwitcher();
    initCustomCursorHovers();
}


/**
 * Handles number counting animation with easing and IntersectionObserver.
 */
function initNumberAnimation() {
    const metrics = document.querySelectorAll('.metric-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if(el.dataset.animated) return;
                el.dataset.animated = true;
                
                const targetText = el.getAttribute('data-target');
                const numMatch = targetText.match(/[\d.]+/);
                
                if(numMatch) {
                    const numStr = numMatch[0];
                    const num = parseFloat(numStr);
                    const isFloat = numStr.includes('.');
                    const prefix = targetText.slice(0, numMatch.index);
                    const suffix = targetText.slice(numMatch.index + numStr.length);
                    
                    let startTime = null;
                    const duration = 2000;
                    
                    const step = (timestamp) => {
                        if(!startTime) startTime = timestamp;
                        const progress = Math.min((timestamp - startTime) / duration, 1);
                        const easeOut = 1 - Math.pow(1 - progress, 4);
                        const currentNum = num * easeOut;
                        
                        el.innerText = prefix + (isFloat ? currentNum.toFixed(1) : Math.floor(currentNum)) + suffix;
                        
                        if(progress < 1) {
                            window.requestAnimationFrame(step);
                        } else {
                            el.innerText = targetText;
                        }
                    };
                    window.requestAnimationFrame(step);
                } else {
                    el.innerText = targetText;
                }
            }
        });
    }, { threshold: 0.2 });
    
    metrics.forEach(m => observer.observe(m));
}

/**
 * Initialize Custom Cursor with Lerp (Inertia Lag)
 */
function initCustomCursor() {
    const dot = document.getElementById('custom-cursor-dot');
    const ring = document.getElementById('custom-cursor-ring');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // Dot follows instantly
        dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    });

    function render() {
        // Ring follows with lerp
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Hover states for interactive elements
    initCustomCursorHovers();
}

/**
 * Re-run hover detection for dynamic elements
 */
function initCustomCursorHovers() {
    const ring = document.getElementById('custom-cursor-ring');
    if (!ring) return;
    const interactables = document.querySelectorAll('a, button, input, textarea, [role="button"], .group, .service-card');
    interactables.forEach(el => {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = "true";
        el.addEventListener('mouseenter', () => ring.classList.add('hover'), { passive: true });
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'), { passive: true });
    });
}

/**
 * Initialize Scroll Reveal
 */
function initScrollReveal() {
    // Dynamically add reveal class to main sections if not present
    document.querySelectorAll('section > div').forEach(el => {
        if(!el.classList.contains('reveal-up')) {
            el.classList.add('reveal-up');
        }
    });

    const revealElements = document.querySelectorAll('.reveal-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // observer.unobserve(entry.target); // Optional: keep observing if you want repeat animations
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    revealElements.forEach(el => observer.observe(el));
}

/**
 * Initialize Subtle Background Animation (Premium Style A: Interactive Neural Network)
 */
function initSubtleBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height, particles;
    let mouse = { x: null, y: null, radius: 150 };

    // Optimized particle count based on screen area
    const getParticleCount = () => Math.min(Math.floor((window.innerWidth * window.innerHeight) / 12000), 100);
    const connectionDistance = 160;
    const particleSpeed = 0.35;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * particleSpeed;
            this.vy = (Math.random() - 0.5) * particleSpeed;
            this.radius = Math.random() * 1.5 + 0.8;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
        }

        update() {
            // Mouse Interaction (Attraction/Ripple)
            if (mouse.x !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x += directionX * 0.1;
                    this.y += directionY * 0.1;
                }
            }

            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges with soft reset
            if (this.x < -10 || this.x > width + 10) this.vx *= -1;
            if (this.y < -10 || this.y > height + 10) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            // Draw at 5% opacity directly
            ctx.fillStyle = 'rgba(100, 116, 139, 0.4)'; 
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        let count = getParticleCount();
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            p1.update();
            p1.draw();

            // Connect nearest nodes
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    // Line opacity at 0.08 - 0.2 depending on distance
                    const opacity = 0.25 * (1 - dist / connectionDistance);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(94, 106, 210, ${opacity})`; // Indigo-500 tint
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        init();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    init();
    animate();
}

/**
 * Get direction of mouse entry/exit
 * 0: top, 1: right, 2: bottom, 3: left
 */
function getDirection(ev, obj) {
    const rect = obj.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    
    // Calculate x and y relative to the center of the element
    const x = (ev.clientX - rect.left - (w / 2)) * (w > h ? (h / w) : 1);
    const y = (ev.clientY - rect.top - (h / 2)) * (h > w ? (w / h) : 1);
    
    // Calculate the angle and map it to 0-3
    const direction = Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4;
    return direction;
}

function initServiceBackgroundSwitcher() {
    const section = document.getElementById('services');
    if (!section) return;

    const cards = section.querySelectorAll('.service-card');
    if (cards.length === 0) return;

    const getInsetForDirection = (dir) => {
        switch(dir) {
            case 0: return 'inset(0 0 100% 0)'; // Top
            case 1: return 'inset(0 0 0 100%)'; // Right
            case 2: return 'inset(100% 0 0 0)'; // Bottom
            case 3: return 'inset(0 100% 0 0)'; // Left
            default: return 'inset(0 0 0 0)';
        }
    };

    cards.forEach((card) => {
        const bgUrl = card.getAttribute('data-bg');
        if (!bgUrl) return;

        // Create local background container
        const bgLayer = document.createElement('div');
        bgLayer.className = 'service-local-bg absolute inset-0 pointer-events-none z-0';
        bgLayer.style.backgroundImage = `url('${bgUrl}')`;
        bgLayer.style.backgroundSize = 'cover';
        bgLayer.style.backgroundPosition = 'center';
        bgLayer.style.transition = 'clip-path 0.6s cubic-bezier(0.15, 0, 0.2, 1)';
        bgLayer.style.clipPath = 'inset(0 0 0 0)'; // Default hidden state handled by mouse events
        
        // Add dark overlay for readability
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-slate-950/40 opacity-100';
        bgLayer.appendChild(overlay);

        // Prepend to card (behind content)
        card.prepend(bgLayer);

        // Initially hide with a logical state
        bgLayer.style.clipPath = 'inset(0 0 100% 0)'; 

        card.addEventListener('mouseenter', (ev) => {
            const dir = getDirection(ev, card);
            
            // Momentarily disable transition to snap to entry position
            bgLayer.style.transition = 'none';
            bgLayer.style.clipPath = getInsetForDirection(dir);
            
            // Force reflow
            bgLayer.offsetHeight;
            
            // Enable transition and expand
            bgLayer.style.transition = 'clip-path 0.6s cubic-bezier(0.15, 0, 0.2, 1)';
            bgLayer.style.clipPath = 'inset(0 0 0 0)';
        });

        card.addEventListener('mouseleave', (ev) => {
            const dir = getDirection(ev, card);
            bgLayer.style.clipPath = getInsetForDirection(dir);
        });
    });
}

/**
 * Initialize Parallax Scrolling
 */
function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    if (parallaxElements.length === 0) return;
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        parallaxElements.forEach(el => {
            const speed = el.getAttribute('data-speed') || 0.2;
            const yPos = scrollY * speed;
            el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }, { passive: true });
}

/**
 * Navbar Scroll Logic - Only show at the very top
 */
function initNavbarScroll() {
    const nav = document.querySelector('.glass-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        // Only show if we are near the top of the page
        if (currentScroll > 50) {
            nav.classList.add('nav-hidden');
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-hidden');
            nav.classList.remove('nav-scrolled');
        }
    }, { passive: true });
}

/**
 * Cinematic Scroll Engine - SLIDING OVERLAY PARALLAX Mode
 * Logic: Dark base stays; White metrics layer slides up from 100vh to 0.
 * Pacing: Stay (0-0.4) | Fade Down Base (0.4-0.5) | Trigger Slide (0.45)
 */
function initCinematicScroll() {
    const wrapper = document.getElementById('cinematic-scroll-wrapper');
    const servicesLayer = document.getElementById('services');
    const statsLayer = document.getElementById('stats-section');
    if (!wrapper || !servicesLayer || !statsLayer) return;

    // State Tracking
    let state = {
        scrollProgress: 0,
        lerpSlide: 0, // 0 to 1 mapping to translateY(100% to 0%)
        numbersStarted: false
    };

    // Helper: Numeric ease out
    const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const startMetricsAnimation = () => {
        if (state.numbersStarted) return;
        state.numbersStarted = true;
        const numbers = document.querySelectorAll('.metric-number');
        numbers.forEach(num => {
            const target = parseInt(num.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                num.textContent = Math.floor(easedProgress * target);
                if (progress < 1) requestAnimationFrame(animate);
                else num.textContent = target;
            };
            requestAnimationFrame(animate);
        });
    };

    // Rendering Tick Loop
    const update = () => {
        const lerpFactor = 0.08; // Smoothness damping

        // 1. BASE REMAINS SOLID (Per request: Four core services don't change color/fade)
        servicesLayer.style.opacity = "1";
        servicesLayer.style.pointerEvents = state.scrollProgress > 0.7 ? 'none' : 'auto';

        // 2. OVERLAY SLIDE TRIGGER (Turbo Pacing for 300vh)
        let targetSlideValue = state.scrollProgress > 0.35 ? 1 : 0;
        state.lerpSlide += (targetSlideValue - state.lerpSlide) * lerpFactor;

        // Apply Vertical Displacement
        const translateY = (1 - state.lerpSlide) * 100;
        statsLayer.style.transform = `translateY(${translateY}%)`;
        
        // Ensure stats layer is always themed correctly
        statsLayer.classList.add('is-light-theme');

        // Global theme toggle for cursor/nav sync
        // Only active when Stats layer is mostly visible
        if (state.lerpSlide > 0.5) {
            document.documentElement.classList.add('is-light-theme');
        } else {
            document.documentElement.classList.remove('is-light-theme');
        }

        // Safety: Remove if we've scrolled way past or haven't reached
        const rect = wrapper.getBoundingClientRect();
        if (rect.bottom < 100 || rect.top > window.innerHeight) {
            document.documentElement.classList.remove('is-light-theme');
        }

        // 3. STATS REVEAL (Internal animation as it slides)
        let textOpacity = Math.min(Math.max((state.lerpSlide - 0.5) / 0.4, 0), 1);
        const metricsInner = statsLayer.querySelector('.max-w-7xl');
        if (metricsInner) {
            metricsInner.style.opacity = ease(textOpacity);
            metricsInner.style.transform = `translateY(${(1 - ease(textOpacity)) * 20}px)`;
        }

        // Start numbers as the slide reaches visibility threshold
        if (state.lerpSlide > 0.8) {
            startMetricsAnimation();
        } else if (state.scrollProgress < 0.2) {
            state.numbersStarted = false;
        }

        requestAnimationFrame(update);
    };

    // Initial Progress Calculation
    const calculateProgress = () => {
        const rect = wrapper.getBoundingClientRect();
        const totalScrollRange = rect.height - window.innerHeight;
        state.scrollProgress = Math.min(Math.max(-rect.top / totalScrollRange, 0), 1);
    };

    // Start Tick & Listener
    calculateProgress();
    requestAnimationFrame(update);
    window.addEventListener('scroll', calculateProgress, { passive: true });
}

/**
 * Contact Form Logic - Handles submission and visual feedback
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');
    if (!form || !successMsg) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show Loading State on button
        const btn = form.querySelector('button[type="submit"]');
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `
            <span class="flex items-center justify-center gap-3">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>處理中...</span>
            </span>
        `;

        // Simulate network delay
        setTimeout(() => {
            const formData = new FormData(form);
            console.log("PixoLab Contact Form Data:", Object.fromEntries(formData));

            // UI Transition
            form.style.opacity = '0';
            setTimeout(() => {
                form.classList.add('hidden');
                successMsg.classList.remove('hidden');
                successMsg.style.display = 'block';
                successMsg.classList.add('reveal-up', 'active');
                
                // Scroll into view if needed
                successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }, 1500);
    });
}

// Global Initialization after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initSubtleBackground();
    initNavbarScroll();
    initCinematicScroll();
    initContactForm(); // Initialize form logic
});
