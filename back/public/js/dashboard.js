// Minimal dashboard interactions
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.add').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = 'ADD 1';
    });
  });

  document.querySelectorAll('#side .x').forEach(x => {
    x.addEventListener('click', () => {
      x.parentElement.remove();
    });
  });
});
