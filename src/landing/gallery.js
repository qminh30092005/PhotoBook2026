if (new URLSearchParams(location.search).get('demo') === 'form') {
  location.replace('/thanh-toan?demo=form');
}
const banner = document.querySelector('.lp-banner');
const slides = [...banner.querySelectorAll('.lp-slide')];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const play = banner.querySelector('.lp-play');
let paused = motion.matches;
let active = 0;
let timer;

function advance(step) {
  active = (active + step + slides.length) % slides.length;
  slides.forEach((slide, index) => {
    slide.toggleAttribute('data-active', index === active);
    slide.inert = index !== active;
    slide.setAttribute('aria-hidden', String(index !== active));
  });
  banner.querySelector('.lp-count').textContent = (active + 1) + ' / ' + slides.length;
}
function schedule() {
  clearInterval(timer);
  play.textContent = paused ? '▶' : 'Ⅱ';
  play.setAttribute('aria-label', paused ? 'Tiếp tục chuyển banner' : 'Tạm dừng chuyển banner');
  const mouseHover = matchMedia('(hover: hover)').matches && banner.matches(':hover');
  if (!paused && !document.hidden && !touch && !mouseHover && !banner.querySelector(':focus-visible')) {
    timer = setInterval(() => advance(1), 5000);
  }
}
play.onclick = () => { paused = !paused; schedule(); };
for (const button of banner.querySelectorAll('[data-step]')) {
  button.onclick = () => { advance(Number(button.dataset.step)); schedule(); };
}
let touch;
banner.addEventListener('touchstart', event => {
  clearInterval(timer);
  touch = event.touches.length === 1 ? event.touches[0] : null;
}, { passive: true });
banner.addEventListener('touchcancel', () => { touch = null; schedule(); });
banner.addEventListener('touchend', event => {
  if (!touch) { schedule(); return; }
  const dx = event.changedTouches[0].clientX - touch.clientX;
  const dy = event.changedTouches[0].clientY - touch.clientY;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) advance(dx < 0 ? 1 : -1);
  touch = null;
  schedule();
});
for (const event of ['mouseenter', 'mouseleave', 'focusin', 'focusout']) {
  banner.addEventListener(event, () => requestAnimationFrame(schedule));
}
document.addEventListener('visibilitychange', schedule);
motion.addEventListener('change', () => { paused = motion.matches; schedule(); });
schedule();

const filters = document.querySelectorAll('[data-filter]');
const shelf = document.querySelector('.lp-shelf');
for (const filter of filters) {
  filter.onclick = () => {
    for (const button of filters) button.setAttribute('aria-pressed', String(button === filter));
    for (const card of shelf.children) card.hidden = filter.dataset.filter !== 'all' && card.dataset.group !== filter.dataset.filter;
    shelf.scrollLeft = 0;
  };
}
