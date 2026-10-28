import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../lib/api';
import { asset, formatMoney } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import LazyImage from './LazyImage';
import Stars from './Stars';

export default function ProductCard({ product }) {
  const { token } = useAuth();
  const { refresh } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('idle'); // idle | adding | added

  const addToCart = async () => {
    if (!token) {
      toast('Please sign in to add items to your cart');
      setTimeout(() => navigate('/login', { state: { from: '/' } }), 1100);
      return;
    }
    setStatus('adding');
    try {
      await api.post('/cart-items', { productId: product.id, quantity });
      await refresh();
      setStatus('added');
      setTimeout(() => setStatus('idle'), 1800);
    } catch (err) {
      toast(errorMessage(err), 'error');
      setStatus('idle');
    }
  };

  return (
    <article
      className="card group relative flex h-full flex-col overflow-hidden p-3.5 transition-all duration-700 ease-expo-out hover:-translate-y-1.5 hover:border-moss/60 hover:shadow-[0_14px_30px_rgba(96,105,92,0.18)]"
    >
      <LazyImage src={asset(product.image)} alt={product.name} className="mb-3.5" />
      <h3 className="clamp-2 min-h-[41px] text-[15px] font-semibold leading-snug">{product.name}</h3>
      <div className="mb-1.5 mt-2.5 flex items-center gap-2">
        <Stars rating={product.rating} />
        <span className="text-[13px] text-mist">{product.rating.count}</span>
      </div>
      <div className="font-display text-[22px] font-bold">{formatMoney(product.priceCents)}</div>
      <div className="mt-auto flex gap-2.5 pt-3.5">
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          aria-label="Quantity"
          className="field w-[68px] shrink-0"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i + 1}>{i + 1}</option>
          ))}
        </select>
        <button
          onClick={addToCart}
          disabled={status === 'adding'}
          className={`btn-primary flex-1 px-3 ${status === 'added' ? 'btn-added' : ''}`}
        >
          {status === 'adding' ? 'Adding…' : status === 'added' ? '✓ Added' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
