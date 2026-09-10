"use client";

import Image from "next/image";
import { useState } from "react";
import type { PortfolioImage } from "@/lib/site";

export function ProjectGallery({ name, images, compact = false }: { name: string; images: readonly PortfolioImage[]; compact?: boolean }) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];

  return <div className="project-gallery">
    <div className="project-visual"><Image src={current.src} alt={current.alt} fill sizes={compact ? "(max-width: 680px) 100vw, (max-width: 980px) 50vw, 33vw" : "(max-width: 680px) 100vw, 50vw"} /></div>
    {!compact && images.length > 1 && <div className="project-gallery-controls">
      <div className="project-thumbnails" role="group" aria-label={`${name} images`}>
        {images.map((image, index) => <button key={image.src} type="button" onClick={() => setSelected(index)} aria-label={`Show ${name}: ${image.label}`} aria-pressed={index === selected}>
          <Image src={image.src} alt="" fill sizes="80px" />
        </button>)}
      </div>
      <p className="project-image-caption" aria-live="polite">{current.label} <span>{selected + 1} / {images.length}</span></p>
    </div>}
  </div>;
}
