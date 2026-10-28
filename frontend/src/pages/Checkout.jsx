import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { asset, formatDate, formatMoney, sleep } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import LazyImage from '../components/LazyImage';
import Reveal from '../components/Reveal';

const shippingLabel = (o) => (o.priceCents === 0 ? 'FREE Shipping' : `${formatMoney(o.priceCents)} - Shipping`);

function SummaryRow({ label, cents, total }) {
  return (
    <div className={`flex justify-between py-2 ${total ? 'mt-2 border-t border-moss/25 pt-[18px] text-xl font-bold text-fg' : 'text-mist'}`}>
      <span>{label}</span>
      <span className={total ? 'font-display' : ''}>{formatMoney(cents)}</span>
    </div>
  );
}

function CartItem({ item, options, removing, onUpdate, onRemove }) {
  const { product } = item;
  const selected = options.find((o) => o.id === item.deliveryOptionId) ?? options[0];

  return (
    <div
      className={`card mb-[18px] p-[22px] transition-all duration-[900ms] ease-expo-out ${
        removing ? 'max-h-0 translate-x-10 overflow-hidden !py-0 opacity-0 !mb-0' : 'max-h-[700px]'
      }`}
    >
      <div className="mb-4 font-display text-lg font-semibold text-moss">
        Delivery date: {formatDate(selected.estimatedDeliveryTimeMs)}
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-[22px] lg:grid-cols-[120px_1fr_280px]">
        <LazyImage src={asset(product.image)} alt={product.name} size={120} />
        <div>
          <div className="mb-2 text-[17px] font-semibold">{product.name}</div>
          <div className="mb-3.5 font-display text-xl font-bold">{formatMoney(product.priceCents)}</div>
          <div className="flex flex-wrap items-center gap-3 text-mist">
            <label className="flex items-center gap-2">
              Quantity
              <select
                value={item.quantity}
                onChange={(e) => onUpdate(item.productId, { quantity: Number(e.target.value) })}
                aria-label={`Quantity for ${product.name}`}
                className="field h-9"
              >
                {Array.from({ length: 10 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}
              </select>
            </label>
            <button onClick={() => onRemove(item.productId)} className="link-btn !text-danger">Delete</button>
          </div>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <div className="mb-2.5 font-semibold">Choose a delivery option</div>
          {options.map((o) => (
            <label
              key={o.id}
              className="mb-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-moss/25 px-3.5 py-[11px] transition-all duration-500 ease-expo-out hover:bg-white/50 has-[:checked]:border-moss has-[:checked]:bg-mint/40"
            >
              <input
                type="radio"
                name={`delivery-${item.productId}`}
                checked={o.id === item.deliveryOptionId}
                onChange={() => onUpdate(item.productId, { deliveryOptionId: o.id })}
                className="h-4 w-4 accent-moss"
              />
              <span>
                <div className="text-sm font-semibold">{formatDate(o.estimatedDeliveryTimeMs)}</div>
                <div className="text-[13px] text-mist">{shippingLabel(o)}</div>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const toast = useToast();
  const navigate = useNavigate();
  const { setCount } = useCart();

  const [data, setData] = useState(null); // { cart, options, summary }
  const [removing, setRemoving] = useState(null);
  const [placing, setPlacing] = useState(false);

  const load = useCallback(async () => {
    const [cart, options, summary] = (
      await Promise.all([
        api.get('/cart-items'),
        api.get('/delivery-options', { params: { expand: 'estimatedDeliveryTime' } }),
        api.get('/payment-summary')
      ])
    ).map((r) => r.data);
    setData({ cart, options, summary });
    setCount(summary.totalItems);
  }, [setCount]);

  useEffect(() => {
    load().catch((err) => {
      toast(errorMessage(err), 'error');
      setData({ cart: [], options: [], summary: null });
    });
  }, [load, toast]);

  const update = async (productId, body) => {
    try {
      await api.put(`/cart-items/${productId}`, body);
      await load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const remove = async (productId) => {
    setRemoving(productId);
    try {
      await Promise.all([api.delete(`/cart-items/${productId}`), sleep(850)]);
      await load();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setRemoving(null);
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      await api.post('/orders');
      setCount(0);
      toast('Order placed! 🎉', 'success');
      setTimeout(() => navigate('/orders'), 900);
    } catch (err) {
      toast(errorMessage(err), 'error');
      setPlacing(false);
    }
  };

  return (
    <>
      <h1 className="mb-7 text-[clamp(28px,4vw,40px)] font-bold">
        Review your <span className="hl">order</span>
      </h1>

      {!data && <div className="shimmer card h-72" />}

      {data && data.cart.length === 0 && (
        <EmptyState title="Your cart is empty" text="Add something from the catalog to get started.">
          <Link to="/" className="btn-primary">Browse products</Link>
        </EmptyState>
      )}

      {data && data.cart.length > 0 && data.summary && (
        <div className="grid items-start gap-7 lg:grid-cols-[1fr_380px]">
          <div>
            {data.cart.map((item) => (
              <Reveal key={item.productId}>
                <CartItem item={item} options={data.options} removing={removing === item.productId} onUpdate={update} onRemove={remove} />
              </Reveal>
            ))}
          </div>

          <Reveal className="lg:sticky lg:top-[94px]">
            <aside className="card p-[26px]">
              <h2 className="mb-[18px] text-[22px] font-semibold">Order summary</h2>
              <SummaryRow label={`Items (${data.summary.totalItems})`} cents={data.summary.productCostCents} />
              <SummaryRow label="Shipping & handling" cents={data.summary.shippingCostCents} />
              <SummaryRow label="Total before tax" cents={data.summary.totalCostBeforeTaxCents} />
              <SummaryRow label="Estimated tax (10%)" cents={data.summary.taxCents} />
              <SummaryRow label="Order total" cents={data.summary.totalCostCents} total />
              <button onClick={placeOrder} disabled={placing} className="btn-primary mt-5 h-[52px] w-full text-base">
                {placing ? 'Placing order…' : 'Place your order'}
              </button>
              <div className="mt-3.5 text-center text-[13px] text-mist">🔒 Secure checkout</div>
            </aside>
          </Reveal>
        </div>
      )}
    </>
  );
}
