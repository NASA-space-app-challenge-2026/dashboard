// 오른쪽 아래의 Live2D 검은 고양이 Hijiki. 누르면 야옹 소리가 나고 살짝 튀어오른다.
// live2d-widget(전역 L2Dwidget, index.html 에서 로드)이 그린다.
(() => {
  if (!window.L2Dwidget) return;
  const MODEL_URL = "https://unpkg.com/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json";
  const MOBILE_MAX_SIDE = 540;  // 화면의 짧은 변 기준
  if (Math.min(innerWidth, innerHeight) <= MOBILE_MAX_SIDE) return;  // 모바일에서는 고양이를 띄우지 않는다
  const WIDGET_ID = "live2d-widget", CANVAS_ID = "live2dcanvas", FOOTER_ID = "footer";
  const SOUND_URLS = ["/assets/cat/meow-1.mp3", "/assets/cat/meow-2.m4a", "/assets/cat/meow-3.m4a"];
  const VOLUME = 0.08;
  const FEET_RATIO = 0.27;  // 캔버스 바닥에서 고양이 발바닥까지의 투명 여백 (캔버스 높이 대비)
  const SIZE = { width: 100, height: 200, hOffset: 0, vOffset: -40 };

  let last = -1;
  const meow = () => {
    let i;
    do i = Math.floor(Math.random() * SOUND_URLS.length); while (i === last);
    last = i;
    const a = new Audio(SOUND_URLS[i]);
    a.volume = VOLUME;
    a.playbackRate = 1.02 + Math.random() * 0.08;
    a.play().catch(() => {});
  };

  // 푸터의 구분선(border-top)에 닿으면 고양이가 선에 얹혀 같이 밀려 올라간다.
  const rideFooter = widget => {
    const base = SIZE.vOffset;
    const feet = SIZE.height * FEET_RATIO;
    let raf = 0;
    const update = () => {
      raf = 0;
      const foot = document.getElementById(FOOTER_ID);
      const push = foot ? innerHeight - foot.getBoundingClientRect().top - feet : base;
      widget.style.bottom = `${Math.max(base, push)}px`;
    };
    const schedule = () => { raf = raf || requestAnimationFrame(update); };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    update();
  };

  const setup = widget => {
    widget.setAttribute("aria-hidden", "true");
    rideFooter(widget);
    widget.addEventListener("pointerdown", e => {
      if (e.button !== undefined && e.button !== 0) return;
      meow();
      const cv = document.getElementById(CANVAS_ID);
      if (!cv) return;
      cv.classList.remove("meowing");
      void cv.offsetWidth;
      cv.classList.add("meowing");
      cv.addEventListener("animationend", () => cv.classList.remove("meowing"), { once: true });
    });
  };

  L2Dwidget.init({
    model: { jsonPath: MODEL_URL, scale: 1 },
    display: { position: "right", ...SIZE },
    react: { opacityDefault: 0.7, opacityOnHover: 0.2 },
  });

  const found = document.getElementById(WIDGET_ID);
  if (found) return setup(found);
  const obs = new MutationObserver(() => {
    const w = document.getElementById(WIDGET_ID);
    if (!w) return;
    obs.disconnect();
    setup(w);
  });
  obs.observe(document.body, { childList: true });
})();
