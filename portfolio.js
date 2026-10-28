const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Menú móvil
const nav = document.querySelector('.nav');
const menuButton = document.querySelector('.menu-button');
const navLinks = [...document.querySelectorAll('.nav-links a')];

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

menuButton.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

// Cabecera y barra de progreso
const header = document.querySelector('.site-header');
const progress = document.querySelector('.progress span');
const timeline = document.querySelector('.timeline');
const timelineFill = document.querySelector('.timeline-line span');
let ticking = false;

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.setProperty('--p', max > 0 ? scrollY / max : 0);
  header.classList.toggle('is-scrolled', scrollY > 20);

  const rect = timeline.getBoundingClientRect();
  const t = (innerHeight * .65 - rect.top) / rect.height;
  timelineFill.style.setProperty('--t', Math.min(Math.max(t, 0), 1));
  ticking = false;
}

addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
onScroll();

// Rotación de roles en el hero
const roles = ['desarrollo web', 'soporte IT', 'automatización e IA', 'Angular y Node.js'];
const rotatorWord = document.querySelector('.rotator-word');
let roleIndex = 0;

if (!reduceMotion) {
  setInterval(() => {
    rotatorWord.classList.add('is-out');
    setTimeout(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      rotatorWord.textContent = roles[roleIndex];
      rotatorWord.classList.replace('is-out', 'is-in');
      requestAnimationFrame(() => requestAnimationFrame(() => rotatorWord.classList.remove('is-in')));
    }, 380);
  }, 3200);
}

// Contadores
function countUp(element) {
  const target = Number(element.dataset.to);
  const duration = 1400;
  const start = performance.now();
  const step = now => {
    const progress = Math.min((now - start) / duration, 1);
    element.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counters = [...document.querySelectorAll('.count')];
if (!reduceMotion) {
  counters.forEach(counter => { counter.textContent = '0'; });
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      setTimeout(() => countUp(entry.target), 700);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: .6 });
  counters.forEach(counter => counterObserver.observe(counter));
}

// Revelado escalonado al hacer scroll
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(element => {
  const siblings = [...element.parentElement.children].filter(child => child.classList.contains('reveal'));
  element.style.setProperty('--d', `${Math.min(siblings.indexOf(element), 5) * .08}s`);
  revealObserver.observe(element);
});

// Pestañas de perfil
const tabs = [...document.querySelectorAll('.mode-button')];
const panels = [...document.querySelectorAll('.mode-panel')];
const indicator = document.querySelector('.mode-indicator');

function moveIndicator(tab) {
  indicator.style.setProperty('--w', `${tab.offsetWidth}px`);
  indicator.style.setProperty('--x', `${tab.offsetLeft - 5}px`);
}

function activateMode(activeTab) {
  tabs.forEach(tab => {
    const selected = tab === activeTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  panels.forEach(panel => {
    const visible = panel.id === activeTab.getAttribute('aria-controls');
    panel.hidden = !visible;
    panel.classList.toggle('is-visible', visible);
  });
  moveIndicator(activeTab);
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateMode(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    activateMode(next);
  });
});

moveIndicator(tabs[0]);
addEventListener('resize', () => moveIndicator(tabs.find(tab => tab.getAttribute('aria-selected') === 'true')));
document.fonts?.ready.then(() => moveIndicator(tabs.find(tab => tab.getAttribute('aria-selected') === 'true')));

// Enlace activo en la navegación
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-40% 0px -55% 0px' });

document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

// Efectos de puntero: foco de luz en tarjetas y botones magnéticos
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.spot').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });

  document.querySelectorAll('.magnetic').forEach(button => {
    button.addEventListener('pointermove', event => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .18;
      const y = (event.clientY - rect.top - rect.height / 2) * .3;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener('pointerleave', () => { button.style.transform = ''; });
  });

  const portrait = document.querySelector('.portrait-frame');
  document.querySelector('.hero').addEventListener('pointermove', event => {
    const x = (event.clientX / innerWidth - .5) * 10;
    const y = (event.clientY / innerHeight - .5) * 10;
    portrait.style.transform = `translate(${x}px, ${y}px)`;
  });
  portrait.style.transition = 'transform .8s cubic-bezier(.22, 1, .36, 1)';
}

// Copiar email
const toast = document.querySelector('.toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      showToast('Email copiado al portapapeles');
    } catch {
      showToast(button.dataset.copy);
    }
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();
