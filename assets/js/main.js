// NAV
const nav = document.getElementById('nav');
const sceneEls = document.querySelectorAll('.scene[data-nav]');
function updateNav() {
  nav.classList.toggle('scrolled', scrollY > 60);
  let theme = 'light';
  sceneEls.forEach(s => { const r = s.getBoundingClientRect(); if (r.top <= innerHeight * 0.4) theme = s.dataset.nav; });
  nav.classList.remove('dark-nav','terra-nav');
  if (theme === 'dark') nav.classList.add('dark-nav');
  if (theme === 'terra') nav.classList.add('terra-nav');
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// REVEAL
document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add('visible'); }, { threshold: 0.1 }).observe(el);
});

function dpr(c) {
  const d = devicePixelRatio || 1;
  c.width = c.offsetWidth * d; c.height = c.offsetHeight * d;
  const ctx = c.getContext('2d'); ctx.scale(d, d);
  return { ctx, W: c.offsetWidth, H: c.offsetHeight };
}

// ══════════════════════════════
// HERO: SLAB BUILDING ANIMATION
// ══════════════════════════════
const heroCanvas = document.getElementById('canvas-hero');
let hCtx, hW, hH, hT = 0;

const LAYERS = [
  { label: 'Foundation', yR: 0.72, thick: 18, delay: 80 },
  { label: 'Floor',      yR: 0.52, thick: 14, delay: 150 },
  { label: 'Framework',  yR: 0.32, thick: 10, delay: 220 },
];

function easeOutExpo(x) { return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); }
function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

function getP(layer, t) {
  return Math.min(1, Math.max(0, (t - layer.delay) / 55));
}

function initHero() {
  const d = devicePixelRatio || 1;
  heroCanvas.width = heroCanvas.offsetWidth * d;
  heroCanvas.height = heroCanvas.offsetHeight * d;
  hCtx = heroCanvas.getContext('2d');
  hCtx.scale(d, d);
  hW = heroCanvas.offsetWidth;
  hH = heroCanvas.offsetHeight;
}

function drawHero() {
  if (!hCtx) return;
  hCtx.clearRect(0, 0, hW, hH);
  hT++;

  // Grid
  hCtx.strokeStyle = 'rgba(156,136,116,0.055)';
  hCtx.lineWidth = 0.4;
  for (let x = 0; x < hW; x += 60) { hCtx.beginPath(); hCtx.moveTo(x,0); hCtx.lineTo(x,hH); hCtx.stroke(); }
  for (let y = 0; y < hH; y += 60) { hCtx.beginPath(); hCtx.moveTo(0,y); hCtx.lineTo(hW,y); hCtx.stroke(); }

  // Dimension line (left)
  const p0 = easeOutExpo(getP(LAYERS[0], hT));
  const p2 = easeOutExpo(getP(LAYERS[2], hT));
  if (p0 > 0) {
    const y1 = hH * LAYERS[0].yR;
    const y2 = hH * LAYERS[2].yR;
    const visY2 = y1 + (y2 - y1) * p2;
    hCtx.setLineDash([4,3]);
    hCtx.beginPath(); hCtx.moveTo(hW*0.035, y1); hCtx.lineTo(hW*0.035, visY2);
    hCtx.strokeStyle = `rgba(196,96,58,${0.18 * p0})`; hCtx.lineWidth = 0.7; hCtx.stroke();
    hCtx.setLineDash([]);
  }

  LAYERS.forEach((layer, li) => {
    const raw = getP(layer, hT);
    const p = easeOutExpo(raw);
    if (p <= 0) return;

    const targetY = hH * layer.yR;
    const startY = hH * (layer.yR + 0.28);
    const y = startY + (targetY - startY) * p;
    const slabX = hW * 0.05, slabW = hW * 0.9;

    // Slab fill
    hCtx.fillStyle = `rgba(196,96,58,${0.025 * p})`;
    hCtx.fillRect(slabX, y - layer.thick/2, slabW, layer.thick);

    // Top line
    hCtx.beginPath(); hCtx.moveTo(slabX, y - layer.thick/2); hCtx.lineTo(slabX + slabW, y - layer.thick/2);
    hCtx.strokeStyle = `rgba(196,96,58,${0.38 * p})`; hCtx.lineWidth = 1.2; hCtx.stroke();

    // Bottom line
    hCtx.beginPath(); hCtx.moveTo(slabX, y + layer.thick/2); hCtx.lineTo(slabX + slabW, y + layer.thick/2);
    hCtx.strokeStyle = `rgba(196,96,58,${0.1 * p})`; hCtx.lineWidth = 0.5; hCtx.stroke();

    // Rebar dots
    const rP = Math.min(1, Math.max(0, (raw - 0.5) / 0.5));
    if (rP > 0) {
      const sp = hW * 0.052;
      for (let x = slabX + sp*0.5; x < slabX + slabW; x += sp) {
        const wobble = Math.sin(hT * 0.018 + x * 0.012) * 0.12;
        hCtx.beginPath(); hCtx.arc(x, y, 2.5, 0, Math.PI*2);
        hCtx.fillStyle = `rgba(196,96,58,${(0.28 + wobble) * rP * p})`; hCtx.fill();
      }
    }

    // Label
    if (p > 0.6) {
      hCtx.font = `500 ${Math.round(9)}px Pretendard, sans-serif`;
      hCtx.fillStyle = `rgba(196,96,58,${(p-0.6)*2.5 * 0.45})`;
      hCtx.fillText(layer.label.toUpperCase(), slabX, y - layer.thick/2 - 6);
    }

    // Tick
    if (p0 > 0) {
      hCtx.beginPath(); hCtx.moveTo(hW*0.025, y); hCtx.lineTo(hW*0.045, y);
      hCtx.strokeStyle = `rgba(196,96,58,${0.22*p})`; hCtx.lineWidth=0.7; hCtx.stroke();
    }
  });

  // Complete glow
  const allDone = LAYERS.every(l => getP(l, hT) >= 1);
  if (allDone) {
    const gt = hT - (LAYERS[2].delay + 55);
    const ga = Math.min(0.05, gt * 0.0015) * (0.7 + 0.3 * Math.sin(hT * 0.014));
    LAYERS.forEach(l => {
      const y = hH * l.yR;
      const grd = hCtx.createLinearGradient(hW*0.05,0,hW*0.95,0);
      grd.addColorStop(0,'rgba(196,96,58,0)');
      grd.addColorStop(0.5,`rgba(196,96,58,${ga})`);
      grd.addColorStop(1,'rgba(196,96,58,0)');
      hCtx.fillStyle=grd;
      hCtx.fillRect(hW*0.05, y-l.thick/2, hW*0.9, l.thick);
    });
  }

  requestAnimationFrame(drawHero);
}

// ══════════════════════════════
// BG HELPERS
// ══════════════════════════════
function drawDarkBg(id, alpha=0.07) {
  const c = document.getElementById(id); if(!c) return;
  const {ctx,W,H} = dpr(c); ctx.clearRect(0,0,W,H);
  [0.2,0.35,0.5,0.65,0.8].forEach((p,i)=>{ ctx.beginPath(); ctx.moveTo(0,H*p); ctx.lineTo(W,H*p); ctx.strokeStyle=`rgba(224,122,82,${alpha*(i%2===0?1:0.5)})`; ctx.lineWidth=i%2===0?1:0.5; ctx.stroke(); });
  for(let x=0;x<W;x+=80){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.strokeStyle=`rgba(245,242,238,${alpha*0.35})`; ctx.lineWidth=0.4; ctx.stroke(); }
}
function drawLightBg(id) {
  const c = document.getElementById(id); if(!c) return;
  const {ctx,W,H} = dpr(c); ctx.clearRect(0,0,W,H);
  for(let x=0;x<W;x+=64){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.strokeStyle='rgba(156,136,116,0.055)'; ctx.lineWidth=0.4; ctx.stroke(); }
  for(let y=0;y<H;y+=64){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.strokeStyle='rgba(156,136,116,0.055)'; ctx.lineWidth=0.4; ctx.stroke(); }
  [0.25,0.5,0.75].forEach(p=>{ ctx.beginPath(); ctx.moveTo(0,H*p); ctx.lineTo(W,H*p); ctx.strokeStyle='rgba(196,96,58,0.045)'; ctx.lineWidth=1; ctx.stroke(); });
}
function drawTerraBg(id) {
  const c = document.getElementById(id); if(!c) return;
  const {ctx,W,H} = dpr(c); ctx.clearRect(0,0,W,H);
  [0.15,0.3,0.5,0.7,0.85].forEach((p,i)=>{ ctx.beginPath(); ctx.moveTo(0,H*p); ctx.lineTo(W,H*p); ctx.strokeStyle=`rgba(245,242,238,${i%2===0?0.09:0.045})`; ctx.lineWidth=i%2===0?1:0.5; ctx.stroke(); });
  for(let x=0;x<W;x+=80){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.strokeStyle='rgba(245,242,238,0.04)'; ctx.lineWidth=0.4; ctx.stroke(); }
}

// ══════════════════════════════
// R1: Animated Network
// ══════════════════════════════
let r1Ctx, r1W, r1H, r1T=0, r1Nodes=[], r1Edges=[], r1TargetEdges=[], r1Next=0;

function initR1() {
  const c = document.getElementById('canvas-r1'); if(!c) return;
  const d=devicePixelRatio||1; c.width=c.offsetWidth*d; c.height=c.offsetHeight*d;
  r1Ctx=c.getContext('2d'); r1Ctx.scale(d,d); r1W=c.offsetWidth; r1H=c.offsetHeight;
  const N=14; r1Nodes=[];
  for(let i=0;i<N;i++){
    const angle=(i/N)*Math.PI*2, r=r1W*0.28*(0.4+Math.random()*0.6);
    r1Nodes.push({x:r1W*0.5+Math.cos(angle)*r, y:r1H*0.46+Math.sin(angle)*r, r:3+Math.random()*4, vx:(Math.random()-0.5)*0.35, vy:(Math.random()-0.5)*0.35, main:i===0});
  }
  r1Nodes[0].x=r1W*0.5; r1Nodes[0].y=r1H*0.46; r1Nodes[0].r=8;
  r1Edges=genR1E(); r1TargetEdges=genR1E();
}
function genR1E(){
  const N=r1Nodes.length, s=new Set(), count=10+Math.floor(Math.random()*7);
  while(s.size<count){ const a=Math.floor(Math.random()*N), b=Math.floor(Math.random()*N); if(a!==b) s.add(`${Math.min(a,b)}-${Math.max(a,b)}`); }
  return Array.from(s).map(e=>e.split('-').map(Number));
}
function drawR1(){
  if(!r1Ctx) return; r1Ctx.clearRect(0,0,r1W,r1H); r1T++;
  r1Nodes.forEach((n,i)=>{ if(i===0) return; n.x+=n.vx; n.y+=n.vy; if(Math.hypot(n.x-r1W*0.5,n.y-r1H*0.46)>r1W*0.42){n.vx*=-1;n.vy*=-1;} });
  if(r1T>r1Next){ r1Edges=r1TargetEdges; r1TargetEdges=genR1E(); r1Next=r1T+80+Math.random()*50; }

  // Background: light grid
  r1Ctx.strokeStyle='rgba(156,136,116,0.07)'; r1Ctx.lineWidth=0.4;
  for(let x=0;x<r1W;x+=48){r1Ctx.beginPath();r1Ctx.moveTo(x,0);r1Ctx.lineTo(x,r1H);r1Ctx.stroke();}
  for(let y=0;y<r1H;y+=48){r1Ctx.beginPath();r1Ctx.moveTo(0,y);r1Ctx.lineTo(r1W,y);r1Ctx.stroke();}

  // Glow
  const grd=r1Ctx.createRadialGradient(r1W*0.5,r1H*0.46,0,r1W*0.5,r1H*0.46,r1W*0.24);
  grd.addColorStop(0,'rgba(196,96,58,0.08)'); grd.addColorStop(1,'rgba(196,96,58,0)');
  r1Ctx.beginPath(); r1Ctx.arc(r1W*0.5,r1H*0.46,r1W*0.24,0,Math.PI*2); r1Ctx.fillStyle=grd; r1Ctx.fill();

  r1Edges.forEach(([a,b])=>{ r1Ctx.beginPath(); r1Ctx.moveTo(r1Nodes[a].x,r1Nodes[a].y); r1Ctx.lineTo(r1Nodes[b].x,r1Nodes[b].y); r1Ctx.strokeStyle='rgba(196,96,58,0.15)'; r1Ctx.lineWidth=0.8; r1Ctx.stroke(); });
  const prog=Math.min(1,(r1T-Math.max(0,r1Next-80))/50);
  r1TargetEdges.slice(0,4).forEach(([a,b])=>{ r1Ctx.beginPath(); r1Ctx.moveTo(r1Nodes[a].x,r1Nodes[a].y); r1Ctx.lineTo(r1Nodes[a].x+(r1Nodes[b].x-r1Nodes[a].x)*prog, r1Nodes[a].y+(r1Nodes[b].y-r1Nodes[a].y)*prog); r1Ctx.strokeStyle='rgba(196,96,58,0.5)'; r1Ctx.lineWidth=1.4; r1Ctx.stroke(); });
  r1Nodes.forEach(n=>{ r1Ctx.beginPath(); r1Ctx.arc(n.x,n.y,n.r,0,Math.PI*2); r1Ctx.fillStyle=n.main?'rgba(196,96,58,0.85)':'rgba(196,96,58,0.38)'; r1Ctx.fill(); if(n.main){r1Ctx.beginPath();r1Ctx.arc(n.x,n.y,n.r+5,0,Math.PI*2);r1Ctx.strokeStyle='rgba(196,96,58,0.18)';r1Ctx.lineWidth=1.5;r1Ctx.stroke();} });

  // CI curve bottom
  const oy=r1H*0.9, ox2=r1W*0.07, cw2=r1W*0.86;
  r1Ctx.beginPath();
  for(let i=0;i<=100;i++){const xn=i/100,x=ox2+xn*cw2,u=oy-(Math.exp(-3*Math.pow(xn-0.5,2))*r1H*0.06);i===0?r1Ctx.moveTo(x,u):r1Ctx.lineTo(x,u);}
  for(let i=100;i>=0;i--){const xn=i/100,x=ox2+xn*cw2,l=oy-(Math.exp(-3*Math.pow(xn-0.5,2))*r1H*0.02);r1Ctx.lineTo(x,l);}
  r1Ctx.fillStyle='rgba(196,96,58,0.06)'; r1Ctx.fill();
  r1Ctx.beginPath();
  for(let i=0;i<=100;i++){const xn=i/100,x=ox2+xn*cw2,y=oy-(Math.exp(-3*Math.pow(xn-0.5,2))*r1H*0.04);i===0?r1Ctx.moveTo(x,y):r1Ctx.lineTo(x,y);}
  r1Ctx.strokeStyle='rgba(196,96,58,0.4)'; r1Ctx.lineWidth=1.2; r1Ctx.stroke();

  requestAnimationFrame(drawR1);
}

// ══════════════════════════════
// R2: DTI Tractography (dark bg)
// ══════════════════════════════
let r2Ctx, r2W, r2H, r2T=0;
function initR2(){
  const c=document.getElementById('canvas-r2'); if(!c) return;
  const d=devicePixelRatio||1; c.width=c.offsetWidth*d; c.height=c.offsetHeight*d;
  r2Ctx=c.getContext('2d'); r2Ctx.scale(d,d); r2W=c.offsetWidth; r2H=c.offsetHeight;
}
function drawR2(){
  if(!r2Ctx) return; r2Ctx.clearRect(0,0,r2W,r2H); r2T++;
  const phase=r2T*0.018;
  const cx=r2W*0.5, cy=r2H*0.48, rx=r2W*0.36, ry=r2H*0.38;

  // Dark bg
  r2Ctx.fillStyle='rgba(20,16,14,0.5)'; r2Ctx.beginPath(); r2Ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); r2Ctx.fill();
  r2Ctx.strokeStyle='rgba(224,122,82,0.3)'; r2Ctx.lineWidth=1.5; r2Ctx.stroke();
  r2Ctx.beginPath(); r2Ctx.ellipse(cx,cy,rx*0.56,ry*0.52,0,0,Math.PI*2); r2Ctx.strokeStyle='rgba(224,122,82,0.08)'; r2Ctx.lineWidth=0.7; r2Ctx.stroke();

  // CC (terra) — horizontal
  const ccF=0.4+0.4*Math.abs(Math.sin(phase*0.9));
  for(let i=-4;i<=4;i++){
    const yO=i*ry*0.11, f=ccF*(0.5+0.5*Math.abs(Math.sin(phase*1.1+i*0.5)));
    r2Ctx.beginPath(); r2Ctx.moveTo(cx-rx*0.85,cy+yO*0.28); r2Ctx.bezierCurveTo(cx-rx*0.22,cy+yO-ry*0.2,cx+rx*0.22,cy+yO-ry*0.2,cx+rx*0.85,cy+yO*0.28);
    r2Ctx.strokeStyle=`rgba(196,96,58,${f*0.55})`; r2Ctx.lineWidth=0.75; r2Ctx.stroke();
  }
  // CST (warm cream) — vertical
  const cstF=0.4+0.4*Math.abs(Math.sin(phase*1.1+1.0));
  for(let i=-2;i<=2;i++){
    const xO=i*rx*0.07, f=cstF*(0.5+0.5*Math.abs(Math.sin(phase*0.8+i*0.7)));
    [-0.3,0.3].forEach(side=>{
      r2Ctx.beginPath(); r2Ctx.moveTo(cx+side*rx+xO*0.5,cy-ry*0.88); r2Ctx.bezierCurveTo(cx+side*rx*1.1+xO,cy-ry*0.2,cx+side*rx*0.9+xO,cy+ry*0.2,cx+side*rx*0.8+xO*0.5,cy+ry*0.88);
      r2Ctx.strokeStyle=`rgba(224,180,140,${f*0.45})`; r2Ctx.lineWidth=0.65; r2Ctx.stroke();
    });
  }
  // SLF (terra2) — arcing
  const slfF=0.4+0.4*Math.abs(Math.sin(phase*0.75+0.5));
  for(let i=-3;i<=3;i++){
    const yO=i*ry*0.09, f=slfF*(0.5+0.5*Math.abs(Math.sin(phase*1.2+i*0.6)));
    [-1,1].forEach(side=>{
      r2Ctx.beginPath(); r2Ctx.moveTo(cx+side*rx*0.88,cy-ry*0.1+yO); r2Ctx.bezierCurveTo(cx+side*rx*0.5,cy-ry*0.58+yO,cx+side*rx*0.1,cy-ry*0.58+yO,cx-side*rx*0.1,cy-ry*0.1+yO*0.5);
      r2Ctx.strokeStyle=`rgba(224,122,82,${f*0.48})`; r2Ctx.lineWidth=0.65; r2Ctx.stroke();
    });
  }
  // ILF (warm gray) — lower
  const ilfF=0.4+0.4*Math.abs(Math.sin(phase*0.85+2.0));
  for(let i=-2;i<=2;i++){
    const yO=i*ry*0.1, f=ilfF*(0.4+0.4*Math.abs(Math.sin(phase+i)));
    r2Ctx.beginPath(); r2Ctx.moveTo(cx-rx*0.8,cy+ry*0.3+yO); r2Ctx.bezierCurveTo(cx-rx*0.2,cy+ry*0.52+yO,cx+rx*0.2,cy+ry*0.52+yO,cx+rx*0.8,cy+ry*0.3+yO);
    r2Ctx.strokeStyle=`rgba(156,136,116,${f*0.48})`; r2Ctx.lineWidth=0.6; r2Ctx.stroke();
  }
  // Legend
  const lx=r2W*0.06, ly=r2H*0.88;
  [{color:'rgba(196,96,58,0.75)',label:'CC'},{color:'rgba(224,180,140,0.75)',label:'CST'},{color:'rgba(224,122,82,0.75)',label:'SLF'},{color:'rgba(156,136,116,0.75)',label:'ILF'}].forEach((item,i)=>{
    r2Ctx.fillStyle=item.color; r2Ctx.fillRect(lx,ly+i*14,8,8);
    r2Ctx.fillStyle='rgba(224,122,82,0.4)'; r2Ctx.font='8px Pretendard,sans-serif'; r2Ctx.fillText(item.label,lx+12,ly+i*14+7);
  });
  requestAnimationFrame(drawR2);
}

// ══════════════════════════════
// R3: Animated Bubble Chart
// ══════════════════════════════
let r3Ctx, r3W, r3H, r3T=0, r3Bubbles=[];
function initR3(){
  const c=document.getElementById('canvas-r3'); if(!c) return;
  const d=devicePixelRatio||1; c.width=c.offsetWidth*d; c.height=c.offsetHeight*d;
  r3Ctx=c.getContext('2d'); r3Ctx.scale(d,d); r3W=c.offsetWidth; r3H=c.offsetHeight;
  const groups=[
    {cx:r3W*0.28,cy:r3H*0.38,color:'rgba(196,96,58,',n:13},
    {cx:r3W*0.55,cy:r3H*0.56,color:'rgba(156,136,116,',n:11},
    {cx:r3W*0.75,cy:r3H*0.34,color:'rgba(196,96,58,',n:9},
  ];
  r3Bubbles=[];
  groups.forEach(g=>{ for(let i=0;i<g.n;i++) r3Bubbles.push({x:g.cx+(Math.random()-0.5)*r3W*0.18,y:g.cy+(Math.random()-0.5)*r3H*0.2,r:5+Math.random()*16,color:g.color,phase:Math.random()*Math.PI*2,speed:0.6+Math.random()*0.8}); });
}
function drawR3(){
  if(!r3Ctx) return; r3Ctx.clearRect(0,0,r3W,r3H); r3T++;
  const t=r3T*0.012;
  // grid bg
  r3Ctx.strokeStyle='rgba(156,136,116,0.07)'; r3Ctx.lineWidth=0.4;
  for(let x=0;x<r3W;x+=56){r3Ctx.beginPath();r3Ctx.moveTo(x,0);r3Ctx.lineTo(x,r3H);r3Ctx.stroke();}
  for(let y=0;y<r3H;y+=56){r3Ctx.beginPath();r3Ctx.moveTo(0,y);r3Ctx.lineTo(r3W,y);r3Ctx.stroke();}

  const ox=r3W*0.08,oy=r3H*0.88,cw=r3W*0.84,ch=r3H*0.74;
  for(let i=1;i<=4;i++){
    r3Ctx.beginPath();r3Ctx.moveTo(ox,oy-(i/4)*ch);r3Ctx.lineTo(ox+cw,oy-(i/4)*ch);r3Ctx.strokeStyle='rgba(156,136,116,0.08)';r3Ctx.lineWidth=0.5;r3Ctx.stroke();
    r3Ctx.beginPath();r3Ctx.moveTo(ox+(i/4)*cw,oy);r3Ctx.lineTo(ox+(i/4)*cw,oy-ch);r3Ctx.stroke();
  }
  r3Ctx.beginPath();r3Ctx.moveTo(ox,oy-ch);r3Ctx.lineTo(ox,oy);r3Ctx.lineTo(ox+cw,oy);r3Ctx.strokeStyle='rgba(156,136,116,0.2)';r3Ctx.lineWidth=0.8;r3Ctx.stroke();
  // Regression line dashed
  r3Ctx.beginPath();r3Ctx.moveTo(ox,oy-0.12*ch);r3Ctx.lineTo(ox+cw,oy-0.72*ch);
  r3Ctx.strokeStyle='rgba(196,96,58,0.28)';r3Ctx.lineWidth=1.2;r3Ctx.setLineDash([5,3]);r3Ctx.stroke();r3Ctx.setLineDash([]);
  // Bubbles
  r3Bubbles.forEach(b=>{ const a=0.1+0.4*Math.abs(Math.sin(t*b.speed+b.phase)); r3Ctx.beginPath();r3Ctx.arc(b.x,b.y,b.r,0,Math.PI*2);r3Ctx.fillStyle=`${b.color}${a})`;r3Ctx.fill();r3Ctx.strokeStyle=`${b.color}${a*0.7})`;r3Ctx.lineWidth=0.7;r3Ctx.stroke(); });
  // Label
  r3Ctx.font='8px Pretendard,sans-serif'; r3Ctx.fillStyle='rgba(156,136,116,0.45)'; r3Ctx.fillText('Complex Survey Design (KNHANES)',ox+4,oy-ch+14);
  requestAnimationFrame(drawR3);
}

// INIT
window.addEventListener('load', () => {
  initHero(); requestAnimationFrame(drawHero);
  drawDarkBg('bg-intro');
  drawLightBg('bg-r1'); drawDarkBg('bg-r2'); drawLightBg('bg-r3');
  drawDarkBg('bg-people'); drawLightBg('bg-pub');
  drawDarkBg('bg-news'); drawLightBg('bg-teaching');
  drawTerraBg('bg-join'); drawDarkBg('bg-resources');
  initR1(); requestAnimationFrame(drawR1);
  initR2(); requestAnimationFrame(drawR2);
  initR3(); requestAnimationFrame(drawR3);
});
window.addEventListener('resize', () => {
  initHero(); drawDarkBg('bg-intro');
  drawLightBg('bg-r1'); drawDarkBg('bg-r2'); drawLightBg('bg-r3');
  drawDarkBg('bg-people'); drawLightBg('bg-pub');
  drawDarkBg('bg-news'); drawLightBg('bg-teaching');
  drawTerraBg('bg-join'); drawDarkBg('bg-resources');
  initR1(); initR2(); initR3();
});
// PEOPLE TABS
document.querySelectorAll('.people-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.people-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.people-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});
// PUB TABS
document.querySelectorAll('.pub-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.pub-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.pub-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});
