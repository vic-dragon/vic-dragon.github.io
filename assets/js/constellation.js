// ── CONSTELLATION BACKGROUND ──
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');

function resizeBg() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = document.body.scrollHeight;
}

// 별자리 정의 (세 개 - 각 연구 주제)
const constellations = [
  // Biomedical Imaging - 오리온자리 느낌
  {
    stars: [
      { x: 0.15, y: 0.08 }, { x: 0.25, y: 0.06 }, { x: 0.35, y: 0.09 },
      { x: 0.20, y: 0.13 }, { x: 0.30, y: 0.13 }, { x: 0.22, y: 0.18 },
      { x: 0.28, y: 0.18 }, { x: 0.18, y: 0.23 }, { x: 0.32, y: 0.23 }
    ],
    edges: [[0,1],[1,2],[0,3],[2,4],[3,4],[3,5],[4,6],[5,6],[5,7],[6,8]]
  },
  // Statistical Methodology - 북두칠성 느낌
  {
    stars: [
      { x: 0.60, y: 0.05 }, { x: 0.70, y: 0.06 }, { x: 0.78, y: 0.08 },
      { x: 0.85, y: 0.07 }, { x: 0.82, y: 0.13 }, { x: 0.75, y: 0.15 },
      { x: 0.65, y: 0.13 }
    ],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]]
  },
  // Population Health - 남십자성 느낌
  {
    stars: [
      { x: 0.45, y: 0.04 }, { x: 0.45, y: 0.14 },
      { x: 0.38, y: 0.09 }, { x: 0.52, y: 0.09 },
      { x: 0.42, y: 0.12 }, { x: 0.48, y: 0.12 }
    ],
    edges: [[0,1],[2,3],[4,5],[0,4],[0,5],[1,4],[1,5]]
  }
];

// 배경 별들 (작고 은은하게)
let bgStars = [];

function initBgStars() {
  bgStars = [];
  const count = Math.floor((bgCanvas.width * bgCanvas.height) / 8000);
  for (let i = 0; i < count; i++) {
    bgStars.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      r: Math.random() * 0.8 + 0.2,
      a: Math.random() * 0.4 + 0.1,
      speed: Math.random() * 0.002 + 0.0005,
      offset: Math.random() * Math.PI * 2
    });
  }
}

function drawBg(t) {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  const scrollY = window.scrollY;
  const pageH = bgCanvas.height;
  const winH = window.innerHeight;

  // 배경 별들
  bgStars.forEach(s => {
    const a = s.a * (0.5 + 0.5 * Math.abs(Math.sin(t * s.speed + s.offset)));
    bgCtx.beginPath();
    bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(201,168,76,${a})`;
    bgCtx.fill();
  });

  // 별자리들 - 스크롤 위치에 따라 opacity 변화
  const scrollProgress = scrollY / (pageH - winH);

  constellations.forEach((c, ci) => {
    // 각 별자리가 다른 섹션에서 활성화
    let alpha;
    if (ci === 0) alpha = scrollProgress < 0.5 ? 0.6 : 0.15;
    else if (ci === 1) alpha = scrollProgress > 0.2 && scrollProgress < 0.7 ? 0.6 : 0.15;
    else alpha = scrollProgress > 0.5 ? 0.6 : 0.15;

    // 별자리 선
    c.edges.forEach(([a, b]) => {
      const sx = c.stars[a].x * bgCanvas.width;
      const sy = c.stars[a].y * pageH;
      const ex = c.stars[b].x * bgCanvas.width;
      const ey = c.stars[b].y * pageH;
      bgCtx.beginPath();
      bgCtx.moveTo(sx, sy);
      bgCtx.lineTo(ex, ey);
      bgCtx.strokeStyle = `rgba(201,168,76,${alpha * 0.3})`;
      bgCtx.lineWidth = 0.5;
      bgCtx.stroke();
    });

    // 별자리 별
    c.stars.forEach(s => {
      const x = s.x * bgCanvas.width;
      const y = s.y * pageH;
      const pulse = 0.7 + 0.3 * Math.abs(Math.sin(t * 0.001 + ci));

      bgCtx.beginPath();
      bgCtx.arc(x, y, 2 * pulse, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(232,201,122,${alpha * pulse})`;
      bgCtx.fill();

      // 별 빛 번짐
      const grd = bgCtx.createRadialGradient(x, y, 0, x, y, 8);
      grd.addColorStop(0, `rgba(201,168,76,${alpha * 0.4})`);
      grd.addColorStop(1, 'rgba(201,168,76,0)');
      bgCtx.beginPath();
      bgCtx.arc(x, y, 8, 0, Math.PI * 2);
      bgCtx.fillStyle = grd;
      bgCtx.fill();
    });
  });

  requestAnimationFrame(drawBg);
}

// 초기화
window.addEventListener('load', () => {
  resizeBg();
  initBgStars();
  requestAnimationFrame(drawBg);
});

window.addEventListener('resize', () => {
  resizeBg();
  initBgStars();
});
