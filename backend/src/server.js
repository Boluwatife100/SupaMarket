import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './lib/config.js';
import { prisma } from './lib/prisma.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import deliveryOptionRoutes from './routes/deliveryOptions.js';
import cartItemRoutes from './routes/cartItems.js';
import orderRoutes from './routes/orders.js';
import paymentSummaryRoutes from './routes/paymentSummary.js';

const app = express();
app.set('trust proxy', 1); // behind nginx in Docker, so rate limiting sees the real client IP

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok' });
});

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again in a few minutes.' }
  }),
  authRoutes
);
app.use('/api/products', productRoutes);
app.use('/api/delivery-options', deliveryOptionRoutes);
app.use('/api/cart-items', cartItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment-summary', paymentSummaryRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Express 5 forwards errors from async handlers here automatically.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong' : err.message });
});

const server = app.listen(config.port, () => {
  console.log(`API listening on port ${config.port}`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
