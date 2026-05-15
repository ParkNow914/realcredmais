document.getElementById('retryButton')?.addEventListener('click', () => {
  window.location.reload();
});

window.addEventListener('online', () => {
  window.location.reload();
});