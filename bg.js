// 우주 배경: 정적 별(1회 렌더) + 별똥별(rAF).
(() => {
  const STAR_DENSITY = 1 / 9000;          // px² 당 별 수
  const STAR_MAX = 220;
  const METEOR_DELAY_MS = [2000, 3000];   // 별똥별 사이 간격 범위
  const METEOR_LIFE_MS = [700, 1100];
  const METEOR_LEN = [120, 220];
  const STAR_RGB = "255,255,255", STAR_ALPHA = 0.75, METEOR_RGB = "255,255,255";

  const mk = (id) => {
    const c = document.createElement("canvas");
    c.id = id;
    c.setAttribute("aria-hidden", "true");
    document.body.prepend(c);
    return c;
  };
  const starCv = mk("bg-stars"), meteorCv = mk("bg-meteor");
  const sctx = starCv.getContext("2d"), mctx = meteorCv.getContext("2d");
  const rand = (a, b) => a + Math.random() * (b - a);

  let w = 0, h = 0, dpr = 1, stars = [];

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    for (const c of [starCv, meteorCv]) { c.width = w * dpr; c.height = h * dpr; }
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(STAR_MAX, Math.round(w * h * STAR_DENSITY));
    stars = Array.from({ length: n }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(0.4, 1.3), a: rand(0.3, 1) }));
    drawStars();
  }

  function drawStars() {
    sctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      sctx.fillStyle = `rgba(${STAR_RGB},${(s.a * STAR_ALPHA).toFixed(2)})`;
      sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, 6.2832); sctx.fill();
    }
  }

  const meteors = [];
  let timer = 0, raf = 0;

  function spawn() {
    const angle = rand(Math.PI * 0.12, Math.PI * 0.33);           // 아래 방향 기울기
    meteors.push({
      x: rand(w * 0.25, w * 1.05), y: rand(-20, h * 0.5), t0: performance.now(),
      life: rand(...METEOR_LIFE_MS), len: rand(...METEOR_LEN),
      dx: -Math.cos(angle), dy: Math.sin(angle), speed: rand(0.7, 1.4),   // px/ms
    });
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function frame(now) {
    mctx.clearRect(0, 0, w, h);
    mctx.lineWidth = 1.5; mctx.lineCap = "round";
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i], k = (now - m.t0) / m.life;
      if (k >= 1) { meteors.splice(i, 1); continue; }
      const d = (now - m.t0) * m.speed;
      const hx = m.x + m.dx * d, hy = m.y + m.dy * d;
      const fade = Math.sin(Math.PI * k);                         // 페이드 인/아웃
      const tx = hx - m.dx * m.len, ty = hy - m.dy * m.len;
      const g = mctx.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, `rgba(${METEOR_RGB},0)`);
      g.addColorStop(1, `rgba(${METEOR_RGB},${(0.85 * fade).toFixed(2)})`);
      mctx.strokeStyle = g;
      mctx.beginPath(); mctx.moveTo(tx, ty); mctx.lineTo(hx, hy); mctx.stroke();
    }
    raf = meteors.length ? requestAnimationFrame(frame) : 0;
  }

  function loop() { spawn(); timer = setTimeout(loop, rand(...METEOR_DELAY_MS)); }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  function start() { if (!reduce.matches && !document.hidden && !timer) loop(); }
  function stop() { clearTimeout(timer); timer = 0; cancelAnimationFrame(raf); raf = 0; meteors.length = 0; mctx.clearRect(0, 0, w, h); }

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  reduce.addEventListener("change", () => (reduce.matches ? stop() : start()));
  let rt = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(layout, 150); });

  layout();
  start();
})();
