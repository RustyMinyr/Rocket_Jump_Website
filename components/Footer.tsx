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
        </div>
        <div><h3>Navigate</h3>{navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div>
        <div><h3>Visit</h3><p>{siteConfig.location}</p><p>{siteConfig.serviceArea}</p><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></div>
      </div>
      <div className="shell footer-bottom"><span>© {new Date().getFullYear()} RocketJump. All rights reserved.</span><span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/admin">Admin</Link><a className={styles.egg} href="/drifter/" aria-label="Play Drifter" title="Lost in space. Still moving."><span aria-hidden="true">✧</span></a></span></div>
    </footer>
  );
}
