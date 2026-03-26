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

  // 2. Logo Wall (Tailwind UI Logo Cloud Style)
  if (data.logo_wall && data.logo_wall.logos) {
      const logoContainer = document.getElementById('logo-wall-container');
      if (logoContainer) {
          logoContainer.innerHTML = '';
          data.logo_wall.logos.forEach(logoName => {
              const div = document.createElement('div');
              div.className = 'col-span-1 flex justify-center py-8 px-8 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors duration-300 ring-1 ring-inset ring-slate-900/5 group';
              div.innerHTML = `<span class="text-lg font-bold text-slate-400 group-hover:text-brand-500 transition-colors duration-300 tracking-tight">${logoName}</span>`; 
              logoContainer.appendChild(div);
          });
      }
  }

  // 3. Metrics (High-impact Stats)
  if (data.metrics && data.metrics.cards) {
      const metricsContainer = document.getElementById('metrics-container');
      if (metricsContainer) {
          metricsContainer.innerHTML = '';
          data.metrics.cards.forEach(card => {
              const dl = document.createElement('div');
              dl.className = 'flex flex-col bg-slate-400/5 p-8 border border-slate-100 hover:border-brand-100 transition-colors duration-300';
              dl.innerHTML = `
                  <dt class="text-sm font-semibold leading-6 text-slate-600">${card.label}</dt>
                  <dd class="order-first text-4xl font-extrabold tracking-tight text-slate-900 metric-number" data-target="${card.metric}">0</dd>
                  <dt class="mt-2 text-xs text-slate-400 italic">${card.source}</dt>
              `;
              metricsContainer.appendChild(dl);
          });
      }
      setTimeout(initNumberAnimation, 100);
  }

  // 4. Steps (Process cards)
  if (data.how_it_works && data.how_it_works.steps) {
      const stepsContainer = document.getElementById('steps-container');
      if (stepsContainer) {
          stepsContainer.innerHTML = '';
          data.how_it_works.steps.forEach((step, index) => {
              const div = document.createElement('div');
              div.className = 'relative flex flex-col gap-6 p-8 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-md transition-shadow group';
              div.innerHTML = `
                  <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 group-hover:bg-brand-600 transition-colors">
                    <span class="text-white font-bold text-sm">${index + 1}</span>
                  </div>
                  <div>
                    <h3 class="text-base font-semibold leading-7 text-slate-900">${step.title}</h3>
                    <p class="mt-2 text-sm leading-7 text-slate-600">${step.desc}</p>
                  </div>
              `;
              stepsContainer.appendChild(div);
          });
      }
  }

  // 5. Services (4-column cards - Refine-Lab Style)
  if (data.services && data.services.items) {
      const servicesContainer = document.getElementById('services-container');
      if (servicesContainer) {
          servicesContainer.innerHTML = '';
          
          // Abstract Geometric Wireframe Icons (Inspired by Refine-Lab)
          const wireframes = [
            // 001 - Sphere/Orbit (AI Enterprise System)
            `<svg viewBox="0 0 100 100" class="w-24 h-24 stroke-slate-300 fill-none group-hover:stroke-brand-500 transition-colors duration-500 animate-spin-slow">
              <circle cx="50" cy="50" r="40" stroke-width="0.5" stroke-dasharray="2 2" />
              <ellipse cx="50" cy="50" rx="40" ry="15" stroke-width="1" />
              <ellipse cx="50" cy="50" rx="15" ry="40" stroke-width="1" />
              <circle cx="50" cy="50" r="4" fill="currentColor" class="text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </svg>`,
            // 002 - Concentric Circles (Chatbot + Analytics)
            `<svg viewBox="0 0 100 100" class="w-24 h-24 stroke-slate-300 fill-none group-hover:stroke-brand-500 transition-colors duration-500">
              <circle cx="50" cy="50" r="10" stroke-width="1" class="group-hover:animate-ping-slow" />
              <circle cx="50" cy="50" r="20" stroke-width="0.8" opacity="0.6" />
              <circle cx="50" cy="50" r="30" stroke-width="0.6" opacity="0.4" />
              <circle cx="50" cy="50" r="40" stroke-width="0.4" opacity="0.2" />
              <line x1="50" y1="10" x2="50" y2="90" stroke-width="0.2" stroke-dasharray="4 4" />
              <line x1="10" y1="50" x2="90" y2="50" stroke-width="0.2" stroke-dasharray="4 4" />
            </svg>`,
            // 003 - Pyramid/Crystal (Social Content)
            `<svg viewBox="0 0 100 100" class="w-24 h-24 stroke-slate-300 fill-none group-hover:stroke-brand-500 transition-colors duration-500 group-hover:scale-110 transform transition-transform">
              <path d="M50 10 L90 80 L10 80 Z" stroke-width="1" />
              <path d="M50 10 L50 80" stroke-width="0.5" />
              <path d="M10 80 L50 60 L90 80" stroke-width="0.5" />
              <circle cx="50" cy="10" r="2" fill="currentColor" class="text-brand-500 opacity-0 group-hover:opacity-100" />
            </svg>`,
            // 004 - Cube/Structure (GEO Audit)
            `<svg viewBox="0 0 100 100" class="w-24 h-24 stroke-slate-300 fill-none group-hover:stroke-brand-500 transition-colors duration-500">
              <rect x="20" y="20" width="40" height="40" stroke-width="1" class="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-700" />
              <rect x="40" y="40" width="40" height="40" stroke-width="1" />
              <line x1="20" y1="20" x2="40" y2="40" stroke-width="1" />
              <line x1="60" y1="20" x2="80" y2="40" stroke-width="1" />
              <line x1="20" y1="60" x2="40" y2="80" stroke-width="1" />
              <line x1="60" y1="60" x2="80" y2="80" stroke-width="1" />
            </svg>`
          ];

          data.services.items.forEach((item, index) => {
              const num = (index + 1).toString().padStart(3, '0');
              const div = document.createElement('div');
              div.className = 'flex flex-col bg-white rounded-[2.5rem] p-10 ring-1 ring-slate-100 hover:ring-brand-500/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 group relative hover:-translate-y-2 overflow-hidden items-center text-center';
              div.innerHTML = `
                  <div class="absolute top-8 left-8 text-xs font-medium text-slate-300 tracking-widest">${num}</div>
                  <div class="flex items-center justify-center h-48 mb-8">
                    ${wireframes[index]}
                  </div>
                  <h3 class="text-xl font-bold text-slate-900 group-hover:text-brand-500 transition-colors duration-300">${item.name}</h3>
                  <p class="mt-4 text-sm font-semibold text-brand-600">${item.subtitle}</p>
                  <p class="mt-4 text-sm leading-relaxed text-slate-500 max-w-[280px]">${item.desc}</p>
                  <div class="mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0 flex-grow flex items-end">
                    <a href="${item.url}" class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900">
                      Learn More
                      <div class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                      </div>
                    </a>
                  </div>
              `;
              servicesContainer.appendChild(div);
          });
      }
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
 * Initialize Parallax Scrolling
 */
function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        parallaxElements.forEach(el => {
            const speed = el.getAttribute('data-speed') || 0.2;
            el.style.transform = `translateY(${scrollY * speed}px)`;
        });
    }, { passive: true });
}

// Call new initializers on DOMContentLoad
document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    setTimeout(() => {
        initScrollReveal();
        initParallax();
    }, 150);
}); 
