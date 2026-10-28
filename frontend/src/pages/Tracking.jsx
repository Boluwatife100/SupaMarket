import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { asset, formatDate } from '../lib/format';
import EmptyState from '../components/EmptyState';
import LazyImage from '../components/LazyImage';
import Reveal from '../components/Reveal';

const LABELS = ['Preparing', 'Shipped', 'Delivered'];

export default function Tracking() {
  const { orderId, productId } = useParams();
  const [state, setState] = useState({ status: 'loading' }); // loading | ready | missing
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api.get(`/orders/${encodeURIComponent(orderId)}`)
      .then(({ data: order }) => {
        if (cancelled) return;
        const item = order.products.find((p) => p.productId === productId);
        if (!item) return setState({ status: 'missing', message: 'That product is not part of this order.' });

        const span = Math.max(item.estimatedDeliveryTimeMs - order.orderTimeMs, 1);
        const pct = Math.min(100, Math.max(6, ((Date.now() - order.orderTimeMs) / span) * 100));
        setState({ status: 'ready', item, pct });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ status: 'missing', message: err.response?.status === 404 ? 'We could not find that order.' : errorMessage(err) });
        }
      });
    return () => { cancelled = true; };
  }, [orderId, productId]);

  // Let the page settle, then slowly fill the bar.
  useEffect(() => {
    if (state.status !== 'ready') return undefined;
    const id = setTimeout(() => setWidth(state.pct), 500);
    return () => clearTimeout(id);
  }, [state]);

  if (state.status === 'loading') return <div className="shimmer card mx-auto h-96 max-w-[760px]" />;

  if (state.status === 'missing') {
    return (
      <EmptyState title="Package not found" text={state.message}>
        <Link to="/orders" className="btn-primary">View all orders</Link>
      </EmptyState>
    );
  }

  const { item, pct } = state;
  const stage = pct >= 100 ? 2 : pct >= 33 ? 1 : 0;

  return (
    <Reveal className="mx-auto max-w-[760px]">
      <section className="card p-6 sm:p-9">
        <Link to="/orders" className="link-btn">← View all orders</Link>
        <h1 className="mb-2.5 mt-5 font-display text-[26px] font-semibold text-moss">
          {stage === 2 ? 'Delivered on' : 'Arriving on'} {formatDate(item.estimatedDeliveryTimeMs)}
        </h1>
        <div>{item.product.name}</div>
        <div className="text-sm text-mist">Quantity: {item.quantity}</div>
        <LazyImage src={asset(item.product.image)} alt={item.product.name} eager className="my-[22px] mb-[30px] max-w-[260px]" />

        <div className="mb-3 flex justify-between font-medium text-mist">
          {LABELS.map((l, i) => (
            <span key={l} className={i === stage ? 'font-bold text-ink' : ''}>{l}</span>
          ))}
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-moss/20" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full bg-moss transition-[width] duration-[2400ms] ease-expo-out"
            style={{ width: `${width}%` }}
          />
        </div>
      </section>
    </Reveal>
  );
}
