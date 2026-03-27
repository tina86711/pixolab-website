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

  // 3. Metrics (High-impact Stats - Big 7xl Number Style)
  if (data.metrics && data.metrics.cards) {
      const metricsContainer = document.getElementById('metrics-grid');
      if (metricsContainer) {
          metricsContainer.innerHTML = '';
          data.metrics.cards.forEach((card, index) => {
              const div = document.createElement('div');
              div.className = 'stat-item flex flex-col reveal-up';
              div.style.transitionDelay = `${index * 0.1}s`;
              div.innerHTML = `
                  <dt class="text-sm font-bold leading-6 text-slate-400 tracking-[0.2em] uppercase mb-4">${card.label}</dt>
                  <dd class="order-first flex items-baseline gap-1">
                      <span class="stat-number text-7xl font-black tracking-tighter text-white metric-number" data-target="${card.metric}">0</span>
                      <span class="text-4xl font-black text-brand-400">+</span>
                  </dd>
                  <dt class="mt-4 text-xs text-slate-500 italic opacity-60">${card.source}</dt>
              `;
              metricsContainer.appendChild(div);
          });
          // Initialize scroll reveal for newly added elements
          if (typeof initScrollReveal === 'function') initScrollReveal();
      }
      setTimeout(initNumberAnimation, 100);
  }

  // 4. Steps (Premium Process Cards)
  if (data.how_it_works && data.how_it_works.steps) {
      const stepsContainer = document.getElementById('how-it-works-grid');
      if (stepsContainer) {
          stepsContainer.innerHTML = '';
          data.how_it_works.steps.forEach((step, index) => {
              const div = document.createElement('div');
              div.className = 'reveal-up';
              div.style.transitionDelay = `${index * 0.1 + 0.1}s`;
              div.innerHTML = `
                  <div class="h-20 w-20 rounded-[2rem] ${index === 2 ? 'bg-brand-50 text-brand-600 border border-brand-200' : (index === 1 ? 'bg-slate-900 text-white' : 'bg-brand-500 text-white')} flex items-center justify-center text-2xl font-black shadow-xl mb-10">
                    ${index + 1}
                  </div>
                  <h3 class="text-2xl font-bold text-slate-900 mb-4">${step.title}</h3>
                  <p class="text-lg text-slate-500 leading-relaxed font-medium">${step.desc}</p>
              `;
              stepsContainer.appendChild(div);
          });
          if (typeof initScrollReveal === 'function') initScrollReveal();
      }
  }

    // Re-init switcher after items are created (if they were dynamic) or just once
    initServiceBackgroundSwitcher();

    // Init Hero Slider if data exists
    if (data.hero && data.hero.slides) {
        new HeroSlider(data.hero.slides);
    }
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
    const setupHovers = () => {
        const interactables = document.querySelectorAll('a, button, input, textarea, [role="button"], .group');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('hover'), { passive: true });
            el.addEventListener('mouseleave', () => ring.classList.remove('hover'), { passive: true });
        });
    };
    
    setupHovers();
    setTimeout(setupHovers, 1000); // re-run after dynamic DOM loads
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
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

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
 * Initialize Service Section Background Switcher
 */
function initServiceBackgroundSwitcher() {
    const section = document.getElementById('services');
    if (!section) return;

    // Create background layers if they don't exist
    let layerContainer = section.querySelector('.service-bg-container');
    if (!layerContainer) {
        layerContainer = document.createElement('div');
        layerContainer.className = 'service-bg-container absolute inset-0 -z-10 pointer-events-none';
        section.style.position = 'relative';
        section.insertBefore(layerContainer, section.firstChild);
    }

    const images = [
        'img/refinelab_panoramic_view_of_Kuala_Lumpur_city_in_bright_dayli_7cbc5caa-5a8f-40b9-9b7d-def1603ff0c0_0.png',
        'img/unnamed.jpg',
        'img/unnamed (1).jpg',
        'img/refinelab_panoramic_view_of_Kuala_Lumpur_city_in_bright_dayli_7cbc5caa-5a8f-40b9-9b7d-def1603ff0c0_0.png'
    ];

    // Pre-create layers
    if (layerContainer.children.length === 0) {
        images.forEach(src => {
            const layer = document.createElement('div');
            layer.className = 'service-bg-layer absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-0';
            layer.style.backgroundImage = `url('${src}')`;
            layer.style.backgroundSize = 'cover';
            layer.style.backgroundPosition = 'center';
            layerContainer.appendChild(layer);
        });
    }

    const cards = section.querySelectorAll('.service-card');
    const layers = layerContainer.querySelectorAll('.service-bg-layer');

    cards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            layers.forEach((l, i) => {
                l.classList.toggle('active', i === index);
                l.style.opacity = i === index ? '0.15' : '0'; // Sync with premium feel
            });
        });
    });

    section.addEventListener('mouseleave', () => {
        layers.forEach(l => {
            l.classList.remove('active');
            l.style.opacity = '0';
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
 * Handle Navbar transparency toggle on scroll
 */
function initNavbarScroll() {
    const nav = document.querySelector('.glass-nav');
    if (!nav) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
}

// Call new initializers on DOMContentLoad
document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initSubtleBackground();
    initNavbarScroll();
    setTimeout(() => {
        initScrollReveal();
        initParallax();
        initServiceBackgroundSwitcher();
    }, 150);
}); 
