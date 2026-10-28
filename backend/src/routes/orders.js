import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/errors.js';
import { DAY_MS, summarize } from '../lib/pricing.js';
import { toOrder } from '../lib/serialize.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const withProducts = { items: { include: { product: true } } };

router.get('/', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: withProducts,
    orderBy: { orderTimeMs: 'desc' }
  });
  res.json(orders.map(toOrder));
});

router.post('/', async (req, res) => {
  const order = await prisma.$transaction(async (tx) => {
    const cart = await tx.cartItem.findMany({
      where: { userId: req.userId },
      include: { product: true, deliveryOption: true }
    });
    if (cart.length === 0) throw new HttpError(400, 'Cart is empty');

    const now = Date.now();
    const created = await tx.order.create({
      data: {
        userId: req.userId,
        orderTimeMs: BigInt(now),
        totalCostCents: summarize(cart).totalCostCents,
        items: {
          create: cart.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            priceCents: i.product.priceCents,
            estimatedDeliveryTimeMs: BigInt(now + i.deliveryOption.deliveryDays * DAY_MS)
          }))
        }
      },
      include: withProducts
    });

    await tx.cartItem.deleteMany({ where: { userId: req.userId } });
    return created;
  });

  res.status(201).json(toOrder(order));
});

router.get('/:orderId', async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.orderId, userId: req.userId },
    include: withProducts
  });
  if (!order) throw new HttpError(404, 'Order not found');
  res.json(toOrder(order));
});

export default router;
