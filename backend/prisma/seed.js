import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { products } from './data/products.js';
import { deliveryOptions } from './data/deliveryOptions.js';
import { orders } from './data/orders.js';

const prisma = new PrismaClient();

async function main() {
  for (const p of products) {
    const data = {
      image: p.image,
      name: p.name,
      ratingStars: p.rating.stars,
      ratingCount: p.rating.count,
      priceCents: p.priceCents,
      keywords: p.keywords
    };
    await prisma.product.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data } });
  }

  for (const o of deliveryOptions) {
    await prisma.deliveryOption.upsert({ where: { id: o.id }, update: o, create: o });
  }
  console.log(`Seeded ${products.length} products and ${deliveryOptions.length} delivery options.`);

  // Optional demo account (with the two sample orders from the original project).
  if (process.env.SEED_DEMO_USER === 'true') {
    const email = 'demo@example.com';
    const passwordHash = await bcrypt.hash('Demo12345!', 12);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name: 'Demo User', email, passwordHash }
    });

    const priceById = new Map(products.map((p) => [p.id, p.priceCents]));
    for (const o of orders) {
      await prisma.order.upsert({
        where: { id: o.id },
        update: {},
        create: {
          id: o.id,
          userId: user.id,
          orderTimeMs: BigInt(o.orderTimeMs),
          totalCostCents: o.totalCostCents,
          items: {
            create: o.products.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              priceCents: priceById.get(i.productId) ?? 0,
              estimatedDeliveryTimeMs: BigInt(i.estimatedDeliveryTimeMs)
            }))
          }
        }
      });
    }
    console.log('Demo user ready: demo@example.com / Demo12345!');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
