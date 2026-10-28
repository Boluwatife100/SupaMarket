export const DAY_MS = 24 * 60 * 60 * 1000;
const TAX_RATE = 0.1;

// items: cart rows including `product` and `deliveryOption`.
export function summarize(items) {
  let totalItems = 0;
  let productCostCents = 0;
  let shippingCostCents = 0;

  for (const item of items) {
    totalItems += item.quantity;
    productCostCents += item.product.priceCents * item.quantity;
    shippingCostCents += item.deliveryOption.priceCents;
  }

  const totalCostBeforeTaxCents = productCostCents + shippingCostCents;
  const taxCents = Math.round(totalCostBeforeTaxCents * TAX_RATE);

  return {
    totalItems,
    productCostCents,
    shippingCostCents,
    totalCostBeforeTaxCents,
    taxCents,
    totalCostCents: totalCostBeforeTaxCents + taxCents
  };
}
