# E-commerce Project (full stack)

A dark, futuristic storefront with a real backend.

- **Frontend:** **React 18** (Vite, React Router) + **Tailwind CSS** + **Axios**, lazy-loaded images, skeleton loaders, slow scroll-reveal and page transitions
- **Backend:** Node.js + Express 5, **Prisma** + PostgreSQL, **bcrypt** password hashing, JWT auth, **CORS**, Helmet, rate limiting
- **DevOps:** everything is containerized with **Docker Compose** (database, API, and an nginx web server that serves the built React app)

## Run it (Docker)

```bash
cp .env.example .env     # optional, but change JWT_SECRET and POSTGRES_PASSWORD for anything public
docker compose up --build
```

Open **http://localhost:8080**. The API is also on http://localhost:3000/api.

On first start the API creates the tables, loads the 42 products and delivery options, and (when `SEED_DEMO_USER=true`) a demo account:

```
demo@example.com / Demo12345!
```

Set `SEED_DEMO_USER=false` in `.env` for production. Stop with `docker compose down` (add `-v` to wipe the database).

## Run it without Docker

```bash
# 1. database only (published on localhost:5433 so it won't clash with a local Postgres)
docker compose up db -d

# 2. API
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev              # http://localhost:3000

# 3. frontend (new terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

In dev, Vite forwards `/api` calls to the API on port 3000 (see `frontend/vite.config.js`). In Docker, nginx does the same. Set `VITE_API_URL` only if your API lives somewhere else.

## API

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | no | `{ name, email, password }` (password 8-72 chars) |
| POST | `/api/auth/login` | no | returns `{ token, user }` |
| GET | `/api/auth/me` | yes | current user |
| GET | `/api/products` | no | `?search=` filters by name/keywords |
| GET | `/api/products/:id` | no | |
| GET | `/api/delivery-options` | no | `?expand=estimatedDeliveryTime` |
| GET/POST | `/api/cart-items` | yes | POST `{ productId, quantity 1-10 }` |
| PUT/DELETE | `/api/cart-items/:productId` | yes | PUT `{ quantity?, deliveryOptionId? }` |
| GET | `/api/payment-summary` | yes | totals + 10% tax |
| GET/POST | `/api/orders` | yes | POST turns the cart into an order |
| GET | `/api/orders/:orderId` | yes | |
| GET | `/api/health` | no | |

Send the token as `Authorization: Bearer <token>`.

## What changed from the original

- Replaced the Sequelize + SQLite/JSON setup with Prisma + PostgreSQL (`backend/prisma/schema.prisma`).
- Added accounts: bcrypt-hashed passwords, JWT sessions. Carts and orders now belong to the signed-in user (they used to be one shared global cart).
- Removed the public `/api/reset` endpoint (anyone could wipe the data).
- The frontend is now a React + Tailwind single-page app (pages: shop, checkout, orders, package tracking, sign-in/register) with category filter chips.
- Product photos were compressed from 14 MB to 1.7 MB (same file names, now in `frontend/public/images`).

## Notes

- `frontend/public/images/logo*.png` is still the original course logo. Swap in your own.
- Payments are not integrated: "Place your order" records the order only.

## Troubleshooting

- **`apt-get` / `npm install` / "Temporary failure resolving" during `docker compose up --build`:** Docker lost its internet connection while building. Just run the command again (finished steps are cached). If it keeps happening, in Docker Desktop open Settings > Docker Engine and add `"dns": ["8.8.8.8", "1.1.1.1"]` to the JSON, then Apply & restart.

- **"ports are not available ... 5433" (or 8080 / 3000):** another program is using that port. Stop it, or change the left-hand number of that port mapping in `docker-compose.yml`.
