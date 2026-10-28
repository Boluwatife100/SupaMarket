// Converts database rows into the JSON shape the frontend expects.
export const toProduct = (p) => ({
  id: p.id,
  image: p.image,
  name: p.name,
  rating: { stars: p.ratingStars, count: p.ratingCount },
  priceCents: p.priceCents,
  keywords: p.keywords
});

export const toCartItem = (c) => ({
  productId: c.productId,
  quantity: c.quantity,
  deliveryOptionId: c.deliveryOptionId,
  ...(c.product ? { product: toProduct(c.product) } : {})
});

export const toOrder = (o) => ({
  id: o.id,
  orderTimeMs: Number(o.orderTimeMs),
  totalCostCents: o.totalCostCents,
  products: o.items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    estimatedDeliveryTimeMs: Number(i.estimatedDeliveryTimeMs),
    ...(i.product ? { product: toProduct(i.product) } : {})
  }))
});

export const toUser = (u) => ({ id: u.id, name: u.name, email: u.email });
