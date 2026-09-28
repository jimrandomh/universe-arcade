// A slow, twinkling starfield behind the page. Static when reduced motion is requested.
(() => {
  const canvas = document.getElementById('stars');
  const g = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stars = [];
  let w = 0;
  let h = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Positions are fractions of the viewport, so a resize (or a mobile URL bar sliding away)
    // stretches the sky instead of reshuffling it.
    if (!stars.length) stars = Array.from({ length: Math.min(600, Math.round((w * h) / 5200)) }, star);
    draw(performance.now());
  }

  function star() {
    return {
      x: Math.random(),
      y: Math.random(),
      size: Math.random() < 0.12 ? 2 : 1,
      base: 0.25 + Math.random() * 0.55,
      speed: 0.4 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      warm: Math.random() < 0.15,
    };
  }

  function draw(t) {
    g.clearRect(0, 0, w, h);
    for (const s of stars) {
      const a = still ? s.base : s.base * (0.65 + 0.35 * Math.sin(s.phase + (t / 1000) * s.speed));
      g.fillStyle = s.warm ? `rgba(255, 214, 140, ${a})` : `rgba(200, 212, 255, ${a})`;
      g.fillRect(Math.round(s.x * w), Math.round(s.y * h), s.size, s.size);
    }
  }

  function frame(t) {
    draw(t);
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  if (!still) requestAnimationFrame(frame);
})();
