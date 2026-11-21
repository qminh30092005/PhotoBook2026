for (const contact of document.querySelectorAll('[data-contact]')) {
  const email = CONFIG.SHOP_PRIVACY_EMAIL;
  if (email || CONFIG.SHOP_ZALO) {
    const link = document.createElement('a');
    link.href = email ? 'mailto:' + encodeURIComponent(email) : 'https://zalo.me/' + encodeURIComponent(CONFIG.SHOP_ZALO);
    link.textContent = email || 'qua Zalo';
    contact.replaceChildren(link);
  }
}
