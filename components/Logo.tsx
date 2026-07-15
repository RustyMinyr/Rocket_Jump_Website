import Link from "next/link";

export function Logo({ dark = true }: { dark?: boolean }) {
  return (
    <Link href="/" className={`logo ${dark ? "logo-dark" : "logo-light"}`} aria-label="RocketJump home">
      <span className="logo-words"><b>rocket</b><b>jump</b></span>
      <span className="logo-rocket" aria-hidden="true"><i /></span>
      <span className="sr-only">Temporary logo placeholder</span>
    </Link>
  );
}
