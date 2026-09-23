import Link from "next/link";
import { Logo } from "./Logo";
import { navigation, siteConfig } from "@/lib/site";
import styles from "./FooterEgg.module.css";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>{siteConfig.tagline}</p>
          <p className="muted">Web design. Brand identity.<br />Social content &amp; reporting.</p>
          <nav className="footer-social" aria-label="RocketJump social media">
            <a href="https://www.instagram.com/rocketjumpgq/" target="_blank" rel="noopener noreferrer" aria-label="RocketJump on Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61594007503317" target="_blank" rel="noopener noreferrer" aria-label="RocketJump on Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M13.8 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4a23 23 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.4H7.6v3.2h2.8V22h3.4Z" />
              </svg>
            </a>
          </nav>
        </div>
        <div><h3>Navigate</h3>{navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div>
        <div><h3>Visit</h3><p>{siteConfig.location}</p><p>{siteConfig.serviceArea}</p><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></div>
      </div>
      <div className="shell footer-bottom"><span>© {new Date().getFullYear()} RocketJump. All rights reserved.</span><span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/admin">Admin</Link><a className={styles.egg} href="/drifter/" aria-label="Play Drifter" title="Lost in space. Still moving."><span aria-hidden="true">✧</span></a></span></div>
    </footer>
  );
}
