import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/cart-items');
      setCount(data.reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      /* the badge is cosmetic; ignore failures */
    }
  }, []);

  useEffect(() => {
    if (token) refresh();
    else setCount(0);
  }, [token, refresh]);

  const value = useMemo(() => ({ count, setCount, refresh }), [count, refresh]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
