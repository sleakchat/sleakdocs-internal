document.addEventListener(
  'click',
  (e) => {
    const link = e.target.closest('#navbar a[href="/roadmap/overview"]');
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    window.location.href = '/roadmap/timeline';
  },
  true
);
