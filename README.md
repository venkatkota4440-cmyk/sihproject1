# AgriNex — Direct. Trusted. Smart.
> **From Farm to Buyer — The Next-Generation Agricultural Fintech & Marketplace Platform**

![AgriNex Banner](https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=80)

---

## 🌟 Executive Overview & Problem Statement

Traditional agricultural supply chains in India and emerging economies suffer from exploitative commission agents, opaque Mandi price manipulations, and delays in farmer compensation:
- **Middleman Margin Drain**: 18% to 25% of agricultural produce value is captured by unregulated intermediaries.
- **Delayed Payouts**: Farmers often wait 2 to 4 weeks after unloading produce before receiving cash settlements.
- **No Real-Time Quality Standardization**: Grading disputes occur at destination hubs, leading to unilateral rejections.
- **Cold-Chain Blind Spots**: Lack of real-time temperature and GPS telematics during transit results in high spoilage rates of perishables.

### The AgriNex Solution
AgriNex bridges **Farmers**, **Institutional Bulk Buyers**, **Refrigerated Transporters**, and **Regulators** in a transparent direct marketplace:
1. **Direct Wholesale Marketplace**: Eliminates broker deductions with direct contract bidding.
2. **AI Crop Quality & Disease Scanner**: In-browser camera diagnostics detect leaf pathology, estimating brix levels and market freshness.
3. **Mandi Price Discovery & AI Forecasting**: Real APMC Agmarknet benchmark curves with algorithmic 14-day price forecasting.
4. **Digital Contract & Escrow Handshake**: Automated legal trade contracts where buyer deposits are locked in escrow and instantly disbursed to the farmer upon a 6-digit delivery OTP verification.
5. **Live GPS & Reefer Telematics**: Real-time simulated truck tracking with reefer temperature telemetry.

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 React 18 + Vite Frontend                     │
│  Three.js 3D Hero • Leaflet Maps • Recharts • Lucide React  │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST & WebSockets
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Node.js + Express API & Socket.IO               │
│      JWT Auth • RBAC • Escrow Machine • PDF Tax Receipt      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      MongoDB / DataStore     │ │  Python FastAPI AI Engine   │
│ Persistent JSON / Mongoose   │ │  Vision Diagnosis & Trends │
└──────────────────────────────┘ └────────────────────────────┘
```

- **Frontend**: React 18, Vite, Three.js, React Three Fiber, Drei, Lucide React, Recharts, Leaflet, Canvas Confetti.
- **Backend**: Node.js, Express.js, Socket.IO, Helmet, CORS, JWT, bcryptjs, Rate Limiting.
- **AI Service**: Python FastAPI, NumPy, Pandas, scikit-learn.
- **Containerization**: Docker, Docker Compose (`client`, `app`, `ai`, `mongo`, `redis`).

---

## ⚡ 1-Click Demo Evaluation Credentials

A sticky **Demo Account Bar** is active at the top of every screen for instant role-switching during hackathon presentations:

| Role | Name | Email | Password | Key Capability |
| :--- | :--- | :--- | :--- | :--- |
| **🌾 Farmer** | Ramesh Patel | `farmer@agrinex.com` | `Farmer@123` | List crops, camera scan, negotiate offers, view earnings |
| **🛒 Buyer** | FreshDirect Wholesale | `buyer@agrinex.com` | `Buyer@123` | Browse market, post tenders, make bids, demo payment, receive OTP |
| **🚚 Transporter** | Kisan Logistics Express | `transporter@agrinex.com` | `Transporter@123` | Reefer fleet manifest, transit update, verify 6-digit OTP |
| **🛡️ Admin** | AgriNex Administrator | `admin@agrinex.com` | `Admin@123` | KYC approvals, GMV metrics, audit logs, listings moderation |

---

## 🚀 Running AgriNex Locally

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- Python 3.10+ (Optional; Node server has built-in mirrored AI engine fallback)

### Step 1: Clone and Configure Environment
```bash
git clone <repo-url>
cd agrinex
cp .env.example .env
```

### Step 2: Start the Backend Server (Port 5000)
```bash
cd server
npm install
node index.js
```
*The server automatically boots with pre-seeded demo users, 8+ crops, active live demo orders, and APMC mandi price series.*

### Step 3: Start the Frontend Client (Port 5173)
```bash
cd ../client
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🐳 Docker Compose Quickstart

To run all services with a single command:
```bash
docker-compose up --build
```

Services exposed:
- Client: `http://localhost:5173`
- API Backend: `http://localhost:5000`
- AI Microservice: `http://localhost:8000`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

---

## 📋 Complete Hackathon End-to-End Walkthrough

1. **Landing Page**: Open `http://localhost:5173`. Explore the interactive 3D swaying crop fields, APMC live mandi price ticker, and features.
2. **Farmer Add Crop**: Click **"Farmer (Ramesh)"** in top demo bar. Go to **"List New Crop"**. Click **"Take Live Photo"** to open real browser camera viewfinder, or use **"AI Crop Scanner"** to run automated disease diagnostics.
3. **Buyer Browse & Offer**: Switch to **"Buyer (FreshDirect)"** in top demo bar. Browse the **Marketplace**, filter by Organic, and click **"Make Offer"** on Red Onions to propose a bid.
4. **Farmer Counter**: Switch to **"Farmer"**, open **"Offers"**, and propose a counter-rate.
5. **Buyer Accept & Escrow**: Switch to **"Buyer"**, open **"My Offers"**, accept the counter-bid. The digital legal contract is executed. Click **"Make Escrow Payment"** (UPI/Card). Order advances to `TRANSPORT_ASSIGNED`.
6. **Live Telemetry & GPS**: Open **"My Orders"**. Watch the truck move on the Leaflet GPS map with reefer temperature telemetry. Note the **6-digit delivery OTP** (`482915`).
7. **Transporter Handshake**: Switch to **"Transporter"**, open shipment manifest, and submit the 6-digit delivery OTP. Order transitions to `COMPLETED` and escrow releases.
8. **Tax Invoice & Earnings**: Download or print the digital contract and GST tax invoice receipt. Check Farmer Earnings ledger updated in real time.

---

## 🔒 Security & Data Integrity
- **No Sensitive Address Exposure**: Farmer residential locations and exact farm houses are masked; public approximate coordinates are used for GPS dispatch.
- **Zero Card / Aadhaar Storage**: Sensitive payment and KYC numbers are validated via mock hash tokens and never stored.
- **Tamper-Evident Audit Logging**: System actions (bids, status transitions, KYC approvals) are recorded in the immutable audit ledger.

---

## 📜 License
AgriNex is developed under the MIT License for open agricultural technological advancement.
