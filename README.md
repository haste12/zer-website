# Zer Jewelry – Professional Gold Jewelry Store

A full-stack gold jewelry store built with **Next.js**, **Express.js**, and **MongoDB**.

---

## ✨ Features

### 🛍️ Customer-Facing Store

- **Product listing** with search, filter by karat & category, and pagination
- **Product detail pages** with live calculated prices
- **Live gold price banner** on every page (auto-refreshes every 60s)
- **Gold prices page** with current rates and history
- Fully responsive (mobile + desktop)
- Dark luxury UI with gold theme

### ⚙️ Admin Dashboard

- **Secure JWT login** (rate-limited)
- **Dashboard** with stats, item distribution charts, quick actions
- **Add / Edit / Delete** jewelry items
- **Set weight** in mithqal (auto-converts to grams)
- **Choose karat**: 18K, 21K, 22K, 24K
- **Live price preview** while editing an item
- **Extra profit margin** per item (optional workmanship fee)
- **Image upload** (up to 5 per item)
- **Toggle availability** directly from item list
- **Mark featured** items for homepage showcase

### 💰 Automatic Price Calculation

- Set gold market prices per karat (IQD per mithqal) + USD exchange rate
- **All item prices recalculate instantly** when market prices are updated
- Formula: `Price = PricePerMithqal × Weight + ProfitMargin`
- Price history is stored for reference

---

## 🏗️ Tech Stack

| Layer    | Technology                                     |
| -------- | ---------------------------------------------- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend  | Express.js, Node.js                            |
| Database | MongoDB (local) + Mongoose                     |
| Auth     | JWT (jsonwebtoken) + bcryptjs                  |
| State    | SWR (stale-while-revalidate)                   |
| Styling  | Tailwind CSS                                   |

---

## 📁 Project Structure

```
zer-website/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── GoldPrice.js   # Gold market prices
│   │   │   ├── Item.js        # Jewelry items
│   │   │   └── User.js        # Admin users
│   │   ├── routes/
│   │   │   ├── auth.js        # Login / me / change-password
│   │   │   ├── items.js       # CRUD for items
│   │   │   ├── goldPrice.js   # Get & update gold prices
│   │   │   └── admin.js       # Dashboard stats & bulk ops
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT protect middleware
│   │   ├── server.js          # Express entry point
│   │   └── seed.js            # Seed admin user + sample data
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   │   ├── page.tsx           # Home page
│   │   │   ├── products/          # Products listing + detail
│   │   │   ├── gold-prices/       # Gold market prices page
│   │   │   ├── about/             # About page
│   │   │   └── admin/             # Admin section
│   │   │       ├── login/         # Login page
│   │   │       ├── dashboard/     # Dashboard
│   │   │       ├── items/         # item list, new, edit
│   │   │       ├── gold-price/    # Update gold prices
│   │   │       └── settings/      # Change password
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── GoldPriceBanner.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── LiveGoldSection.tsx
│   │   │   └── admin/
│   │   │       ├── AdminSidebar.tsx
│   │   │       ├── AdminGuard.tsx   # Route protection
│   │   │       └── ItemForm.tsx     # Shared add/edit form
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── types/
│   │       └── index.ts
│   └── .env.local
└── package.json
```

---

## 🚀 Setup & Run

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally (`mongodb://localhost:27017`)

### 1. Install dependencies

```bash
# From root directory
npm run install:all

# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

### 2. Seed the database

```bash
npm run seed
# Creates admin user + sample gold prices + 8 sample items
```

**Default Admin Credentials:**

```
Username: admin
Password: admin123456
```

> ⚠️ Change password after first login at `/admin/settings`

### 3. Start development servers

**Terminal 1 – Backend:**

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 – Frontend:**

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

---

## 🌐 URLs

| URL                                      | Description        |
| ---------------------------------------- | ------------------ |
| `http://localhost:3000`                  | Store homepage     |
| `http://localhost:3000/products`         | Product catalog    |
| `http://localhost:3000/gold-prices`      | Live gold prices   |
| `http://localhost:3000/admin/login`      | Admin login        |
| `http://localhost:3000/admin/dashboard`  | Admin dashboard    |
| `http://localhost:3000/admin/items`      | Manage items       |
| `http://localhost:3000/admin/gold-price` | Update gold prices |
| `http://localhost:5000/api/health`       | API health check   |

---

## 💰 Price Calculation

```
Item Price = Gold Price per Mithqal × Weight (mithqal) + Profit Margin
```

**Example:**

- 21K gold rate = 1,064,000 IQD/mithqal
- Item weight = 2 mithqal
- Profit margin = 50,000 IQD
- **Total = 2,178,000 IQD**

When you update the gold price, all item prices recalculate instantly.

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zer-jewelry
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_UPLOADS_URL=http://localhost:5000
NEXT_PUBLIC_SITE_NAME=Zer Jewelry
```

---

## 📡 API Endpoints

### Public

| Method | Endpoint                  | Description             |
| ------ | ------------------------- | ----------------------- |
| GET    | `/api/gold-price`         | Current gold prices     |
| GET    | `/api/gold-price/history` | Price history           |
| GET    | `/api/items`              | List items (filterable) |
| GET    | `/api/items/:id`          | Get single item         |

### Admin (JWT required)

| Method | Endpoint                 | Description                  |
| ------ | ------------------------ | ---------------------------- |
| POST   | `/api/auth/login`        | Admin login                  |
| GET    | `/api/auth/me`           | Current user                 |
| POST   | `/api/items`             | Create item                  |
| PUT    | `/api/items/:id`         | Update item                  |
| DELETE | `/api/items/:id`         | Delete item                  |
| POST   | `/api/gold-price`        | Update gold prices           |
| GET    | `/api/admin/dashboard`   | Dashboard stats              |
| POST   | `/api/admin/recalculate` | Force recalculate all prices |
