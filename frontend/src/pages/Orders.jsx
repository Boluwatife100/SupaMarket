import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { asset, formatDate, formatMoney, formatShortDate } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import LazyImage from '../components/LazyImage';
import Reveal from '../components/Reveal';

const label = 'mb-0.5 text-xs uppercase tracking-widest text-mist';

function OrderItem({ order, item, divider }) {
  const toast = useToast();
  const { refresh } = useCart();
  const [busy, setBusy] = useState(false);

  const buyAgain = async () => {
    setBusy(true);
    try {
      await api.post('/cart-items', { productId: item.productId, quantity: 1 });
      await refresh();
      toast('Added to your cart', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`grid grid-cols-[80px_1fr] gap-[22px] px-6 py-[22px] sm:grid-cols-[110px_1fr_auto] ${divider ? 'border-t border-moss/25' : ''}`}>
      <LazyImage src={asset(item.product.image)} alt={item.product.name} size={110} />
      <div>
        <div className="mb-1.5 text-[17px] font-semibold">{item.product.name}</div>
        <div className="mb-1 text-sm text-mist">
          {item.estimatedDeliveryTimeMs > Date.now() ? 'Arriving on' : 'Delivered on'}: {formatDate(item.estimatedDeliveryTimeMs)}
        </div>
        <div className="text-sm text-mist">Quantity: {item.quantity}</div>
      </div>
      <div className="col-span-2 flex gap-2.5 sm:col-span-1 sm:flex-col sm:justify-center">
        <button onClick={buyAgain} disabled={busy} className="btn">Buy it again</button>
        <Link to={`/tracking/${order.id}/${item.productId}`} className="btn border-moss/25 !bg-transparent">Track package</Link>
      </div>
    </div>
  );
}

export default function Orders() {
  const toast = useToast();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch((err) => {
        toast(errorMessage(err), 'error');
        setOrders([]);
      });
  }, [toast]);

  return (
    <>
      <h1 className="mb-7 text-[clamp(28px,4vw,40px)] font-bold">
        Your <span className="hl">orders</span>
      </h1>

      {!orders && <div className="shimmer card h-72" />}

      {orders?.length === 0 && (
        <EmptyState title="No orders yet" text="When you place an order it will show up here.">
          <Link to="/" className="btn-primary">Start shopping</Link>
        </EmptyState>
      )}

      {orders?.map((order) => (
        <Reveal key={order.id} className="mb-[26px]">
          <section className="card overflow-hidden">
            <header className="flex flex-wrap justify-between gap-[18px] border-b border-moss/25 bg-mint/40 px-6 py-[18px]">
              <div className="flex flex-wrap gap-10">
                <div><div className={label}>Order placed</div>{formatShortDate(order.orderTimeMs)}</div>
                <div><div className={label}>Total</div>{formatMoney(order.totalCostCents)}</div>
              </div>
              <div><div className={label}>Order ID</div><div className="break-all text-[13px]">{order.id}</div></div>
            </header>
            {order.products.map((item, i) => (
              <OrderItem key={item.productId} order={order} item={item} divider={i > 0} />
            ))}
          </section>
        </Reveal>
      ))}
    </>
  );
}
