// ── STARS ──
const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');
let stars = [];

function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
resize(); window.addEventListener('resize', resize);

function initStars() {
  stars = [];
  for (let i = 0; i < 200; i++) stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.2 + 0.2,
    speed: Math.random() * 0.004 + 0.001,
    offset: Math.random() * Math.PI * 2
  });
}
initStars();

function drawStars(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => {
    const a = 0.15 + 0.65 * Math.abs(Math.sin(t * s.speed + s.offset));
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(201,168,76,${a})`; ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
requestAnimationFrame(drawStars);

// ── NAV ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 60));

// ── REVEAL ──
document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) el.classList.add('visible');
  }, { threshold: 0.12 }).observe(el);
});

// ── STICKY RESEARCH ──
const stickyContainer = document.getElementById('sticky-container');
const cards = document.querySelectorAll('.research-card');
const dots = document.querySelectorAll('.dot');
const progressDots = document.getElementById('progress-dots');
const totalCards = cards.length;
let currentCard = -1;

function updateCards() {
  if (!stickyContainer) return;
  const rect = stickyContainer.getBoundingClientRect();
  const scrolled = -rect.top;
  const scrollRange = stickyContainer.offsetHeight - innerHeight;
  if (scrolled < 0 || scrolled > scrollRange) {
    progressDots.classList.remove('visible');
    if (scrolled < 0) { cards.forEach(c => c.classList.remove('active','exit')); currentCard = -1; }
    return;
  }
  progressDots.classList.add('visible');
  const index = Math.round((scrolled / scrollRange) * (totalCards - 1));
  if (index !== currentCard) {
    const prev = currentCard; currentCard = index;
    cards.forEach((c, i) => {
      c.classList.remove('active','exit');
      if (i === index) c.classList.add('active');
      else if (i === prev && i < index) {
        c.classList.add('exit');
        setTimeout(() => c.classList.remove('exit'), 700);
      }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }
}
window.addEventListener('scroll', updateCards, { passive: true });
updateCards();

// ── PEOPLE TABS ──
document.querySelectorAll('.people-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.people-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.people-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

// ── PUB TABS ──
document.querySelectorAll('.pub-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.pub-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.pub-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});
