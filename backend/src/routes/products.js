import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/errors.js';
import { toProduct } from '../lib/serialize.js';

const router = Router();

router.get('/', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  let products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });

  if (search) {
    products = products.filter(
      (p) => p.name.toLowerCase().includes(search) || p.keywords.some((k) => k.toLowerCase().includes(search))
    );
  }

  res.set('Cache-Control', 'public, max-age=60');
  res.json(products.map(toProduct));
});

router.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(toProduct(product));
});

export default router;
