const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');

function resizeBg() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBg();
window.addEventListener('resize', resizeBg);

// ── 현재 씬 상태 ──
let currentScene = 'hero';
let sceneAlpha = 1;
let animT = 0;

// ── 네트워크 노드 (Hero) ──
let nodes = [];
function initNodes() {
  nodes = [];
  for (let i = 0; i < 40; i++) {
    nodes.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1
    });
  }
}
initNodes();
window.addEventListener('resize', initNodes);

function drawNetwork(alpha) {
  nodes.forEach(n => {
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > bgCanvas.width) n.vx *= -1;
    if (n.y < 0 || n.y > bgCanvas.height) n.vy *= -1;
  });
  nodes.forEach((a, i) => {
    nodes.slice(i+1).forEach(b => {
      const d = Math.hypot(a.x-b.x, a.y-b.y);
      if (d < 140) {
        bgCtx.beginPath();
        bgCtx.moveTo(a.x, a.y);
        bgCtx.lineTo(b.x, b.y);
        bgCtx.strokeStyle = `rgba(201,168,76,${alpha * (1 - d/140) * 0.25})`;
        bgCtx.lineWidth = 0.6;
        bgCtx.stroke();
      }
    });
    bgCtx.beginPath();
    bgCtx.arc(a.x, a.y, a.r, 0, Math.PI*2);
    bgCtx.fillStyle = `rgba(201,168,76,${alpha * 0.5})`;
    bgCtx.fill();
  });
}

// ── KM 커브 + MRI 윤곽 (Card 1) ──
function drawBiomedical(alpha, t) {
  const W = bgCanvas.width, H = bgCanvas.height;

  // MRI 뇌 윤곽 (오른쪽)
  bgCtx.save();
  bgCtx.translate(W * 0.72, H * 0.5);
  bgCtx.scale(1, 1.25);
  for (let ring = 1; ring <= 4; ring++) {
    bgCtx.beginPath();
    bgCtx.ellipse(0, 0, 80 * ring * 0.38, 70 * ring * 0.38, 0, 0, Math.PI*2);
    bgCtx.strokeStyle = `rgba(201,168,76,${alpha * 0.08})`;
    bgCtx.lineWidth = 0.8;
    bgCtx.stroke();
  }
  // 뇌 주름 느낌
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const r1 = 55 + Math.sin(angle * 3) * 15;
    const r2 = 75 + Math.cos(angle * 2) * 12;
    bgCtx.beginPath();
    bgCtx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
    bgCtx.quadraticCurveTo(
      Math.cos(angle + 0.3) * (r1 + r2) / 2,
      Math.sin(angle + 0.3) * (r1 + r2) / 2,
      Math.cos(angle + 0.6) * r2,
      Math.sin(angle + 0.6) * r2
    );
    bgCtx.strokeStyle = `rgba(201,168,76,${alpha * 0.1})`;
    bgCtx.lineWidth = 0.7;
    bgCtx.stroke();
  }
  bgCtx.restore();

  // KM 커브 (왼쪽)
  const ox = W * 0.08, oy = H * 0.75, cw = W * 0.38, ch = H * 0.45;

  // 축
  bgCtx.beginPath();
  bgCtx.moveTo(ox, oy - ch);
  bgCtx.lineTo(ox, oy);
  bgCtx.lineTo(ox + cw, oy);
  bgCtx.strokeStyle = `rgba(201,168,76,${alpha * 0.2})`;
  bgCtx.lineWidth = 0.8;
  bgCtx.stroke();

  // KM 커브 1
  const steps1 = [0, 0.05, 0.12, 0.18, 0.28, 0.38, 0.48, 0.55, 0.62, 0.68, 0.73, 0.77, 0.80];
  bgCtx.beginPath();
  steps1.forEach((s, i) => {
    const x = ox + (i / (steps1.length-1)) * cw;
    const y = oy - (1 - s) * ch;
    i === 0 ? bgCtx.moveTo(x, y) : bgCtx.lineTo(x, y);
    if (i < steps1.length - 1) {
      bgCtx.lineTo(ox + ((i+1) / (steps1.length-1)) * cw, y);
    }
  });
  bgCtx.strokeStyle = `rgba(201,168,76,${alpha * 0.5})`;
  bgCtx.lineWidth = 1.5;
  bgCtx.stroke();

  // KM 커브 2 (점선)
  const steps2 = [0, 0.08, 0.18, 0.28, 0.42, 0.54, 0.63, 0.70, 0.76, 0.81, 0.85, 0.88, 0.90];
  bgCtx.setLineDash([4, 3]);
  bgCtx.beginPath();
  steps2.forEach((s, i) => {
    const x = ox + (i / (steps2.length-1)) * cw;
    const y = oy - (1 - s) * ch;
    i === 0 ? bgCtx.moveTo(x, y) : bgCtx.lineTo(x, y);
    if (i < steps2.length - 1) {
      bgCtx.lineTo(ox + ((i+1) / (steps2.length-1)) * cw, y);
    }
  });
  bgCtx.strokeStyle = `rgba(201,168,76,${alpha * 0.3})`;
  bgCtx.lineWidth = 1;
  bgCtx.stroke();
  bgCtx.setLineDash([]);

  // 신뢰구간 밴드
  bgCtx.beginPath();
  steps1.forEach((s, i) => {
    const x = ox + (i / (steps1.length-1)) * cw;
    const y = oy - (1 - s + 0.06) * ch;
    i === 0 ? bgCtx.moveTo(x, y) : bgCtx.lineTo(x, y);
  });
  steps1.slice().reverse().forEach((s, i) => {
    const idx = steps1.length - 1 - i;
    const x = ox + (idx / (steps1.length-1)) * cw;
    const y = oy - (1 - s - 0.06) * ch;
    bgCtx.lineTo(x, y);
  });
  bgCtx.fillStyle = `rgba(201,168,76,${alpha * 0.06})`;
  bgCtx.fill();
}

// ── 밀도 곡선 (Card 2) ──
function drawDensity(alpha, t) {
  const W = bgCanvas.width, H = bgCanvas.height;
  const curves = [
    { mu: 0.3, sigma: 0.08, color: `rgba(201,168,76,` },
    { mu: 0.45, sigma: 0.12, color: `rgba(232,201,122,` },
    { mu: 0.6, sigma: 0.07, color: `rgba(180,140,60,` },
    { mu: 0.5, sigma: 0.18, color: `rgba(201,168,76,` },
    { mu: 0.35, sigma: 0.05, color: `rgba(240,210,130,` },
  ];

  // 축
  const oy = H * 0.78;
  bgCtx.beginPath();
  bgCtx.moveTo(W * 0.05, oy);
  bgCtx.lineTo(W * 0.95, oy);
  bgCtx.strokeStyle = `rgba(201,168,76,${alpha * 0.15})`;
  bgCtx.lineWidth = 0.8;
  bgCtx.stroke();

  curves.forEach((c, ci) => {
    const shift = Math.sin(t * 0.0008 + ci * 1.2) * 0.015;
    bgCtx.beginPath();
    for (let xi = 0; xi <= 200; xi++) {
      const xn = xi / 200;
      const x = W * 0.05 + xn * W * 0.9;
      const gauss = Math.exp(-0.5 * Math.pow((xn - c.mu - shift) / c.sigma, 2)) / (c.sigma * Math.sqrt(2 * Math.PI));
      const maxG = 1 / (c.sigma * Math.sqrt(2 * Math.PI));
      const y = oy - (gauss / maxG) * H * 0.45;
      xi === 0 ? bgCtx.moveTo(x, y) : bgCtx.lineTo(x, y);
    }
    bgCtx.strokeStyle = `${c.color}${alpha * (0.25 + ci * 0.06)})`;
    bgCtx.lineWidth = 1.2;
    bgCtx.stroke();

    // 곡선 아래 채우기
    bgCtx.lineTo(W * 0.95, oy);
    bgCtx.lineTo(W * 0.05, oy);
    bgCtx.fillStyle = `${c.color}${alpha * 0.04})`;
    bgCtx.fill();
  });
}

// ── 산점도 + 회귀선 (Card 3) ──
let scatterPoints = [];
function initScatter() {
  scatterPoints = [];
  const W = bgCanvas.width, H = bgCanvas.height;
  const slope = 0.45, intercept = 0.25;
  for (let i = 0; i < 80; i++) {
    const xn = Math.random() * 0.8 + 0.1;
    const yn = slope * xn + intercept + (Math.random() - 0.5) * 0.18;
    scatterPoints.push({
      x: W * 0.08 + xn * W * 0.84,
      y: H * 0.85 - yn * H * 0.7,
      r: Math.random() * 2 + 1.5,
      group: Math.random() > 0.5 ? 0 : 1
    });
  }
}
initScatter();
window.addEventListener('resize', initScatter);

function drawScatter(alpha, t) {
  const W = bgCanvas.width, H = bgCanvas.height;
  const ox = W * 0.08, oy = H * 0.85;
  const cw = W * 0.84, ch = H * 0.7;

  // 축
  bgCtx.beginPath();
  bgCtx.moveTo(ox, oy - ch);
  bgCtx.lineTo(ox, oy);
  bgCtx.lineTo(ox + cw, oy);
  bgCtx.strokeStyle = `rgba(201,168,76,${alpha * 0.18})`;
  bgCtx.lineWidth = 0.8;
  bgCtx.stroke();

  // 그리드
  for (let i = 1; i <= 4; i++) {
    bgCtx.beginPath();
    bgCtx.moveTo(ox, oy - (i/4) * ch);
    bgCtx.lineTo(ox + cw, oy - (i/4) * ch);
    bgCtx.strokeStyle = `rgba(201,168,76,${alpha * 0.06})`;
    bgCtx.lineWidth = 0.5;
    bgCtx.stroke();

    bgCtx.beginPath();
    bgCtx.moveTo(ox + (i/4) * cw, oy);
    bgCtx.lineTo(ox + (i/4) * cw, oy - ch);
    bgCtx.stroke();
  }

  // 회귀선
  const slope = 0.45, intercept = 0.25;
  bgCtx.beginPath();
  bgCtx.moveTo(ox, oy - intercept * ch);
  bgCtx.lineTo(ox + cw, oy - (slope * 0.8 + intercept) * ch);
  bgCtx.strokeStyle = `rgba(232,201,122,${alpha * 0.5})`;
  bgCtx.lineWidth = 1.5;
  bgCtx.stroke();

  // 신뢰구간
  bgCtx.beginPath();
  bgCtx.moveTo(ox, oy - (intercept + 0.06) * ch);
  bgCtx.lineTo(ox + cw, oy - (slope * 0.8 + intercept + 0.04) * ch);
  bgCtx.lineTo(ox + cw, oy - (slope * 0.8 + intercept - 0.04) * ch);
  bgCtx.lineTo(ox, oy - (intercept - 0.06) * ch);
  bgCtx.fillStyle = `rgba(201,168,76,${alpha * 0.07})`;
  bgCtx.fill();

  // 산점도 포인트
  scatterPoints.forEach(p => {
    bgCtx.beginPath();
    bgCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    bgCtx.fillStyle = p.group === 0
      ? `rgba(201,168,76,${alpha * 0.45})`
      : `rgba(232,201,122,${alpha * 0.35})`;
    bgCtx.fill();
  });
}

// ── 그리드 (나머지 섹션) ──
function drawGrid(alpha) {
  const W = bgCanvas.width, H = bgCanvas.height;
  const gap = 60;
  for (let x = 0; x < W; x += gap) {
    bgCtx.beginPath();
    bgCtx.moveTo(x, 0); bgCtx.lineTo(x, H);
    bgCtx.strokeStyle = `rgba(201,168,76,${alpha * 0.04})`;
    bgCtx.lineWidth = 0.5;
    bgCtx.stroke();
  }
  for (let y = 0; y < H; y += gap) {
    bgCtx.beginPath();
    bgCtx.moveTo(0, y); bgCtx.lineTo(W, y);
    bgCtx.strokeStyle = `rgba(201,168,76,${alpha * 0.04})`;
    bgCtx.lineWidth = 0.5;
    bgCtx.stroke();
  }
}

// ── 씬 감지 ──
function detectScene() {
  const scrollY = window.scrollY;
  const winH = window.innerHeight;
  const sections = ['hero', 'research', 'people', 'publications', 'news', 'teaching', 'join', 'resources'];

  for (const id of sections) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.top <= winH * 0.5 && rect.bottom >= winH * 0.5) {
      // 리서치 카드 감지
      if (id === 'research') {
        const cards = document.querySelectorAll('.research-card');
        cards.forEach((card, i) => {
          if (card.classList.contains('active')) currentScene = `research-${i}`;
        });
        return;
      }
      currentScene = id;
      return;
    }
  }
}

// ── 메인 루프 ──
function drawBg() {
  animT++;
  detectScene();
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  const a = 1;
  if (currentScene === 'hero') {
    drawNetwork(a);
  } else if (currentScene === 'research-0') {
    drawGrid(a);
    drawBiomedical(a, animT);
  } else if (currentScene === 'research-1') {
    drawGrid(a);
    drawDensity(a, animT);
  } else if (currentScene === 'research-2') {
    drawGrid(a);
    drawScatter(a, animT);
  } else {
    drawGrid(a);
  }

  requestAnimationFrame(drawBg);
}

window.addEventListener('scroll', detectScene, { passive: true });
requestAnimationFrame(drawBg);
