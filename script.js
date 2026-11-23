/**
 * JAGADEESHWAR S — PREMIUM CINEMATIC 3D DEVELOPER PORTFOLIO
 * Three.js Cinematic Space Engine & Interactive UI Architecture
 */

(function () {
  'use strict';

  // --- 1. GLOBAL STATE & CONFIGURATION ---
  const CONFIG = {
    starCount: 2400,
    dustCount: 600,
    cameraSpeed: 0.05,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  let scene, camera, renderer, starField, dustParticles, celestialBody, celestialRing;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;
  let isPageVisible = true;
  let animationFrameId = null;

  // --- 2. THREE.JS 3D SPACE ENVIRONMENT ---
  function initThreeSpace() {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;

    // Check WebGL availability
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded, falling back to 2D canvas stars.');
      initCanvas2DFallback(canvas);
      return;
    }

    try {
      // Scene & Camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
      camera.position.z = 1000;

      // WebGL Renderer
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      // A. Distant Multidimensional Starfield
      createRealisticStarfield();

      // B. Ambient Deep Cosmic Dust Particles
      createCosmicDust();

      // C. Animated 3D Celestial Planet Sphere with Atmospheric Glow
      createCelestialObject();

      // Event Listeners
      window.addEventListener('resize', onWindowResize, { passive: true });
      window.addEventListener('mousemove', onDocumentMouseMove, { passive: true });
      window.addEventListener('scroll', onDocumentScroll, { passive: true });

      // Handle visibility changes to save GPU
      document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        if (isPageVisible && !animationFrameId) {
          animateSpace();
        }
      });

      // Start Render Loop
      animateSpace();

    } catch (err) {
      console.error('WebGL Initialization Error:', err);
      initCanvas2DFallback(canvas);
    }
  }

  // --- CREATE STARFIELD ---
  function createRealisticStarfield() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.starCount * 3);
    const colors = new Float32Array(CONFIG.starCount * 3);
    const sizes = new Float32Array(CONFIG.starCount);

    const colorVariants = [
      new THREE.Color(1.0, 1.0, 1.0),       // Pure brilliant white
      new THREE.Color(0.85, 0.9, 1.0),      // Crisp glacial white-blue
      new THREE.Color(0.75, 0.75, 0.8),     // Subtle muted silver
      new THREE.Color(0.95, 0.95, 0.9)      // Soft starlight ivory
    ];

    for (let i = 0; i < CONFIG.starCount; i++) {
      const i3 = i * 3;
      // Spherical distribution across deep space
      const radius = 600 + Math.random() * 1600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const color = colorVariants[Math.floor(Math.random() * colorVariants.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Realistic star size variation
      sizes[i] = Math.random() < 0.1 ? 3.0 : Math.random() < 0.3 ? 2.0 : 1.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Star point texture with soft radial falloff
    const starTexture = createStarCanvasTexture();

    const material = new THREE.PointsMaterial({
      size: 2.2,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false
    });

    starField = new THREE.Points(geometry, material);
    scene.add(starField);
  }

  // --- CREATE COSMIC DUST ---
  function createCosmicDust() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.dustCount * 3);

    for (let i = 0; i < CONFIG.dustCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1200;
      positions[i + 1] = (Math.random() - 0.5) * 1200;
      positions[i + 2] = (Math.random() - 0.5) * 800 + 400;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      color: 0x9999aa,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    dustParticles = new THREE.Points(geometry, material);
    scene.add(dustParticles);
  }

  // --- CREATE 3D CELESTIAL OBJECT (PLANET & ORBITAL RING) ---
  function createCelestialObject() {
    const celestialGroup = new THREE.Group();

    // 1. Celestial Planet Sphere (Monochrome Architectural Grid & Wireframe)
    const sphereGeometry = new THREE.SphereGeometry(140, 36, 36);

    // Core dark sphere
    const sphereCoreMat = new THREE.MeshBasicMaterial({
      color: 0x050508,
      transparent: true,
      opacity: 0.95
    });
    const sphereCore = new THREE.Mesh(sphereGeometry, sphereCoreMat);
    celestialGroup.add(sphereCore);

    // Elegant monochrome wireframe / geodesic cage
    const wireframeGeometry = new THREE.WireframeGeometry(sphereGeometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      linewidth: 1
    });
    const sphereWire = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    celestialGroup.add(sphereWire);

    // Atmospheric Rim Glow
    const glowGeo = new THREE.SphereGeometry(143, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.04
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    celestialGroup.add(glowMesh);

    // 2. Cosmic Orbital Ring (Particle Belt)
    const ringGeo = new THREE.BufferGeometry();
    const ringCount = 800;
    const ringPositions = new Float32Array(ringCount * 3);
    const innerRadius = 180;
    const outerRadius = 260;

    for (let i = 0; i < ringCount * 3; i += 3) {
      const r = innerRadius + Math.random() * (outerRadius - innerRadius);
      const angle = Math.random() * Math.PI * 2;
      ringPositions[i] = Math.cos(angle) * r;
      ringPositions[i + 1] = (Math.random() - 0.5) * 8; // Slight disc thickness
      ringPositions[i + 2] = Math.sin(angle) * r;
    }

    ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));

    const ringMat = new THREE.PointsMaterial({
      size: 1.4,
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    celestialRing = new THREE.Points(ringGeo, ringMat);
    celestialRing.rotation.x = Math.PI / 4.5;
    celestialRing.rotation.y = Math.PI / 8;
    celestialGroup.add(celestialRing);

    // Initial positioning in 3D space: placed in upper-right cosmic quadrant
    celestialGroup.position.set(380, 120, -100);
    celestialBody = celestialGroup;
    scene.add(celestialBody);
  }

  // --- GENERATE CIRCULAR STAR POINT TEXTURE ---
  function createStarCanvasTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // --- WINDOW RESIZE ---
  function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  // --- MOUSE MOVEMENT PARALLAX ---
  function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.4;
    mouseY = (event.clientY - windowHalfY) * 0.4;
  }

  // --- SCROLL-LINKED CAMERA INTERACTION ---
  let scrollProgress = 0;
  function onDocumentScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  // --- 3D ANIMATION LOOP ---
  function animateSpace(timestamp) {
    if (!isPageVisible) {
      animationFrameId = null;
      return;
    }

    animationFrameId = requestAnimationFrame(animateSpace);

    // Smooth Parallax Interpolation (Lerp)
    if (!CONFIG.reducedMotion) {
      targetX += (mouseX - targetX) * CONFIG.cameraSpeed;
      targetY += (mouseY - targetY) * CONFIG.cameraSpeed;

      camera.position.x = targetX * 0.5;
      camera.position.y = -targetY * 0.5 + (scrollProgress * 200);
      camera.lookAt(scene.position);
    }

    // Starfield gentle cosmic drift
    if (starField) {
      starField.rotation.y += 0.0003;
      starField.rotation.x += 0.0001;
    }

    if (dustParticles) {
      dustParticles.rotation.y += 0.0005;
      dustParticles.rotation.z -= 0.0002;
    }

    // Celestial Planet & Ring Rotation & Float
    if (celestialBody) {
      celestialBody.rotation.y += 0.0025;
      celestialBody.rotation.x += 0.001;

      // Floating sinusoidal oscillation
      const time = timestamp ? timestamp * 0.001 : Date.now() * 0.001;
      celestialBody.position.y = 120 + Math.sin(time * 0.8) * 15 - (scrollProgress * 300);
      celestialBody.position.x = 380 - (scrollProgress * 150);

      if (celestialRing) {
        celestialRing.rotation.z += 0.0015;
      }
    }

    renderer.render(scene, camera);
  }

  // --- 2D CANVAS FALLBACK IF WEBGL IS UNAVAILABLE ---
  function initCanvas2DFallback(canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const stars = [];
    for (let i = 0; i < 400; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.2 + 0.05
      });
    }

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    function draw() {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      requestAnimationFrame(draw);
    }
    draw();
  }

  // --- 3. UI INTERACTIONS & SCROLL EFFECTS ---
  function initUIInteractions() {
    initThemeToggle();
    initProfileInteractivity();
    initNavbarScroll();
    initMobileNav();
    initActiveNavObserver();
    initHeroTilt();
    initCertificateFilter();
    initContactForm();
    initBackToTop();
  }

  // --- THEME TOGGLE (DARK SPACE vs LIGHT WHITE THEME) ---
  let currentTheme = 'dark';
  function initThemeToggle() {
    const desktopBtn = document.getElementById('theme-toggle-btn');
    const mobileBtn = document.getElementById('mobile-theme-toggle-btn');

    function applyTheme(theme) {
      currentTheme = theme;
      const isLight = theme === 'light';

      if (isLight) {
        document.body.classList.add('light-theme');
      } else {
        document.body.classList.remove('light-theme');
      }

      // Update sun/moon icons on all theme buttons
      document.querySelectorAll('.sun-icon').forEach(icon => {
        icon.classList.toggle('hidden', isLight);
      });
      document.querySelectorAll('.moon-icon').forEach(icon => {
        icon.classList.toggle('hidden', !isLight);
      });

      // Update mobile button label text
      const mobileLabel = document.querySelector('#mobile-theme-toggle-btn .theme-text');
      if (mobileLabel) {
        mobileLabel.textContent = isLight ? 'Switch To Dark Theme' : 'Switch To Light Theme';
      }

      // Dynamically adjust Three.js 3D space scene colors
      if (starField && starField.material) {
        starField.material.color.setHex(isLight ? 0x0f172a : 0xffffff);
        starField.material.opacity = isLight ? 0.75 : 1.0;
        starField.material.needsUpdate = true;
      }
      if (dustParticles && dustParticles.material) {
        dustParticles.material.color.setHex(isLight ? 0x334155 : 0x9999aa);
        dustParticles.material.needsUpdate = true;
      }
      if (celestialBody) {
        celestialBody.children.forEach(child => {
          if (child.material) {
            if (child.isLineSegments) {
              child.material.color.setHex(isLight ? 0x0f172a : 0xffffff);
              child.material.opacity = isLight ? 0.35 : 0.15;
            } else if (child.isPoints) {
              child.material.color.setHex(isLight ? 0x1e293b : 0xffffff);
              child.material.opacity = isLight ? 0.6 : 0.45;
            }
            child.material.needsUpdate = true;
          }
        });
      }

      try {
        localStorage.setItem('portfolio-theme', theme);
      } catch (e) {}
    }

    // Toggle click handler
    function toggle() {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      showToast(nextTheme === 'light' ? 'Switched to Minimalist Light Theme (White Background)' : 'Switched to Deep Space Dark Theme');
    }

    if (desktopBtn) desktopBtn.addEventListener('click', toggle);
    if (mobileBtn) mobileBtn.addEventListener('click', toggle);

    // Initial theme preference from storage
    try {
      const saved = localStorage.getItem('portfolio-theme');
      if (saved) {
        applyTheme(saved);
      }
    } catch (e) {}
  }

  // --- INTERACTIVE PROFILE IMAGE (EFFICIENCY & MULTI-MODE NOIR / COLOR / CYBER) ---
  function initProfileInteractivity() {
    const profileImg = document.getElementById('hero-profile-img');
    const profileFrame = document.getElementById('profile-frame');
    const modeLabel = document.getElementById('profile-mode-label');
    const scanline = document.getElementById('cyber-scanline');
    const modeBtns = document.querySelectorAll('.profile-mode-btn');
    const heroCard = document.querySelector('.hero-3d-card');

    if (!profileImg) return;

    const modes = ['noir', 'color', 'cyber'];
    const labels = {
      noir: 'Noir Mode',
      color: 'Color Mode',
      cyber: 'Cyber Scan Mode'
    };
    let currentModeIndex = 0;

    function setProfileMode(mode) {
      currentModeIndex = modes.indexOf(mode);
      if (currentModeIndex === -1) currentModeIndex = 0;

      // Update image filter class
      profileImg.classList.remove('profile-mode-noir', 'profile-mode-color', 'profile-mode-cyber');
      profileImg.classList.add(`profile-mode-${mode}`);

      // Update button active state
      modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
      });

      // Update mode text label
      if (modeLabel) modeLabel.textContent = labels[mode];

      // Toggle animated laser scanline in cyber mode
      if (scanline) {
        scanline.classList.toggle('hidden', mode !== 'cyber');
      }
    }

    // Click photo to cycle through modes
    if (profileFrame) {
      profileFrame.addEventListener('click', () => {
        currentModeIndex = (currentModeIndex + 1) % modes.length;
        setProfileMode(modes[currentModeIndex]);
      });
    }

    // Mode button selector clicks
    modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mode = btn.getAttribute('data-mode');
        setProfileMode(mode);
      });
    });

    // Dynamic specular reflection sheen tracking cursor on photo
    if (heroCard) {
      heroCard.addEventListener('mousemove', (e) => {
        const rect = heroCard.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        heroCard.style.setProperty('--mouse-x', `${x}%`);
        heroCard.style.setProperty('--mouse-y', `${y}%`);
      });
    }
  }

  // --- NAVBAR SCROLL EFFECT ---
  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // --- MOBILE NAVIGATION DRAWER ---
  function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!toggleBtn || !mobileMenu) return;

    function toggleMenu(open) {
      const isExpanded = open !== undefined ? open : toggleBtn.getAttribute('aria-expanded') !== 'true';
      toggleBtn.setAttribute('aria-expanded', String(isExpanded));
      toggleBtn.classList.toggle('active', isExpanded);

      if (isExpanded) {
        mobileMenu.classList.add('active');
      } else {
        mobileMenu.classList.remove('active');
      }
    }

    toggleBtn.addEventListener('click', () => toggleMenu());

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!toggleBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        toggleMenu(false);
      }
    });
  }

  // --- ACTIVE NAVIGATION SPY (IntersectionObserver) ---
  function initActiveNavObserver() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px'
    });

    sections.forEach(section => observer.observe(section));
  }

  // --- HERO 3D CARD MOUSE TILT ---
  function initHeroTilt() {
    const card = document.querySelector('.hero-3d-card');
    const container = document.querySelector('.hero-card-container');
    if (!card || !container || CONFIG.reducedMotion) return;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    container.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  // --- CERTIFICATE FILTER TABS ---
  function initCertificateFilter() {
    const buttons = document.querySelectorAll('.cert-filter-btn');
    const cards = document.querySelectorAll('.cert-card');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        cards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 30);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --- LIGHTBOX MODAL ---
  window.openLightbox = function (src, title, subtitle) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const titleEl = document.getElementById('lightbox-title');
    const subEl = document.getElementById('lightbox-subtitle');
    const downloadLink = document.getElementById('lightbox-download-link');

    if (!modal || !img) return;

    img.src = src;
    img.alt = title || 'Certificate Preview';
    if (titleEl) titleEl.textContent = title || 'Certificate Preview';
    if (subEl) subEl.textContent = subtitle || 'Verified Credential';
    if (downloadLink) {
      downloadLink.href = src;
      downloadLink.download = (title ? title.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'certificate') + '.png';
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeLightbox = function () {
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Lightbox Close Events
  document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('lightbox-close-btn');
    const modal = document.getElementById('lightbox-modal');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeLightbox();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  });

  // --- CONTACT FORM HANDLING ---
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all required fields.');
        return;
      }

      // Build Mailto URI
      const mailSubject = encodeURIComponent(`[Portfolio Inquiry] ${subject || 'New Contact Request'}`);
      const mailBody = encodeURIComponent(
        `Hello Jagadeeshwar,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent from Portfolio Website`
      );
      const mailtoUrl = `mailto:jagadeeshwar634@gmail.com?subject=${mailSubject}&body=${mailBody}`;

      // Show sleek confirmation toast
      showToast('Opening native email client with pre-populated message...');

      // Trigger mail client
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 400);

      form.reset();
    });
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // --- BACK TO TOP BUTTON ---
  function initBackToTop() {
    const btn = document.getElementById('back-to-top-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --- INITIALIZE ON DOM READY ---
  document.addEventListener('DOMContentLoaded', () => {
    initThreeSpace();
    initUIInteractions();
  });

})();
