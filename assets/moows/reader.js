(() => {
  const total = 76;
  const spread = document.querySelector('.spread');
  const reader = document.querySelector('.reader');
  const input = document.querySelector('#page');
  const status = document.querySelector('#status');
  const prev = document.querySelector('#prev');
  const next = document.querySelector('#next');
  const sidePrev = document.querySelector('#side-prev');
  const sideNext = document.querySelector('#side-next');
  const mobile = matchMedia('(max-width:700px)');
  let page = 1;
  const normalize = value => Math.min(total, Math.max(1, Number.parseInt(value, 10) || 1));
  function render() {
    page = normalize(page);
    if (!mobile.matches && page > 1 && page < total && page % 2) page--;
    const pages = mobile.matches || page === 1 || page === total ? [page] : [page, page + 1];
    spread.replaceChildren(...pages.map(n => {
      const img = new Image();
      img.src = `../../../assets/moows/issue-01/page-${String(n).padStart(2, '0')}.jpg`;
      img.alt = `MOOWS issue 1, printed page ${n}. Open the PDF to read selectable text.`;
      img.addEventListener('error', () => { status.textContent = 'This page could not load. Try again or open the PDF below.'; });
      return img;
    }));
    spread.classList.toggle('single', pages.length === 1);
    spread.classList.remove('turn');
    void spread.offsetWidth;
    spread.classList.add('turn');
    const links = document.querySelector('#web-versions');
    const matches = (window.moowsArticles || []).filter(article => article.pages.some(n => pages.includes(n)));
    links.replaceChildren(...matches.map(article => {
      const link = document.createElement('a');
      link.className = 'button';
      link.href = `../${article.slug}/`;
      link.textContent = `See the web version: ${article.title}`;
      return link;
    }));
    if (!matches.length) {
      const link = document.createElement('a');
      link.href = '../../../cowzine.html#contents';
      link.textContent = 'See the web version: all contents';
      links.append(link);
    }
    input.value = page;
    status.textContent = `Page${pages.length > 1 ? 's' : ''} ${pages.join('–')} of ${total}`;
    prev.disabled = page === 1;
    next.disabled = page === total;
    sidePrev.disabled = prev.disabled;
    sideNext.disabled = next.disabled;
    history.replaceState(null, '', `#page=${page}`);
  }
  function move(direction) {
    page += mobile.matches ? direction : direction > 0 ? (page === 1 ? 1 : 2) : (page === 2 ? -1 : -2);
    render();
  }
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  sidePrev.addEventListener('click', () => move(-1));
  sideNext.addEventListener('click', () => move(1));
  document.querySelector('#jump').addEventListener('submit', e => { e.preventDefault(); page = normalize(input.value); render(); });
  document.addEventListener('keydown', e => {
    if (/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); }
  });
  document.querySelector('#zoom').addEventListener('click', e => {
    const zoomed = reader.classList.toggle('zoomed');
    e.currentTarget.setAttribute('aria-pressed', String(zoomed));
    e.currentTarget.textContent = zoomed ? 'Fit pages' : 'Zoom in';
  });
  const full = document.querySelector('#fullscreen');
  full.hidden = !document.fullscreenEnabled;
  full.addEventListener('click', async () => {
    try {
      reader.classList.remove('zoomed');
      const zoom = document.querySelector('#zoom');
      zoom.setAttribute('aria-pressed', 'false');
      zoom.textContent = 'Zoom in';
      await reader.requestFullscreen();
    } catch { status.textContent = 'Fullscreen unavailable. You can still zoom in.'; }
  });
  let touch;
  reader.addEventListener('touchstart', e => { touch = [e.changedTouches[0].clientX, e.changedTouches[0].clientY]; }, {passive:true});
  reader.addEventListener('touchend', e => {
    if (!touch || reader.classList.contains('zoomed')) return;
    const dx = e.changedTouches[0].clientX - touch[0], dy = e.changedTouches[0].clientY - touch[1];
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
    touch = null;
  }, {passive:true});
  function fromHash() {
    const value = new URLSearchParams(location.hash.slice(1)).get('page');
    if (value !== null || !location.hash) { page = normalize(value); render(); }
  }
  window.addEventListener('hashchange', fromHash);
  mobile.addEventListener('change', render);
  fromHash();
})();
