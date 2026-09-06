/**
 * Night Pipers - Celestial Interactive JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initMobileNav();
  initBreathingWidget();
  initMoonPhase();
  initNavbarScroll();
});

/* -------------------------------------------------------------------------- */
/* Starfield Canvas Background                                                */
/* -------------------------------------------------------------------------- */
function initStarfield() {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createStars();
  });

  let stars = [];
  const starCount = Math.floor((width * height) / 3200);

  function createStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.3 + 0.3,
        alpha: Math.random() * 0.7 + 0.2,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        color: Math.random() > 0.85 ? '#c4b5fd' : (Math.random() > 0.7 ? '#93c5fd' : '#ffffff')
      });
    }
  }
  createStars();

  // Subtle shooting star
  let shootingStar = null;
  function spawnShootingStar() {
    if (Math.random() < 0.008 && !shootingStar) {
      shootingStar = {
        x: Math.random() * width,
        y: Math.random() * (height * 0.4),
        length: Math.random() * 80 + 50,
        speed: Math.random() * 6 + 4,
        angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
        opacity: 1
      };
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Render twinkling stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.alpha += s.twinkleSpeed * s.twinkleDir;
      if (s.alpha > 0.9) {
        s.alpha = 0.9;
        s.twinkleDir = -1;
      } else if (s.alpha < 0.15) {
        s.alpha = 0.15;
        s.twinkleDir = 1;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.shadowBlur = s.radius > 1 ? 4 : 0;
      ctx.shadowColor = s.color;
      ctx.fill();
      ctx.restore();
    }

    // Shooting star animation
    spawnShootingStar();
    if (shootingStar) {
      ctx.save();
      ctx.beginPath();
      const endX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
      const endY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;
      
      const grad = ctx.createLinearGradient(shootingStar.x, shootingStar.y, endX, endY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.moveTo(shootingStar.x, shootingStar.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.restore();

      shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
      shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
      shootingStar.opacity -= 0.015;

      if (shootingStar.opacity <= 0 || shootingStar.x > width || shootingStar.y > height) {
        shootingStar = null;
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* -------------------------------------------------------------------------- */
/* Mobile Navigation Drawer                                                   */
/* -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('active');
    toggleBtn.setAttribute('aria-expanded', isOpen);
    toggleBtn.innerHTML = isOpen
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
  });

  const drawerLinks = drawer.querySelectorAll('a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('active');
      toggleBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Mindful Breathing Sanctuary Widget                                         */
/* -------------------------------------------------------------------------- */
function initBreathingWidget() {
  const orb = document.getElementById('breathing-orb');
  const actionText = document.getElementById('breath-action');
  const timerLabel = document.getElementById('breath-timer');
  const toggleBtn = document.getElementById('breath-toggle-btn');

  if (!orb || !actionText || !timerLabel || !toggleBtn) return;

  let isRunning = false;
  let cycleInterval = null;
  let stepTimer = null;
  
  // 4s Inhale, 4s Hold, 4s Exhale (Box breathing cycle)
  const phases = [
    { name: 'Inhale', class: 'inhale', duration: 4, tip: 'Breathe in slowly through the nose...' },
    { name: 'Hold', class: 'hold', duration: 4, tip: 'Gently retain your breath with calm...' },
    { name: 'Exhale', class: 'exhale', duration: 4, tip: 'Release the breath effortlessly...' }
  ];

  let currentPhaseIndex = 0;
  let remainingSeconds = 4;

  function runPhase() {
    const phase = phases[currentPhaseIndex];
    orb.className = 'breathing-orb ' + phase.class;
    actionText.textContent = phase.name;
    remainingSeconds = phase.duration;
    timerLabel.textContent = `${phase.tip} (${remainingSeconds}s)`;

    if (stepTimer) clearInterval(stepTimer);
    stepTimer = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds > 0) {
        timerLabel.textContent = `${phase.tip} (${remainingSeconds}s)`;
      }
    }, 1000);

    currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
  }

  function startBreathing() {
    isRunning = true;
    toggleBtn.textContent = 'Pause Sanctuary';
    toggleBtn.classList.replace('btn-primary', 'btn-secondary');
    currentPhaseIndex = 0;
    runPhase();
    cycleInterval = setInterval(runPhase, 4000);
  }

  function stopBreathing() {
    isRunning = false;
    toggleBtn.textContent = 'Begin Breathing';
    toggleBtn.classList.replace('btn-secondary', 'btn-primary');
    clearInterval(cycleInterval);
    clearInterval(stepTimer);
    orb.className = 'breathing-orb';
    actionText.textContent = 'Breathe';
    timerLabel.textContent = 'Find stillness before sleep & reflection';
  }

  toggleBtn.addEventListener('click', () => {
    if (isRunning) {
      stopBreathing();
    } else {
      startBreathing();
    }
  });
}

/* -------------------------------------------------------------------------- */
/* Real-time Moon Phase Calculation                                           */
/* -------------------------------------------------------------------------- */
function initMoonPhase() {
  const moonPhaseName = document.getElementById('current-moon-phase');
  const moonIllumination = document.getElementById('current-moon-illum');

  if (!moonPhaseName) return;

  // Synodic lunar cycle calculation
  const now = new Date();
  // Known new moon reference: Jan 11, 2024, 11:57 UTC
  const refNewMoon = new Date(Date.UTC(2024, 0, 11, 11, 57, 0));
  const synodicMonth = 29.53058867; // in days
  const diffDays = (now.getTime() - refNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const cycleDay = (diffDays % synodicMonth + synodicMonth) % synodicMonth;
  const phaseFraction = cycleDay / synodicMonth;

  let phase = 'New Moon';
  let illum = Math.round((1 - Math.cos(phaseFraction * 2 * Math.PI)) / 2 * 100);

  if (cycleDay < 1.845) phase = 'New Moon';
  else if (cycleDay < 5.536) phase = 'Waxing Crescent';
  else if (cycleDay < 9.228) phase = 'First Quarter';
  else if (cycleDay < 12.919) phase = 'Waxing Gibbous';
  else if (cycleDay < 16.610) phase = 'Full Moon';
  else if (cycleDay < 20.302) phase = 'Waning Gibbous';
  else if (cycleDay < 23.993) phase = 'Last Quarter';
  else if (cycleDay < 27.684) phase = 'Waning Crescent';
  else phase = 'New Moon';

  moonPhaseName.textContent = phase;
  if (moonIllumination) {
    moonIllumination.textContent = `${illum}% Illumination`;
  }
}

/* -------------------------------------------------------------------------- */
/* Navbar Scroll Effect                                                       */
/* -------------------------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.background = 'rgba(5, 7, 13, 0.92)';
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    } else {
      navbar.style.background = 'rgba(5, 7, 13, 0.75)';
      navbar.style.boxShadow = 'none';
    }
  });
}
