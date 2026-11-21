/* ===== boot ===== */
function render() {
  closeModal();
  const pv = $('.pv');
  if (pv) pv.remove();
  app().onclick = null;
  if (S.screen === 'shop') renderShop();
  else if (S.screen === 'allset') renderAllset();
  else if (S.screen === 'magic') renderMagic();
  else if (S.screen === 'editor' && S.book) renderEditor();
  else {
    S.screen = 'shop';
    renderShop();
  }
  window.scrollTo(0, 0);
}
