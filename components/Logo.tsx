import Link from "next/link";

export function Logo({ dark = true }: { dark?: boolean }) {
  return (
    <Link href="/" className={`logo brand-lockup ${dark ? "logo-dark" : "logo-light"}`} aria-label="RocketJump home">
      <span className="logo-wordmark" aria-hidden="true">
        <span>r<span className="logo-pink">o</span>cket</span>
        <span>jump<span className="logo-dot">.</span></span>
      </span>
      <span className="logo-rocket" aria-hidden="true">
        <i className="logo-window" />
        <i className="logo-fin logo-fin-left" />
        <i className="logo-fin logo-fin-right" />
        <i className="logo-flame" />
      </span>
      <span className="sr-only">RocketJump</span>
    </Link>
  );
}
