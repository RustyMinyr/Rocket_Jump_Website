import Link from "next/link";
import { Logo } from "./Logo";
import { navigation, siteConfig, socialLinks } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>{siteConfig.tagline}</p>
          <p className="muted">Web design. Brand identity.<br />Social content &amp; reporting.</p>
        </div>
        <div><h3>Navigate</h3>{navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}<Link href="/client-portal">Client Portal</Link></div>
        <div><h3>Visit</h3><p>{siteConfig.location}</p><p>{siteConfig.serviceArea}</p><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><a href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a></div>
        <div><h3>Follow</h3>{socialLinks.map((link) => <a key={link.label} href={link.href} aria-label={`Visit RocketJump on ${link.label}`}>{link.label}</a>)}</div>
      </div>
      <div className="shell footer-bottom"><span>© {new Date().getFullYear()} RocketJump. All rights reserved.</span><span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></span></div>
    </footer>
  );
}
