document.querySelectorAll('[data-sidebar-toggle]').forEach(el => {
  el.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });
});

document.querySelectorAll('.collapsable').forEach(el => {
  el.querySelector('.collapsable-trigger').addEventListener(
    'click',
    () => {
      el.classList.toggle('collapsed');
    }
  );
});
