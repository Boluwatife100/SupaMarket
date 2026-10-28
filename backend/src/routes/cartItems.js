import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/errors.js';
import { toCartItem } from '../lib/serialize.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const MAX_QTY = 10;
const isQty = (n) => Number.isInteger(n) && n >= 1 && n <= MAX_QTY;

router.get('/', async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.userId },
    include: { product: true },
    orderBy: { createdAt: 'asc' }
  });
  res.json(items.map(toCartItem));
});

router.post('/', async (req, res) => {
  const { productId, quantity } = req.body ?? {};
  if (typeof productId !== 'string') throw new HttpError(400, 'productId is required');
  if (!isQty(quantity)) throw new HttpError(400, `Quantity must be a whole number between 1 and ${MAX_QTY}`);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new HttpError(400, 'Product not found');

  const key = { userId_productId: { userId: req.userId, productId } };
  const existing = await prisma.cartItem.findUnique({ where: key });
  const newQuantity = Math.min((existing?.quantity ?? 0) + quantity, MAX_QTY);

  const item = await prisma.cartItem.upsert({
    where: key,
    update: { quantity: newQuantity },
    create: { userId: req.userId, productId, quantity: newQuantity, deliveryOptionId: '1' }
  });
  res.status(201).json(toCartItem(item));
});

router.put('/:productId', async (req, res) => {
  const { quantity, deliveryOptionId } = req.body ?? {};
  const key = { userId_productId: { userId: req.userId, productId: req.params.productId } };

  const existing = await prisma.cartItem.findUnique({ where: key });
  if (!existing) throw new HttpError(404, 'Cart item not found');

  const data = {};
  if (quantity !== undefined) {
    if (!isQty(quantity)) throw new HttpError(400, `Quantity must be a whole number between 1 and ${MAX_QTY}`);
    data.quantity = quantity;
  }
  if (deliveryOptionId !== undefined) {
    const option = typeof deliveryOptionId === 'string'
      ? await prisma.deliveryOption.findUnique({ where: { id: deliveryOptionId } })
      : null;
    if (!option) throw new HttpError(400, 'Invalid delivery option');
    data.deliveryOptionId = deliveryOptionId;
  }

  const item = await prisma.cartItem.update({ where: key, data });
  res.json(toCartItem(item));
});

router.delete('/:productId', async (req, res) => {
  const { count } = await prisma.cartItem.deleteMany({
    where: { userId: req.userId, productId: req.params.productId }
  });
  if (count === 0) throw new HttpError(404, 'Cart item not found');
  res.status(204).send();
});

export default router;
