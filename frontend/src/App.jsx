import { Link, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import EmptyState from "./components/EmptyState";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Tracking from "./pages/Tracking";

export default function App() {
  const { pathname } = useLocation();

  return (
    <>
      <Header />

      <main
        key={pathname}
        className="mx-auto min-h-screen max-w-[1280px] animate-page-in px-4 pb-20 pt-[92px] sm:px-6 sm:pt-[108px]"
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking/:orderId/:productId"
            element={
              <ProtectedRoute>
                <Tracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <EmptyState
                title="Page not found"
                text="That page does not exist."
              >
                <Link to="/" className="btn-primary">
                  Back to shop
                </Link>
              </EmptyState>
            }
          />
        </Routes>
      </main>
      <footer className="px-6 pb-10 pt-8 text-center text-sm text-mist">
        © 2026 SupaMarket Store · All rights are reserved.
      </footer>
    </>
  );
}
