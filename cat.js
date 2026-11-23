// 오른쪽 아래의 Live2D 검은 고양이 Hijiki. 누르면 야옹 소리가 나고 살짝 튀어오른다.
// live2d-widget(전역 L2Dwidget, index.html 에서 로드)이 그린다.
(() => {
  if (!window.L2Dwidget) return;
  const MODEL_URL = "https://unpkg.com/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json";
  const MOBILE_MAX_SIDE = 540;  // 화면의 짧은 변 기준
  const WIDGET_ID = "live2d-widget", CANVAS_ID = "live2dcanvas";
  const SOUND_URLS = ["/assets/cat/meow-1.mp3", "/assets/cat/meow-2.m4a", "/assets/cat/meow-3.m4a"];
  const VOLUME = 0.08;
  const DISPLAY = {
    desktop: { width: 150, height: 300, hOffset: 0, vOffset: -20 },
    mobile: { width: 80, height: 160, hOffset: -10, vOffset: -30 },
  };

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

  const setup = widget => {
    widget.setAttribute("aria-hidden", "true");
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

  const size = Math.min(innerWidth, innerHeight) <= MOBILE_MAX_SIDE ? DISPLAY.mobile : DISPLAY.desktop;
  L2Dwidget.init({
    model: { jsonPath: MODEL_URL, scale: 1 },
    display: { position: "right", ...size },
    mobile: { show: true, scale: 1.0 },
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
