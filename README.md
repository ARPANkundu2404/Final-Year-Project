# 🅿 SmartPark — Intelligent Parking Web App

A high-end, responsive Smart Parking Web App built with Next.js 14 (App Router), Tailwind CSS, Framer Motion, and Mapbox GL JS.

## File Structure

```
smart-parking-app/
├── app/
│   ├── globals.css              # Tailwind + custom styles
│   ├── layout.jsx               # Root layout, Mapbox CSS, Google Fonts
│   └── page.jsx                 # Main entry point
├── components/
│   ├── Booking/
│   │   └── BookingFlow.jsx      # BottomSheet + StripeModal + SuccessOverlay
│   ├── Discovery/
│   │   └── DiscoveryPanel.jsx   # Floating nearby lots panel
│   ├── Map/
│   │   └── MapComponent.jsx     # Mapbox GL JS map + markers + fallback
│   ├── Navigation/
│   │   └── Navigation.jsx       # BottomNav (mobile) + SideRail (desktop)
│   └── Ticket/
│       └── QRTicket.jsx         # Digital ticket with QR code
├── context/
│   └── ParkingContext.jsx       # Global state (useReducer)
├── hooks/
│   ├── useFirebaseSim.js        # Simulated data fetching (Firebase-ready)
│   └── useMapData.js            # Mapbox initialization + markers
├── utils/
│   ├── formatters.js            # Price, distance, time, booking ID helpers
│   └── mapHelpers.js            # Custom marker DOM elements
├── tailwind.config.js
└── package.json
```

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add environment variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_public_token_here
```
Get a free token at https://account.mapbox.com/

### 3. Run the dev server
```bash
npm run dev
```

Open http://localhost:3000

---

## Feature Walkthrough

### 🗺 Map
- Mapbox GL JS with dark theme + atmospheric fog
- Color-coded markers: **Emerald** = Available, **Rose** = Full, **Gold ring** = Recommended
- Fetches user's GPS location and flies to it on load
- Clicking a marker opens the booking bottom sheet

### 📋 Discovery Panel
- Floats over the map (bottom of screen / left rail on desktop)
- Sortable list: Recommended first, then by distance
- Expandable to show all nearby lots
- Real-time availability updates every 5 seconds (simulated)

### 💳 Booking Flow
1. **Bottom Sheet** — Lot details, duration picker, slot type, price summary
2. **Stripe Modal** — Card number, expiry, CVV, cardholder name with validation
3. **Success Animation** — Framer Motion checkmark with ripple effect
4. **Digital Ticket** — QR code, booking ID, slot number, share & directions

### 🔌 Integration Points

#### Firebase (Real-time sensor data from ESP32)
Search for `// FIREBASE_INTEGRATION_POINT` in the codebase:
- `hooks/useFirebaseSim.js` — Replace mock data with Firestore `getDocs`
- `hooks/useFirebaseSim.js` — Replace `setInterval` with `onSnapshot` listener
- `context/ParkingContext.jsx` — The reducer already handles `UPDATE_LOT_AVAILABILITY`

#### Stripe (Payment processing)
Search for `// STRIPE_API_POINT` in the codebase:
- `components/Booking/BookingFlow.jsx` — Create payment intent in `StripePaymentModal`
- `context/ParkingContext.jsx` — Confirm payment in `confirmBooking` action

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Deep Indigo | `#1E1B4B` | Backgrounds, cards |
| Emerald | `#10B981` | Available, CTAs, accents |
| Rose | `#F43F5E` | Full lots, errors |
| Amber | `#FBBF24` | Recommended badge |
| Slate | `#64748B` | Muted text, icons |

- **Font**: DM Sans (body) + JetBrains Mono (booking IDs)
- **Radius**: `rounded-2xl` / `rounded-3xl` throughout
- **Blur**: `backdrop-blur-md` on all overlays

---

## Adding Real Firebase

```bash
npm install firebase
```

```js
// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const app = initializeApp({ /* your config */ });
export const db = getFirestore(app);
```

Replace the `// FIREBASE_INTEGRATION_POINT` comments in `hooks/useFirebaseSim.js`.

## Adding Real Stripe

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

Create `/app/api/create-payment-intent/route.js` and replace `// STRIPE_API_POINT` comments.