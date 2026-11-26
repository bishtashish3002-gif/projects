const body = document.body;
const themeButton = document.getElementById('theme');
const toast = document.getElementById('toast');
let toastTimer;

themeButton.addEventListener('click', () => {
  body.classList.toggle('dark');
  const darkMode = body.classList.contains('dark');
  themeButton.textContent = darkMode ? 'Light theme' : 'Dark theme';
  themeButton.setAttribute('aria-label', darkMode ? 'Switch to light theme' : 'Switch to dark theme');
});

function showMessage(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

document.querySelectorAll('.tool').forEach((tool) => {
  tool.addEventListener('click', () => {
    document.querySelectorAll('.tool').forEach((item) => item.classList.remove('active'));
    tool.classList.add('active');
    showMessage(`${tool.dataset.name} selected — coming next!`);
  });
});

document.getElementById('all-tools').addEventListener('click', () => {
  showMessage('More free student tools are on the way.');
});
