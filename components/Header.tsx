"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navigation } from "@/lib/site";
import { Logo } from "./Logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.slice(0, -1).map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>{item.label}</Link>
          ))}
        </nav>
        <Link href="/contact" className="button button-small header-cta">Let&apos;s Launch <span>↗</span></Link>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
          <span /><span /><span />
        </button>
      </div>
      <nav id="mobile-menu" className={`mobile-nav ${open ? "open" : ""}`} aria-label="Mobile navigation">
        {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
        <Link href="/contact" className="button" onClick={() => setOpen(false)}>Let&apos;s Launch Your Brand <span>↗</span></Link>
      </nav>
    </header>
  );
}
