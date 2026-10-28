# E-commerce Project (full stack)

A simple, futuristic storefront with a real backend.

- **Frontend:** **React 18** (Vite, React Router) + **Tailwind CSS** + **Axios**, lazy-loaded images, skeleton loaders, slow scroll-reveal and page transitions
- **Backend:** Node.js + Express 5, **Prisma** + PostgreSQL, **bcrypt** password hashing, JWT auth, **CORS**, Helmet, rate limiting
- **DevOps:** everything is containerized with **Docker Compose** (database, API, and an nginx web server that serves the built React app)

## Run it (Docker)

```bash
cp .env.example .env    
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


## Notes

- Payments are not integrated: "Place your order" records the order only.

