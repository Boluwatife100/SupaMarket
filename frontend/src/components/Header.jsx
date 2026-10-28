import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { CartIcon, OrdersIcon, SearchIcon, UserIcon } from "./icons";

const navLink = ({ isActive }) =>
  `relative flex items-center gap-2 rounded-full px-3.5 py-2 font-medium transition-all duration-500 ease-expo-out hover:bg-moss/10 hover:text-fg ${
    isActive ? "bg-mint text-ink" : "text-moss"
  }`;

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();

  const onHome = pathname === "/";
  const urlQuery = onHome ? (params.get("search") ?? "") : "";
  const [value, setValue] = useState(urlQuery);
  const timer = useRef();

  useEffect(() => {
    setValue((v) => (v.trim() === urlQuery ? v : urlQuery));
  }, [urlQuery]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (q, replace) =>
    navigate(q ? `/?search=${encodeURIComponent(q)}` : "/", { replace });

  const onChange = (e) => {
    const q = e.target.value;
    setValue(q);
    if (!onHome) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => go(q.trim(), true), 250);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    clearTimeout(timer.current);
    go(value.trim(), onHome);
  };

  const onLogout = () => {
    logout();
    toast("Signed out", "success");
    navigate("/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-[70px] items-center gap-2.5 border-b border-moss/25 bg-paper/95 px-3.5 sm:gap-5 sm:px-6">
      <Link to="/" className="flex shrink-0 items-center" aria-label="Home">
        <img
          src="/images/supamarket-white.png"
          alt="Ecommerce"
          className="hidden h-[26px] w-auto sm:block"
        />
        <img
          src="/images/supamarket-dark.png"
          alt="Ecommerce"
          className="h-[26px] w-auto sm:hidden"
        />
      </Link>

      <form
        onSubmit={onSubmit}
        role="search"
        className="relative mx-auto max-w-[640px] flex-1"
      >
        <input
          type="search"
          value={value}
          onChange={onChange}
          placeholder="Search the catalog"
          aria-label="Search products"
          autoComplete="off"
          className="field h-11 w-full rounded-full pl-5 pr-12"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full border border-moss/40 bg-mint transition-transform duration-500 ease-expo-out hover:scale-110"
        >
          <SearchIcon className="h-4 w-4 text-ink" />
        </button>
      </form>

      <nav className="flex shrink-0 items-center gap-1.5">
        <NavLink to="/orders" className={navLink}>
          <OrdersIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Orders</span>
        </NavLink>
        <NavLink to="/checkout" className={navLink}>
          <CartIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <span
              key={count}
              className="grid h-5 min-w-[20px] animate-bump place-items-center rounded-full bg-moss px-1.5 text-xs font-bold text-paper"
            >
              {count}
            </span>
          )}
        </NavLink>
        {user ? (
          <button
            onClick={onLogout}
            title="Sign out"
            className={`${navLink({ isActive: false })} cursor-pointer border-0 bg-transparent`}
          >
            <UserIcon className="h-5 w-5" />
            <span className="hidden max-w-[110px] truncate sm:inline">
              {user.name}
            </span>
          </button>
        ) : (
          <NavLink to="/login" className={navLink}>
            <UserIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Sign in</span>
          </NavLink>
        )}
      </nav>
    </header>
  );
}
