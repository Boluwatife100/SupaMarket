const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatMoney = (cents) => money.format(cents / 100);
export const formatDate = (ms) =>
  new Date(ms).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
export const formatShortDate = (ms) =>
  new Date(ms).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// Product image paths from the API look like "images/products/x.jpg"; make them absolute for the router.
export const asset = (path) => `/${String(path).replace(/^\/+/, '')}`;

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
