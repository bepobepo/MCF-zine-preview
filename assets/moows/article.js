(() => {
  const button = document.querySelector('.share-article');
  const status = document.querySelector('.share-status');
  if (!button || (!navigator.share && !navigator.clipboard)) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    const url = location.href.split('#')[0].split('?')[0];
    try {
      if (navigator.share) await navigator.share({ title: document.title, url });
      else {
        await navigator.clipboard.writeText(url);
        status.textContent = 'Link copied.';
      }
    } catch (error) {
      if (error.name !== 'AbortError') status.textContent = 'Copy the address from your browser to share this piece.';
    }
  });
})();

// Move decoration at one quarter of the text's scroll speed.
(() => {
  const layer = document.querySelector('.article-background');
  if (!layer) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let pending = false;
  function paint() {
    layer.style.backgroundPositionY = reduced.matches ? '0px' : `${-Math.max(0, window.scrollY) * 0.25}px`;
    pending = false;
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(paint); } }
  window.addEventListener('scroll', schedule, { passive: true });
  reduced.addEventListener('change', schedule);
  paint();
})();
