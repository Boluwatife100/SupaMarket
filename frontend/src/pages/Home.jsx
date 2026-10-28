import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../lib/api";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import Reveal from "../components/Reveal";

function SkeletonCard() {
  return (
    <div className="card p-3.5">
      <div className="shimmer aspect-square rounded-[14px] bg-moss/10" />
      <div className="shimmer mt-3 h-3.5 rounded-lg bg-moss/10" />
      <div className="shimmer mt-3 h-3.5 w-3/5 rounded-lg bg-moss/10" />
      <div className="shimmer mt-3 h-3.5 w-2/5 rounded-lg bg-moss/10" />
    </div>
  );
}

export default function Home() {
  const [params] = useSearchParams();
  const search = (params.get("search") ?? "").trim();

  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [chip, setChip] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const { data } = await api.get("/products");
      setProducts(data);
      setStatus("ready");
    } catch (err) {
      setError(errorMessage(err));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chips = useMemo(() => {
    const counts = new Map();
    products.forEach((p) =>
      p.keywords.forEach((k) => counts.set(k, (counts.get(k) ?? 0) + 1)),
    );
    return [...counts]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([k]) => k);
  }, [products]);

  const list = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const textOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q));
      return textOk && (!chip || p.keywords.includes(chip));
    });
  }, [products, search, chip]);

  return (
    <>
      <Reveal className="max-w-[760px] pb-9 pt-6">
        <span className="mb-3.5 inline-block rounded-full border border-moss/40 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-moss">
          New arrivals
        </span>
        <h1 className="text-[clamp(36px,6vw,64px)] font-extrabold leading-[1.08]">
          Everyday essentials,
          <br /> delivered to your door.
        </h1>
        <p className="mt-[18px] max-w-[560px] text-lg text-moss">
          Home, kitchen, sport and style, with delivery options to suit you.
        </p>
      </Reveal>

      {status === "ready" && chips.length > 0 && (
        <div
          className="mb-[18px] flex flex-wrap gap-2.5"
          aria-label="Filter by category"
        >
          {["", ...chips].map((k) => (
            <button
              key={k || "all"}
              onClick={() => setChip(k)}
              className={`chip ${k === chip ? "chip-active" : ""}`}
            >
              {k || "All"}
            </button>
          ))}
        </div>
      )}

      <div className="mb-[22px] min-h-5 text-sm text-mist" aria-live="polite">
        {status === "ready" &&
          (search
            ? `${list.length} result${list.length === 1 ? "" : "s"} for “${search}”`
            : `${list.length} product${list.length === 1 ? "" : "s"}`)}
      </div>

      {status === "loading" && (
        <section
          className="grid grid-cols-1 gap-3.5 min-[421px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(236px,1fr))] sm:gap-[22px]"
          aria-busy="true"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </section>
      )}

      {status === "error" && (
        <EmptyState title="Could not load products" text={error}>
          <button onClick={load} className="btn-primary">
            Try again
          </button>
        </EmptyState>
      )}

      {status === "ready" && list.length === 0 && (
        <EmptyState
          title="Nothing found"
          text="Try a different keyword or clear the filters."
        />
      )}

      {status === "ready" && list.length > 0 && (
        <section className="grid grid-cols-1 gap-3.5 min-[421px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(236px,1fr))] sm:gap-[22px]">
          {list.map((product, i) => (
            <Reveal key={product.id} delay={(i % 4) * 90}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </section>
      )}
    </>
  );
}
