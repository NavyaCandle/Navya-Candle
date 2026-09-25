fetch('store.json').then(r => r.json()).then(cfg => {
  document.querySelectorAll('[data-fill]').forEach(el => { el.textContent = cfg[el.dataset.fill] || ''; });
  document.querySelectorAll('[data-if]').forEach(el => { el.hidden = !cfg[el.dataset.if]; });
  document.querySelectorAll('[data-wa]').forEach(el => {
    if (cfg.whatsapp) el.href = 'https://wa.me/' + cfg.whatsapp; else el.hidden = true;
  });
}).catch(() => {});
