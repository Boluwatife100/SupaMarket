import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { DAY_MS } from '../lib/pricing.js';

const router = Router();

router.get('/', async (req, res) => {
  const options = await prisma.deliveryOption.findMany({ orderBy: { deliveryDays: 'desc' } });
  const expand = req.query.expand === 'estimatedDeliveryTime';

  res.json(
    options.map((o) => ({
      id: o.id,
      deliveryDays: o.deliveryDays,
      priceCents: o.priceCents,
      ...(expand ? { estimatedDeliveryTimeMs: Date.now() + o.deliveryDays * DAY_MS } : {})
    }))
  );
});

export default router;
