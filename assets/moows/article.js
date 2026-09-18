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
