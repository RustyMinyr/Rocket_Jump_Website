"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const revealSelector = [
  "main > section:not(:first-child) > .shell > .section-heading",
  ".intro-grid > *",
  ".speciality-grid > *",
  ".split-section > *",
  ".heading-row",
  ".cta-inner > *",
  ".contact-grid > *",
  ".promo-grid > article",
  ".service-card",
  ".project-card",
  ".package-card",
  ".process-grid article",
  ".why-grid article",
  ".maintenance-grid article",
  ".capability-grid article",
  ".social-capabilities article",
  ".values-grid article",
].join(",");

export function ScrollMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    nodes.forEach((node, index) => {
      node.classList.add("reveal-ready");
      node.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
    });

    if (reduceMotion) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return () => {
        nodes.forEach((node) => {
          node.classList.remove("reveal-ready", "is-visible");
          node.style.removeProperty("--reveal-delay");
        });
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6%" },
    );
    nodes.forEach((node) => observer.observe(node));

    let raf = 0;
    const updateScroll = () => {
      raf = 0;
      const y = window.scrollY;
      root.classList.toggle("has-scrolled", y > 110);
      root.style.setProperty("--hero-shift", `${Math.max(-92, y * -0.16)}px`);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(updateScroll);
    };
    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      root.classList.remove("has-scrolled");
      root.style.removeProperty("--hero-shift");
      nodes.forEach((node) => {
        node.classList.remove("reveal-ready", "is-visible");
        node.style.removeProperty("--reveal-delay");
      });
    };
  }, [pathname]);

  return null;
}
