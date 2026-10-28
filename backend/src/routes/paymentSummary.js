import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { summarize } from '../lib/pricing.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.userId },
    include: { product: true, deliveryOption: true }
  });
  res.json(summarize(items));
});

export default router;
