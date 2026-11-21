function modal(html, init) {
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = `<div class="dlg" role="dialog">${html}</div>`;
  document.body.appendChild(m);
  m.addEventListener('click', (e) => {
    if (e.target === m || e.target.closest('[data-close]')) closeModal();
  });
  if (init) init(m.querySelector('.dlg'));
  return m;
}
function closeModal() {
  document.querySelectorAll('.modal').forEach((m) => m.remove());
}
function copyText(t) {
  try {
    navigator.clipboard.writeText(t).then(
      () => toast('Đã copy'),
      () => toast('Hãy bôi đen và copy thủ công'),
    );
  } catch (e) {
    toast('Hãy bôi đen và copy thủ công');
  }
}
