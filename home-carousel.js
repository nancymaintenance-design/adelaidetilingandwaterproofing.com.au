// Native, linked photographs remain available if JavaScript is disabled.
(() => {
  const root = document.querySelector('[data-home-carousel]');
  if (!root) return;
  const slides = [...root.querySelectorAll('[data-slide]')];
  if (slides.length < 2) return;
  const controls = root.querySelector('.home-carousel-controls');
  const rotation = root.querySelector('[data-rotation]');
  const status = root.querySelector('[data-slide-status]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer, running = !reduced.matches, hovering = false;
  let pointerRotationIntent;
  function schedule() {
    clearTimeout(timer);
    rotation.textContent = window.EllisI18n ? window.EllisI18n.message(window.EllisI18n.locale(), running ? 'pause' : 'start') : (running ? 'Pause slideshow' : 'Start slideshow');
    if (running && !hovering && !document.hidden) {
      timer = setTimeout(() => { show(current + 1, false); }, 6500);
    }
  }
  function show(index, announce) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    status.setAttribute('aria-live', announce ? 'polite' : 'off');
    status.textContent = `${current + 1} / ${slides.length}`;
    schedule();
  }
  root.querySelector('[data-prev]').addEventListener('click', () => { running = false; show(current - 1, true); });
  root.querySelector('[data-next]').addEventListener('click', () => { running = false; show(current + 1, true); });
  // Capture pointer intent before focusin pauses rotation and updates the label.
  rotation.addEventListener('pointerdown', () => { pointerRotationIntent = !running; });
  rotation.addEventListener('pointercancel', () => { pointerRotationIntent = undefined; });
  rotation.addEventListener('click', event => {
    running = event.detail > 0 && pointerRotationIntent !== undefined ? pointerRotationIntent : !running;
    pointerRotationIntent = undefined;
    schedule();
  });
  // Focus stops rotation until the visitor explicitly starts it again.
  root.addEventListener('focusin', () => { running = false; schedule(); });
  root.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  root.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { if (reduced.matches) running = false; schedule(); });
  controls.hidden = false;
  show(0, false);
})();
