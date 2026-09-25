const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rupee = n => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

/* ---------------- load the shop's data (store.json). Edit that file to add candles, change prices, etc. ---------------- */
let STORE = null, PRODUCTS = [], BY_ID = {}, cart = {}, activeCat = 'all';
try { cart = JSON.parse(localStorage.getItem('navya_cart') || '{}') || {}; } catch { cart = {}; }
const saveCart = () => { try { localStorage.setItem('navya_cart', JSON.stringify(cart)); } catch { /* ignore */ } };

async function loadStore() {
  const res = await fetch('store.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('store.json did not load');
  STORE = await res.json();
  PRODUCTS = STORE.products.map((p, i) => ({ ...p, id: i, priceP: Math.round(p.price * 100), mrpP: Math.round(p.mrp * 100) }));
  BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

  document.querySelectorAll('[data-fill]').forEach(el => { el.textContent = STORE[el.dataset.fill] || ''; });
  document.querySelectorAll('[data-if]').forEach(el => { el.hidden = !STORE[el.dataset.if]; });
  document.querySelectorAll('[data-wa]').forEach(el => {
    if (!STORE.whatsapp) { el.hidden = true; return; }
    el.href = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(el.dataset.text || 'Hi!')}`;
  });
  if (STORE.whatsapp) { const a = $('waFloat'); a.href = `https://wa.me/${STORE.whatsapp}`; a.hidden = false; }
}

/* ---------------- artwork placeholder for products without a photo ---------------- */
function art(p) {
  if (p.image) return `<img src="images/${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`;
  const wax = '#F0DCB6';
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="${wax}" opacity=".18"/>
    <rect x="72" y="70" width="56" height="112" rx="6" fill="${wax}"/>
    <ellipse cx="100" cy="70" rx="28" ry="7" fill="#fff" opacity=".4"/>
    <ellipse cx="100" cy="66" rx="9" ry="17" fill="#E29A34" opacity=".9"/>
    <rect x="98.5" y="53" width="3" height="13" rx="1.5" fill="#3B2A1C"/></svg>`;
}

/* ---------------- catalogue ---------------- */
function renderCategories() {
  const cats = STORE.categories.map(c => ({ ...c, count: PRODUCTS.filter(p => p.category === c.slug).length }));
  $('cols').innerHTML = cats.map((c, i) => `
    <a class="col" href="#shop" data-cat="${esc(c.slug)}">
      <div class="swatch" style="background:linear-gradient(140deg, ${['#F0DCB6', '#E4DCEA', '#F5E7CF', '#D9CCE4'][i % 4]}, ${['#E29A34', '#8E4C64', '#C98A4B', '#3A2C45'][i % 4]})"></div>
      <h3>${esc(c.name)}</h3><span>${esc(c.blurb || c.count + ' items')}</span></a>`).join('');
  $('chips').innerHTML = [{ name: 'All', slug: 'all' }, ...cats]
    .map(c => `<button class="chip" data-cat="${esc(c.slug)}" aria-pressed="${c.slug === 'all'}">${esc(c.name)}</button>`).join('');
}

function renderProducts() {
  const q = $('search').value.trim().toLowerCase();
  const sort = $('sort').value;
  let list = PRODUCTS.filter(p => (activeCat === 'all' || p.category === activeCat)
    && (!q || p.name.toLowerCase().includes(q) || (p.scent || '').toLowerCase().includes(q)));
  if (sort === 'price_asc') list = [...list].sort((a, b) => a.priceP - b.priceP);
  if (sort === 'price_desc') list = [...list].sort((a, b) => b.priceP - a.priceP);

  $('grid').innerHTML = list.length ? list.map(p => `
    <article class="card ${p.stock ? '' : 'oos'}">
      <div class="card__art">${art(p)}${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ''}</div>
      <div class="card__body">
        <h3>${esc(p.name)}</h3>
        <p class="scent">${esc(p.scent)}</p>
        ${p.stock === 0 ? '<p class="stockline">Sold out</p>' : p.stock <= 5 ? `<p class="stockline">Only ${p.stock} left</p>` : ''}
        <div class="price"><b>${rupee(p.price)}</b>${p.mrp > p.price ? `<s>${rupee(p.mrp)}</s><em>${Math.round((1 - p.price / p.mrp) * 100)}% off</em>` : ''}</div>
        <button class="add" data-id="${p.id}" ${p.stock ? '' : 'disabled'}>${p.stock ? 'Add to cart' : 'Sold out'}</button>
      </div>
    </article>`).join('')
    : `<p style="color:var(--muted)">No candles match that. Clear the search to see everything.</p>`;

  const hamper = PRODUCTS.find(p => p.tag === 'Signature') || PRODUCTS.find(p => p.category === 'shaped-candles');
  if (hamper) $('hamperCard').innerHTML = `<div class="tcard">
      <h3 style="font-size:19px">${esc(hamper.name)}</h3>
      <p style="margin-top:8px">${esc(hamper.scent)}</p>
      <div class="price"><b>${rupee(hamper.price)}</b><s>${rupee(hamper.mrp)}</s></div>
      <button class="add" data-id="${hamper.id}">Add hamper to cart</button></div>`;
}

function renderReviews() {
  const rs = STORE.reviews || [];
  $('reviewStrip').innerHTML = rs.slice(0, 6).map(v => `
    <div class="tcard"><div class="stars">${'★'.repeat(v.rating | 0)}${'☆'.repeat(5 - (v.rating | 0))}</div>
      <p>${esc(v.body)}</p>
      <div class="who">${esc(v.name)}${v.city ? ' · ' + esc(v.city) : ''}</div></div>`).join('');
}

/* ---------------- cart & pricing (all worked out here in the browser, no server) ---------------- */
let toastT;
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2000);
}

const cartItems = () => Object.entries(cart).map(([id, qty]) => ({ id: Number(id), qty })).filter(e => BY_ID[e.id] && e.qty > 0);

function priceCart() {
  const lines = cartItems().map(({ id, qty }) => { const p = BY_ID[id]; return { id, name: p.name, price: p.priceP, qty: Math.min(qty, p.stock || qty) }; });
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const offerMinP = Math.round(STORE.offerMinOrder * 100), offerOffP = Math.round(STORE.offerAmountOff * 100);
  const discount = subtotal > offerMinP ? Math.min(offerOffP, subtotal) : 0;   // "above" the amount, so exactly the limit does not qualify
  const shipping = lines.length ? Math.round(STORE.shippingCharge * 100) : 0;
  return { lines, subtotal, discount, shipping, total: subtotal - discount + shipping };
}

function refreshCart() {
  const entries = cartItems();
  $('cartCount').textContent = entries.reduce((s, e) => s + e.qty, 0);
  $('cartCount').hidden = !entries.length;

  if (!entries.length) {
    $('items').innerHTML = `<p style="color:var(--muted); padding:20px 0">Your cart is empty.</p>`;
    $('sub').textContent = '₹0'; $('ship').textContent = '—'; $('tot').textContent = '₹0'; $('discRow').hidden = true;
    $('offerBar').hidden = true; $('freeNote').textContent = '';
    return;
  }
  const q = priceCart();
  $('items').innerHTML = entries.map(({ id, qty }) => { const p = BY_ID[id]; return `
    <div class="item">
      <div class="thumb">${art(p)}</div>
      <div><div class="nm">${esc(p.name)}</div><div class="price">${rupee(p.price)}</div>
        <div class="qty"><button data-dec="${id}">−</button><b>${qty}</b><button data-inc="${id}">+</button></div></div>
      <button class="rm" data-rm="${id}" aria-label="Remove">✕</button>
    </div>`; }).join('');

  $('sub').textContent = rupee(q.subtotal / 100);
  $('ship').textContent = rupee(q.shipping / 100);
  $('discRow').hidden = !q.discount;
  $('disc').textContent = '–' + rupee(q.discount / 100);
  $('tot').textContent = rupee(q.total / 100);

  const unlocked = q.subtotal > Math.round(STORE.offerMinOrder * 100);
  const need = Math.max(1, Math.ceil((Math.round(STORE.offerMinOrder * 100) - q.subtotal + 1) / 100));
  $('offerBar').hidden = false;
  $('offerFill').style.width = (unlocked ? 100 : Math.min(99, Math.round(q.subtotal / (STORE.offerMinOrder * 100) * 100))) + '%';
  $('freeNote').textContent = unlocked ? `You unlocked ${rupee(STORE.offerAmountOff)} off. It is already in your total.`
    : `Add ₹${need.toLocaleString('en-IN')} more to get ${rupee(STORE.offerAmountOff)} off your order.`;
}

document.addEventListener('click', e => {
  const add = e.target.closest('.add'); if (add) { const id = Number(add.dataset.id); cart[id] = (cart[id] || 0) + 1; saveCart(); refreshCart(); toast('Added to cart'); }
  const inc = e.target.closest('[data-inc]'); if (inc) { const id = Number(inc.dataset.inc); cart[id] = (cart[id] || 0) + 1; saveCart(); refreshCart(); }
  const dec = e.target.closest('[data-dec]'); if (dec) { const id = Number(dec.dataset.dec); cart[id] = Math.max(0, (cart[id] || 0) - 1); if (!cart[id]) delete cart[id]; saveCart(); refreshCart(); }
  const rm = e.target.closest('[data-rm]'); if (rm) { delete cart[rm.dataset.rm]; saveCart(); refreshCart(); }
  const chip = e.target.closest('[data-cat]'); if (chip) {
    activeCat = chip.dataset.cat;
    document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.cat === activeCat));
    renderProducts();
  }
});
$('search').addEventListener('input', renderProducts);
$('sort').addEventListener('change', renderProducts);

/* ---------------- cart drawer / checkout modal open+close ---------------- */
const openCart = () => { $('scrim').classList.add('show'); $('drawer').classList.add('show'); $('drawer').setAttribute('aria-hidden', 'false'); refreshCart(); };
const closeCart = () => { $('scrim').classList.remove('show'); $('drawer').classList.remove('show'); $('drawer').setAttribute('aria-hidden', 'true'); };
$('cartBtn').onclick = openCart;
$('closeCart').onclick = closeCart;
$('scrim').onclick = () => { closeCart(); $('checkoutModal').classList.remove('show'); };
$('payBtn').onclick = () => {
  if (!cartItems().length) return toast('Your cart is empty.');
  prefillCustomer();
  $('coSummary').innerHTML = '';
  $('checkoutModal').classList.add('show');
};
$('coClose').onclick = () => $('checkoutModal').classList.remove('show');

/* ---------------- checkout form: friendly checks + remembered details ---------------- */
const FIELD_RULES = [
  ['f_name', v => v.trim().length >= 2, 'Please enter your full name.'],
  ['f_phone', v => /^[6-9]\d{9}$/.test(v.replace(/\D/g, '').slice(-10)), 'Enter your 10-digit mobile number.'],
  ['f_address', v => v.trim().length >= 10, 'Add the house or flat number and street.'],
  ['f_city', v => v.trim().length >= 2, 'Enter your city.'],
  ['f_state', v => v !== '', 'Choose your state.'],
  ['f_pin', v => /^[1-9]\d{5}$/.test(v.trim()), 'Enter a 6-digit PIN code.']
];
function validateCheckout() {
  let first = null;
  for (const [id, ok, msg] of FIELD_RULES) {
    const el = $(id), bad = !ok(el.value), note = document.querySelector(`[data-for="${id}"]`);
    el.classList.toggle('invalid', bad); note.textContent = bad ? msg : ''; note.hidden = !bad;
    if (bad && !first) first = el;
  }
  if (first) { first.focus(); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  return !first;
}
FIELD_RULES.forEach(([id]) => $(id).addEventListener('input', () => {
  $(id).classList.remove('invalid'); const n = document.querySelector(`[data-for="${id}"]`); n.hidden = true;
}));

const SAVED = 'navya_customer';
function prefillCustomer() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVED) || '{}');
    [['f_name', 'name'], ['f_phone', 'phone'], ['f_address', 'address'], ['f_city', 'city'], ['f_state', 'state'], ['f_pin', 'pincode']]
      .forEach(([id, k]) => { if (d[k] && !$(id).value) $(id).value = d[k]; });
  } catch { /* storage can be blocked, that is fine */ }
}
function rememberCustomer(c) {
  try { const { note, ...keep } = c; localStorage.setItem(SAVED, JSON.stringify(keep)); } catch { /* ignore */ }
}

/* ---------------- send the order to WhatsApp (no server, this is the whole checkout) ---------------- */
function whatsappUrl(f, q) {
  const shown = q.lines.slice(0, 15).map(l => `• ${l.name} × ${l.qty} — ₹${(l.price * l.qty) / 100}`);
  if (q.lines.length > 15) shown.push(`• …and ${q.lines.length - 15} more item(s)`);
  const text = [
    `Hi ${STORE.storeName}! I want to place this order.`, '',
    ...shown, '',
    ...(q.discount ? [`Offer discount: –₹${q.discount / 100}`] : []),
    `Shipping: ₹${q.shipping / 100}`,
    `Total: ₹${q.total / 100}`, '',
    `Name: ${f.name}`, `Phone: ${f.phone}`,
    `Address: ${f.address}, ${f.city}, ${f.state} ${f.pincode}`,
    ...(f.note ? [`Note: ${f.note}`] : []), '',
    'Please share the payment details (UPI) so I can confirm.'
  ].join('\n');
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
}

$('waBtn').onclick = () => {
  if (!validateCheckout()) return;
  const f = { name: $('f_name').value.trim(), phone: $('f_phone').value.replace(/\D/g, '').slice(-10), address: $('f_address').value.trim(), city: $('f_city').value.trim(), state: $('f_state').value, pincode: $('f_pin').value.trim(), note: $('f_note').value.trim() };
  const q = priceCart();
  if (!q.lines.length) return toast('Your cart is empty.');
  rememberCustomer(f);
  const url = whatsappUrl(f, q);
  $('checkoutModal').querySelector('.modal__box').innerHTML = `
    <h2>Almost done!</h2>
    <ol style="margin:12px 0; padding-left:20px; line-height:1.7">
      <li>Tap <b>Continue on WhatsApp</b> below.</li>
      <li>Press <b>Send</b> on the message that opens. Please do not edit it.</li>
      <li>We reply with the UPI payment details. Your order is confirmed once we receive the payment.</li>
    </ol>
    <div class="ok">Total: <b>${rupee(q.total / 100)}</b></div>
    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px">
      <a class="btn btn--wa" href="${esc(url)}" target="_blank" rel="noopener">Continue on WhatsApp</a>
      <button class="btn" data-action="close-and-clear">Back to the shop</button>
    </div>`;
  cart = {}; saveCart(); refreshCart();
};

document.addEventListener('click', e => {
  const a = e.target.closest('[data-action="close-and-clear"]'); if (a) { $('checkoutModal').classList.remove('show'); closeCart(); }
});

/* ---------------- newsletter box -> just a WhatsApp opt-in, nothing is stored anywhere ---------------- */
$('joinBtn').onclick = () => {
  const email = $('mail').value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return $('mailNote').textContent = 'Enter a valid email.';
  const text = `Hi ${STORE.storeName}! Please add me to your updates list. My email: ${email}`;
  window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  $('mailNote').textContent = 'Opening WhatsApp — send the message to join.';
};

/* ---------------- boot ---------------- */
(async function boot() {
  try {
    await loadStore();
    renderCategories(); renderProducts(); renderReviews(); refreshCart();
  } catch (e) {
    $('grid').innerHTML = `<p style="color:var(--muted)">Could not load the catalogue: ${esc(e.message)}</p>`;
  }
})();

$('burger').onclick = () => { const open = $('nav').classList.toggle('show'); $('burger').setAttribute('aria-expanded', open); };
$('themeBtn').onclick = () => {
  const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', cur); try { localStorage.setItem('navya_theme', cur); } catch { /* ignore */ }
};
try { const saved = localStorage.getItem('navya_theme'); if (saved) document.documentElement.setAttribute('data-theme', saved); } catch { /* ignore */ }
