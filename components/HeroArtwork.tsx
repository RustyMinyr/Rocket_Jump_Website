"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Keep the planet and its orbit on the same coordinate system at every size. */
export function HeroArtwork({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const update = () => setScale(element.clientWidth / 520);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={container} className="hero-artwork">
    <div className="hero-artwork-stage" style={{ transform: `scale(${scale})` }}>{children}</div>
    {overlay}
  </div>;
}
