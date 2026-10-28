const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' };

export const SearchIcon = (p) => (
  <svg viewBox="0 0 24 24" strokeWidth="2.4" {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const CartIcon = (p) => (
  <svg viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...p}>
    <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6" /><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" />
  </svg>
);
export const OrdersIcon = (p) => (
  <svg viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...p}><path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /></svg>
);
export const UserIcon = (p) => (
  <svg viewBox="0 0 24 24" strokeWidth="1.8" {...base} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>
);
