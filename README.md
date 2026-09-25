# Navya Candle Studio — free static version

This is a lighter version of the store with **no server and no database**. It is plain HTML/CSS/JS, so it can be
hosted for free, forever, with no credit card, on GitHub Pages or Cloudflare Pages. Customers browse, add candles
to a cart, and the **Order on WhatsApp** button sends the order straight to your WhatsApp (9873863591) with the
items, address and total. You reply with UPI payment details there, the same as the full version.

## What is different from the full (Render) version

Because there is no server, these things are not possible here:
- **No admin panel and no login.** You add candles, change prices, and edit text by editing one file, `store.json`,
  on GitHub. No password, no code to write.
- **No stock control.** Stock numbers are just text on the page ("Only 5 left"); nothing is actually reserved or
  reduced when someone orders. Update the `stock` number yourself when something sells out.
- **No order history or order numbers.** Each order lives only in your WhatsApp chat. There is nothing to look up
  by "order number" — track orders from WhatsApp itself.
- **No card/UPI payment gateway (Razorpay).** Payment happens on WhatsApp, exactly like the WhatsApp option in the
  full version.
- **No owner alert service.** The customer's own WhatsApp message is the alert — there is no second notification.

Everything else — the shop pages, cart, the automatic ₹100-off-orders-above-₹2,000 offer, flat ₹165 shipping, the
policies page — works the same.

## Put it online for free (GitHub Pages, about 10 minutes)

1. Unzip this folder. It should contain `index.html`, `store.json`, `images/`, and a few other files.
2. Create a free account at github.com.
3. Click **+ → New repository**. Name it anything (for example `navya-candle`). Choose **Public** (GitHub Pages'
   free tier needs the repository to be public — that only means the *code* is public, not your WhatsApp chats
   or customer details, since none of that is ever stored anywhere).
4. Click **uploading an existing file** and drag in every file and folder from this unzipped folder (including
   the whole `images` folder). Click **Commit changes**.
5. Go to the repository's **Settings → Pages**. Under "Build and deployment", set **Source** to
   **Deploy from a branch**, branch **main**, folder **/ (root)**. Click **Save**.
6. Wait about a minute, then refresh that page. A green box shows your live link, something like
   `https://yourname.github.io/navya-candle/`. Open it — your shop is live.

Any time you edit a file on GitHub and commit it, the live site updates itself within a minute or two.

### Alternative: Cloudflare Pages

Slightly more steps to set up but has no bandwidth limit at all, which matters if the shop gets busy.

1. Put the same files in a GitHub repository as above (steps 2–4).
2. Create a free account at dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git**.
3. Pick your repository. Leave the build command empty and set the output folder to `/`. Click **Save and Deploy**.
4. You get a link like `https://navya-candle.pages.dev`.

## Add a new candle, change a price, or add a photo

Everything the shop shows comes from one file: **`store.json`**. Open it on GitHub (click the file, then the pencil
icon ✏️ to edit) or edit it on your computer and re-upload it.

**To add a candle**, add a new line inside the `"products"` list, copying the shape of an existing one:
```json
{ "name": "Rose Pillar", "scent": "Bulgarian rose, tall pillar", "price": 599, "mrp": 749, "category": "shaped-candles", "stock": 15, "tag": "New", "image": "rose-pillar.jpg" }
```
- `price` and `mrp` are in plain rupees (no paise, no ₹ symbol).
- `category` must match one of the `slug` values in the `"categories"` list above it (`tealights`, `tin-candles`,
  `tart-candles`, `shaped-candles`), or add a new category there first.
- `tag` is optional (e.g. `"Bestseller"`, `"New"`) — leave it `""` for none.
- `image` is a file name inside the `images` folder (see below). Leave it `""` to show a placeholder candle icon.
- Don't forget the comma between products, and don't remove any commas or curly braces — a small typo will break
  the whole page. If the shop stops showing candles after an edit, check `store.json` at jsonlint.com to find the
  mistake.

**To add a photo**, put the JPG/PNG/WebP file in the `images` folder (upload it there on GitHub the same way you
uploaded the other files), then use its exact file name in that product's `"image"` field.

**To change a price or mark something sold out**, just edit the `price`/`mrp`/`stock` numbers for that product.

**To change shipping, the offer, your WhatsApp number, or address**, edit the values at the very top of `store.json`
(`shippingCharge`, `offerMinOrder`, `offerAmountOff`, `whatsapp`, `phone`, `email`, `address`). The offer is for
orders **above** `offerMinOrder` — right now that means ₹2,001 and up, not exactly ₹2,000.

## Want the full version later?

If you outgrow this (need an admin panel, order history, stock that updates itself, or card payments), the full
version of this same store — the one I built earlier with Render hosting — has all of that. You can move to it any
time; nothing here locks you in.
