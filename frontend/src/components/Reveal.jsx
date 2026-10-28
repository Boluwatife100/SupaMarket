import { useEffect, useRef, useState } from 'react';

// Fades and slides its children in (slowly) the first time they scroll into view.
export default function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-expo-out ${
        shown ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-7 scale-[0.98] opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
