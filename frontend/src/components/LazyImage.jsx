import { useEffect, useRef, useState } from "react";

// Native lazy loading + a shimmer placeholder + a blur-to-sharp fade once the image arrives.
export default function LazyImage({
  src,
  alt,
  size = 260,
  eager = false,
  className = "",
}) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true);
  }, [src]);

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-[14px] bg-white ${className}`}
    >
      {!loaded && <div className="shimmer absolute inset-0 bg-moss/15" />}
      <img
        ref={ref}
        src={src}
        alt={alt}
        width={size}
        height={size}
        loading={eager ? undefined : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`h-full w-full object-contain p-2.5 transition-all duration-1000 ease-expo-out group-hover:scale-105 ${
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-lg"
        }`}
      />
    </div>
  );
}
