// NAV
const nav = document.getElementById('nav');
const sceneEls = document.querySelectorAll('.scene[data-nav]');
function updateNav() {
  nav.classList.toggle('scrolled', scrollY > 60);
  let theme = 'light';
  sceneEls.forEach(s => { const r = s.getBoundingClientRect(); if (r.top <= window.innerHeight * 0.4) theme = s.dataset.nav; });
  nav.classList.remove('dark-nav','terra-nav');
  if (theme === 'dark') nav.classList.add('dark-nav');
  if (theme === 'terra') nav.classList.add('terra-nav');
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add('visible'); }, { threshold: 0.1 }).observe(el);
});

function dpr(canvas) {
  const d = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * d;
  canvas.height = canvas.offsetHeight * d;
  const ctx = canvas.getContext('2d');
  ctx.scale(d, d);
  return { ctx, W: canvas.offsetWidth, H: canvas.offsetHeight };
}

// ═══════════════════════════════════════════
// HERO ANIMATION
// ═══════════════════════════════════════════
const heroCanvas = document.getElementById('canvas-hero');
let heroCtx, heroW, heroH;

// Network state
const NET_NODES = 12;
let netNodes = [];
let netEdges = [];
let netTargetEdges = [];
let netT = 0;
let nextEdgeUpdate = 0;

// Brain SLF state
let slfFlicker = 0;
let slfPhase = 0;

// Bubble chart state
let bubbles = [];
let bubbleT = 0;

function initHero() {
  const d = window.devicePixelRatio || 1;
  heroCanvas.width = heroCanvas.offsetWidth * d;
  heroCanvas.height = heroCanvas.offsetHeight * d;
  heroCtx = heroCanvas.getContext('2d');
  heroCtx.scale(d, d);
  heroW = heroCanvas.offsetWidth;
  heroH = heroCanvas.offsetHeight;

  // Init network nodes — left third
  netNodes = [];
  for (let i = 0; i < NET_NODES; i++) {
    const angle = (i / NET_NODES) * Math.PI * 2;
    const r = heroW * 0.1 * (0.5 + Math.random() * 0.5);
    netNodes.push({
      x: heroW * 0.14 + Math.cos(angle) * r,
      y: heroH * 0.5 + Math.sin(angle) * r,
      r: 2 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    });
  }
  netEdges = generateEdges();
  netTargetEdges = generateEdges();

  // Init bubbles — right third
  const groups = [
    { cx: heroW * 0.78, cy: heroH * 0.38, color: 'rgba(196,96,58,', count: 12 },
    { cx: heroW * 0.86, cy: heroH * 0.58, color: 'rgba(156,136,116,', count: 10 },
    { cx: heroW * 0.70, cy: heroH * 0.60, color: 'rgba(196,96,58,', count: 9 },
  ];
  bubbles = [];
  groups.forEach((g, gi) => {
    for (let i = 0; i < g.count; i++) {
      bubbles.push({
        x: g.cx + (Math.random() - 0.5) * heroW * 0.08,
        y: g.cy + (Math.random() - 0.5) * heroH * 0.12,
        r: 4 + Math.random() * 10,
        color: g.color,
        group: gi,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.012,
      });
    }
  });
}

function generateEdges() {
  const edges = new Set();
  const count = 8 + Math.floor(Math.random() * 8);
  while (edges.size < count) {
    const a = Math.floor(Math.random() * NET_NODES);
    const b = Math.floor(Math.random() * NET_NODES);
    if (a !== b) edges.add(`${Math.min(a,b)}-${Math.max(a,b)}`);
  }
  return Array.from(edges).map(e => e.split('-').map(Number));
}

function drawHeroFrame(t) {
  if (!heroCtx) return;
  heroCtx.clearRect(0, 0, heroW, heroH);

  // ── Blueprint grid ──
  for (let x = 0; x < heroW; x += 48) {
    heroCtx.beginPath(); heroCtx.moveTo(x, 0); heroCtx.lineTo(x, heroH);
    heroCtx.strokeStyle = 'rgba(156,136,116,0.06)'; heroCtx.lineWidth = 0.4; heroCtx.stroke();
  }
  for (let y = 0; y < heroH; y += 48) {
    heroCtx.beginPath(); heroCtx.moveTo(0, y); heroCtx.lineTo(heroW, y);
    heroCtx.strokeStyle = 'rgba(156,136,116,0.06)'; heroCtx.lineWidth = 0.4; heroCtx.stroke();
  }

  // ── Slab layers ──
  const layers = [
    { y: heroH * 0.25, thick: 16 },
    { y: heroH * 0.52, thick: 13 },
    { y: heroH * 0.76, thick: 10 },
  ];
  layers.forEach((layer, li) => {
    heroCtx.fillStyle = `rgba(196,96,58,${0.03 + li * 0.01})`;
    heroCtx.fillRect(heroW * 0.04, layer.y - layer.thick/2, heroW * 0.92, layer.thick);
    heroCtx.beginPath(); heroCtx.moveTo(heroW*0.04, layer.y - layer.thick/2); heroCtx.lineTo(heroW*0.96, layer.y - layer.thick/2);
    heroCtx.strokeStyle = `rgba(196,96,58,${0.18 + li*0.04})`; heroCtx.lineWidth = 1; heroCtx.stroke();
    for (let x = heroW*0.07; x < heroW*0.93; x += heroW*0.055) {
      heroCtx.beginPath(); heroCtx.arc(x, layer.y, 2, 0, Math.PI*2);
      heroCtx.fillStyle = `rgba(196,96,58,0.2)`; heroCtx.fill();
    }
  });

  // ── LEFT: Animated Network ──
  netT++;
  // Move nodes
  netNodes.forEach(n => {
    n.x += n.vx; n.y += n.vy;
    const cx = heroW * 0.14, cy = heroH * 0.5, maxR = heroW * 0.13;
    const dx = n.x - cx, dy = n.y - cy;
    if (Math.hypot(dx, dy) > maxR) { n.vx *= -1; n.vy *= -1; }
  });

  // Update edges periodically
  if (netT > nextEdgeUpdate) {
    netEdges = netTargetEdges;
    netTargetEdges = generateEdges();
    nextEdgeUpdate = netT + 90 + Math.random() * 60;
  }

  // Draw edges
  netEdges.forEach(([a, b]) => {
    heroCtx.beginPath();
    heroCtx.moveTo(netNodes[a].x, netNodes[a].y);
    heroCtx.lineTo(netNodes[b].x, netNodes[b].y);
    heroCtx.strokeStyle = 'rgba(196,96,58,0.2)';
    heroCtx.lineWidth = 0.8; heroCtx.stroke();
  });
  // Draw nodes
  netNodes.forEach(n => {
    heroCtx.beginPath(); heroCtx.arc(n.x, n.y, n.r, 0, Math.PI*2);
    heroCtx.fillStyle = 'rgba(196,96,58,0.45)'; heroCtx.fill();
  });
  // "Developing" pulse on newest edges
  netTargetEdges.slice(0, 3).forEach(([a, b]) => {
    const progress = Math.min(1, (netT - (nextEdgeUpdate - 90)) / 60);
    heroCtx.beginPath();
    heroCtx.moveTo(netNodes[a].x, netNodes[a].y);
    const ex = netNodes[a].x + (netNodes[b].x - netNodes[a].x) * progress;
    const ey = netNodes[a].y + (netNodes[b].y - netNodes[a].y) * progress;
    heroCtx.lineTo(ex, ey);
    heroCtx.strokeStyle = 'rgba(196,96,58,0.6)';
    heroCtx.lineWidth = 1.5; heroCtx.stroke();
  });

  // ── CENTER: Full Brain DTI Tractography (terra tone) ──
  slfPhase += 0.018;
  const brainCX = heroW * 0.5, brainCY = heroH * 0.47;
  const brainRX = heroW * 0.08, brainRY = heroH * 0.11;

  // Dark brain bg
  heroCtx.beginPath();
  heroCtx.ellipse(brainCX, brainCY, brainRX, brainRY, 0, 0, Math.PI*2);
  heroCtx.fillStyle = 'rgba(30,24,20,0.35)';
  heroCtx.fill();

  // Brain outline
  heroCtx.beginPath();
  heroCtx.ellipse(brainCX, brainCY, brainRX, brainRY, 0, 0, Math.PI*2);
  heroCtx.strokeStyle = 'rgba(196,96,58,0.3)';
  heroCtx.lineWidth = 1; heroCtx.stroke();

  // CC — horizontal fibers (warm terra)
  const ccFlick = 0.4 + 0.4 * Math.abs(Math.sin(slfPhase * 0.9));
  for (let i = -4; i <= 4; i++) {
    const yOff = i * brainRY * 0.12;
    const flick = ccFlick * (0.5 + 0.5 * Math.abs(Math.sin(slfPhase * 1.1 + i * 0.5)));
    heroCtx.beginPath();
    heroCtx.moveTo(brainCX - brainRX*0.82, brainCY + yOff*0.3);
    heroCtx.bezierCurveTo(
      brainCX - brainRX*0.25, brainCY + yOff - brainRY*0.22,
      brainCX + brainRX*0.25, brainCY + yOff - brainRY*0.22,
      brainCX + brainRX*0.82, brainCY + yOff*0.3
    );
    heroCtx.strokeStyle = `rgba(196,96,58,${flick * 0.6})`;
    heroCtx.lineWidth = 0.7; heroCtx.stroke();
  }

  // CST — vertical fibers (warm muted)
  const cstFlick = 0.4 + 0.4 * Math.abs(Math.sin(slfPhase * 1.1 + 1.0));
  for (let i = -2; i <= 2; i++) {
    const xOff = i * brainRX * 0.08;
    const flick = cstFlick * (0.5 + 0.5 * Math.abs(Math.sin(slfPhase * 0.8 + i * 0.7)));
    [-0.28, 0.28].forEach(side => {
      heroCtx.beginPath();
      heroCtx.moveTo(brainCX + side*brainRX + xOff*0.5, brainCY - brainRY*0.88);
      heroCtx.bezierCurveTo(
        brainCX + side*brainRX*1.1 + xOff, brainCY - brainRY*0.2,
        brainCX + side*brainRX*0.9 + xOff, brainCY + brainRY*0.2,
        brainCX + side*brainRX*0.8 + xOff*0.5, brainCY + brainRY*0.88
      );
      heroCtx.strokeStyle = `rgba(224,180,140,${flick * 0.45})`;
      heroCtx.lineWidth = 0.6; heroCtx.stroke();
    });
  }

  // SLF — arcing fibers (terra2 warm)
  const slfFlickH = 0.4 + 0.4 * Math.abs(Math.sin(slfPhase * 0.75 + 0.5));
  for (let i = -3; i <= 3; i++) {
    const yOff = i * brainRY * 0.09;
    const flick = slfFlickH * (0.5 + 0.5 * Math.abs(Math.sin(slfPhase * 1.2 + i * 0.6)));
    [-1, 1].forEach(side => {
      heroCtx.beginPath();
      heroCtx.moveTo(brainCX + side*brainRX*0.88, brainCY - brainRY*0.1 + yOff);
      heroCtx.bezierCurveTo(
        brainCX + side*brainRX*0.5, brainCY - brainRY*0.6 + yOff,
        brainCX + side*brainRX*0.1, brainCY - brainRY*0.6 + yOff,
        brainCX - side*brainRX*0.1, brainCY - brainRY*0.1 + yOff*0.5
      );
      heroCtx.strokeStyle = `rgba(224,122,82,${flick * 0.5})`;
      heroCtx.lineWidth = 0.65; heroCtx.stroke();
    });
  }

  // ILF — lower arcing (warm gray)
  const ilfFlick = 0.4 + 0.4 * Math.abs(Math.sin(slfPhase * 0.85 + 2.0));
  for (let i = -2; i <= 2; i++) {
    const yOff = i * brainRY * 0.1;
    const flick = ilfFlick * (0.4 + 0.4 * Math.abs(Math.sin(slfPhase + i)));
    heroCtx.beginPath();
    heroCtx.moveTo(brainCX - brainRX*0.8, brainCY + brainRY*0.3 + yOff);
    heroCtx.bezierCurveTo(
      brainCX - brainRX*0.2, brainCY + brainRY*0.55 + yOff,
      brainCX + brainRX*0.2, brainCY + brainRY*0.55 + yOff,
      brainCX + brainRX*0.8, brainCY + brainRY*0.3 + yOff
    );
    heroCtx.strokeStyle = `rgba(156,136,116,${flick * 0.5})`;
    heroCtx.lineWidth = 0.6; heroCtx.stroke();
  }

  // Tract labels
  heroCtx.font = '7px DM Mono,monospace';
  heroCtx.textAlign = 'center';
  [
    { x: brainCX, y: brainCY - brainRY*0.18, label: 'CC', a: 0.25 + 0.2*Math.abs(Math.sin(slfPhase*0.9)) },
    { x: brainCX - brainRX*0.55, y: brainCY - brainRY*0.55, label: 'SLF', a: 0.25 + 0.2*Math.abs(Math.sin(slfPhase*0.75+0.5)) },
    { x: brainCX + brainRX*0.55, y: brainCY - brainRY*0.55, label: 'SLF', a: 0.25 + 0.2*Math.abs(Math.sin(slfPhase*0.75+1.0)) },
    { x: brainCX - brainRX*0.35, y: brainCY + brainRY*0.05, label: 'CST', a: 0.2 + 0.2*Math.abs(Math.sin(slfPhase*1.1)) },
    { x: brainCX + brainRX*0.35, y: brainCY + brainRY*0.05, label: 'CST', a: 0.2 + 0.2*Math.abs(Math.sin(slfPhase*1.1+1.5)) },
  ].forEach(l => {
    heroCtx.fillStyle = `rgba(196,96,58,${l.a})`;
    heroCtx.fillText(l.label, l.x, l.y);
  });
  heroCtx.textAlign = 'left';

  // ── RIGHT: Animated Bubble Chart ──
  bubbleT += 0.016;
  bubbles.forEach(b => {
    const alpha = 0.15 + 0.45 * Math.abs(Math.sin(bubbleT * b.speed * 60 + b.phase));
    heroCtx.beginPath();
    heroCtx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    heroCtx.fillStyle = `${b.color}${alpha})`;
    heroCtx.fill();
    heroCtx.beginPath();
    heroCtx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    heroCtx.strokeStyle = `${b.color}${alpha * 0.6})`;
    heroCtx.lineWidth = 0.5; heroCtx.stroke();
  });

  requestAnimationFrame(drawHeroFrame);
}

// ═══════════════════════════════════════════
// RESEARCH 1: Animated Network
// ═══════════════════════════════════════════
let r1Ctx, r1W, r1H;
let r1Nodes = [], r1Edges = [], r1TargetEdges = [], r1T = 0, r1NextUpdate = 0;

function initR1() {
  const c = document.getElementById('canvas-r1'); if (!c) return;
  const d = window.devicePixelRatio || 1;
  c.width = c.offsetWidth * d; c.height = c.offsetHeight * d;
  r1Ctx = c.getContext('2d'); r1Ctx.scale(d, d);
  r1W = c.offsetWidth; r1H = c.offsetHeight;

  const N = 14;
  r1Nodes = [];
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2;
    const r = r1W * 0.28 * (0.4 + Math.random() * 0.6);
    r1Nodes.push({
      x: r1W*0.5 + Math.cos(angle) * r,
      y: r1H*0.46 + Math.sin(angle) * r,
      r: 3 + Math.random() * 4,
      vx: (Math.random()-0.5)*0.4,
      vy: (Math.random()-0.5)*0.4,
      main: i === 0,
    });
  }
  r1Nodes[0].x = r1W*0.5; r1Nodes[0].y = r1H*0.46; r1Nodes[0].r = 8;
  r1Edges = genR1Edges();
  r1TargetEdges = genR1Edges();
}

function genR1Edges() {
  const N = r1Nodes.length, edges = new Set();
  const count = 10 + Math.floor(Math.random() * 8);
  while (edges.size < count) {
    const a = Math.floor(Math.random() * N);
    const b = Math.floor(Math.random() * N);
    if (a !== b) edges.add(`${Math.min(a,b)}-${Math.max(a,b)}`);
  }
  return Array.from(edges).map(e => e.split('-').map(Number));
}

function drawR1Frame() {
  if (!r1Ctx) return;
  r1Ctx.clearRect(0, 0, r1W, r1H);
  r1T++;

  r1Nodes.forEach((n, i) => {
    if (i === 0) return;
    n.x += n.vx; n.y += n.vy;
    const dx = n.x - r1W*0.5, dy = n.y - r1H*0.46;
    if (Math.hypot(dx,dy) > r1W*0.42) { n.vx*=-1; n.vy*=-1; }
  });

  if (r1T > r1NextUpdate) {
    r1Edges = r1TargetEdges;
    r1TargetEdges = genR1Edges();
    r1NextUpdate = r1T + 80 + Math.random() * 50;
  }

  // Existing edges
  r1Edges.forEach(([a,b]) => {
    r1Ctx.beginPath();
    r1Ctx.moveTo(r1Nodes[a].x, r1Nodes[a].y);
    r1Ctx.lineTo(r1Nodes[b].x, r1Nodes[b].y);
    r1Ctx.strokeStyle = 'rgba(196,96,58,0.18)'; r1Ctx.lineWidth = 0.8; r1Ctx.stroke();
  });

  // Growing new edges
  const progress = Math.min(1, (r1T - Math.max(0, r1NextUpdate - 80)) / 50);
  r1TargetEdges.slice(0, 4).forEach(([a,b]) => {
    r1Ctx.beginPath();
    r1Ctx.moveTo(r1Nodes[a].x, r1Nodes[a].y);
    r1Ctx.lineTo(
      r1Nodes[a].x + (r1Nodes[b].x - r1Nodes[a].x) * progress,
      r1Nodes[a].y + (r1Nodes[b].y - r1Nodes[a].y) * progress
    );
    r1Ctx.strokeStyle = 'rgba(196,96,58,0.55)'; r1Ctx.lineWidth = 1.5; r1Ctx.stroke();
  });

  // Uncertainty glow on main node
  const grd = r1Ctx.createRadialGradient(r1W*0.5,r1H*0.46,0,r1W*0.5,r1H*0.46,r1W*0.22);
  grd.addColorStop(0,'rgba(196,96,58,0.1)'); grd.addColorStop(1,'rgba(196,96,58,0)');
  r1Ctx.beginPath(); r1Ctx.arc(r1W*0.5,r1H*0.46,r1W*0.22,0,Math.PI*2);
  r1Ctx.fillStyle=grd; r1Ctx.fill();

  // Nodes
  r1Nodes.forEach(n => {
    r1Ctx.beginPath(); r1Ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
    r1Ctx.fillStyle = n.main ? 'rgba(196,96,58,0.9)' : 'rgba(196,96,58,0.4)';
    r1Ctx.fill();
    if (n.main) {
      r1Ctx.beginPath(); r1Ctx.arc(n.x, n.y, n.r+5, 0, Math.PI*2);
      r1Ctx.strokeStyle='rgba(196,96,58,0.2)'; r1Ctx.lineWidth=1.5; r1Ctx.stroke();
    }
  });

  // CI curve at bottom
  const oy=r1H*0.9, ox2=r1W*0.08, cw2=r1W*0.84;
  r1Ctx.beginPath();
  for(let i=0;i<=100;i++){ const xn=i/100,x=ox2+xn*cw2,u=oy-(Math.exp(-3*Math.pow(xn-0.5,2))*r1H*0.06); i===0?r1Ctx.moveTo(x,u):r1Ctx.lineTo(x,u); }
  for(let i=100;i>=0;i--){ const xn=i/100,x=ox2+xn*cw2,l=oy-(Math.exp(-3*Math.pow(xn-0.5,2))*r1H*0.02); r1Ctx.lineTo(x,l); }
  r1Ctx.fillStyle='rgba(196,96,58,0.07)'; r1Ctx.fill();
  r1Ctx.beginPath();
  for(let i=0;i<=100;i++){ const xn=i/100,x=ox2+xn*cw2,y=oy-(Math.exp(-3*Math.pow(xn-0.5,2))*r1H*0.04); i===0?r1Ctx.moveTo(x,y):r1Ctx.lineTo(x,y); }
  r1Ctx.strokeStyle='rgba(196,96,58,0.45)'; r1Ctx.lineWidth=1.2; r1Ctx.stroke();

  requestAnimationFrame(drawR1Frame);
}

// ═══════════════════════════════════════════
// RESEARCH 2: DTI Tractography (full brain)
// ═══════════════════════════════════════════
let r2Ctx, r2W, r2H, r2T = 0;

function initR2() {
  const c = document.getElementById('canvas-r2'); if (!c) return;
  const d = window.devicePixelRatio || 1;
  c.width = c.offsetWidth * d; c.height = c.offsetHeight * d;
  r2Ctx = c.getContext('2d'); r2Ctx.scale(d, d);
  r2W = c.offsetWidth; r2H = c.offsetHeight;
}

function drawR2Frame() {
  if (!r2Ctx) return;
  r2Ctx.clearRect(0, 0, r2W, r2H);
  r2T++;
  const phase = r2T * 0.018;
  const cx = r2W * 0.5, cy = r2H * 0.48;
  const rx = r2W * 0.36, ry = r2H * 0.4;

  // Dark brain bg
  r2Ctx.beginPath();
  r2Ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
  r2Ctx.fillStyle = 'rgba(20,16,14,0.6)';
  r2Ctx.fill();

  // Brain outline
  r2Ctx.beginPath();
  r2Ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
  r2Ctx.strokeStyle = 'rgba(224,122,82,0.4)';
  r2Ctx.lineWidth = 1.5; r2Ctx.stroke();

  // Corpus Callosum (CC) — left-right: RED, horizontal arc
  const ccFlick = 0.5 + 0.5 * Math.abs(Math.sin(phase * 0.9));
  for (let i = -4; i <= 4; i++) {
    const yOff = i * ry * 0.045;
    const flick = ccFlick * (0.6 + 0.4 * Math.abs(Math.sin(phase * 1.1 + i * 0.5)));
    r2Ctx.beginPath();
    r2Ctx.moveTo(cx - rx*0.72, cy + yOff*0.3);
    r2Ctx.bezierCurveTo(
      cx - rx*0.2, cy + yOff - ry*0.18,
      cx + rx*0.2, cy + yOff - ry*0.18,
      cx + rx*0.72, cy + yOff*0.3
    );
    r2Ctx.strokeStyle = `rgba(220,60,60,${flick * 0.55})`;
    r2Ctx.lineWidth = 0.8; r2Ctx.stroke();
  }

  // CST — Corticospinal Tract: superior-inferior: BLUE, vertical
  const cstFlick = 0.5 + 0.5 * Math.abs(Math.sin(phase * 1.1 + 1.0));
  for (let i = -3; i <= 3; i++) {
    const xOff = i * rx * 0.06;
    const flick = cstFlick * (0.5 + 0.5 * Math.abs(Math.sin(phase * 0.8 + i * 0.7)));
    // Left CST
    r2Ctx.beginPath();
    r2Ctx.moveTo(cx - rx*0.3 + xOff, cy - ry*0.85);
    r2Ctx.bezierCurveTo(
      cx - rx*0.35 + xOff, cy - ry*0.2,
      cx - rx*0.25 + xOff, cy + ry*0.2,
      cx - rx*0.2 + xOff, cy + ry*0.82
    );
    r2Ctx.strokeStyle = `rgba(60,100,220,${flick * 0.55})`;
    r2Ctx.lineWidth = 0.8; r2Ctx.stroke();
    // Right CST
    r2Ctx.beginPath();
    r2Ctx.moveTo(cx + rx*0.3 - xOff, cy - ry*0.85);
    r2Ctx.bezierCurveTo(
      cx + rx*0.35 - xOff, cy - ry*0.2,
      cx + rx*0.25 - xOff, cy + ry*0.2,
      cx + rx*0.2 - xOff, cy + ry*0.82
    );
    r2Ctx.strokeStyle = `rgba(60,100,220,${flick * 0.55})`;
    r2Ctx.lineWidth = 0.8; r2Ctx.stroke();
  }

  // SLF — Superior Longitudinal Fasciculus: anterior-posterior: GREEN, arcing
  const slfFlick = 0.5 + 0.5 * Math.abs(Math.sin(phase * 0.75 + 0.5));
  for (let i = -4; i <= 4; i++) {
    const yOff = i * ry * 0.04;
    const flick = slfFlick * (0.5 + 0.5 * Math.abs(Math.sin(phase * 1.2 + i * 0.6)));
    // Left SLF
    r2Ctx.beginPath();
    r2Ctx.moveTo(cx - rx*0.85, cy - ry*0.1 + yOff);
    r2Ctx.bezierCurveTo(
      cx - rx*0.5, cy - ry*0.55 + yOff,
      cx - rx*0.1, cy - ry*0.55 + yOff,
      cx + rx*0.1, cy - ry*0.1 + yOff*0.5
    );
    r2Ctx.strokeStyle = `rgba(40,180,80,${flick * 0.5})`;
    r2Ctx.lineWidth = 0.7; r2Ctx.stroke();
    // Right SLF
    r2Ctx.beginPath();
    r2Ctx.moveTo(cx + rx*0.85, cy - ry*0.1 + yOff);
    r2Ctx.bezierCurveTo(
      cx + rx*0.5, cy - ry*0.55 + yOff,
      cx + rx*0.1, cy - ry*0.55 + yOff,
      cx - rx*0.1, cy - ry*0.1 + yOff*0.5
    );
    r2Ctx.strokeStyle = `rgba(40,180,80,${flick * 0.5})`;
    r2Ctx.lineWidth = 0.7; r2Ctx.stroke();
  }

  // ILF — Inferior Longitudinal Fasciculus: anterior-posterior GREEN, lower
  const ilfFlick = 0.5 + 0.5 * Math.abs(Math.sin(phase * 0.85 + 2.0));
  for (let i = -2; i <= 2; i++) {
    const yOff = i * ry * 0.05;
    const flick = ilfFlick * (0.4 + 0.4 * Math.abs(Math.sin(phase + i)));
    r2Ctx.beginPath();
    r2Ctx.moveTo(cx - rx*0.78, cy + ry*0.25 + yOff);
    r2Ctx.bezierCurveTo(
      cx - rx*0.3, cy + ry*0.45 + yOff,
      cx + rx*0.3, cy + ry*0.45 + yOff,
      cx + rx*0.78, cy + ry*0.25 + yOff
    );
    r2Ctx.strokeStyle = `rgba(60,200,100,${flick * 0.45})`;
    r2Ctx.lineWidth = 0.7; r2Ctx.stroke();
  }

  // Clip to brain shape
  r2Ctx.save();
  r2Ctx.beginPath();
  r2Ctx.ellipse(cx, cy, rx+2, ry+2, 0, 0, Math.PI*2);
  r2Ctx.clip();
  r2Ctx.restore();

  // Color legend
  const legendX = r2W * 0.06, legendY = r2H * 0.88;
  const items = [
    { color: 'rgba(220,60,60,0.8)', label: 'CC (L-R)' },
    { color: 'rgba(60,100,220,0.8)', label: 'CST (S-I)' },
    { color: 'rgba(40,180,80,0.8)',  label: 'SLF / ILF (A-P)' },
  ];
  items.forEach((item, i) => {
    r2Ctx.fillStyle = item.color;
    r2Ctx.fillRect(legendX, legendY + i*14, 8, 8);
    r2Ctx.font = '8px DM Mono,monospace';
    r2Ctx.fillStyle = 'rgba(224,122,82,0.45)';
    r2Ctx.fillText(item.label, legendX + 12, legendY + i*14 + 7);
  });

  // Tract labels (flickering)
  r2Ctx.font = '8px DM Mono,monospace';
  r2Ctx.textAlign = 'center';
  [
    { x: cx, y: cy - ry*0.25, label: 'CC', alpha: 0.3 + 0.3*Math.abs(Math.sin(phase*0.9)) },
    { x: cx - rx*0.42, y: cy - ry*0.5, label: 'SLF', alpha: 0.3 + 0.3*Math.abs(Math.sin(phase*0.75+0.5)) },
    { x: cx + rx*0.42, y: cy - ry*0.5, label: 'SLF', alpha: 0.3 + 0.3*Math.abs(Math.sin(phase*0.75+1.0)) },
    { x: cx - rx*0.32, y: cy, label: 'CST', alpha: 0.3 + 0.3*Math.abs(Math.sin(phase*1.1+1.0)) },
    { x: cx + rx*0.32, y: cy, label: 'CST', alpha: 0.3 + 0.3*Math.abs(Math.sin(phase*1.1+1.5)) },
  ].forEach(l => {
    r2Ctx.fillStyle = `rgba(245,242,238,${l.alpha})`;
    r2Ctx.fillText(l.label, l.x, l.y);
  });
  r2Ctx.textAlign = 'left';

  requestAnimationFrame(drawR2Frame);
}

// ═══════════════════════════════════════════
// RESEARCH 3: Animated Bubble Chart
// ═══════════════════════════════════════════
let r3Ctx, r3W, r3H, r3T = 0;
let r3Bubbles = [];

function initR3() {
  const c = document.getElementById('canvas-r3'); if (!c) return;
  const d = window.devicePixelRatio || 1;
  c.width = c.offsetWidth * d; c.height = c.offsetHeight * d;
  r3Ctx = c.getContext('2d'); r3Ctx.scale(d, d);
  r3W = c.offsetWidth; r3H = c.offsetHeight;

  const groups = [
    { cx: r3W*0.28, cy: r3H*0.38, color: 'rgba(196,96,58,', label: 'Group A', count: 14 },
    { cx: r3W*0.55, cy: r3H*0.55, color: 'rgba(156,136,116,', label: 'Group B', count: 12 },
    { cx: r3W*0.75, cy: r3H*0.35, color: 'rgba(196,96,58,', label: 'Group C', count: 10 },
  ];
  r3Bubbles = [];
  groups.forEach((g, gi) => {
    for (let i = 0; i < g.count; i++) {
      r3Bubbles.push({
        x: g.cx + (Math.random()-0.5) * r3W*0.18,
        y: g.cy + (Math.random()-0.5) * r3H*0.2,
        r: 5 + Math.random() * 16,
        color: g.color,
        group: gi,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
        label: g.label,
      });
    }
  });
}

function drawR3Frame() {
  if (!r3Ctx) return;
  r3Ctx.clearRect(0, 0, r3W, r3H);
  r3T++;

  const t = r3T * 0.012;

  // Axes
  const ox = r3W*0.08, oy = r3H*0.88, cw = r3W*0.84, ch = r3H*0.75;
  for(let i=1;i<=4;i++){
    r3Ctx.beginPath(); r3Ctx.moveTo(ox,oy-(i/4)*ch); r3Ctx.lineTo(ox+cw,oy-(i/4)*ch);
    r3Ctx.strokeStyle='rgba(156,136,116,0.08)'; r3Ctx.lineWidth=0.5; r3Ctx.stroke();
    r3Ctx.beginPath(); r3Ctx.moveTo(ox+(i/4)*cw,oy); r3Ctx.lineTo(ox+(i/4)*cw,oy-ch);
    r3Ctx.strokeStyle='rgba(156,136,116,0.08)'; r3Ctx.lineWidth=0.5; r3Ctx.stroke();
  }
  r3Ctx.beginPath(); r3Ctx.moveTo(ox,oy-ch); r3Ctx.lineTo(ox,oy); r3Ctx.lineTo(ox+cw,oy);
  r3Ctx.strokeStyle='rgba(156,136,116,0.2)'; r3Ctx.lineWidth=0.8; r3Ctx.stroke();

  // Regression line
  r3Ctx.beginPath(); r3Ctx.moveTo(ox,oy-0.12*ch); r3Ctx.lineTo(ox+cw,oy-0.72*ch);
  r3Ctx.strokeStyle='rgba(196,96,58,0.3)'; r3Ctx.lineWidth=1.2; r3Ctx.setLineDash([5,3]); r3Ctx.stroke();
  r3Ctx.setLineDash([]);

  // Animated bubbles
  r3Bubbles.forEach(b => {
    const alpha = 0.12 + 0.45 * Math.abs(Math.sin(t * b.speed + b.phase));
    // Bubble fill
    r3Ctx.beginPath();
    r3Ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    r3Ctx.fillStyle = `${b.color}${alpha})`;
    r3Ctx.fill();
    // Bubble stroke
    r3Ctx.beginPath();
    r3Ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    r3Ctx.strokeStyle = `${b.color}${alpha * 0.8})`;
    r3Ctx.lineWidth = 0.8; r3Ctx.stroke();
  });

  // Axis labels
  r3Ctx.font = '9px DM Mono,monospace';
  r3Ctx.fillStyle = 'rgba(156,136,116,0.5)';
  r3Ctx.fillText('Complex Survey Design (KNHANES)', ox+4, oy-ch+14);

  // Group labels (fade in/out)
  const groupCenters = [
    { x: r3W*0.28, y: r3H*0.28, label: 'Diet Group A' },
    { x: r3W*0.55, y: r3H*0.48, label: 'Diet Group B' },
    { x: r3W*0.75, y: r3H*0.26, label: 'Diet Group C' },
  ];
  groupCenters.forEach((g, i) => {
    const alpha = 0.2 + 0.3 * Math.abs(Math.sin(t * 0.4 + i * 1.5));
    r3Ctx.fillStyle = `rgba(196,96,58,${alpha})`;
    r3Ctx.font = '8px DM Mono,monospace';
    r3Ctx.fillText(g.label, g.x, g.y);
  });

  requestAnimationFrame(drawR3Frame);
}

// ── BG CANVASES ──
function drawDarkBg(id, alpha=0.07) {
  const c = document.getElementById(id); if(!c) return;
  const {ctx,W,H} = dpr(c); ctx.clearRect(0,0,W,H);
  [0.2,0.35,0.5,0.65,0.8].forEach((p,i)=>{ ctx.beginPath(); ctx.moveTo(0,H*p); ctx.lineTo(W,H*p); ctx.strokeStyle=`rgba(224,122,82,${alpha*(i%2===0?1:0.5)})`; ctx.lineWidth=i%2===0?1:0.5; ctx.stroke(); });
  for(let x=0;x<W;x+=80){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.strokeStyle=`rgba(245,242,238,${alpha*0.4})`; ctx.lineWidth=0.4; ctx.stroke(); }
}
function drawLightBg(id) {
  const c = document.getElementById(id); if(!c) return;
  const {ctx,W,H} = dpr(c); ctx.clearRect(0,0,W,H);
  for(let x=0;x<W;x+=64){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.strokeStyle='rgba(156,136,116,0.06)'; ctx.lineWidth=0.4; ctx.stroke(); }
  for(let y=0;y<H;y+=64){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.strokeStyle='rgba(156,136,116,0.06)'; ctx.lineWidth=0.4; ctx.stroke(); }
  [0.25,0.5,0.75].forEach(p=>{ ctx.beginPath(); ctx.moveTo(0,H*p); ctx.lineTo(W,H*p); ctx.strokeStyle='rgba(196,96,58,0.05)'; ctx.lineWidth=1; ctx.stroke(); });
}
function drawTerraBg(id) {
  const c = document.getElementById(id); if(!c) return;
  const {ctx,W,H} = dpr(c); ctx.clearRect(0,0,W,H);
  [0.15,0.3,0.5,0.7,0.85].forEach((p,i)=>{ ctx.beginPath(); ctx.moveTo(0,H*p); ctx.lineTo(W,H*p); ctx.strokeStyle=`rgba(245,242,238,${i%2===0?0.1:0.05})`; ctx.lineWidth=i%2===0?1:0.5; ctx.stroke(); });
  for(let x=0;x<W;x+=80){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.strokeStyle='rgba(245,242,238,0.04)'; ctx.lineWidth=0.4; ctx.stroke(); }
}

window.addEventListener('load', () => {
  initHero(); requestAnimationFrame(drawHeroFrame);
  drawDarkBg('bg-intro');
  drawLightBg('bg-r1'); drawDarkBg('bg-r2'); drawLightBg('bg-r3');
  drawDarkBg('bg-people'); drawLightBg('bg-pub');
  drawDarkBg('bg-news'); drawLightBg('bg-teaching');
  drawTerraBg('bg-join'); drawDarkBg('bg-resources');
  initR1(); requestAnimationFrame(drawR1Frame);
  initR2(); requestAnimationFrame(drawR2Frame);
  initR3(); requestAnimationFrame(drawR3Frame);
});

window.addEventListener('resize', () => {
  initHero();
  drawDarkBg('bg-intro');
  drawLightBg('bg-r1'); drawDarkBg('bg-r2'); drawLightBg('bg-r3');
  drawDarkBg('bg-people'); drawLightBg('bg-pub');
  drawDarkBg('bg-news'); drawLightBg('bg-teaching');
  drawTerraBg('bg-join'); drawDarkBg('bg-resources');
  initR1(); initR2(); initR3();
});
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
