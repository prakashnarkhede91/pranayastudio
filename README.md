# Telior

A simple order & measurement book for a tailoring / stitching business, built as a
React web app wrapped with Capacitor so it can run as a native Android/iOS app.

Everything is stored on-device (localStorage) — no backend, no accounts, works offline.

## What's inside

- **Dashboard** — active orders, orders due soon, customer count, total order value
- **Customers** — add/search customers, store phone/address/notes and a full set of
  body measurements (chest, waist, hip, shoulder, sleeve, shirt length, neck, trouser
  length, thigh)
- **Orders** — take an order against a customer (garment type, due date, price,
  advance paid), track it through Pending → Cutting → Stitching → Ready → Delivered
  on a measuring-tape style status tracker

## Run it as a website (fastest way to try it)

```bash
npm install
npm run dev
```

Open the printed local URL. This is a normal Vite + React app, so any host that
serves static files (Vercel, Netlify, GitHub Pages, your own server) works too:

```bash
npm run build   # outputs static site to dist/
```

## Turn it into a real Android / iOS app (Capacitor)

You'll need Android Studio (for Android) and/or Xcode on a Mac (for iOS) installed
locally — those can't run in this environment, so do this step on your own machine.

```bash
npm install
npm run build

# first time only, per platform:
npx cap add android
npx cap add ios      # Mac + Xcode only

# every time you change the app:
npm run build
npx cap sync

# open in the native IDE to run on a device/emulator or produce a store build:
npx cap open android
npx cap open ios
```

The app id is `com.telior.app` and the display name is `Telior` — both set in
`capacitor.config.ts`. Change them there before you publish if you'd like something
different.

## Notes on the data

- Data lives in the browser/webview's `localStorage` under the key `telior.v1`, so it
  persists between app launches but stays on that one device.
- If you want data to sync across a phone, tablet, and desktop, the next step would be
  swapping the storage layer in `src/data/store.jsx` for a backend (e.g. Supabase,
  Firebase) or for `@capacitor/preferences` plus a sync service — the rest of the app
  doesn't need to change, since every screen goes through the `useData()` hook.

## Project structure

```
src/
  data/store.jsx        data layer: all reads/writes go through useData()
  components/           BottomNav, StatusPill, StatusTape, EmptyState
  pages/                Dashboard, Customers, CustomerForm, CustomerDetail,
                         Orders, OrderForm, OrderDetail
  App.jsx                routes + top bar
  index.css              design tokens and all styling
```
